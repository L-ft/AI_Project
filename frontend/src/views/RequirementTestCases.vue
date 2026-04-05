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
        <h1 class="rtc-title">功能测试用例库</h1>
        <p class="rtc-desc">
          采用常见用例模板（模块、编号、优先级、前置条件、步骤、预期结果）；支持从 Excel 批量导入或 XMind 脑图快速同步结构。
        </p>
      </div>
    </header>

    <n-card class="rtc-card" :bordered="false" size="small">
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
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed, onMounted } from 'vue'
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
  type DropdownOption
} from 'naive-ui'
import {
  SearchOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  DownOutlined,
  DeleteOutlined
} from '@vicons/antd'
import { message } from '@/utils/naive-api'
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

const loading = ref(false)
const saving = ref(false)
const rows = ref<FunctionalTestCaseRow[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const moduleFilter = ref('')

const drawerShow = ref(false)
const editingId = ref<number | null>(null)
const drawerWidth = computed(() =>
  typeof window !== 'undefined' ? Math.min(720, window.innerWidth - 24) : 720
)

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
  max-width: 720px;
  line-height: 1.6;
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
</style>
