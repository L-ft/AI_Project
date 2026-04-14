<template>
  <div class="data-builder">
    <PageTopbar
      title="智能造数"
      badge="LLM Data"
      :breadcrumbs="['接口管理', '智能造数']"
    >
      <template #icon>
        <n-icon :size="22" color="#fff" :component="DatabaseOutlined" />
      </template>
      <template #right>
        <n-space align="center" :size="12">
          <n-tag v-if="serviceOk" type="success" size="small" round>服务在线</n-tag>
          <n-tag v-else type="warning" size="small" round>检测服务…</n-tag>
          <n-button size="small" secondary @click="pingService">检测连接</n-button>
        </n-space>
      </template>
    </PageTopbar>

    <n-scrollbar class="data-builder-scroll">
      <div class="data-builder-inner">
        <n-alert type="info" class="intro-alert" title="使用说明">
          配置<strong>目标 MySQL</strong>（与平台自身库可不同）→ 选择表并同步结构 → 用自然语言描述造数需求 → 生成预览（当前为占位逻辑，接入 LLM 后将输出真实计划）→ 在设置中调整上限与归档选项。执行写入将在后续版本开放。
        </n-alert>

        <n-tabs v-model:value="activeTab" type="line" animated class="main-tabs">
          <n-tab-pane name="conn" tab="连接配置">
            <n-card title="MySQL 目标库" size="small" class="panel-card">
              <n-form label-placement="left" label-width="96" :model="conn">
                <n-grid :cols="2" :x-gap="16" :y-gap="12">
                  <n-gi>
                    <n-form-item label="主机">
                      <n-input v-model:value="conn.host" placeholder="如127.0.0.1" clearable />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="端口">
                      <n-input-number v-model:value="conn.port" :min="1" :max="65535" class="w-full" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="用户名">
                      <n-input v-model:value="conn.user" placeholder="数据库用户" clearable />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="密码">
                      <n-input v-model:value="conn.password" type="password" show-password-on="click" placeholder="可为空" />
                    </n-form-item>
                  </n-gi>
                  <n-gi :span="2">
                    <n-form-item label="数据库">
                      <n-input v-model:value="conn.database" placeholder="库名（字母数字下划线）" clearable />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                <n-space style="margin-top: 8px">
                  <n-button type="primary" :loading="testing" @click="onTestConn">测试连接</n-button>
                  <n-button secondary :loading="loadingTables" :disabled="!lastTestOk" @click="onLoadTables">加载表列表</n-button>
                </n-space>
                <n-alert v-if="testMsg" style="margin-top: 12px" :type="lastTestOk ? 'success' : 'error'" :title="testMsg">
                  <template v-if="serverVersion">Server: {{ serverVersion }}</template>
                </n-alert>
              </n-form>
            </n-card>
          </n-tab-pane>

          <n-tab-pane name="schema" tab="表与结构">
            <n-card title="选择表并同步 DDL" size="small" class="panel-card">
              <n-space vertical :size="12" style="width: 100%">
                <n-space>
                  <n-select
                    v-model:value="selectedTable"
                    :options="tableOptions"
                    placeholder="先完成连接并加载表列表"
                    filterable
                    clearable
                    style="min-width: 280px"
                    :disabled="tableOptions.length === 0"
                  />
                  <n-button type="primary" secondary :loading="syncing" :disabled="!selectedTable" @click="onSyncSchema">
                    同步结构
                  </n-button>
                </n-space>
                <n-alert v-if="!tableOptions.length" type="warning" title="暂无表数据">请在「连接配置」中测试连接并加载表列表。</n-alert>
                <template v-else-if="schema">
                  <n-descriptions label-placement="left" bordered size="small" :column="2" class="schema-desc">
                    <n-descriptions-item label="库名">{{ schema.database }}</n-descriptions-item>
                    <n-descriptions-item label="表名">{{ schema.table }}</n-descriptions-item>
                    <n-descriptions-item label="列数">{{ schema.columns.length }}</n-descriptions-item>
                  </n-descriptions>
                  <n-data-table
                    size="small"
                    :columns="columnTableCols"
                    :data="schema.columns"
                    :pagination="{ pageSize: 12 }"
                    :scroll-x="720"
                    class="col-table"
                  />
                  <n-collapse>
                    <n-collapse-item title="JSON（供 LLM 上下文）" name="json">
                      <n-code language="json" :code="schemaJsonPretty" word-wrap />
                    </n-collapse-item>
                  </n-collapse>
                </template>
              </n-space>
            </n-card>
          </n-tab-pane>

          <n-tab-pane name="preview" tab="需求与预览">
            <n-card title="自然语言需求" size="small" class="panel-card">
              <n-space vertical :size="12" style="width: 100%">
                <n-space align="center">
                  <n-text depth="3">提示词模版</n-text>
                  <n-select
                    v-model:value="selectedPromptId"
                    :options="promptSelectOptions"
                    placeholder="选用预设场景（可选）"
                    clearable
                    filterable
                    style="min-width: 260px"
                    @update:value="onPickPrompt"
                  />
                  <n-radio-group v-model:value="generationMode" name="genmode">
                    <n-radio-button value="template">模版化（高性能）</n-radio-button>
                    <n-radio-button value="semantic">语义化（LLM 文本）</n-radio-button>
                  </n-radio-group>
                </n-space>
                <n-input
                  v-model:value="instruction"
                  type="textarea"
                  placeholder="例：生成 1000 条数据，用户名为合成中文姓名风格，年龄在 20–40 岁…"
                  :autosize="{ minRows: 5, maxRows: 14 }"
                />
                <n-button
                  type="primary"
                  :loading="previewing"
                  :disabled="!schema || !instruction.trim()"
                  @click="onGeneratePreview"
                >
                  生成预览
                </n-button>
                <n-alert v-if="preview?.stub" type="warning" title="当前为占位预览">
                  后端尚未接入大模型时，仅根据表字段生成 INSERT 模板骨架，便于联调界面与接口。
                </n-alert>
                <template v-if="preview">
                  <n-tabs type="segment" class="preview-tabs">
                    <n-tab-pane name="rationale" tab="生成计划">
                      <n-card embedded size="small">
                        <n-text style="white-space: pre-wrap">{{ preview.rationale }}</n-text>
                      </n-card>
                    </n-tab-pane>
                    <n-tab-pane name="sql" tab="SQL 模版">
                      <n-code language="sql" :code="preview.sql_template" word-wrap />
                    </n-tab-pane>
                    <n-tab-pane name="bind" tab="字段绑定">
                      <n-data-table size="small" :columns="bindingCols" :data="preview.bindings" :pagination="{ pageSize: 8 }" />
                    </n-tab-pane>
                  </n-tabs>
                  <n-descriptions bordered size="small" :column="3" class="preview-meta">
                    <n-descriptions-item label="模式">{{ preview.generation_mode }}</n-descriptions-item>
                    <n-descriptions-item label="预估行数">{{ preview.estimated_total_rows }}</n-descriptions-item>
                    <n-descriptions-item label="绑定数">{{ preview.bindings.length }}</n-descriptions-item>
                  </n-descriptions>
                </template>
              </n-space>
            </n-card>
          </n-tab-pane>

          <n-tab-pane name="settings" tab="设置与执行">
            <n-card title="高级选项" size="small" class="panel-card">
              <n-form label-placement="left" label-width="180" :show-feedback="false">
                <n-form-item label="归档加密全文（高级）">
                  <n-space vertical :size="4">
                    <n-switch v-model:value="settingsForm.encrypt_fulltext_enabled" />
                    <n-text depth="3" style="font-size: 12px">开启后本地保存任务时将加密存储完整 Prompt（需后续解锁流程配合）。</n-text>
                  </n-space>
                </n-form-item>
                <n-form-item label="INSERT…SELECT 最大行数上限">
                  <n-input-number
                    v-model:value="settingsForm.max_insert_select_rows"
                    :min="1"
                    :max="500000000"
                    :step="10000"
                    class="w-full"
                    style="max-width: 280px"
                  />
                </n-form-item>
                <n-button type="primary" secondary :loading="savingSettings" @click="onSaveSettings">保存设置</n-button>
              </n-form>
            </n-card>
            <n-card title="执行" size="small" class="panel-card execute-card">
              <n-alert type="default" title="批量写入" style="margin-bottom: 12px">
                当前版本仅完成预览与 Schema 联调；点击下方按钮可验证执行接口（将返回未开放提示）。
              </n-alert>
              <n-space>
                <n-button
                  type="error"
                  secondary
                  :disabled="!preview"
                  :loading="executing"
                  @click="onExecute(false)"
                >
                  试运行（不确认）
                </n-button>
                <n-button type="primary" :disabled="!preview" :loading="executing" @click="onExecute(true)">
                  确认并执行
                </n-button>
              </n-space>
              <n-alert v-if="executeMsg" type="info" style="margin-top: 12px" :title="executeMsg" />
            </n-card>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NCard,
  NCode,
  NCollapse,
  NCollapseItem,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NIcon,
  NInput,
  NInputNumber,
  NRadioButton,
  NRadioGroup,
  NScrollbar,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  NTag,
  NText,
  NSwitch,
  type DataTableColumns
} from 'naive-ui'
import { DatabaseOutlined } from '@vicons/antd'
import PageTopbar from '@/components/PageTopbar.vue'
import { dataBuilderUrl } from '@/api/data-builder-request'
import {
  executePlan,
  generatePreview,
  getDataBuilderSettings,
  getPromptLibrary,
  listMysqlTables,
  patchDataBuilderSettings,
  syncTableSchema,
  testMysqlConnection,
  type GeneratePreviewResult,
  type PromptLibraryItem,
  type TableSchemaResult
} from '@/api/data-builder'
import { message } from '@/utils/naive-api'

const activeTab = ref('conn')
const serviceOk = ref(false)

const conn = ref({
  host: '127.0.0.1',
  port: 3308,
  user: 'root',
  password: '',
  database: 'ai_automation_db'
})

const testing = ref(false)
const lastTestOk = ref(false)
const testMsg = ref('')
const serverVersion = ref('')

const loadingTables = ref(false)
const tableOptions = ref<{ label: string; value: string }[]>([])
const selectedTable = ref<string | null>(null)

const syncing = ref(false)
const schema = ref<TableSchemaResult | null>(null)

const promptItems = ref<PromptLibraryItem[]>([])
const selectedPromptId = ref<string | null>(null)
const instruction = ref('')
const generationMode = ref<'template' | 'semantic'>('template')

const previewing = ref(false)
const preview = ref<GeneratePreviewResult | null>(null)

const settingsForm = ref({
  encrypt_fulltext_enabled: false,
  max_insert_select_rows: 1_000_000
})
const savingSettings = ref(false)

const executing = ref(false)
const executeMsg = ref('')

const columnTableCols: DataTableColumns<TableSchemaResult['columns'][0]> = [
  { title: '列名', key: 'name', width: 140, ellipsis: { tooltip: true } },
  { title: '类型', key: 'data_type', width: 120 },
  { title: '完整类型', key: 'column_type', minWidth: 160, ellipsis: { tooltip: true } },
  {
    title: '可空',
    key: 'nullable',
    width: 72,
    render: (row) => (row.nullable ? '是' : '否')
  },
  { title: '注释', key: 'comment', ellipsis: { tooltip: true } }
]

const bindingCols: DataTableColumns<GeneratePreviewResult['bindings'][0]> = [
  { title: '占位符', key: 'placeholder', width: 120 },
  { title: '列', key: 'column', width: 120 },
  { title: '策略', key: 'strategy', width: 140 },
  {
    title: '参数',
    key: 'params',
    render: (row) =>
      h(NText, { depth: 3, style: 'font-size:12px' }, () =>
        JSON.stringify(row.params ?? {})
      )
  }
]

const schemaJsonPretty = computed(() => {
  if (!schema.value) return ''
  return JSON.stringify(
    {
      database: schema.value.database,
      table: schema.value.table,
      columns: schema.value.columns
    },
    null,
    2
  )
})

const promptSelectOptions = computed(() =>
  promptItems.value.map((p) => ({ label: p.title, value: p.id }))
)

function connBody() {
  return {
    host: conn.value.host.trim(),
    port: conn.value.port,
    user: conn.value.user.trim(),
    password: conn.value.password,
    database: conn.value.database.trim()
  }
}

async function pingService() {
  try {
    const r = await fetch(dataBuilderUrl('/health'))
    serviceOk.value = r.ok
    if (r.ok) message.success('数据构建服务可达')
    else message.warning(`服务响应异常 HTTP ${r.status}`)
  } catch {
    serviceOk.value = false
    message.error('无法访问数据构建服务')
  }
}

async function onTestConn() {
  testing.value = true
  testMsg.value = ''
  serverVersion.value = ''
  try {
    const res = await testMysqlConnection(connBody())
    lastTestOk.value = res.ok
    testMsg.value = res.message
    serverVersion.value = res.server_version ?? ''
    if (res.ok) message.success('连接成功')
    else message.error(res.message)
  } finally {
    testing.value = false
  }
}

async function onLoadTables() {
  loadingTables.value = true
  try {
    const res = await listMysqlTables(connBody())
    tableOptions.value = res.tables.map((t) => ({ label: t, value: t }))
    if (!res.tables.length) message.info('该库下没有基表')
    else message.success(`已加载 ${res.tables.length} 张表`)
  } finally {
    loadingTables.value = false
  }
}

async function onSyncSchema() {
  if (!selectedTable.value) return
  syncing.value = true
  try {
    schema.value = await syncTableSchema({ ...connBody(), table: selectedTable.value })
    preview.value = null
    message.success('结构已同步')
    activeTab.value = 'preview'
  } finally {
    syncing.value = false
  }
}

function onPickPrompt(id: string | null) {
  if (!id) return
  const item = promptItems.value.find((p) => p.id === id)
  if (item) instruction.value = item.instruction
}

async function onGeneratePreview() {
  if (!schema.value || !instruction.value.trim()) return
  previewing.value = true
  try {
    const table_schema = {
      database: schema.value.database,
      table: schema.value.table,
      columns: schema.value.columns
    }
    preview.value = await generatePreview({
      instruction: instruction.value.trim(),
      target_table: schema.value.table,
      table_schema,
      generation_mode: generationMode.value
    })
    message.success('已生成预览')
  } finally {
    previewing.value = false
  }
}

async function loadSettings() {
  try {
    const s = await getDataBuilderSettings()
    settingsForm.value.encrypt_fulltext_enabled = s.encrypt_fulltext_enabled
    settingsForm.value.max_insert_select_rows = s.max_insert_select_rows
  } catch {
    /* client 已 toast */
  }
}

async function onSaveSettings() {
  savingSettings.value = true
  try {
    await patchDataBuilderSettings({
      encrypt_fulltext_enabled: settingsForm.value.encrypt_fulltext_enabled,
      max_insert_select_rows: settingsForm.value.max_insert_select_rows
    })
    message.success('设置已保存（服务端进程内生效）')
    await loadSettings()
  } finally {
    savingSettings.value = false
  }
}

async function onExecute(confirm: boolean) {
  if (!preview.value || !schema.value) return
  executing.value = true
  executeMsg.value = ''
  try {
    const plan = {
      schema_version: '1.0',
      rationale: preview.value.rationale,
      sql_template: preview.value.sql_template,
      bindings: preview.value.bindings,
      generation_mode: preview.value.generation_mode,
      estimated_total_rows: preview.value.estimated_total_rows,
      target_table: schema.value.table,
      database: schema.value.database
    }
    const res = await executePlan({ plan, confirm })
    executeMsg.value = res.message
    message.info(res.message)
  } finally {
    executing.value = false
  }
}

watch(selectedTable, () => {
  schema.value = null
  preview.value = null
})

onMounted(async () => {
  void pingService()
  try {
    const lib = await getPromptLibrary()
    promptItems.value = lib.items ?? []
  } catch {
    promptItems.value = []
  }
  await loadSettings()
})
</script>

<style scoped>
.data-builder {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--color-bg-page, #f5f5f7);
}

.data-builder-scroll {
  flex: 1;
  min-height: 0;
}

.data-builder-inner {
  padding: 20px 24px 32px;
  max-width: 1200px;
}

.intro-alert {
  margin-bottom: 16px;
}

.main-tabs :deep(.n-tabs-nav) {
  margin-bottom: 8px;
}

.panel-card {
  margin-bottom: 16px;
}

.panel-card :deep(.n-card-header) {
  padding-bottom: 8px;
}

.w-full {
  width: 100%;
}

.schema-desc {
  margin-bottom: 12px;
}

.col-table {
  margin-bottom: 12px;
}

.preview-tabs {
  margin-top: 8px;
}

.preview-meta {
  margin-top: 12px;
}

.execute-card {
  margin-top: 0;
}
</style>
