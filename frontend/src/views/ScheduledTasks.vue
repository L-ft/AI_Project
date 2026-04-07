<template>
  <div class="st-page">
    <div class="st-inner">
      <header class="st-hero">
        <div class="st-hero-text">
          <p class="st-eyebrow">接口管理 · 调度</p>
          <h1 class="st-title">定时任务</h1>
          <p class="st-sub">
            按 Cron 自动执行「自动化测试」中的场景，生成报告并记录在运行历史。调度由执行引擎进程内触发，无需单独 Runner。
          </p>
        </div>
        <div class="st-hero-visual" aria-hidden="true">
          <div class="st-orbit" />
          <div class="st-glow" />
        </div>
      </header>

      <section class="st-stats">
        <div class="st-stat-card">
          <span class="st-stat-label">启用中</span>
          <span class="st-stat-val">{{ statEnabled }}</span>
        </div>
        <div class="st-stat-card accent">
          <span class="st-stat-label">任务总数</span>
          <span class="st-stat-val">{{ rows.length }}</span>
        </div>
        <div class="st-stat-card success">
          <span class="st-stat-label">最近成功</span>
          <span class="st-stat-val">{{ statLastOk }}</span>
        </div>
        <div class="st-stat-card warn">
          <span class="st-stat-label">最近失败</span>
          <span class="st-stat-val">{{ statLastFail }}</span>
        </div>
      </section>

      <div class="st-toolbar">
        <n-input
          v-model:value="searchQ"
          placeholder="搜索任务名称、场景编码…"
          clearable
          round
          class="st-search"
          @keyup.enter="load"
        >
          <template #prefix>
            <n-icon :component="SearchOutlined" class="st-ico" />
          </template>
        </n-input>
        <n-button type="primary" round @click="openCreate">
          <template #icon><n-icon :component="PlusOutlined" /></template>
          新建任务
        </n-button>
        <n-button quaternary circle @click="load">
          <template #icon><n-icon :component="SyncOutlined" /></template>
        </n-button>
      </div>

      <n-spin :show="loading">
        <div v-if="!loading && filteredRows.length === 0" class="st-empty">
          <n-icon :component="FieldTimeOutlined" :size="44" class="st-empty-ico" />
          <p class="st-empty-title">暂无定时任务</p>
          <p class="st-empty-desc">选择已有自动化测试场景，配置 Cron 表达式后即可按计划执行。</p>
          <n-button type="primary" dashed @click="openCreate">创建第一个任务</n-button>
        </div>
        <n-data-table
          v-else
          :columns="columns"
          :data="filteredRows"
          :bordered="false"
          :single-line="false"
          :row-props="rowProps"
          class="st-table"
        />
      </n-spin>
    </div>

    <n-modal
      v-model:show="modalShow"
      preset="card"
      :title="modalMode === 'create' ? '新建定时任务' : '编辑定时任务'"
      class="st-modal"
      style="width: min(520px, 92vw)"
      :mask-closable="false"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="96">
        <n-form-item path="name" label="任务名称">
          <n-input v-model:value="form.name" placeholder="例如：每日回归-订单流" />
        </n-form-item>
        <n-form-item path="scenarioCode" label="测试场景">
          <n-select
            v-model:value="form.scenarioCode"
            :options="scenarioOptions"
            placeholder="选择自动化测试场景"
            filterable
            clearable
          />
        </n-form-item>
        <n-form-item path="cronExpression" label="Cron">
          <n-input-group>
            <n-input v-model:value="form.cronExpression" placeholder="分 时 日 月 周" />
            <n-select v-model:value="cronPreset" :options="cronPresetOptions" style="width: 160px" @update:value="onCronPreset" />
          </n-input-group>
          <div class="st-hint">标准五段式，如每天 9 点：<code>0 9 * * *</code></div>
        </n-form-item>
        <n-form-item path="timezone" label="时区">
          <n-select v-model:value="form.timezone" :options="tzOptions" filterable />
        </n-form-item>
        <n-form-item path="enabled" label="启用">
          <n-switch v-model:value="form.enabled" />
        </n-form-item>
        <n-form-item path="description" label="备注">
          <n-input v-model:value="form.description" type="textarea" placeholder="可选" :rows="2" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="modalShow = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="submitForm">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-drawer v-model:show="runsDrawer" :width="420" placement="right">
      <n-drawer-content title="运行历史" closable>
        <n-spin :show="runsLoading">
          <n-timeline v-if="runItems.length" size="medium">
            <n-timeline-item
              v-for="r in runItems"
              :key="r.id"
              :type="r.status === 'success' ? 'success' : r.status === 'failed' ? 'error' : 'info'"
            >
              <div class="st-run-line">
                <span class="st-run-status">{{ runStatusText(r.status) }}</span>
                <span class="st-run-time">{{ r.started_at || '—' }}</span>
              </div>
              <div v-if="r.message" class="st-run-msg">{{ r.message }}</div>
              <div v-if="r.report_code" class="st-run-report">
                报告：<code>{{ r.report_code }}</code>
              </div>
            </n-timeline-item>
          </n-timeline>
          <n-empty v-else description="暂无记录" />
        </n-spin>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import {
  NButton,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NEmpty,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NModal,
  NSelect,
  NSpace,
  NSpin,
  NSwitch,
  NTimeline,
  NTimelineItem,
  useDialog,
  useMessage
} from 'naive-ui'
import {
  FieldTimeOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined
} from '@vicons/antd'
import execRequest from '@/api/exec-request'
import {
  createScheduledTask,
  deleteScheduledTask,
  listScheduledTasks,
  listTaskRuns,
  triggerScheduledTask,
  updateScheduledTask,
  type ScheduledTaskRow,
  type ScheduledTaskRunRow
} from '@/api/scheduled-tasks'

const dialog = useDialog()
const msg = useMessage()

const loading = ref(false)
const rows = ref<ScheduledTaskRow[]>([])
const searchQ = ref('')

const modalShow = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingCode = ref<string | null>(null)
const saving = ref(false)
const formRef = ref<FormInst | null>(null)
const form = ref({
  name: '',
  scenarioCode: null as string | null,
  cronExpression: '0 9 * * *',
  timezone: 'Asia/Shanghai',
  enabled: true,
  description: '' as string | null
})

const cronPreset = ref<string | null>(null)
const cronPresetOptions = [
  { label: '预设…', value: '__none__' },
  { label: '每 30 分钟', value: '*/30 * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 9:00', value: '0 9 * * *' },
  { label: '工作日 9:00', value: '0 9 * * 1-5' },
  { label: '每周一 9:00', value: '0 9 * * 1' }
]

const tzOptions = [
  { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
  { label: 'UTC', value: 'UTC' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
  { label: 'America/New_York', value: 'America/New_York' }
]

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: ['blur', 'input'] }],
  scenarioCode: [{ required: true, message: '请选择场景', trigger: ['blur', 'change'] }],
  cronExpression: [{ required: true, message: '请输入 Cron', trigger: ['blur', 'input'] }],
  timezone: [{ required: true, message: '请选择时区', trigger: ['change'] }]
}

const scenarioOptions = ref<{ label: string; value: string }[]>([])

const runsDrawer = ref(false)
const runsLoading = ref(false)
const runItems = ref<ScheduledTaskRunRow[]>([])
const runsForCode = ref<string | null>(null)

const statEnabled = computed(() => rows.value.filter((r) => r.enabled).length)
const statLastOk = computed(() => rows.value.filter((r) => r.last_run_status === 'passed').length)
const statLastFail = computed(() => rows.value.filter((r) => r.last_run_status === 'failed').length)

const filteredRows = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      (r.scenario_code || '').toLowerCase().includes(q) ||
      (r.code || '').toLowerCase().includes(q)
  )
})

function onCronPreset(v: string | null) {
  if (!v || v === '__none__') return
  form.value.cronExpression = v
}

async function loadScenarios() {
  try {
    const raw = (await execRequest.get('/test-scenarios')) as { id?: string; name?: string; code?: string }[]
    const list = Array.isArray(raw) ? raw : []
    scenarioOptions.value = list.map((s) => ({
      label: `${s.name || s.code || s.id || ''} (${s.code || s.id})`,
      value: String(s.code || s.id || '')
    }))
  } catch {
    scenarioOptions.value = []
  }
}

async function load() {
  loading.value = true
  try {
    rows.value = await listScheduledTasks()
  } catch {
    rows.value = []
    msg.error('加载定时任务失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  modalMode.value = 'create'
  editingCode.value = null
  cronPreset.value = null
  form.value = {
    name: '',
    scenarioCode: null,
    cronExpression: '0 9 * * *',
    timezone: 'Asia/Shanghai',
    enabled: true,
    description: ''
  }
  modalShow.value = true
}

function openEdit(row: ScheduledTaskRow) {
  modalMode.value = 'edit'
  editingCode.value = row.code
  form.value = {
    name: row.name,
    scenarioCode: row.scenario_code,
    cronExpression: row.cron_expression,
    timezone: row.timezone || 'Asia/Shanghai',
    enabled: row.enabled,
    description: row.description || ''
  }
  modalShow.value = true
}

async function submitForm() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    if (modalMode.value === 'create') {
      await createScheduledTask({
        name: form.value.name,
        scenarioCode: form.value.scenarioCode!,
        cronExpression: form.value.cronExpression.trim(),
        timezone: form.value.timezone,
        enabled: form.value.enabled,
        description: form.value.description || undefined
      })
      msg.success('已创建')
    } else if (editingCode.value) {
      await updateScheduledTask(editingCode.value, {
        name: form.value.name,
        scenarioCode: form.value.scenarioCode!,
        cronExpression: form.value.cronExpression.trim(),
        timezone: form.value.timezone,
        enabled: form.value.enabled,
        description: form.value.description
      })
      msg.success('已保存')
    }
    modalShow.value = false
    await load()
  } catch {
    /* axios 已提示 */
  } finally {
    saving.value = false
  }
}

function confirmDelete(row: ScheduledTaskRow) {
  dialog.warning({
    title: '删除定时任务',
    content: `确定删除「${row.name}」？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteScheduledTask(row.code)
        msg.success('已删除')
        await load()
      } catch {
        /* */
      }
    }
  })
}

async function onTrigger(row: ScheduledTaskRow) {
  try {
    await triggerScheduledTask(row.code)
    msg.success('已触发执行')
    await load()
  } catch {
    /* */
  }
}

async function openRuns(row: ScheduledTaskRow) {
  runsForCode.value = row.code
  runsDrawer.value = true
  runsLoading.value = true
  try {
    runItems.value = await listTaskRuns(row.code)
  } catch {
    runItems.value = []
  } finally {
    runsLoading.value = false
  }
}

watch(runsDrawer, (v) => {
  if (!v) runsForCode.value = null
})

function runStatusText(s: string) {
  if (s === 'success') return '成功'
  if (s === 'failed') return '失败'
  if (s === 'running') return '运行中'
  return s
}

function rowProps(_row: ScheduledTaskRow) {
  return { style: 'cursor: default' }
}

const columns = computed<DataTableColumns<ScheduledTaskRow>>(() => [
  {
    title: '任务',
    key: 'name',
    minWidth: 160,
    ellipsis: { tooltip: true },
    render(row) {
      return h('div', { class: 'st-cell-name' }, [
        h('span', { class: 'st-name' }, row.name),
        h('span', { class: 'st-code' }, row.code)
      ])
    }
  },
  {
    title: '场景',
    key: 'scenario_code',
    width: 140,
    ellipsis: { tooltip: true }
  },
  {
    title: 'Cron',
    key: 'cron_expression',
    width: 120
  },
  {
    title: '下次运行',
    key: 'next_run_at',
    width: 168,
    render(row) {
      return row.next_run_at || '—'
    }
  },
  {
    title: '上次',
    key: 'last_run_at',
    width: 168,
    render(row) {
      return row.last_run_at || '—'
    }
  },
  {
    title: '状态',
    key: 'last_run_status',
    width: 88,
    render(row) {
      const t = row.last_run_status
      if (t === 'passed') return h('span', { class: 'st-pill st-pill--ok' }, '成功')
      if (t === 'failed') return h('span', { class: 'st-pill st-pill--bad' }, '失败')
      return h('span', { class: 'st-pill' }, '—')
    }
  },
  {
    title: '启用',
    key: 'enabled',
    width: 72,
    render(row) {
      return h(
        NSwitch,
        {
          size: 'small',
          value: row.enabled,
          onUpdateValue: async (v: boolean) => {
            try {
              await updateScheduledTask(row.code, { enabled: v })
              row.enabled = v
              msg.success(v ? '已启用' : '已停用')
              await load()
            } catch {
              await load()
            }
          }
        },
        {}
      )
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    render(row) {
      return h(NSpace, { size: 8 }, () => [
        h(
          NButton,
          { size: 'small', tertiary: true, onClick: () => onTrigger(row) },
          { default: () => '立即执行' }
        ),
        h(
          NButton,
          { size: 'small', tertiary: true, onClick: () => openRuns(row) },
          { default: () => '历史' }
        ),
        h(
          NButton,
          { size: 'small', tertiary: true, onClick: () => openEdit(row) },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          { size: 'small', tertiary: true, type: 'error', onClick: () => confirmDelete(row) },
          { default: () => '删除' }
        )
      ])
    }
  }
])

onMounted(async () => {
  await loadScenarios()
  await load()
})
</script>

<style scoped>
.st-page {
  min-height: 100%;
  background: var(--color-bg-page);
  padding: var(--page-padding-y, 24px) var(--page-padding-x, 28px);
  box-sizing: border-box;
}

.st-inner {
  max-width: 1180px;
  margin: 0 auto;
}

.st-hero {
  display: grid;
  grid-template-columns: 1fr minmax(120px, 200px);
  gap: var(--space-6, 24px);
  align-items: center;
  margin-bottom: var(--space-6, 24px);
}

.st-eyebrow {
  font-size: var(--text-xs, 12px);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-2, 8px);
}

.st-title {
  font-size: var(--text-2xl, 26px);
  font-weight: var(--font-semibold, 600);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2, 8px);
}

.st-sub {
  font-size: var(--text-md, 14px);
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 640px;
}

.st-hero-visual {
  position: relative;
  height: 120px;
}

.st-orbit {
  position: absolute;
  inset: 10%;
  border: 1px dashed var(--color-border-subtle);
  border-radius: 50%;
  animation: st-spin 24s linear infinite;
}

.st-glow {
  position: absolute;
  inset: 28%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(125, 51, 255, 0.2), transparent 70%);
}

@keyframes st-spin {
  to {
    transform: rotate(360deg);
  }
}

.st-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4, 16px);
  margin-bottom: var(--space-5, 20px);
}

.st-stat-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-4, 16px);
  box-shadow: var(--shadow-xs);
}

.st-stat-card.accent {
  border-color: rgba(125, 51, 255, 0.25);
}
.st-stat-card.success {
  border-color: rgba(34, 197, 94, 0.25);
}
.st-stat-card.warn {
  border-color: rgba(245, 158, 11, 0.3);
}

.st-stat-label {
  display: block;
  font-size: var(--text-xs, 12px);
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
}

.st-stat-val {
  font-size: var(--text-xl, 22px);
  font-weight: var(--font-semibold, 600);
  color: var(--color-text-primary);
}

.st-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3, 12px);
  align-items: center;
  margin-bottom: var(--space-4, 16px);
}

.st-search {
  flex: 1;
  min-width: 220px;
  max-width: 400px;
}

.st-ico {
  color: var(--color-text-tertiary);
}

.st-empty {
  text-align: center;
  padding: 48px 16px;
  background: var(--color-bg-surface);
  border: 1px dashed var(--color-border-subtle);
  border-radius: var(--radius-lg, 12px);
}

.st-empty-ico {
  color: var(--color-text-tertiary);
  margin-bottom: 12px;
}

.st-empty-title {
  font-weight: var(--font-semibold, 600);
  margin-bottom: 8px;
}

.st-empty-desc {
  color: var(--color-text-secondary);
  font-size: var(--text-sm, 13px);
  margin-bottom: 16px;
}

.st-table :deep(.n-data-table-th) {
  font-weight: var(--font-semibold, 600);
}

.st-cell-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.st-name {
  font-weight: var(--font-medium, 500);
}

.st-code {
  font-size: 11px;
  color: var(--color-text-tertiary);
  font-family: ui-monospace, monospace;
}

.st-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  background: var(--color-gray-100);
  color: var(--color-text-secondary);
}

.st-pill--ok {
  background: rgba(34, 197, 94, 0.12);
  color: rgb(22, 163, 74);
}

.st-pill--bad {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(220, 38, 38);
}

.st-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.st-hint code {
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--color-gray-100);
}

.st-run-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}

.st-run-status {
  font-weight: var(--font-medium, 500);
}

.st-run-time {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.st-run-msg {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  word-break: break-word;
}

.st-run-report {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.st-run-report code {
  font-size: 11px;
}

@media (max-width: 900px) {
  .st-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .st-hero {
    grid-template-columns: 1fr;
  }
}
</style>
