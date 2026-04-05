<template>
  <div class="rtc-page">
    <header class="rtc-header">
      <div class="rtc-header-text">
        <n-breadcrumb class="rtc-bc">
          <n-breadcrumb-item>
            <router-link to="/requirement-cases">需求用例</router-link>
          </n-breadcrumb-item>
          <n-breadcrumb-item>测试用例</n-breadcrumb-item>
        </n-breadcrumb>
        <h1 class="rtc-title">测试用例</h1>
        <p class="rtc-desc">
          <span class="rtc-desc-strong">手动测试用例</span>：标准模板维护，支持 Excel / XMind 导入；
          <span class="rtc-desc-strong">AI 测试用例</span>：由「需求生成用例」根据文档自动生成并落库；「查看文档」在右侧抽屉展示关键点与用例。
        </p>
      </div>
    </header>

    <n-card class="rtc-card" :bordered="false" size="small">
      <n-tabs v-model:value="activeTab" type="line" class="rtc-tabs" @update:value="onTabChange">
        <n-tab-pane name="manual" tab="手动测试用例">
          <div class="rtc-toolbar">
            <n-space wrap :size="12">
              <n-input
                v-model:value="keyword"
                clearable
                placeholder="搜索标题 / 编号 / 备注"
                style="width: 220px"
                @keyup.enter="reload"
              />
              <n-input
                v-model:value="moduleFilter"
                clearable
                placeholder="模块关键字"
                style="width: 160px"
                @keyup.enter="reload"
              />
              <n-button type="primary" @click="reload">
                <template #icon><n-icon :component="SearchOutlined" /></template>
                查询
              </n-button>
              <n-button @click="openCreate">
                <template #icon><n-icon :component="PlusOutlined" /></template>
                新建用例
              </n-button>
              <n-dropdown trigger="click" :options="importOptions" @select="onImportSelect">
                <n-button>
                  <template #icon><n-icon :component="CloudUploadOutlined" /></template>
                  导入
                  <n-icon :component="DownOutlined" :size="12" style="margin-left: 4px" />
                </n-button>
              </n-dropdown>
            </n-space>
            <n-text depth="3" class="rtc-hint">
              Excel 首行需含「用例标题」列；可选：模块、用例编号、优先级、前置条件、测试步骤、预期结果、备注
            </n-text>
          </div>

          <n-data-table
            :columns="columns"
            :data="rows"
            :loading="loading"
            :row-key="(r: FunctionalTestCaseRow) => r.id"
            :bordered="false"
            striped
            class="rtc-table"
            :scroll-x="1100"
          />
          <div class="rtc-pager">
            <n-pagination
              v-model:page="page"
              v-model:page-size="pageSize"
              :item-count="total"
              :page-sizes="[10, 20, 50]"
              show-size-picker
              @update:page="reload"
              @update:page-size="onPageSize"
            />
          </div>
        </n-tab-pane>

        <n-tab-pane name="ai" tab="AI 测试用例">
          <div class="rtc-toolbar rtc-ai-toolbar">
            <n-space wrap :size="12">
              <n-input
                v-model:value="aiKeyword"
                clearable
                placeholder="搜索用例标题"
                style="width: 220px"
                @keyup.enter="reloadAi"
              />
              <n-input
                v-model:value="aiDocKeyword"
                clearable
                placeholder="需求文档名称"
                style="width: 200px"
                @keyup.enter="reloadAi"
              />
              <n-button type="primary" @click="reloadAi">
                <template #icon><n-icon :component="SearchOutlined" /></template>
                查询
              </n-button>
            </n-space>
            <n-text depth="3" class="rtc-hint">
              数据来自各需求文档批次下已生成的用例；点击「查看文档」在右侧抽屉中浏览需求关键点与测试用例。
            </n-text>
          </div>
          <n-data-table
            :columns="aiColumns"
            :data="aiRows"
            :loading="aiLoading"
            :row-key="(r: RequirementAiCaseRow) => r.id"
            :bordered="false"
            striped
            class="rtc-table"
            :scroll-x="1000"
          >
            <template #empty>
              <div class="rtc-ai-empty-wrap">
                <n-empty description="暂无 AI 生成用例">
                  <template #extra>
                    <n-button type="primary" @click="router.push('/requirement-cases')">
                      去上传需求文档
                    </n-button>
                  </template>
                </n-empty>
              </div>
            </template>
          </n-data-table>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 隐藏的文件选择，供导入菜单使用 -->
    <input
      ref="excelInputRef"
      type="file"
      accept=".xlsx,.xlsm"
      class="rtc-file-input"
      @change="onExcelPicked"
    />
    <input
      ref="xmindInputRef"
      type="file"
      accept=".xmind"
      class="rtc-file-input"
      @change="onXmindPicked"
    />

    <n-drawer
      v-model:show="drawerShow"
      :width="drawerWidth"
      placement="right"
      :trap-focus="false"
      class="rtc-drawer"
    >
      <n-drawer-content :title="drawerTitle" closable>
        <n-form
          :model="form"
          label-placement="left"
          label-width="96"
          require-mark-placement="right-hanging"
          class="rtc-form"
        >
          <n-form-item label="所属模块" path="module">
            <n-input v-model:value="form.module" placeholder="如：用户中心 / 登录" />
          </n-form-item>
          <n-form-item label="用例编号" path="case_code">
            <n-input v-model:value="form.case_code" placeholder="可选，如 TC-LOGIN-001" />
          </n-form-item>
          <n-form-item label="用例标题" path="title" required>
            <n-input v-model:value="form.title" placeholder="一句话说明验证点" />
          </n-form-item>
          <n-grid :cols="2" :x-gap="16">
            <n-gi>
              <n-form-item label="优先级" path="priority">
                <n-select v-model:value="form.priority" :options="priorityOptions" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="用例类型" path="category">
                <n-select v-model:value="form.category" :options="categoryOptions" />
              </n-form-item>
            </n-gi>
          </n-grid>
          <n-form-item label="状态" path="status">
            <n-select v-model:value="form.status" :options="statusOptions" />
          </n-form-item>
          <n-form-item label="前置条件" path="preconditions">
            <n-input
              v-model:value="form.preconditions"
              type="textarea"
              placeholder="执行本用例前需满足的环境、账号、数据等"
              :autosize="{ minRows: 2, maxRows: 8 }"
            />
          </n-form-item>
          <n-form-item label="测试步骤">
            <div class="rtc-steps-editor">
              <div v-for="(s, idx) in formSteps" :key="idx" class="rtc-step-row">
                <span class="rtc-step-idx">{{ idx + 1 }}</span>
                <n-input
                  v-model:value="s.action"
                  type="textarea"
                  placeholder="操作"
                  :autosize="{ minRows: 1, maxRows: 6 }"
                  class="rtc-step-action"
                />
                <n-input
                  v-model:value="s.expected"
                  type="textarea"
                  placeholder="预期（本步）"
                  :autosize="{ minRows: 1, maxRows: 6 }"
                  class="rtc-step-exp"
                />
                <n-button quaternary size="small" @click="removeStep(idx)">
                  <template #icon><n-icon :component="DeleteOutlined" /></template>
                </n-button>
              </div>
              <n-button dashed size="small" block @click="addStep">
                <template #icon><n-icon :component="PlusOutlined" /></template>
                添加步骤
              </n-button>
            </div>
          </n-form-item>
          <n-form-item label="预期结果" path="expected_result">
            <n-input
              v-model:value="form.expected_result"
              type="textarea"
              placeholder="整体预期（可与步骤内预期二选一或补充）"
              :autosize="{ minRows: 2, maxRows: 8 }"
            />
          </n-form-item>
          <n-form-item label="备注" path="remark">
            <n-input
              v-model:value="form.remark"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 6 }"
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="drawerShow = false">取消</n-button>
            <n-button type="primary" :loading="saving" @click="save">保存</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 需求文档预览（AI 用例「查看文档」） -->
    <n-drawer
      v-model:show="docDrawerShow"
      :width="docDrawerWidth"
      placement="right"
      :trap-focus="false"
      class="rtc-doc-drawer"
      @update:show="onDocDrawerUpdateShow"
    >
      <n-drawer-content :title="docDrawerTitle" closable>
        <n-spin :show="docLoading">
          <n-alert v-if="docLoadError" type="error" :show-icon="true" class="rtc-doc-alert">
            {{ docLoadError }}
          </n-alert>
          <template v-else-if="docGroup">
            <n-tag
              v-if="docGroup.status === 'generating' || docGroup.status === 'pending'"
              size="small"
              type="info"
              :bordered="false"
              class="rtc-doc-status"
            >
              <template #icon>
                <n-icon :component="LoadingOutlined" class="rtc-doc-spin-icon" />
              </template>
              AI 正在生成用例，请稍候…
            </n-tag>
            <n-text v-if="docGroup.uploadTime" depth="3" class="rtc-doc-meta">
              上传时间：{{ docGroup.uploadTime }}
            </n-text>
            <n-grid :cols="24" :x-gap="12" :y-gap="12" class="rtc-doc-split" item-responsive responsive="screen">
              <n-gi :span="24" :l="10">
                <n-card title="需求关键点" size="small" :bordered="true" class="rtc-doc-panel">
                  <n-scrollbar class="rtc-doc-scroll">
                    <n-empty
                      v-if="!docKeyPoints.length && docGroup.status === 'done'"
                      description="暂无关键点"
                    />
                    <n-empty
                      v-else-if="
                        !docKeyPoints.length &&
                        (docGroup.status === 'generating' || docGroup.status === 'pending')
                      "
                      description="生成完成后将展示关键点"
                    />
                    <div
                      v-for="kp in docKeyPoints"
                      :key="String(kp.id ?? kp.text)"
                      class="rtc-doc-kp-item"
                    >
                      <div class="rtc-doc-kp-text">{{ kp.text }}</div>
                      <div v-if="kp.ref" class="rtc-doc-kp-ref">{{ kp.ref }}</div>
                    </div>
                  </n-scrollbar>
                </n-card>
              </n-gi>
              <n-gi :span="24" :l="14">
                <n-card title="测试用例" size="small" :bordered="true" class="rtc-doc-panel">
                  <n-scrollbar class="rtc-doc-scroll">
                    <n-empty
                      v-if="!docCases.length && docGroup.status === 'done'"
                      description="该文档下暂无已保存用例"
                    />
                    <n-empty
                      v-else-if="
                        !docCases.length &&
                        (docGroup.status === 'generating' || docGroup.status === 'pending')
                      "
                      description="生成完成后将展示用例"
                    />
                    <div v-else class="rtc-doc-case-list">
                      <n-card
                        v-for="c in docCases"
                        :key="c.id"
                        size="small"
                        class="rtc-doc-case-card"
                      >
                        <div class="rtc-doc-case-head">
                          <div class="rtc-doc-case-head-main">
                            <span class="rtc-doc-case-title">{{ c.title || c.name }}</span>
                            <n-space :size="8" wrap>
                              <n-tag v-if="c.priority" size="small" :bordered="false" type="info">
                                {{ c.priority }}
                              </n-tag>
                              <n-tag
                                v-if="c.kind"
                                size="small"
                                :bordered="false"
                                :type="c.kind === 'positive' ? 'success' : 'warning'"
                              >
                                {{ c.kind === 'positive' ? '正向用例' : '异常用例' }}
                              </n-tag>
                            </n-space>
                          </div>
                        </div>
                        <div v-if="traceLabel(c)" class="rtc-doc-trace">溯源：{{ traceLabel(c) }}</div>
                        <ul class="rtc-doc-steps">
                          <li v-for="(s, i) in c.steps || []" :key="i">{{ s }}</li>
                        </ul>
                      </n-card>
                    </div>
                  </n-scrollbar>
                </n-card>
              </n-gi>
            </n-grid>
          </template>
        </n-spin>
        <template #footer>
          <n-space justify="space-between" style="width: 100%">
            <n-button
              v-if="docGroup"
              type="error"
              quaternary
              :loading="docDeleting"
              @click="confirmDeleteRequirementDoc"
            >
              删除需求文档
            </n-button>
            <div />
            <n-button @click="docDrawerShow = false">关闭</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 编辑 AI 用例 -->
    <n-drawer
      v-model:show="aiEditDrawerShow"
      :width="aiEditDrawerWidth"
      placement="right"
      :trap-focus="false"
      class="rtc-ai-edit-drawer"
    >
      <n-drawer-content title="编辑 AI 用例" closable>
        <n-spin :show="aiEditLoading">
          <n-form label-placement="left" label-width="88" class="rtc-ai-edit-form">
            <n-form-item label="用例标题" required>
              <n-input v-model:value="aiEditForm.name" placeholder="用例名称" />
            </n-form-item>
            <n-form-item label="优先级">
              <n-input v-model:value="aiEditForm.priority" clearable placeholder="如 P0、P1" />
            </n-form-item>
            <n-form-item label="倾向">
              <n-select v-model:value="aiEditForm.kind" :options="aiKindOptions" />
            </n-form-item>
            <n-form-item label="测试步骤">
              <n-input
                v-model:value="aiEditForm.stepsText"
                type="textarea"
                placeholder="每行一条步骤"
                :autosize="{ minRows: 6, maxRows: 16 }"
              />
            </n-form-item>
          </n-form>
        </n-spin>
        <template #footer>
          <n-space justify="end">
            <n-button @click="aiEditDrawerShow = false">取消</n-button>
            <n-button
              type="primary"
              :loading="aiEditSaving"
              :disabled="aiEditLoading"
              @click="saveAiEdit"
            >
              保存
            </n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import type { DataTableColumns } from 'naive-ui'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NSpace,
  NIcon,
  NPagination,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NSelect,
  NGrid,
  NGi,
  NBreadcrumb,
  NBreadcrumbItem,
  NDropdown,
  NText,
  NTabs,
  NTabPane,
  NEmpty,
  NSpin,
  NAlert,
  NTag,
  NScrollbar,
  useDialog,
  type DropdownOption
} from 'naive-ui'
import {
  SearchOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  DownOutlined,
  DeleteOutlined,
  LoadingOutlined
} from '@vicons/antd'
import { message } from '@/utils/naive-api'
import { useRequirementGroupsStore } from '@/store/requirementGroups'
import {
  fetchFunctionalCases,
  createFunctionalCase,
  updateFunctionalCase,
  deleteFunctionalCase,
  importFunctionalCasesExcel,
  importFunctionalCasesXmind,
  type FunctionalTestCaseRow,
  type FunctionalCaseStep
} from '@/api/functional-test-cases'
import {
  fetchRequirementAiCases,
  getApiTestCase,
  updateApiTestCase,
  deleteApiTestCase,
  type RequirementAiCaseRow
} from '@/api/requirement-ai-cases'
import {
  fetchGroupCasesBundle,
  type RequirementCaseRow,
  type RequirementGroupDetail
} from '@/api/requirement-groups'

const router = useRouter()
const dialog = useDialog()
const reqGroups = useRequirementGroupsStore()

const loading = ref(false)
const saving = ref(false)
const rows = ref<FunctionalTestCaseRow[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const moduleFilter = ref('')

const activeTab = ref<'manual' | 'ai'>('manual')
const aiLoading = ref(false)
const aiRows = ref<RequirementAiCaseRow[]>([])
const aiKeyword = ref('')
const aiDocKeyword = ref('')

const drawerShow = ref(false)
const editingId = ref<number | null>(null)
const drawerWidth = computed(() =>
  typeof window !== 'undefined' ? Math.min(720, window.innerWidth - 24) : 720
)

const docDrawerShow = ref(false)
const docDrawerWidth = computed(() =>
  typeof window !== 'undefined' ? Math.min(960, window.innerWidth - 24) : 960
)
const docLoading = ref(false)
const docDeleting = ref(false)
const docLoadError = ref<string | null>(null)
const docGroup = ref<RequirementGroupDetail | null>(null)
const docCases = ref<RequirementCaseRow[]>([])
const docKeyPoints = ref<Array<{ id?: string; text?: string; ref?: string }>>([])
let docPollTimer: ReturnType<typeof setInterval> | null = null

const docDrawerTitle = computed(() => {
  if (!docGroup.value) return '需求文档'
  return `${docGroup.value.docTitle} v${docGroup.value.version}.0`
})

const aiEditDrawerShow = ref(false)
const aiEditLoading = ref(false)
const aiEditSaving = ref(false)
const editingAiId = ref<number | null>(null)
const editingAiGroupId = ref<number | null>(null)
const aiEditBodyDef = ref<Record<string, unknown>>({})
const aiEditForm = ref({
  name: '',
  priority: '',
  kind: 'positive' as 'positive' | 'negative',
  stepsText: ''
})
const aiEditDrawerWidth = computed(() =>
  typeof window !== 'undefined' ? Math.min(560, window.innerWidth - 24) : 560
)
const aiKindOptions = [
  { label: '正向', value: 'positive' },
  { label: '异常', value: 'negative' }
]

const form = ref({
  module: '',
  case_code: '' as string | null,
  title: '',
  priority: 'P2',
  category: 'functional',
  preconditions: '' as string | null,
  expected_result: '' as string | null,
  remark: '' as string | null,
  status: 'draft'
})

const formSteps = ref<FunctionalCaseStep[]>([{ order: 1, action: '', expected: '' }])

const excelInputRef = ref<HTMLInputElement | null>(null)
const xmindInputRef = ref<HTMLInputElement | null>(null)

const drawerTitle = computed(() => (editingId.value ? '编辑用例' : '新建用例'))

const priorityOptions = [
  { label: 'P0 — 阻塞', value: 'P0' },
  { label: 'P1 — 高', value: 'P1' },
  { label: 'P2 — 中', value: 'P2' },
  { label: 'P3 — 低', value: 'P3' }
]

const categoryOptions = [
  { label: '功能', value: 'functional' },
  { label: '冒烟', value: 'smoke' },
  { label: '回归', value: 'regression' },
  { label: '边界', value: 'boundary' },
  { label: '异常', value: 'negative' },
  { label: '兼容', value: 'compatibility' },
  { label: '性能', value: 'performance' }
]

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '就绪', value: 'ready' },
  { label: '废弃', value: 'deprecated' }
]

const categoryLabel = (v: string) =>
  categoryOptions.find((o) => o.value === v)?.label ?? v
const statusLabel = (v: string) =>
  statusOptions.find((o) => o.value === v)?.label ?? v

const importOptions: DropdownOption[] = [
  { label: '导入 Excel（.xlsx）', key: 'excel' },
  { label: '导入 XMind（.xmind）', key: 'xmind' }
]

function onImportSelect(key: string) {
  if (key === 'excel') excelInputRef.value?.click()
  if (key === 'xmind') xmindInputRef.value?.click()
}

async function onExcelPicked(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const res = await importFunctionalCasesExcel(file)
    message.success(`成功导入 ${res.imported} 条，跳过 ${res.skipped} 条`)
    if (res.errors?.length) {
      message.warning(res.errors.slice(0, 3).join('；'))
    }
    await reload()
  } catch {
    /* 全局已提示 */
  }
}

async function onXmindPicked(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const res = await importFunctionalCasesXmind(file)
    message.success(`成功导入 ${res.imported} 条脑图节点`)
    await reload()
  } catch {
    /* 全局已提示 */
  }
}

function resetForm() {
  form.value = {
    module: '',
    case_code: '',
    title: '',
    priority: 'P2',
    category: 'functional',
    preconditions: '',
    expected_result: '',
    remark: '',
    status: 'draft'
  }
  formSteps.value = [{ order: 1, action: '', expected: '' }]
}

function openCreate() {
  editingId.value = null
  resetForm()
  drawerShow.value = true
}

function addStep() {
  const n = formSteps.value.length + 1
  formSteps.value.push({ order: n, action: '', expected: '' })
}

function removeStep(i: number) {
  if (formSteps.value.length <= 1) return
  formSteps.value.splice(i, 1)
  formSteps.value.forEach((s, idx) => {
    s.order = idx + 1
  })
}

function openEdit(row: FunctionalTestCaseRow) {
  editingId.value = row.id
  form.value = {
    module: row.module || '',
    case_code: row.case_code,
    title: row.title,
    priority: row.priority || 'P2',
    category: row.category || 'functional',
    preconditions: row.preconditions,
    expected_result: row.expected_result,
    remark: row.remark,
    status: row.status || 'draft'
  }
  const st = row.steps?.length
    ? row.steps.map((x, i) => ({
        order: i + 1,
        action: x.action || '',
        expected: x.expected || ''
      }))
    : [{ order: 1, action: '', expected: '' }]
  formSteps.value = st
  drawerShow.value = true
}

async function save() {
  if (!form.value.title?.trim()) {
    message.warning('请填写用例标题')
    return
  }
  const stepsPayload = formSteps.value
    .map((s, i) => ({
      order: i + 1,
      action: (s.action || '').trim(),
      expected: (s.expected || '').trim()
    }))
    .filter((s) => s.action || s.expected)
  saving.value = true
  try {
    const body = {
      ...form.value,
      case_code: form.value.case_code?.trim() || null,
      steps: stepsPayload.length ? stepsPayload : null
    }
    if (editingId.value) {
      await updateFunctionalCase(editingId.value, body)
      message.success('已保存')
    } else {
      await createFunctionalCase(body as { title: string })
      message.success('已创建')
    }
    drawerShow.value = false
    await reload()
  } finally {
    saving.value = false
  }
}

async function deleteRow(row: FunctionalTestCaseRow) {
  try {
    await deleteFunctionalCase(row.id)
    message.success('已删除')
    await reload()
  } catch {
    /* 全局 */
  }
}

const columns: DataTableColumns<FunctionalTestCaseRow> = [
  {
    title: '模块',
    key: 'module',
    width: 200,
    ellipsis: { tooltip: true }
  },
  {
    title: '编号',
    key: 'case_code',
    width: 130,
    ellipsis: { tooltip: true }
  },
  {
    title: '用例标题',
    key: 'title',
    minWidth: 240,
    ellipsis: { tooltip: true }
  },
  {
    title: '优先级',
    key: 'priority',
    width: 88,
    render(row) {
      return h(
        'span',
        { class: 'rtc-pri rtc-pri-' + row.priority.toLowerCase() },
        row.priority
      )
    }
  },
  {
    title: '类型',
    key: 'category',
    width: 96,
    render(row) {
      return categoryLabel(row.category)
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return statusLabel(row.status)
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 8 }, () => [
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            onClick: () => openEdit(row)
          },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'error',
            onClick: () => deleteRow(row)
          },
          { default: () => '删除' }
        )
      ])
    }
  }
]

function traceLabel(c: RequirementCaseRow): string {
  const id = c.sourceKeyPointId
  if (!id) return ''
  const kp = docKeyPoints.value.find((k) => k.id === id)
  const t = kp?.text || ''
  return t.length > 80 ? `${t.slice(0, 80)}…` : t
}

function stopDocPoll() {
  if (docPollTimer) {
    clearInterval(docPollTimer)
    docPollTimer = null
  }
}

function maybeStartDocPoll() {
  stopDocPoll()
  const st = docGroup.value?.status
  if (docDrawerShow.value && (st === 'generating' || st === 'pending')) {
    const gid = docGroup.value!.id
    docPollTimer = setInterval(() => {
      void loadDocBundle(gid, true)
    }, 2500)
  }
}

async function loadDocBundle(groupId: number, silent = false) {
  if (!silent) docLoading.value = true
  if (!silent) docLoadError.value = null
  try {
    const bundle = await fetchGroupCasesBundle(groupId)
    docGroup.value = bundle.group
    docCases.value = bundle.cases || []
    docKeyPoints.value = Array.isArray(bundle.group.keyPoints) ? bundle.group.keyPoints : []
    maybeStartDocPoll()
  } catch (e) {
    if (!silent) {
      docLoadError.value = e instanceof Error ? e.message : '加载失败'
      docGroup.value = null
      docCases.value = []
      docKeyPoints.value = []
    }
  } finally {
    if (!silent) docLoading.value = false
  }
}

function goDoc(row: RequirementAiCaseRow) {
  docDrawerShow.value = true
  void loadDocBundle(row.requirementGroupId)
}

function onDocDrawerUpdateShow(show: boolean) {
  if (!show) {
    stopDocPoll()
    docGroup.value = null
    docCases.value = []
    docKeyPoints.value = []
    docLoadError.value = null
  }
}

function confirmDeleteRequirementDoc() {
  if (!docGroup.value) return
  const g = docGroup.value
  dialog.warning({
    title: '删除需求文档',
    content: `将删除「${g.docTitle}」及其全部用例，此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      docDeleting.value = true
      try {
        await reqGroups.remove(g.id)
        message.success('已删除')
        docDrawerShow.value = false
        await reloadAi()
        await reqGroups.load()
      } catch {
        message.error('删除失败')
      } finally {
        docDeleting.value = false
      }
    }
  })
}

async function openAiEdit(row: RequirementAiCaseRow) {
  editingAiId.value = row.id
  editingAiGroupId.value = row.requirementGroupId
  aiEditDrawerShow.value = true
  aiEditLoading.value = true
  aiEditBodyDef.value = {}
  aiEditForm.value = { name: '', priority: '', kind: 'positive', stepsText: '' }
  try {
    const d = await getApiTestCase(row.id)
    const bd =
      d.body_definition && typeof d.body_definition === 'object'
        ? ({ ...d.body_definition } as Record<string, unknown>)
        : {}
    aiEditBodyDef.value = bd
    aiEditForm.value.name = d.name
    aiEditForm.value.priority = bd.priority != null ? String(bd.priority) : ''
    aiEditForm.value.kind = bd.kind === 'negative' ? 'negative' : 'positive'
    const steps = bd.steps
    aiEditForm.value.stepsText = Array.isArray(steps)
      ? steps.map((s) => String(s)).join('\n')
      : ''
  } catch {
    message.error('加载用例失败')
    aiEditDrawerShow.value = false
    editingAiId.value = null
    editingAiGroupId.value = null
  } finally {
    aiEditLoading.value = false
  }
}

async function saveAiEdit() {
  const name = aiEditForm.value.name.trim()
  if (!name) {
    message.warning('请填写用例标题')
    return
  }
  if (editingAiId.value == null) return
  const lines = aiEditForm.value.stepsText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  const nextBody: Record<string, unknown> = { ...aiEditBodyDef.value }
  nextBody.kind = aiEditForm.value.kind
  nextBody.steps = lines
  const pr = aiEditForm.value.priority.trim()
  if (pr) nextBody.priority = pr
  else delete nextBody.priority

  aiEditSaving.value = true
  try {
    await updateApiTestCase(editingAiId.value, {
      name,
      case_type: 'requirement',
      body_definition: nextBody
    })
    message.success('已保存')
    aiEditDrawerShow.value = false
    const gid = editingAiGroupId.value
    await reloadAi()
    if (docDrawerShow.value && docGroup.value && gid != null && docGroup.value.id === gid) {
      void loadDocBundle(gid, true)
    }
  } catch {
    /* 全局 */
  } finally {
    aiEditSaving.value = false
  }
}

function confirmDeleteAiCase(row: RequirementAiCaseRow) {
  dialog.warning({
    title: '删除用例',
    content: `确定删除「${row.name}」吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteApiTestCase(row.id)
        message.success('已删除')
        await reloadAi()
        if (docDrawerShow.value && docGroup.value?.id === row.requirementGroupId) {
          void loadDocBundle(row.requirementGroupId, true)
        }
      } catch {
        message.error('删除失败')
      }
    }
  })
}

const aiColumns: DataTableColumns<RequirementAiCaseRow> = [
  {
    title: '需求文档',
    key: 'docTitle',
    width: 220,
    ellipsis: { tooltip: true },
    render(row) {
      return `${row.docTitle} v${row.groupVersion}.0`
    }
  },
  {
    title: '用例标题',
    key: 'name',
    minWidth: 240,
    ellipsis: { tooltip: true }
  },
  {
    title: '优先级',
    key: 'priority',
    width: 88,
    render(row) {
      return row.priority ?? '—'
    }
  },
  {
    title: '倾向',
    key: 'kind',
    width: 88,
    render(row) {
      if (row.kind === 'positive') return '正向'
      if (row.kind === 'negative') return '异常'
      return '—'
    }
  },
  {
    title: '标签',
    key: 'caseType',
    width: 110,
    ellipsis: { tooltip: true }
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 4, wrap: false }, () => [
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'primary',
            onClick: () => goDoc(row)
          },
          { default: () => '查看文档' }
        ),
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            onClick: () => void openAiEdit(row)
          },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'error',
            onClick: () => confirmDeleteAiCase(row)
          },
          { default: () => '删除' }
        )
      ])
    }
  }
]

function onTabChange(name: string) {
  if (name === 'ai') void reloadAi()
}

async function reloadAi() {
  aiLoading.value = true
  try {
    aiRows.value = await fetchRequirementAiCases({
      keyword: aiKeyword.value.trim() || undefined,
      docKeyword: aiDocKeyword.value.trim() || undefined
    })
  } finally {
    aiLoading.value = false
  }
}

async function reload() {
  loading.value = true
  try {
    const res = await fetchFunctionalCases({
      page: page.value,
      page_size: pageSize.value,
      module: moduleFilter.value.trim() || undefined,
      keyword: keyword.value.trim() || undefined
    })
    rows.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function onPageSize() {
  page.value = 1
  void reload()
}

onMounted(() => {
  void reload()
})

onBeforeUnmount(() => {
  stopDocPoll()
})
</script>

<style scoped>
.rtc-page {
  padding: var(--page-padding-x, 24px);
  min-height: 100%;
  background: linear-gradient(
    180deg,
    rgba(125, 51, 255, 0.04) 0%,
    var(--color-bg-page, #f5f6fa) 120px
  );
}

.rtc-header {
  margin-bottom: 20px;
}

.rtc-bc {
  margin-bottom: 8px;
}

.rtc-bc :deep(a) {
  color: var(--color-primary-500, #7d33ff);
  text-decoration: none;
}
.rtc-bc :deep(a:hover) {
  text-decoration: underline;
}

.rtc-title {
  font-size: var(--text-xl, 1.25rem);
  font-weight: var(--font-semibold, 600);
  color: var(--color-text-primary, #1a1a2e);
  margin-bottom: 8px;
}

.rtc-desc {
  font-size: var(--text-sm, 13px);
  color: var(--color-text-secondary, #64748b);
  max-width: 860px;
  line-height: 1.65;
}

.rtc-desc-strong {
  font-weight: var(--font-semibold, 600);
  color: var(--color-text-primary, #1a1a2e);
}

.rtc-tabs :deep(.n-tabs-nav) {
  margin-bottom: 8px;
}

.rtc-ai-toolbar {
  margin-top: 0;
}

.rtc-ai-empty-wrap {
  padding: 28px 0 8px;
}

.rtc-card {
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.06));
}

.rtc-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.rtc-hint {
  font-size: 12px;
  max-width: 420px;
  line-height: 1.5;
}

.rtc-table :deep(.n-data-table-th) {
  font-weight: 600;
  font-size: 13px;
}

.rtc-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.rtc-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.rtc-form :deep(.n-form-item-feedback-wrapper) {
  min-height: 0;
}

.rtc-steps-editor {
  width: 100%;
}

.rtc-step-row {
  display: grid;
  grid-template-columns: 28px 1fr 1fr 36px;
  gap: 8px;
  align-items: start;
  margin-bottom: 10px;
}

.rtc-step-idx {
  font-size: 12px;
  color: var(--color-text-tertiary);
  text-align: center;
  padding-top: 8px;
}

.rtc-pri {
  font-weight: 600;
  font-size: 12px;
}
.rtc-pri-p0 {
  color: #dc2626;
}
.rtc-pri-p1 {
  color: #ea580c;
}
.rtc-pri-p2 {
  color: #2563eb;
}
.rtc-pri-p3 {
  color: #64748b;
}

.rtc-doc-alert {
  margin-bottom: 12px;
}

.rtc-doc-status {
  margin-bottom: 12px;
}

.rtc-doc-spin-icon {
  animation: rtc-doc-spin 0.9s linear infinite;
}

@keyframes rtc-doc-spin {
  to {
    transform: rotate(360deg);
  }
}

.rtc-doc-meta {
  display: block;
  font-size: var(--text-sm, 13px);
  margin-bottom: 12px;
}

.rtc-doc-split {
  min-height: 280px;
}

.rtc-doc-panel {
  min-height: 280px;
}

.rtc-doc-scroll {
  max-height: min(520px, calc(100vh - 220px));
}

.rtc-doc-kp-item {
  padding: var(--space-3, 12px);
  margin-bottom: var(--space-3, 12px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-bg-surface, #fff);
}

.rtc-doc-kp-text {
  font-size: var(--text-md, 14px);
  font-weight: var(--font-medium, 500);
  color: var(--color-text-primary);
}

.rtc-doc-kp-ref {
  margin-top: var(--space-2, 8px);
  font-size: var(--text-sm, 13px);
  color: var(--color-text-tertiary);
}

.rtc-doc-case-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.rtc-doc-case-card {
  border: 1px solid var(--color-border, #e5e7eb);
}

.rtc-doc-case-head-main {
  flex: 1;
  min-width: 0;
}

.rtc-doc-case-title {
  display: block;
  font-weight: var(--font-semibold, 600);
  margin-bottom: var(--space-2, 8px);
  color: var(--color-text-primary);
}

.rtc-doc-trace {
  margin-top: var(--space-2, 8px);
  font-size: var(--text-xs, 12px);
  color: var(--color-text-tertiary);
}

.rtc-doc-steps {
  margin: var(--space-3, 12px) 0 0;
  padding-left: var(--space-5, 20px);
  color: var(--color-text-secondary);
  font-size: var(--text-sm, 13px);
}
</style>
