<template>
  <div class="req-case-page">
    <header class="req-case-header">
      <div>
        <h1 class="req-case-title">需求生成测试用例</h1>
        <p class="req-case-desc">
          上传需求文档（.md / .txt），由执行引擎异步生成关键点与原子化用例；右侧可编辑、复制与删除。
        </p>
      </div>
      <n-button v-if="store.phase !== 'idle'" quaternary size="small" @click="onReset">
        清空会话
      </n-button>
    </header>

    <n-card class="req-upload-card" :bordered="false" size="small">
      <n-upload
        :max="1"
        accept=".md,.txt,.markdown"
        :show-file-list="true"
        :custom-request="customRequest"
        @before-upload="beforeUpload"
      >
        <n-upload-dragger class="req-dragger">
          <div class="req-dragger-inner">
            <n-icon :size="42" :component="CloudUploadOutlined" class="req-dragger-icon" />
            <p class="req-dragger-title">拖拽文档到此处，或点击上传</p>
            <p class="req-dragger-hint">仅支持 .md / .txt，单文件建议不超过 20MB</p>
            <n-progress
              v-if="store.phase === 'uploading'"
              type="line"
              :percentage="store.uploadPercent"
              indicator-placement="inside"
              processing
              class="req-upload-progress"
            />
          </div>
        </n-upload-dragger>
      </n-upload>
      <div v-if="store.currentFileName" class="req-file-meta">
        当前文件：{{ store.currentFileName }}
      </div>
    </n-card>

    <section v-if="store.phase !== 'idle' || store.logs.length" class="req-progress-section">
      <div class="req-progress-row">
        <n-text depth="3">任务状态</n-text>
        <n-tag v-if="store.phase !== 'idle'" size="small" :bordered="false" type="info">
          {{ phaseLabel }}
        </n-tag>
        <span v-if="store.isBusy" class="req-progress-num">{{ store.progress }}%</span>
      </div>
      <n-progress
        v-if="store.isBusy || store.phase === 'done'"
        type="line"
        :percentage="store.progress"
        :status="store.phase === 'failed' ? 'error' : store.phase === 'done' ? 'success' : 'default'"
        :processing="store.isBusy"
      />
      <div v-if="store.logs.length" class="req-log-panel">
        <div v-for="(line, idx) in store.logs.slice(-12)" :key="idx" class="req-log-line">
          {{ line }}
        </div>
      </div>
      <n-alert v-if="store.errorMessage" type="error" :show-icon="true" class="req-alert">
        {{ store.errorMessage }}
      </n-alert>
    </section>

    <n-grid :cols="24" :x-gap="16" :y-gap="16" class="req-split" item-responsive responsive="screen">
      <n-gi :span="24" :l="10">
        <n-card title="需求关键点" size="small" :bordered="true" class="req-panel">
          <n-scrollbar class="req-scroll">
            <n-empty
              v-if="!store.keyPoints.length && !showSkeleton"
              description="上传并生成后将在此展示关键点（可对照右侧用例溯源）"
            />
            <div
              v-for="kp in store.keyPoints"
              :key="kp.id"
              class="req-kp-item"
            >
              <div class="req-kp-text">{{ kp.text }}</div>
              <div v-if="kp.ref" class="req-kp-ref">{{ kp.ref }}</div>
            </div>
          </n-scrollbar>
        </n-card>
      </n-gi>

      <n-gi :span="24" :l="14">
        <n-card title="生成用例" size="small" :bordered="true" class="req-panel">
          <n-scrollbar class="req-scroll">
            <n-space v-if="showSkeleton" vertical :size="12" style="width: 100%">
              <n-card v-for="n in 4" :key="n" size="small" class="req-case-skeleton">
                <n-skeleton text :repeat="2" />
                <n-skeleton text style="width: 60%" />
              </n-card>
            </n-space>

            <n-empty v-else-if="!store.cases.length && !store.isBusy" description="暂无生成结果" />

            <div v-else class="req-case-list">
              <n-card
                v-for="c in store.cases"
                :key="c.id"
                size="small"
                class="req-case-card"
              >
                <div class="req-case-head">
                  <div class="req-case-head-main">
                    <span class="req-case-title-text">{{ c.title }}</span>
                    <n-space :size="8" wrap>
                      <n-tag size="small" :bordered="false" type="info">{{ c.priority }}</n-tag>
                      <n-tag
                        size="small"
                        :bordered="false"
                        :type="c.kind === 'positive' ? 'success' : 'warning'"
                      >
                        {{ c.kind === 'positive' ? '正向用例' : '异常用例' }}
                      </n-tag>
                    </n-space>
                  </div>
                  <n-space :size="4">
                    <n-button quaternary size="tiny" @click="openEdit(c)">
                      <template #icon><n-icon :component="EditOutlined" /></template>
                      编辑
                    </n-button>
                    <n-button quaternary size="tiny" @click="copyCase(c)">
                      <template #icon><n-icon :component="CopyOutlined" /></template>
                      复制
                    </n-button>
                    <n-button quaternary size="tiny" type="error" @click="store.removeCase(c.id)">
                      <template #icon><n-icon :component="DeleteOutlined" /></template>
                      删除
                    </n-button>
                  </n-space>
                </div>

                <div v-if="sourceLabel(c)" class="req-trace">
                  溯源：{{ sourceLabel(c) }}
                </div>

                <div class="req-steps-wrap">
                  <ul v-show="!isStepsCollapsed(c)" class="req-steps">
                    <li v-for="(s, i) in c.steps" :key="i" class="req-step-li">{{ s }}</li>
                  </ul>
                  <div v-if="isStepsCollapsed(c)" class="req-steps-summary">
                    步骤 · 共 {{ c.steps.length }} 步（已折叠）
                  </div>
                  <n-button
                    v-if="c.steps.length > 3"
                    text
                    size="tiny"
                    type="primary"
                    @click="toggleExpand(c.id)"
                  >
                    {{ expanded[c.id] ? '收起步骤' : '展开步骤' }}
                  </n-button>
                </div>
              </n-card>
            </div>
          </n-scrollbar>
        </n-card>
      </n-gi>
    </n-grid>

    <n-modal
      v-model:show="editVisible"
      preset="card"
      title="编辑用例"
      class="req-edit-modal"
      style="width: min(560px, 96vw)"
      :mask-closable="false"
    >
      <n-form v-if="editForm" label-placement="left" label-width="88">
        <n-form-item label="标题">
          <n-input v-model:value="editForm.title" />
        </n-form-item>
        <n-form-item label="优先级">
          <n-select
            v-model:value="editForm.priority"
            :options="[
              { label: 'P0', value: 'P0' },
              { label: 'P1', value: 'P1' },
              { label: 'P2', value: 'P2' }
            ]"
          />
        </n-form-item>
        <n-form-item label="类型">
          <n-radio-group v-model:value="editForm.kind" name="kind">
            <n-radio value="positive">正向用例</n-radio>
            <n-radio value="negative">异常用例</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="步骤">
          <n-input
            v-model:value="editForm.stepsText"
            type="textarea"
            placeholder="每行一条步骤"
            :autosize="{ minRows: 5, maxRows: 14 }"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="editVisible = false">取消</n-button>
          <n-button type="primary" @click="saveEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui'
import {
  NUpload,
  NUploadDragger,
  NCard,
  NGrid,
  NGi,
  NScrollbar,
  NEmpty,
  NSkeleton,
  NSpace,
  NTag,
  NButton,
  NIcon,
  NProgress,
  NText,
  NAlert,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NRadioGroup,
  NRadio,
  useDialog
} from 'naive-ui'
import {
  CloudUploadOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined
} from '@vicons/antd'
import { message } from '@/utils/naive-api'
import { useCaseGenerationStore, type JobPhase } from '@/store/caseGeneration'
import { useRequirementGroupsStore } from '@/store/requirementGroups'
import type { GeneratedCase, ConflictPayload } from '@/api/case-generation'

const store = useCaseGenerationStore()
const reqGroups = useRequirementGroupsStore()
const dialog = useDialog()

watch(
  () => store.phase,
  (p) => {
    if (p === 'done') void reqGroups.load()
  }
)

const expanded = reactive<Record<string, boolean>>({})
const editVisible = ref(false)
const editingId = ref<string | null>(null)
const editForm = ref<{
  title: string
  priority: 'P0' | 'P1' | 'P2'
  kind: 'positive' | 'negative'
  stepsText: string
} | null>(null)

const showSkeleton = computed(
  () => store.isBusy && store.cases.length === 0
)

const phaseLabel = computed(() => {
  const m: Record<JobPhase, string> = {
    idle: '待命',
    uploading: '上传中',
    pending: '排队中',
    parsing: '解析文档',
    generating: '生成用例',
    done: '已完成',
    failed: '失败'
  }
  return m[store.phase] ?? store.phase
})

function beforeUpload(data: { file: UploadFileInfo }) {
  const f = data.file.file
  if (!f) return false
  const max = 20 * 1024 * 1024
  if (f.size > max) {
    message.error('文件不能超过 20MB')
    return false
  }
  return true
}

async function customRequest({
  file,
  onFinish,
  onError,
  onProgress
}: UploadCustomRequestOptions) {
  const raw = file.file
  if (!raw) {
    onError()
    return
  }

  const tryOnce = async (dup?: {
    duplicateAction?: 'overwrite' | 'new_version'
    overwriteGroupId?: number
  }) => {
    try {
      await store.runUpload(raw, (pct) => onProgress({ percent: pct }), dup)
      onProgress({ percent: 100 })
      onFinish()
    } catch (e: unknown) {
      const cp = (e as { conflictPayload?: ConflictPayload }).conflictPayload
      if (cp) {
        dialog.warning({
          title: '检测到相同文档',
          content:
            '该文件与已上传文档内容一致（哈希相同）。请选择覆盖已有版本，或生成新版本以保留历史。',
          positiveText: '覆盖',
          negativeText: '生成新版本',
          onPositiveClick: async () => {
            await tryOnce({ duplicateAction: 'overwrite' })
          },
          onNegativeClick: async () => {
            await tryOnce({ duplicateAction: 'new_version' })
          }
        })
        return
      }
      message.error('上传或创建任务失败')
      onError()
    }
  }

  await tryOnce()
}

function onReset() {
  store.reset()
}

function sourceLabel(c: GeneratedCase): string {
  if (!c.sourceKeyPointId) return ''
  const kp = store.keyPoints.find((k) => k.id === c.sourceKeyPointId)
  return kp ? kp.text.slice(0, 80) + (kp.text.length > 80 ? '…' : '') : ''
}

function isStepsCollapsed(c: GeneratedCase) {
  if (c.steps.length <= 3) return false
  return !expanded[c.id]
}

function toggleExpand(id: string) {
  expanded[id] = !expanded[id]
}

async function copyCase(c: GeneratedCase) {
  const text = [c.title, ...c.steps.map((s, i) => `${i + 1}. ${s}`)].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败')
  }
}

function openEdit(c: GeneratedCase) {
  editingId.value = c.id
  editForm.value = {
    title: c.title,
    priority: c.priority,
    kind: c.kind,
    stepsText: c.steps.join('\n')
  }
  editVisible.value = true
}

function saveEdit() {
  if (!editingId.value || !editForm.value) return
  const steps = editForm.value.stepsText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  store.updateCase(editingId.value, {
    title: editForm.value.title,
    priority: editForm.value.priority,
    kind: editForm.value.kind,
    steps
  })
  editVisible.value = false
  message.success('已保存')
}

onBeforeUnmount(() => {
  store.stopPolling()
})
</script>

<style scoped>
.req-case-page {
  padding: var(--space-6);
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  overflow: auto;
}

.req-case-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.req-case-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.req-case-desc {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 720px;
  line-height: var(--leading-relaxed);
}

.req-upload-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg, 12px);
  margin-bottom: var(--space-5);
}

.req-dragger {
  border-radius: var(--radius-md, 10px) !important;
  background: var(--color-bg-subtle) !important;
  border: 1px dashed var(--color-border) !important;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.req-dragger:hover {
  border-color: var(--color-primary-300, var(--color-primary-400)) !important;
}

.req-dragger-inner {
  padding: var(--space-6);
  text-align: center;
}

.req-dragger-icon {
  color: var(--color-primary-500);
  margin-bottom: var(--space-3);
}

.req-dragger-title {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.req-dragger-hint {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-4);
}

.req-upload-progress {
  max-width: 400px;
  margin: 0 auto;
}

.req-file-meta {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-3);
}

.req-progress-section {
  margin-bottom: var(--space-5);
}

.req-progress-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.req-progress-num {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.req-log-panel {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-border-subtle);
  max-height: 160px;
  overflow: auto;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.req-log-line {
  opacity: 0.9;
  line-height: 1.5;
}

.req-alert {
  margin-top: var(--space-3);
}

.req-split {
  min-height: 420px;
}

.req-panel {
  height: 100%;
  min-height: 420px;
}

.req-scroll {
  max-height: min(560px, calc(100vh - 320px));
  height: 100%;
}

.req-kp-item {
  padding: var(--space-3);
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
}

.req-kp-text {
  font-size: var(--text-md);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  line-height: var(--leading-normal);
}

.req-kp-ref {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.req-case-skeleton {
  border: 1px solid var(--color-border-subtle);
}

.req-case-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.req-case-card {
  border: 1px solid var(--color-border);
  transition: border-color 0.15s ease;
}

.req-case-card:hover {
  border-color: var(--color-primary-200, var(--color-gray-300));
}

.req-case-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.req-case-head-main {
  flex: 1;
  min-width: 0;
}

.req-case-title-text {
  display: block;
  font-size: var(--text-md);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.req-trace {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-normal);
}

.req-steps-wrap {
  margin-top: var(--space-3);
}

.req-steps {
  margin: 0;
  padding-left: var(--space-5);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.req-step-li {
  margin-bottom: var(--space-1);
}

.req-steps-summary {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-2);
}
</style>
