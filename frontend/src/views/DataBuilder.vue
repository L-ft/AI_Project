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
              <n-alert v-if="connRestoredFromLocal" type="info" title="已恢复本地配置" closable style="margin-bottom: 12px" @close="connRestoredFromLocal = false">
                已从浏览器本地读取上次<strong>连接成功</strong>时保存的配置。请再点一次「测试连接」确认当前环境可用后再继续。
              </n-alert>
              <n-alert type="warning" title="连接行为说明" style="margin-bottom: 12px">
                后端会严格按表单里填写的主机、端口、用户名、密码、数据库去发起连接，不会从项目配置里替你改写目标库。
                为了让 Docker 部署下的体验更接近常见 MySQL 客户端，当后端运行在容器内且这里填写
                localhost / 127.0.0.1 时，服务会自动把它解析为宿主机地址。若你要连接 Compose 内部的 MySQL
                容器，请直接填写 mysql_final:3306。数据库名可先留空用于测试连通性，加载表列表前再填写。
              </n-alert>
              <n-text depth="3" style="display: block; margin: -4px 0 12px; font-size: 12px">
                测试连接成功后，会将本页配置保存到当前浏览器的本地存储（含密码），下次进入本页自动回填。多人共用电脑请勿使用，可用「清除本地保存」删除。
              </n-text>
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
                <n-space style="margin-top: 8px" align="center">
                  <n-button type="primary" :loading="testing" @click="onTestConn">测试连接</n-button>
                  <n-button secondary :loading="loadingTables" :disabled="!lastTestOk" @click="onLoadTables">加载表列表</n-button>
                  <n-button quaternary size="small" @click="onClearSavedMysqlConn">清除本地保存</n-button>
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
                <!-- 顶部行：提示词模版(左) + 生成SQL控件(右) -->
                <div class="preview-top-row">
                  <n-space align="center" wrap>
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
                  <n-space v-if="generationMode === 'semantic'" align="center" :size="8">
                    <n-button type="primary" :loading="generatingSql" :disabled="generatingSql" @click="onGenerateSql">
                      生成 SQL
                    </n-button>
                    <n-input-number
                      v-model:value="queryMaxRows"
                      :min="1"
                      :max="5000"
                      :step="50"
                      style="width: 140px"
                    />
                    <n-text depth="3" style="font-size: 12px">最大返回行</n-text>
                    <n-button
                      type="primary"
                      secondary
                      :loading="executingQuery"
                      :disabled="executingQuery"
                      @click="onExecuteReadonlyQuery"
                    >
                      执行查询
                    </n-button>
                  </n-space>
                </div>

                <!-- 模版化模式：保持原有纵向布局 -->
                <template v-if="generationMode === 'template'">
                  <n-input
                    v-model:value="instruction"
                    type="textarea"
                    placeholder="例：生成 1000 条数据，用户名为合成中文姓名风格，年龄在 20–40 岁…"
                    :autosize="{ minRows: 5, maxRows: 14 }"
                  />
                  <n-space align="center">
                    <n-button
                      type="primary"
                      :loading="previewing"
                      :disabled="!schema || !instruction.trim()"
                      @click="onGeneratePreview"
                    >
                      生成预览
                    </n-button>
                  </n-space>
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
                </template>

                <!-- 语义化模式：左右分布 -->
                <template v-else>
                  <n-grid :cols="24" :x-gap="16">
                    <!-- 左侧：大模型配置 + 需求输入 -->
                    <n-gi :span="12">
                      <n-space vertical :size="12" style="width: 100%">
                        <n-card
                          title="大模型配置"
                          size="small"
                          embedded
                          class="llm-card"
                        >
                          <n-alert type="warning" title="密钥安全" style="margin-bottom: 12px">
                            API Key 仅随请求发往本平台的 data-builder 服务，服务端不落库；请勿在公共网络明文传播。
                          </n-alert>
                          <n-grid :cols="2" :x-gap="16" :y-gap="12">
                            <n-gi>
                              <n-form-item label="厂商" label-placement="left">
                                <n-select
                                  v-model:value="llmProvider"
                                  :options="llmProviderOptions"
                                  style="width: 100%"
                                />
                              </n-form-item>
                            </n-gi>
                            <n-gi>
                              <n-form-item label="模型" label-placement="left">
                                <n-input v-model:value="llmModel" placeholder="如 deepseek-chat / qwen-plus" clearable />
                              </n-form-item>
                            </n-gi>
                            <n-gi :span="2">
                              <n-form-item label="API Key" label-placement="left">
                                <n-input
                                  v-model:value="llmApiKey"
                                  type="password"
                                  show-password-on="click"
                                  placeholder="大模型平台密钥"
                                  clearable
                                />
                              </n-form-item>
                            </n-gi>
                            <n-gi :span="2">
                              <n-form-item :label="llmProvider === 'openai_compatible' ? 'Base URL（必填）' : 'Base URL（可选）'" label-placement="left">
                                <n-input
                                  v-model:value="llmBaseUrl"
                                  :placeholder="
                                    llmProvider === 'openai_compatible'
                                      ? 'https://example.com/v1'
                                      : '留空使用默认；填写则覆盖厂商默认端点'
                                  "
                                  clearable
                                />
                              </n-form-item>
                            </n-gi>
                          </n-grid>
                          <n-text depth="3" style="font-size: 12px">
                            DeepSeek 默认 <code>https://api.deepseek.com/v1</code>；千问兼容模式默认
                            <code>https://dashscope.aliyuncs.com/compatible-mode/v1</code>。OpenAI 兼容通道需填写 Base URL。
                          </n-text>
                        </n-card>
                        <n-input
                          v-model:value="instruction"
                          type="textarea"
                          placeholder="例：统计当前表有多少行；或查询最近 10 条测试用例名称…"
                          :autosize="{ minRows: 5, maxRows: 14 }"
                        />
                      </n-space>
                    </n-gi>
                    <!-- 右侧：生成的SQL + 查询结果 -->
                    <n-gi :span="12">
                      <n-space vertical :size="12" style="width: 100%">
                        <n-alert v-if="nl2sqlRationale" type="default" title="模型说明">
                          <n-text style="white-space: pre-wrap">{{ nl2sqlRationale }}</n-text>
                        </n-alert>
                        <n-card v-if="aiSql" title="AI 生成的 SQL" size="small" embedded>
                          <n-code language="sql" :code="aiSql" word-wrap />
                        </n-card>
                        <n-card v-if="queryResult" title="查询结果" size="small" embedded class="result-card">
                          <n-space vertical :size="8" style="width: 100%">
                            <n-space align="center">
                              <n-text depth="3">行数：{{ queryResult.row_count }}</n-text>
                              <n-tag v-if="queryResult.truncated" type="warning" size="small">已截断（达上限）</n-tag>
                            </n-space>
                            <n-data-table
                              size="small"
                              :columns="queryResultColumns"
                              :data="queryResult.rows"
                              :scroll-x="Math.max(480, (queryResult.columns?.length ?? 0) * 140)"
                              :pagination="{ pageSize: 10 }"
                            />
                          </n-space>
                        </n-card>
                        <div v-if="!aiSql && !queryResult" class="semantic-empty-hint">
                          <n-text depth="3">在左侧配置模型并输入需求，点击「生成 SQL」后结果将在此展示</n-text>
                        </div>
                      </n-space>
                    </n-gi>
                  </n-grid>
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
  executeReadonlyQuery,
  generatePreview,
  getDataBuilderSettings,
  getPromptLibrary,
  listMysqlTables,
  nl2sqlGenerate,
  patchDataBuilderSettings,
  syncTableSchema,
  testMysqlConnection,
  type GeneratePreviewResult,
  type LlmProviderId,
  type PromptLibraryItem,
  type QueryExecuteResult,
  type TableSchemaResult
} from '@/api/data-builder'
import { message } from '@/utils/naive-api'

const activeTab = ref('conn')
const serviceOk = ref(false)

const MYSQL_CONN_STORAGE_KEY = 'data-builder.mysql-conn.v1'

type SavedMysqlConnPayload = {
  v: 1
  host: string
  port: number
  user: string
  password: string
  database: string
  selectedTable?: string | null
}

const conn = ref({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: ''
})

const connRestoredFromLocal = ref(false)

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

const llmProvider = ref<LlmProviderId>('deepseek')
const llmModel = ref('deepseek-chat')
const llmApiKey = ref('')
const llmBaseUrl = ref('')

const llmProviderOptions = [
  { label: 'DeepSeek', value: 'deepseek' as const },
  { label: '通义千问（OpenAI 兼容）', value: 'qwen' as const },
  { label: 'OpenAI 兼容（自定义 Base URL）', value: 'openai_compatible' as const }
]

const generatingSql = ref(false)
const executingQuery = ref(false)
const aiSql = ref('')
const nl2sqlRationale = ref('')
const queryResult = ref<QueryExecuteResult | null>(null)
const queryMaxRows = ref(500)

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

const connReady = computed(
  () =>
    !!conn.value.host.trim() &&
    !!conn.value.user.trim() &&
    !!conn.value.database.trim() &&
    conn.value.port >= 1 &&
    conn.value.port <= 65535
)

const queryResultColumns = computed<DataTableColumns<Record<string, unknown>>>(() => {
  const cols = queryResult.value?.columns ?? []
  return cols.map((c) => ({
    title: c,
    key: c,
    minWidth: 120,
    ellipsis: { tooltip: true },
    render: (row) => {
      const v = row[c]
      if (v == null) return ''
      if (typeof v === 'object') return JSON.stringify(v)
      return String(v)
    }
  }))
})

function connBody() {
  return {
    host: conn.value.host.trim(),
    port: conn.value.port,
    user: conn.value.user.trim(),
    password: conn.value.password,
    database: conn.value.database.trim()
  }
}

function saveMysqlConnToLocal(): void {
  const payload: SavedMysqlConnPayload = {
    v: 1,
    host: conn.value.host.trim(),
    port: Number(conn.value.port) > 0 ? Number(conn.value.port) : 3306,
    user: conn.value.user.trim(),
    password: conn.value.password,
    database: conn.value.database.trim(),
    selectedTable: selectedTable.value
  }
  try {
    localStorage.setItem(MYSQL_CONN_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    message.warning('无法写入浏览器本地存储，请检查是否禁用存储权限')
  }
}

function loadMysqlConnFromLocal(): boolean {
  try {
    const raw = localStorage.getItem(MYSQL_CONN_STORAGE_KEY)
    if (!raw) return false
    const o = JSON.parse(raw) as Partial<SavedMysqlConnPayload>
    if (typeof o.host !== 'string' || typeof o.user !== 'string') return false
    conn.value.host = o.host
    conn.value.port = typeof o.port === 'number' && o.port > 0 && o.port <= 65535 ? o.port : 3306
    conn.value.user = o.user
    conn.value.password = typeof o.password === 'string' ? o.password : ''
    conn.value.database = typeof o.database === 'string' ? o.database : ''
    if (typeof o.selectedTable === 'string' && o.selectedTable.length > 0) {
      selectedTable.value = o.selectedTable
    }
    return true
  } catch {
    return false
  }
}

function onClearSavedMysqlConn(): void {
  try {
    localStorage.removeItem(MYSQL_CONN_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  connRestoredFromLocal.value = false
  message.success('已清除本地保存的连接信息')
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

async function loadTablesFromConn() {
  if (!conn.value.database.trim()) {
    message.warning('请先填写数据库名，再加载表列表')
    return
  }
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

async function onTestConn() {
  testing.value = true
  testMsg.value = ''
  serverVersion.value = ''
  try {
    const res = await testMysqlConnection(connBody())
    lastTestOk.value = res.ok
    testMsg.value = res.message
    serverVersion.value = res.server_version ?? ''
    if (res.ok) {
      message.success('连接成功，配置已保存到浏览器本地')
      saveMysqlConnToLocal()
    } else {
      message.error(res.message)
    }

    if (res.ok && conn.value.database.trim()) {
      await loadTablesFromConn()
    }
  } finally {
    testing.value = false
  }
}

async function onLoadTables() {
  await loadTablesFromConn()
}

async function onSyncSchema() {
  if (!selectedTable.value) return
  syncing.value = true
  try {
    schema.value = await syncTableSchema({ ...connBody(), table: selectedTable.value })
    preview.value = null
    saveMysqlConnToLocal()
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

watch(llmProvider, (p) => {
  if (p === 'deepseek') llmModel.value = 'deepseek-chat'
  else if (p === 'qwen') llmModel.value = 'qwen-plus'
  else llmModel.value = 'gpt-4o-mini'
})

watch(generationMode, (m) => {
  if (m === 'semantic') {
    preview.value = null
  } else {
    aiSql.value = ''
    queryResult.value = null
    nl2sqlRationale.value = ''
  }
})

async function onGenerateSql() {
  if (!instruction.value.trim()) {
    message.warning('请填写自然语言需求')
    return
  }
  if (!llmModel.value.trim()) {
    message.warning('请填写模型名称')
    return
  }
  if (!llmApiKey.value.trim()) {
    message.warning('请填写 API Key')
    return
  }
  if (llmProvider.value === 'openai_compatible' && !llmBaseUrl.value.trim()) {
    message.warning('OpenAI 兼容模式需填写 Base URL')
    return
  }
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }

  let sch = schema.value
  if (!sch) {
    if (!selectedTable.value) {
      message.warning('请先到「表与结构」选择数据表并同步结构（或选中表后直接点生成，将自动同步）')
      return
    }
    try {
      sch = await syncTableSchema({ ...connBody(), table: selectedTable.value })
      schema.value = sch
      message.success('已根据当前所选表自动同步结构')
    } catch {
      return
    }
  }

  generatingSql.value = true
  nl2sqlRationale.value = ''
  try {
    const table_schema = {
      database: sch.database,
      table: sch.table,
      columns: sch.columns
    }
    const res = await nl2sqlGenerate({
      instruction: instruction.value.trim(),
      table_schema,
      provider: llmProvider.value,
      model: llmModel.value.trim(),
      api_key: llmApiKey.value.trim(),
      base_url: llmBaseUrl.value.trim() || undefined
    })
    aiSql.value = res.sql
    nl2sqlRationale.value = (res.rationale ?? '').trim()
    queryResult.value = null
    message.success('已生成 SQL')
  } finally {
    generatingSql.value = false
  }
}

async function onExecuteReadonlyQuery() {
  if (!aiSql.value.trim()) {
    message.warning('请先生成 SQL')
    return
  }
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }
  executingQuery.value = true
  try {
    const maxRows = queryMaxRows.value ?? 500
    queryResult.value = await executeReadonlyQuery({
      ...connBody(),
      sql: aiSql.value.trim(),
      max_rows: maxRows,
      timeout_seconds: 30
    })
    message.success('查询完成')
  } finally {
    executingQuery.value = false
  }
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
  aiSql.value = ''
  queryResult.value = null
  nl2sqlRationale.value = ''
  if (lastTestOk.value) {
    saveMysqlConnToLocal()
  }
})

watch(activeTab, (tab) => {
  if (
    tab === 'schema' &&
    lastTestOk.value &&
    conn.value.database.trim() &&
    tableOptions.value.length === 0 &&
    !loadingTables.value
  ) {
    void loadTablesFromConn()
  }
})

onMounted(async () => {
  if (loadMysqlConnFromLocal()) {
    connRestoredFromLocal.value = true
    lastTestOk.value = false
    testMsg.value = ''
    serverVersion.value = ''
    tableOptions.value = []
    schema.value = null
    preview.value = null
    aiSql.value = ''
    queryResult.value = null
    nl2sqlRationale.value = ''
  }

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
  width: 100%;
  max-width: none;
  box-sizing: border-box;
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

.llm-card :deep(.n-card__content) {
  padding-top: 8px;
}

.result-card :deep(.n-card-header) {
  padding-bottom: 8px;
}

.preview-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.semantic-empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-subtle);
  padding: 24px;
  text-align: center;
}
</style>
