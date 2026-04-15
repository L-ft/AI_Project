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
          配置<strong>目标 MySQL</strong>（与平台自身库可不同）→ 选择表并同步结构 → 描述需求。
          「需求与预览」支持模版占位预览与语义化只读 SQL；<strong>多语句写入编排</strong>在同页下方以事务执行（先校验
          <code>confirm=false</code>，再 <code>confirm=true</code> 提交）。写入步骤仅允许单条
          <code>INSERT</code>（含 <code>INSERT…SELECT</code>）或带 <code>{列名}</code> 模板的按行展开插入。
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
                <n-space align="center" wrap>
                  <n-select
                    v-model:value="selectedTables"
                    :options="tableOptions"
                    placeholder="先完成连接并加载表列表（可多选）"
                    filterable
                    clearable
                    multiple
                    :max-tag-count="3"
                    style="min-width: 320px; max-width: 520px"
                    :disabled="tableOptions.length === 0"
                  />
                  <n-button
                    type="primary"
                    secondary
                    :loading="syncing"
                    :disabled="!selectedTables.length"
                    @click="onSyncSchema"
                  >
                    同步结构
                  </n-button>
                </n-space>
                <n-text v-if="tableOptions.length" depth="3" style="font-size: 12px; display: block">
                  「需求与预览」以<strong>当前表页签</strong>为准；「生成 SQL」会将<strong>当前已同步的全部表</strong>结构一并交给大模型，可按需在问题里写清关联关系。
                </n-text>
                <n-alert v-if="!tableOptions.length" type="warning" title="暂无表数据">请在「连接配置」中测试连接并加载表列表。</n-alert>
                <template v-else-if="syncedSchemas.length">
                  <n-tabs v-model:value="activeSchemaKey" type="line" class="schema-table-tabs">
                    <n-tab-pane v-for="sch in syncedSchemas" :key="sch.table" :name="sch.table" :tab="sch.table">
                      <n-descriptions label-placement="left" bordered size="small" :column="2" class="schema-desc">
                        <n-descriptions-item label="库名">{{ sch.database }}</n-descriptions-item>
                        <n-descriptions-item label="表名">{{ sch.table }}</n-descriptions-item>
                        <n-descriptions-item label="列数">{{ sch.columns.length }}</n-descriptions-item>
                      </n-descriptions>
                      <n-data-table
                        size="small"
                        :columns="columnTableCols"
                        :data="sch.columns"
                        :pagination="{ pageSize: 12 }"
                        :scroll-x="720"
                        class="col-table"
                      />
                      <n-collapse>
                        <n-collapse-item title="JSON（供 LLM 上下文）" :name="`json-${sch.table}`">
                          <n-code language="json" :code="schemaJsonFor(sch)" word-wrap />
                        </n-collapse-item>
                      </n-collapse>
                    </n-tab-pane>
                  </n-tabs>
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
                      :disabled="!activeSchema || !instruction.trim()"
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

                <n-card title="多语句写入编排（事务）" size="small" embedded class="orchestrate-card">
                  <n-space vertical :size="12" style="width: 100%">
                    <n-alert type="warning" title="风险提示">
                      确认执行将向<strong>当前连接库</strong>写入数据；所有步骤在同一事务中，失败会回滚。请先「校验计划」再执行。
                    </n-alert>
                    <n-space align="center" wrap :size="8">
                      <n-button
                        type="primary"
                        secondary
                        :loading="analyzingRel"
                        :disabled="!connReady || !syncedSchemas.length"
                        @click="onAnalyzeRelations"
                      >
                        分析表关联
                      </n-button>
                      <n-button
                        type="primary"
                        secondary
                        :loading="generatingWritePlan"
                        :disabled="llmGenerateDisabled || writePlanBusy"
                        @click="onGenerateWritePlan"
                      >
                        生成写入计划（单段）
                      </n-button>
                      <n-button
                        type="primary"
                        tertiary
                        :loading="generatingCot"
                        :disabled="llmGenerateDisabled || writePlanBusy"
                        @click="onGenerateWritePlanCot"
                      >
                        CoT：Planner + Steps
                      </n-button>
                      <n-button
                        tertiary
                        :loading="generatingPlannerOnly"
                        :disabled="llmGenerateDisabled || writePlanBusy"
                        @click="onGeneratePlannerOnly"
                      >
                        仅 Planner
                      </n-button>
                      <n-button
                        tertiary
                        :loading="generatingStepsOnly"
                        :disabled="llmGenerateDisabled || writePlanBusy || !plannerJson.trim()"
                        @click="onGenerateStepsFromPlanner"
                      >
                        根据 Planner 生成 Steps
                      </n-button>
                      <n-button
                        :loading="orchestrateBusy"
                        :disabled="!connReady || !orchestrateJson.trim()"
                        @click="onOrchestrateValidate"
                      >
                        校验计划
                      </n-button>
                      <n-popconfirm @positive-click="onOrchestrateExecute">
                        <template #trigger>
                          <n-button
                            type="error"
                            secondary
                            :loading="orchestrateBusy"
                            :disabled="!connReady || !orchestrateJson.trim()"
                          >
                            确认执行写入
                          </n-button>
                        </template>
                        确定在目标库执行编排中的写入步骤？此操作不可自动撤销（仅当事务失败时回滚）。
                      </n-popconfirm>
                    </n-space>
                    <n-text depth="3" style="font-size: 12px; display: block">
                      <strong>CoT 双段</strong>：先调用「仅 Planner」得到规划 JSON，再「根据 Planner 生成 Steps」；或一键「CoT：Planner +
                      Steps」。便于固定第一段做回归对比。
                    </n-text>
                    <n-input
                      v-model:value="plannerJson"
                      type="textarea"
                      placeholder="Planner JSON（CoT 第一段，可编辑；由「仅 Planner」或 CoT 一键生成后填入）"
                      :autosize="{ minRows: 4, maxRows: 12 }"
                    />
                    <n-collapse v-if="relEdges.length">
                      <n-collapse-item title="检测到的潜在关联" name="rel">
                        <n-data-table
                          size="small"
                          :columns="relEdgeCols"
                          :data="relEdges"
                          :pagination="{ pageSize: 8 }"
                          :scroll-x="720"
                        />
                      </n-collapse-item>
                    </n-collapse>
                    <n-input
                      v-model:value="writePlanRationale"
                      type="textarea"
                      placeholder="写入计划说明（由 LLM 生成后展示，可编辑补充）"
                      :autosize="{ minRows: 2, maxRows: 6 }"
                    />
                    <n-input
                      v-model:value="orchestrateJson"
                      type="textarea"
                      placeholder='编排 JSON：steps 数组，示例 [{"id":"s1","kind":"readonly","sql":"SELECT id FROM t LIMIT 5","max_rows":10},{"id":"s2","kind":"write","sql":"INSERT INTO c (pid) VALUES ({id})","foreach_source_step_id":"s1"}]'
                      :autosize="{ minRows: 8, maxRows: 22 }"
                    />
                    <n-alert v-if="orchestrateMsg" type="info" :title="orchestrateMsg" />
                    <n-data-table
                      v-if="orchestrateStepResults.length"
                      size="small"
                      :columns="orchestrateResultCols"
                      :data="orchestrateStepResults"
                      :pagination="{ pageSize: 6 }"
                    />
                  </n-space>
                </n-card>
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
                真实写入请使用「需求与预览」页签中的<strong>多语句写入编排</strong>（
                <code>/api/v1/orchestrate/execute</code>）。下方按钮仍为旧版占位预览执行接口。
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
  NPopconfirm,
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
  fetchSchemaRelationships,
  generatePreview,
  generateWritePlan,
  generateWritePlanCot,
  generateWritePlanPlanner,
  generateWritePlanSteps,
  getDataBuilderSettings,
  getPromptLibrary,
  listMysqlTables,
  nl2sqlGenerate,
  orchestrateExecute,
  patchDataBuilderSettings,
  syncTableSchemasBatch,
  testMysqlConnection,
  type GeneratePreviewResult,
  type LlmProviderId,
  type OrchestrateStepPayload,
  type OrchestrateStepResult,
  type PromptLibraryItem,
  type QueryExecuteResult,
  type RelationshipEdge,
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
  /** 多选表名；旧版仅含 selectedTable */
  selectedTables?: string[]
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
const selectedTables = ref<string[]>([])

const syncing = ref(false)
const syncedSchemas = ref<TableSchemaResult[]>([])
const activeSchemaKey = ref<string | null>(null)

const activeSchema = computed(() => {
  const list = syncedSchemas.value
  if (!list.length) return null
  const key = activeSchemaKey.value
  if (key) {
    const found = list.find((s) => s.table === key)
    if (found) return found
  }
  return list[0]
})

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

const analyzingRel = ref(false)
const relEdges = ref<RelationshipEdge[]>([])
const generatingWritePlan = ref(false)
const generatingCot = ref(false)
const generatingPlannerOnly = ref(false)
const generatingStepsOnly = ref(false)
const plannerJson = ref('')
const orchestrateBusy = ref(false)
const orchestrateJson = ref('')
const writePlanRationale = ref('')
const orchestrateMsg = ref('')
const orchestrateStepResults = ref<OrchestrateStepResult[]>([])

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

const relEdgeCols: DataTableColumns<RelationshipEdge> = [
  { title: '子表', key: 'from_table', width: 140, ellipsis: { tooltip: true } },
  { title: '子列', key: 'from_column', width: 120 },
  { title: '父表', key: 'to_table', width: 140, ellipsis: { tooltip: true } },
  { title: '父列', key: 'to_column', width: 100 },
  {
    title: '来源',
    key: 'source',
    width: 100,
    render: (row) => (row.source === 'fk' ? '外键' : '启发式')
  },
  {
    title: '置信度',
    key: 'confidence',
    width: 88,
    render: (row) => String(row.confidence)
  }
]

const orchestrateResultCols: DataTableColumns<OrchestrateStepResult> = [
  { title: '步骤', key: 'step_id', width: 100 },
  {
    title: '类型',
    key: 'kind',
    width: 88,
    render: (row) => (row.kind === 'readonly' ? '只读' : '写入')
  },
  { title: '结果行数', key: 'row_count', width: 96 },
  { title: '影响行', key: 'affected_rows', width: 96 },
  {
    title: '截断',
    key: 'truncated',
    width: 72,
    render: (row) => (row.truncated ? '是' : '')
  }
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

function schemaJsonFor(sch: TableSchemaResult): string {
  return JSON.stringify(
    {
      database: sch.database,
      table: sch.table,
      columns: sch.columns
    },
    null,
    2
  )
}

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

const llmGenerateDisabled = computed(
  () =>
    !connReady.value ||
    !syncedSchemas.value.length ||
    !instruction.value.trim() ||
    !llmModel.value.trim() ||
    !llmApiKey.value.trim() ||
    (llmProvider.value === 'openai_compatible' && !llmBaseUrl.value.trim())
)

const writePlanBusy = computed(
  () =>
    generatingWritePlan.value ||
    generatingCot.value ||
    generatingPlannerOnly.value ||
    generatingStepsOnly.value
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
    selectedTables: [...selectedTables.value]
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
    if (Array.isArray(o.selectedTables) && o.selectedTables.length > 0) {
      selectedTables.value = o.selectedTables.filter((t): t is string => typeof t === 'string' && t.length > 0)
    } else if (typeof o.selectedTable === 'string' && o.selectedTable.length > 0) {
      selectedTables.value = [o.selectedTable]
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

async function fetchSchemasForTables(tables: string[]): Promise<TableSchemaResult[]> {
  const { schemas } = await syncTableSchemasBatch({ ...connBody(), tables })
  return schemas
}

async function onSyncSchema() {
  if (!selectedTables.value.length) return
  syncing.value = true
  try {
    syncedSchemas.value = await fetchSchemasForTables(selectedTables.value)
    const first = syncedSchemas.value[0]?.table ?? null
    activeSchemaKey.value = first
    preview.value = null
    saveMysqlConnToLocal()
    message.success(`已同步 ${syncedSchemas.value.length} 张表结构`)
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

  if (!activeSchema.value) {
    if (!selectedTables.value.length) {
      message.warning('请先到「表与结构」选择数据表并同步结构（或选中表后直接点生成，将自动同步）')
      return
    }
    try {
      const list = await fetchSchemasForTables(selectedTables.value)
      syncedSchemas.value = list
      activeSchemaKey.value = list[0]?.table ?? null
      preview.value = null
      message.success(
        list.length > 1
          ? `已根据当前所选 ${list.length} 张表自动同步结构（生成 SQL 将包含全部已同步表）`
          : '已根据当前所选表自动同步结构'
      )
    } catch {
      return
    }
  }

  if (!syncedSchemas.value.length) {
    message.warning('请先到「表与结构」同步表结构后再生成 SQL')
    return
  }

  generatingSql.value = true
  nl2sqlRationale.value = ''
  try {
    const tables_schema = syncedSchemas.value.map((s) => ({
      database: s.database,
      table: s.table,
      columns: s.columns
    }))
    const res = await nl2sqlGenerate({
      instruction: instruction.value.trim(),
      tables_schema,
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
  const sch = activeSchema.value
  if (!sch || !instruction.value.trim()) return
  previewing.value = true
  try {
    const table_schema = {
      database: sch.database,
      table: sch.table,
      columns: sch.columns
    }
    preview.value = await generatePreview({
      instruction: instruction.value.trim(),
      target_table: sch.table,
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
  const sch = activeSchema.value
  if (!preview.value || !sch) return
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
      target_table: sch.table,
      database: sch.database
    }
    const res = await executePlan({ plan, confirm })
    executeMsg.value = res.message
    message.info(res.message)
  } finally {
    executing.value = false
  }
}

function parseOrchestrateSteps(raw: string): OrchestrateStepPayload[] {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('编排 JSON 为空')
  const j: unknown = JSON.parse(trimmed)
  if (Array.isArray(j)) return j as OrchestrateStepPayload[]
  if (j && typeof j === 'object' && Array.isArray((j as { steps?: unknown }).steps)) {
    return (j as { steps: OrchestrateStepPayload[] }).steps
  }
  throw new Error('编排 JSON 须为数组，或包含 steps 数组的对象')
}

async function onAnalyzeRelations() {
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }
  if (!syncedSchemas.value.length) {
    message.warning('请先同步表结构')
    return
  }
  analyzingRel.value = true
  try {
    const tables = syncedSchemas.value.map((s) => s.table)
    const res = await fetchSchemaRelationships({ ...connBody(), tables })
    relEdges.value = res.edges ?? []
    message.success(`已分析关联，共 ${relEdges.value.length} 条边`)
  } catch {
    relEdges.value = []
  } finally {
    analyzingRel.value = false
  }
}

function buildWritePlanLlmPayload() {
  const hints = relEdges.value.map(
    (e) => `${e.from_table}.${e.from_column} -> ${e.to_table}.${e.to_column} (${e.source})`
  )
  const tables_schema = syncedSchemas.value.map((s) => ({
    database: s.database,
    table: s.table,
    columns: s.columns
  }))
  return {
    instruction: instruction.value.trim(),
    tables_schema,
    relation_hints: hints.length ? hints : undefined,
    provider: llmProvider.value,
    model: llmModel.value.trim(),
    api_key: llmApiKey.value.trim(),
    base_url: llmBaseUrl.value.trim() || undefined
  }
}

async function onGenerateWritePlan() {
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }
  if (!syncedSchemas.value.length) {
    message.warning('请先同步表结构')
    return
  }
  if (!instruction.value.trim()) {
    message.warning('请填写自然语言写入/造数目标')
    return
  }
  if (!llmModel.value.trim() || !llmApiKey.value.trim()) {
    message.warning('请填写模型名称与 API Key')
    return
  }
  if (llmProvider.value === 'openai_compatible' && !llmBaseUrl.value.trim()) {
    message.warning('OpenAI 兼容模式需填写 Base URL')
    return
  }
  generatingWritePlan.value = true
  try {
    const res = await generateWritePlan(buildWritePlanLlmPayload())
    plannerJson.value = ''
    writePlanRationale.value = (res.rationale ?? '').trim()
    orchestrateJson.value = JSON.stringify(
      { rationale: res.rationale ?? '', steps: res.steps ?? [] },
      null,
      2
    )
    orchestrateMsg.value = ''
    orchestrateStepResults.value = []
    message.success('已生成写入计划（单段），请检查 JSON 后再校验/执行')
  } finally {
    generatingWritePlan.value = false
  }
}

async function onGenerateWritePlanCot() {
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }
  if (!syncedSchemas.value.length) {
    message.warning('请先同步表结构')
    return
  }
  if (!instruction.value.trim()) {
    message.warning('请填写自然语言写入/造数目标')
    return
  }
  if (!llmModel.value.trim() || !llmApiKey.value.trim()) {
    message.warning('请填写模型名称与 API Key')
    return
  }
  if (llmProvider.value === 'openai_compatible' && !llmBaseUrl.value.trim()) {
    message.warning('OpenAI 兼容模式需填写 Base URL')
    return
  }
  generatingCot.value = true
  try {
    const res = await generateWritePlanCot(buildWritePlanLlmPayload())
    plannerJson.value = JSON.stringify(res.planner, null, 2)
    const pr = (res.planner?.rationale ?? '').trim()
    const wr = (res.write_plan?.rationale ?? '').trim()
    writePlanRationale.value = [pr && `【Planner】${pr}`, wr && `【生成器】${wr}`].filter(Boolean).join('\n\n')
    orchestrateJson.value = JSON.stringify(
      { rationale: res.write_plan?.rationale ?? '', steps: res.write_plan?.steps ?? [] },
      null,
      2
    )
    orchestrateMsg.value = ''
    orchestrateStepResults.value = []
    message.success('CoT 两段已生成，请检查 Planner 与编排 JSON')
  } finally {
    generatingCot.value = false
  }
}

async function onGeneratePlannerOnly() {
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }
  if (!syncedSchemas.value.length) {
    message.warning('请先同步表结构')
    return
  }
  if (!instruction.value.trim()) {
    message.warning('请填写自然语言写入/造数目标')
    return
  }
  if (!llmModel.value.trim() || !llmApiKey.value.trim()) {
    message.warning('请填写模型名称与 API Key')
    return
  }
  if (llmProvider.value === 'openai_compatible' && !llmBaseUrl.value.trim()) {
    message.warning('OpenAI 兼容模式需填写 Base URL')
    return
  }
  generatingPlannerOnly.value = true
  try {
    const p = await generateWritePlanPlanner(buildWritePlanLlmPayload())
    plannerJson.value = JSON.stringify(p, null, 2)
    orchestrateMsg.value = ''
    orchestrateStepResults.value = []
    message.success('Planner 已生成，可继续生成 Steps 或手工改 JSON')
  } finally {
    generatingPlannerOnly.value = false
  }
}

async function onGenerateStepsFromPlanner() {
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }
  if (!syncedSchemas.value.length) {
    message.warning('请先同步表结构')
    return
  }
  if (!instruction.value.trim()) {
    message.warning('请填写自然语言写入/造数目标')
    return
  }
  if (!llmModel.value.trim() || !llmApiKey.value.trim()) {
    message.warning('请填写模型名称与 API Key')
    return
  }
  if (llmProvider.value === 'openai_compatible' && !llmBaseUrl.value.trim()) {
    message.warning('OpenAI 兼容模式需填写 Base URL')
    return
  }
  let planner: Record<string, unknown>
  try {
    planner = JSON.parse(plannerJson.value) as Record<string, unknown>
  } catch {
    message.error('Planner JSON 解析失败')
    return
  }
  generatingStepsOnly.value = true
  try {
    const res = await generateWritePlanSteps({
      ...buildWritePlanLlmPayload(),
      planner
    })
    writePlanRationale.value = (res.rationale ?? '').trim()
    orchestrateJson.value = JSON.stringify(
      { rationale: res.rationale ?? '', steps: res.steps ?? [] },
      null,
      2
    )
    orchestrateMsg.value = ''
    orchestrateStepResults.value = []
    message.success('已根据 Planner 生成 Steps')
  } finally {
    generatingStepsOnly.value = false
  }
}

async function onOrchestrateValidate() {
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }
  let steps: OrchestrateStepPayload[]
  try {
    steps = parseOrchestrateSteps(orchestrateJson.value)
  } catch (e) {
    message.error(e instanceof Error ? e.message : '编排 JSON 解析失败')
    return
  }
  orchestrateBusy.value = true
  orchestrateMsg.value = ''
  orchestrateStepResults.value = []
  try {
    const out = await orchestrateExecute({ ...connBody(), confirm: false, steps })
    orchestrateMsg.value = out.message
    orchestrateStepResults.value = out.results ?? []
    message.success('校验完成')
  } finally {
    orchestrateBusy.value = false
  }
}

async function onOrchestrateExecute() {
  if (!connReady.value) {
    message.warning('请先在「连接配置」中填写主机、用户名与数据库名')
    return
  }
  let steps: OrchestrateStepPayload[]
  try {
    steps = parseOrchestrateSteps(orchestrateJson.value)
  } catch (e) {
    message.error(e instanceof Error ? e.message : '编排 JSON 解析失败')
    return
  }
  orchestrateBusy.value = true
  orchestrateMsg.value = ''
  orchestrateStepResults.value = []
  try {
    const out = await orchestrateExecute({ ...connBody(), confirm: true, steps })
    orchestrateMsg.value = out.message
    orchestrateStepResults.value = out.results ?? []
    if (out.ok) message.success(out.message)
    else message.warning(out.message)
  } finally {
    orchestrateBusy.value = false
  }
}

watch(selectedTables, () => {
  syncedSchemas.value = []
  activeSchemaKey.value = null
  preview.value = null
  aiSql.value = ''
  queryResult.value = null
  nl2sqlRationale.value = ''
  relEdges.value = []
  orchestrateJson.value = ''
  plannerJson.value = ''
  writePlanRationale.value = ''
  orchestrateMsg.value = ''
  orchestrateStepResults.value = []
  if (lastTestOk.value) {
    saveMysqlConnToLocal()
  }
})

watch(activeSchemaKey, () => {
  preview.value = null
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
    syncedSchemas.value = []
    activeSchemaKey.value = null
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

.schema-table-tabs {
  margin-top: 4px;
}

.schema-table-tabs :deep(.n-tab-pane) {
  padding-top: 12px;
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

.orchestrate-card {
  margin-top: 4px;
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
