<template>
  <div class="dashboard-page">
    <n-spin :show="loading" class="dashboard-spin">
      <div class="dashboard-inner">
        <header class="dashboard-header">
          <div>
            <h1 class="dashboard-title">工作台</h1>
            <p class="dashboard-desc">
              数据来自执行引擎：接口资产、测试报告汇总与近 7 日执行趋势。
            </p>
          </div>
          <n-button quaternary size="small" @click="loadOverview">
            <template #icon><n-icon :component="ReloadOutlined" /></template>
            刷新
          </n-button>
        </header>

        <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 l:4" responsive="screen">
          <n-gi>
            <n-card :bordered="false" class="dash-stat-card">
              <div class="dash-stat-icon wrap-api">
                <n-icon :component="ApiOutlined" :size="22" />
              </div>
              <n-statistic label="总接口数" :value="displayNum(overview?.interface_count)">
                <template #suffix>
                  <span class="dash-stat-unit">个</span>
                </template>
              </n-statistic>
              <p class="dash-stat-hint">api_interfaces</p>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="dash-stat-card">
              <div class="dash-stat-icon wrap-ok">
                <n-icon :component="CheckCircleOutlined" :size="22" />
              </div>
              <n-statistic label="执行成功率" :value="successRateDisplay">
                <template #suffix>
                  <span v-if="overview?.execution_success_rate != null" class="dash-stat-unit">%</span>
                </template>
              </n-statistic>
              <p class="dash-stat-hint">报告内步骤通过 / (通过+失败)</p>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="dash-stat-card">
              <div class="dash-stat-icon wrap-scn">
                <n-icon :component="DeploymentUnitOutlined" :size="22" />
              </div>
              <n-statistic label="自动化场景" :value="displayNum(overview?.scenario_count)">
                <template #suffix>
                  <span class="dash-stat-unit">个</span>
                </template>
              </n-statistic>
              <p class="dash-stat-hint">测试用例 {{ displayNum(overview?.test_case_count) }} 条</p>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="dash-stat-card">
              <div class="dash-stat-icon wrap-warn">
                <n-icon :component="AlertOutlined" :size="22" />
              </div>
              <n-statistic label="待关注场景" :value="attentionDisplay">
              </n-statistic>
              <p class="dash-stat-hint">运行中 {{ overview?.scenarios_running ?? 0 }} · 最近失败 {{ overview?.scenarios_failed ?? 0 }}</p>
            </n-card>
          </n-gi>
        </n-grid>

        <n-card :bordered="false" class="dashboard-chart-card">
          <template #header>
            <div class="chart-card-head">
              <div>
                <span class="chart-title">AI 任务执行看板</span>
                <span class="chart-sub">近 7 日 · 步骤通过/失败与当日成功率</span>
              </div>
              <n-tag size="small" round :bordered="false" class="chart-tag">
                累计报告 {{ overview?.report_count ?? 0 }} 条 · 步骤 {{ totalSteps }} 次
              </n-tag>
            </div>
          </template>
          <div ref="chartRef" class="chart-box" />
          <p v-if="overview && overview.report_count === 0" class="chart-fallback">
            暂无测试报告，在「自动化测试」中执行步骤或批量运行后，此处将展示近 7 日趋势。
          </p>
        </n-card>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  NGrid,
  NGi,
  NCard,
  NStatistic,
  NIcon,
  NSpin,
  NButton,
  NTag
} from 'naive-ui'
import * as echarts from 'echarts'
import {
  ApiOutlined,
  CheckCircleOutlined,
  DeploymentUnitOutlined,
  AlertOutlined,
  ReloadOutlined
} from '@vicons/antd'
import execRequest from '@/api/exec-request'

type TrendDay = {
  date: string
  weekday: string
  report_count: number
  pass_steps: number
  fail_steps: number
  day_success_rate: number | null
}

type Overview = {
  interface_count: number
  test_case_count: number
  scenario_count: number
  report_count: number
  execution_pass_steps: number
  execution_fail_steps: number
  execution_success_rate: number | null
  scenarios_running: number
  scenarios_failed: number
  trend_7d: TrendDay[]
}

const PRIMARY = '#7d33ff'
const PRIMARY_LIGHT = 'rgba(125, 51, 255, 0.15)'
const TEXT_SECONDARY = '#4f5b76'
const BORDER_SUBTLE = '#e4e8f0'
const GREEN = '#12b76a'
const RED = '#f04438'

const loading = ref(true)
const overview = ref<Overview | null>(null)
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const displayNum = (n: number | undefined | null) => (n == null || Number.isNaN(n) ? 0 : n)

const successRateDisplay = computed(() => {
  const r = overview.value?.execution_success_rate
  if (r == null) return '—'
  return String(r)
})

const attentionDisplay = computed(() => {
  const o = overview.value
  if (!o) return '0'
  return String((o.scenarios_running || 0) + (o.scenarios_failed || 0))
})

const totalSteps = computed(() => {
  const o = overview.value
  if (!o) return 0
  return (o.execution_pass_steps || 0) + (o.execution_fail_steps || 0)
})

const loadOverview = async () => {
  loading.value = true
  try {
    const data: any = await execRequest.get('/dashboard/overview')
    overview.value = data as Overview
  } catch {
    overview.value = null
  } finally {
    loading.value = false
    await nextTick()
    renderChart()
  }
}

const renderChart = () => {
  const el = chartRef.value
  const trend = overview.value?.trend_7d
  if (!el || !trend?.length) {
    chart?.dispose()
    chart = null
    return
  }
  const xLabels = trend.map((d) => `${d.weekday}\n${d.date}`)
  const passData = trend.map((d) => d.pass_steps)
  const failData = trend.map((d) => d.fail_steps)
  const rateData = trend.map((d) =>
    d.day_success_rate != null ? d.day_success_rate : null
  )

  if (!chart) chart = echarts.init(el)
  chart.setOption(
    {
      color: [GREEN, RED, PRIMARY],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: BORDER_SUBTLE,
        textStyle: { color: TEXT_SECONDARY },
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['通过步骤', '失败步骤', '当日成功率'],
        bottom: 0,
        textStyle: { color: TEXT_SECONDARY, fontSize: 12 }
      },
      grid: { left: 48, right: 56, top: 28, bottom: 56 },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLine: { lineStyle: { color: BORDER_SUBTLE } },
        axisTick: { show: false },
        axisLabel: { color: TEXT_SECONDARY, fontSize: 11, lineHeight: 14 }
      },
      yAxis: [
        {
          type: 'value',
          name: '步骤数',
          nameTextStyle: { color: TEXT_SECONDARY, fontSize: 11 },
          splitLine: { lineStyle: { type: 'dashed', color: BORDER_SUBTLE } },
          axisLabel: { color: TEXT_SECONDARY, fontSize: 11 }
        },
        {
          type: 'value',
          name: '成功率',
          min: 0,
          max: 100,
          nameTextStyle: { color: TEXT_SECONDARY, fontSize: 11 },
          splitLine: { show: false },
          axisLabel: {
            color: TEXT_SECONDARY,
            fontSize: 11,
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '通过步骤',
          type: 'bar',
          stack: 'steps',
          barMaxWidth: 28,
          data: passData,
          itemStyle: { color: GREEN, borderRadius: [4, 4, 0, 0] }
        },
        {
          name: '失败步骤',
          type: 'bar',
          stack: 'steps',
          barMaxWidth: 28,
          data: failData,
          itemStyle: { color: RED, borderRadius: [0, 0, 4, 4] }
        },
        {
          name: '当日成功率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          connectNulls: true,
          symbol: 'circle',
          symbolSize: 7,
          data: rateData,
          lineStyle: { width: 2, color: PRIMARY },
          itemStyle: { color: PRIMARY, borderColor: '#fff', borderWidth: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: PRIMARY_LIGHT },
              { offset: 1, color: 'transparent' }
            ])
          }
        }
      ]
    },
    true
  )
  chart.resize()
}

const onResize = () => chart?.resize()

watch(
  () => overview.value?.trend_7d,
  () => {
    void nextTick(() => renderChart())
  },
  { deep: true }
)

onMounted(() => {
  loadOverview()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
@import '@/styles/design-tokens.css';

.dashboard-page {
  position: absolute;
  inset: 0;
  overflow: auto;
  background: var(--color-bg-page);
  font-family: var(--font-family-base);
}

.dashboard-spin {
  min-height: 100%;
}

.dashboard-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-6) var(--page-padding-x) var(--space-10);
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.dashboard-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.dashboard-desc {
  font-size: var(--text-md);
  color: var(--color-text-tertiary);
  margin: 0;
  max-width: 560px;
  line-height: var(--leading-relaxed);
}

.dash-stat-card {
  position: relative;
  border-radius: var(--radius-lg) !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-sm);
  background: linear-gradient(145deg, #ffffff 0%, var(--color-gray-50) 100%);
  overflow: hidden;
  min-height: 132px;
  transition: box-shadow var(--duration-normal), transform var(--duration-fast);
}
.dash-stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.dash-stat-icon {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dash-stat-icon.wrap-api {
  background: var(--color-primary-50);
  color: var(--color-primary-500);
}
.dash-stat-icon.wrap-ok {
  background: rgba(18, 183, 106, 0.12);
  color: var(--color-success);
}
.dash-stat-icon.wrap-scn {
  background: rgba(6, 182, 212, 0.12);
  color: var(--color-accent-600);
}
.dash-stat-icon.wrap-warn {
  background: rgba(240, 68, 56, 0.1);
  color: var(--color-error);
}

.dash-stat-card :deep(.n-statistic__label) {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
.dash-stat-card :deep(.n-statistic-value__content) {
  font-size: 28px;
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.dash-stat-unit {
  font-size: 14px;
  font-weight: var(--font-semibold);
  color: var(--color-text-tertiary);
  margin-left: 2px;
}

.dash-stat-hint {
  margin: var(--space-2) 0 0;
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
}

.dashboard-chart-card {
  margin-top: var(--space-4);
  border-radius: var(--radius-lg) !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-sm);
  background: var(--color-bg-surface);
}

.chart-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.chart-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-right: var(--space-3);
}

.chart-sub {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.chart-tag {
  background: var(--color-gray-100) !important;
  color: var(--color-text-secondary) !important;
}

.chart-box {
  height: 400px;
  width: 100%;
}

.chart-fallback {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
</style>
