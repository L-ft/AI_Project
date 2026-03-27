<template>
  <div class="exec-rpt-page">
    <div class="exec-rpt-inner">
      <!-- 页头 -->
      <header class="exec-rpt-hero">
        <div class="exec-rpt-hero-text">
          <p class="exec-rpt-eyebrow">Execution intelligence</p>
          <h1 class="exec-rpt-title">执行报告</h1>
          <p class="exec-rpt-sub">
            聚合自动化场景的单步调试与批量运行结果，支持检索与下钻明细。
          </p>
        </div>
        <div class="exec-rpt-hero-visual" aria-hidden="true">
          <div class="exec-rpt-orbit" />
          <div class="exec-rpt-glow" />
        </div>
      </header>

      <!-- 指标 -->
      <section class="exec-rpt-stats">
        <div class="exec-rpt-stat-card">
          <span class="exec-rpt-stat-label">报告总数</span>
          <span class="exec-rpt-stat-val">{{ statsTotal }}</span>
          <span class="exec-rpt-stat-hint">当前列表</span>
        </div>
        <div class="exec-rpt-stat-card accent">
          <span class="exec-rpt-stat-label">批量运行</span>
          <span class="exec-rpt-stat-val">{{ statsBatch }}</span>
          <span class="exec-rpt-stat-hint">trigger: batch</span>
        </div>
        <div class="exec-rpt-stat-card success">
          <span class="exec-rpt-stat-label">累计通过步骤</span>
          <span class="exec-rpt-stat-val">{{ statsPassSteps }}</span>
          <span class="exec-rpt-stat-hint">Σ pass</span>
        </div>
        <div class="exec-rpt-stat-card warn">
          <span class="exec-rpt-stat-label">累计失败步骤</span>
          <span class="exec-rpt-stat-val">{{ statsFailSteps }}</span>
          <span class="exec-rpt-stat-hint">Σ fail</span>
        </div>
      </section>

      <!-- 工具栏 -->
      <div class="exec-rpt-toolbar">
        <n-input
          v-model:value="searchQ"
          placeholder="搜索场景名、标题、创建者…"
          clearable
          round
          class="exec-rpt-search"
          @keyup.enter="loadReports"
        >
          <template #prefix>
            <n-icon :component="SearchOutlined" class="exec-rpt-search-ico" />
          </template>
        </n-input>
        <n-select
          v-model:value="filterTrigger"
          :options="triggerOptions"
          style="width: 140px"
          size="medium"
        />
        <n-button quaternary circle @click="loadReports">
          <template #icon><n-icon :component="SyncOutlined" /></template>
        </n-button>
      </div>

      <n-spin :show="loading" class="exec-rpt-spin">
        <div v-if="!loading && rows.length === 0" class="exec-rpt-empty">
          <div class="exec-rpt-empty-ico-wrap">
            <n-icon :component="FileTextOutlined" :size="40" class="exec-rpt-empty-ico" />
          </div>
          <p class="exec-rpt-empty-title">暂无执行记录</p>
          <p class="exec-rpt-empty-desc">
            在「自动化测试」中执行步骤或点击「批量运行」后，报告将自动出现在此处。
          </p>
        </div>

        <div v-else class="exec-rpt-list">
          <article
            v-for="row in rows"
            :key="row.id"
            class="exec-rpt-card"
            @click="openDetail(row)"
          >
            <div class="exec-rpt-card-main">
              <div class="exec-rpt-card-title-row">
                <span class="exec-rpt-pill" :class="pillClass(row.trigger_type)">{{
                  triggerLabel(row.trigger_type)
                }}</span>
                <h2 class="exec-rpt-card-title">{{ displayTitle(row) }}</h2>
              </div>
              <p class="exec-rpt-card-meta">
                <span>{{ row.scenario_name || '—' }}</span>
                <span class="dot">·</span>
                <span>{{ row.env_name || '默认环境' }}</span>
                <span class="dot">·</span>
                <span>{{ row.created_at }}</span>
                <span class="dot">·</span>
                <span>{{ row.creator || '—' }}</span>
              </p>
            </div>
            <div class="exec-rpt-card-metrics">
              <div class="exec-rpt-metric">
                <span class="n">总</span>
                <b>{{ row.summary?.total ?? 0 }}</b>
              </div>
              <div class="exec-rpt-metric ok">
                <span class="n">过</span>
                <b>{{ row.summary?.pass ?? 0 }}</b>
              </div>
              <div class="exec-rpt-metric bad">
                <span class="n">败</span>
                <b>{{ row.summary?.fail ?? 0 }}</b>
              </div>
            </div>
            <n-icon :component="RightOutlined" class="exec-rpt-chevron" />
          </article>
        </div>
      </n-spin>
    </div>

    <n-drawer v-model:show="drawerVisible" :width="drawerWidth" placement="right" class="exec-rpt-drawer">
      <n-drawer-content :title="drawerTitle" closable>
        <n-spin :show="detailLoading">
          <template v-if="detail">
            <div class="exec-rpt-d-sum">
              <n-tag type="success" size="small" round>通过 {{ detail.summary?.pass ?? 0 }}</n-tag>
              <n-tag type="error" size="small" round>失败 {{ detail.summary?.fail ?? 0 }}</n-tag>
              <n-tag size="small" round>共 {{ detail.summary?.total ?? 0 }} 步</n-tag>
            </div>
            <n-scrollbar style="max-height: calc(100vh - 140px)">
              <div
                v-for="(e, idx) in detail.entries || []"
                :key="e.id || idx"
                class="exec-rpt-d-entry"
              >
                <div class="exec-rpt-d-entry-hd">
                  <span :class="['exec-rpt-d-pass', e.pass ? 'ok' : 'bad']">{{
                    e.pass ? 'PASS' : 'FAIL'
                  }}</span>
                  <strong>{{ e.name }}</strong>
                  <n-tag size="tiny" round>{{ e.method }}</n-tag>
                  <span v-if="e.statusCode != null" class="exec-rpt-d-code">{{ e.statusCode }}</span>
                  <span v-if="e.elapsedMs != null" class="exec-rpt-d-ms"
                    >{{ Math.round(e.elapsedMs) }}ms</span
                  >
                </div>
                <div class="exec-rpt-d-url">{{ e.url }}</div>
                <pre v-if="e.responseBodyText" class="exec-rpt-d-body">{{
                  truncate(e.responseBodyText, 1500)
                }}</pre>
                <div v-else-if="e.error" class="exec-rpt-d-err">{{ e.error }}</div>
              </div>
            </n-scrollbar>
          </template>
        </n-spin>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  NInput,
  NButton,
  NIcon,
  NSpin,
  NSelect,
  NTag,
  NScrollbar,
  NDrawer,
  NDrawerContent
} from 'naive-ui'
import { SearchOutlined, SyncOutlined, RightOutlined, FileTextOutlined } from '@vicons/antd'
import execRequest from '@/api/exec-request'

type ReportRow = {
  id: number
  scenario_id: number
  scenario_name?: string
  env_name?: string
  creator?: string
  trigger_type?: string
  title?: string
  summary?: { total?: number; pass?: number; fail?: number; untested?: number }
  created_at?: string
}

const loading = ref(false)
const rawList = ref<ReportRow[]>([])
const searchQ = ref('')
const filterTrigger = ref<string>('all')

const triggerOptions = [
  { label: '全部来源', value: 'all' },
  { label: '手动单步', value: 'manual' },
  { label: '批量运行', value: 'batch' },
  { label: '定时', value: 'scheduled' }
]

const rows = computed(() => {
  let list = rawList.value
  if (filterTrigger.value !== 'all') {
    list = list.filter((r) => (r.trigger_type || 'manual') === filterTrigger.value)
  }
  return list
})

const statsTotal = computed(() => rows.value.length)
const statsBatch = computed(() => rows.value.filter((r) => r.trigger_type === 'batch').length)
const statsPassSteps = computed(() =>
  rows.value.reduce((s, r) => s + Number(r.summary?.pass ?? 0), 0)
)
const statsFailSteps = computed(() =>
  rows.value.reduce((s, r) => s + Number(r.summary?.fail ?? 0), 0)
)

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQ, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchTimer = null
    loadReports()
  }, 400)
})

watch(filterTrigger, () => {
  /* 客户端过滤，无需请求 */
})

const loadReports = async () => {
  loading.value = true
  try {
    const q = searchQ.value.trim()
    const data: any = await execRequest.get('/test-scenarios/reports', {
      params: { q: q || undefined, limit: 200 }
    })
    rawList.value = Array.isArray(data) ? data : []
  } catch {
    rawList.value = []
  } finally {
    loading.value = false
  }
}

const displayTitle = (row: ReportRow) => {
  const t = row.title && String(row.title).trim()
  return t || row.scenario_name || `场景 #${row.scenario_id}`
}

const triggerLabel = (t?: string) => {
  if (t === 'batch') return '批量'
  if (t === 'scheduled') return '定时'
  return '手动'
}

const pillClass = (t?: string) => {
  if (t === 'batch') return 'is-batch'
  if (t === 'scheduled') return 'is-sched'
  return 'is-manual'
}

const drawerVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<any | null>(null)
const drawerTitle = ref('报告明细')

const openDetail = async (row: ReportRow) => {
  drawerTitle.value = displayTitle(row)
  drawerVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    const data: any = await execRequest.get(`/test-scenarios/reports/${row.id}`)
    detail.value = data
  } catch {
    detail.value = null
  } finally {
    detailLoading.value = false
  }
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s)

const drawerWidth = computed(() =>
  typeof window !== 'undefined' ? Math.min(560, window.innerWidth - 24) : 560
)

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
@import '@/styles/design-tokens.css';

.exec-rpt-page {
  position: absolute;
  inset: 0;
  overflow: auto;
  background: linear-gradient(165deg, var(--color-gray-50) 0%, #eef0f8 45%, var(--color-gray-50) 100%);
  font-family: var(--font-family-base);
}

.exec-rpt-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-6) var(--page-padding-x) var(--space-10);
  min-height: 100%;
}

.exec-rpt-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
  position: relative;
}

.exec-rpt-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary-500);
  margin-bottom: var(--space-2);
}

.exec-rpt-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  margin: 0 0 var(--space-2);
}

.exec-rpt-sub {
  font-size: var(--text-md);
  color: var(--color-text-tertiary);
  max-width: 520px;
  line-height: var(--leading-relaxed);
  margin: 0;
}

.exec-rpt-hero-visual {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}
.exec-rpt-orbit {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(125, 51, 255, 0.2);
  animation: exec-spin 18s linear infinite;
}
.exec-rpt-glow {
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(125, 51, 255, 0.35) 0%, transparent 70%);
  filter: blur(8px);
}
@keyframes exec-spin {
  to {
    transform: rotate(360deg);
  }
}

.exec-rpt-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

@media (max-width: 900px) {
  .exec-rpt-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.exec-rpt-stat-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow var(--duration-normal), transform var(--duration-fast);
}
.exec-rpt-stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.exec-rpt-stat-card.accent {
  border-color: rgba(125, 51, 255, 0.25);
  background: linear-gradient(135deg, #fff 0%, var(--color-primary-50) 100%);
}
.exec-rpt-stat-card.success .exec-rpt-stat-val {
  color: var(--color-success);
}
.exec-rpt-stat-card.warn .exec-rpt-stat-val {
  color: var(--color-error);
}

.exec-rpt-stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
.exec-rpt-stat-val {
  font-size: 26px;
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1.1;
}
.exec-rpt-stat-hint {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
}

.exec-rpt-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.exec-rpt-search {
  flex: 1;
  min-width: 200px;
  max-width: 420px;
}
.exec-rpt-search-ico {
  color: var(--color-text-disabled);
}

.exec-rpt-spin {
  min-height: 200px;
}

.exec-rpt-empty {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  border: 1px dashed var(--color-border);
}
.exec-rpt-empty-ico-wrap {
  width: 72px;
  height: 72px;
  margin: 0 auto var(--space-4);
  border-radius: var(--radius-xl);
  background: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
}
.exec-rpt-empty-ico {
  color: var(--color-gray-400);
}
.exec-rpt-empty-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}
.exec-rpt-empty-desc {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: 0 auto;
  max-width: 360px;
  line-height: var(--leading-relaxed);
}

.exec-rpt-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.exec-rpt-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast),
    transform var(--duration-fast);
}
.exec-rpt-card:hover {
  border-color: rgba(125, 51, 255, 0.35);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.exec-rpt-card-main {
  flex: 1;
  min-width: 0;
}
.exec-rpt-card-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.exec-rpt-pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
}
.exec-rpt-pill.is-manual {
  background: #eff6ff;
  color: #2563eb;
}
.exec-rpt-pill.is-batch {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}
.exec-rpt-pill.is-sched {
  background: #fff7ed;
  color: #c2410c;
}

.exec-rpt-card-title {
  font-size: var(--text-md);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exec-rpt-card-meta {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.exec-rpt-card-meta .dot {
  opacity: 0.45;
}

.exec-rpt-card-metrics {
  display: flex;
  gap: var(--space-4);
  flex-shrink: 0;
}
.exec-rpt-metric {
  text-align: center;
  min-width: 40px;
}
.exec-rpt-metric .n {
  display: block;
  font-size: 10px;
  color: var(--color-text-disabled);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.exec-rpt-metric b {
  font-size: 18px;
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
}
.exec-rpt-metric.ok b {
  color: var(--color-success);
}
.exec-rpt-metric.bad b {
  color: var(--color-error);
}

.exec-rpt-chevron {
  color: var(--color-text-disabled);
  font-size: 16px;
  flex-shrink: 0;
}

.exec-rpt-d-sum {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--space-4);
}
.exec-rpt-d-entry {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-3);
  background: var(--color-gray-50);
}
.exec-rpt-d-entry-hd {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.exec-rpt-d-pass {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.exec-rpt-d-pass.ok {
  background: #dcfce7;
  color: #166534;
}
.exec-rpt-d-pass.bad {
  background: #fee2e2;
  color: #991b1b;
}
.exec-rpt-d-code,
.exec-rpt-d-ms {
  font-size: 12px;
  color: var(--color-text-tertiary);
}
.exec-rpt-d-url {
  font-size: 12px;
  color: var(--color-text-secondary);
  word-break: break-all;
  margin-top: 6px;
}
.exec-rpt-d-body {
  margin: 8px 0 0;
  padding: 10px;
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.45;
  overflow-x: auto;
  max-height: 220px;
}
.exec-rpt-d-err {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-error);
}
</style>
