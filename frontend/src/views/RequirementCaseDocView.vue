<template>
  <div class="req-doc-view">
    <header class="req-doc-view-head">
      <n-breadcrumb>
        <n-breadcrumb-item>
          <router-link to="/requirement-cases">智能用例生成</router-link>
        </n-breadcrumb-item>
        <n-breadcrumb-item>AI用例生成</n-breadcrumb-item>
        <n-breadcrumb-item>{{ breadcrumbTitle }}</n-breadcrumb-item>
      </n-breadcrumb>
      <n-text v-if="group?.uploadTime" depth="3" class="req-doc-view-meta">
        上传时间：{{ group.uploadTime }}
      </n-text>
    </header>

    <n-spin :show="loading">
      <n-alert v-if="loadError" type="error" :show-icon="true" class="req-doc-view-alert">
        {{ loadError }}
      </n-alert>

      <template v-else-if="group">
        <n-tag
          v-if="group.status === 'generating' || group.status === 'pending'"
          size="small"
          type="info"
          :bordered="false"
          class="req-doc-view-status"
        >
          <template #icon>
            <n-icon :component="LoadingOutlined" class="req-doc-spin-icon" />
          </template>
          AI 正在生成用例，请稍候…
        </n-tag>

        <n-grid :cols="24" :x-gap="16" :y-gap="16" class="req-doc-split" item-responsive responsive="screen">
          <n-gi :span="24" :l="10">
            <n-card title="需求关键点" size="small" :bordered="true" class="req-doc-panel">
              <n-scrollbar class="req-doc-scroll">
                <n-empty
                  v-if="!keyPoints.length && group.status === 'done'"
                  description="暂无关键点"
                />
                <n-empty
                  v-else-if="!keyPoints.length && (group.status === 'generating' || group.status === 'pending')"
                  description="生成完成后将展示关键点"
                />
                <div
                  v-for="kp in keyPoints"
                  :key="String(kp.id ?? kp.text)"
                  class="req-doc-kp-item"
                >
                  <div class="req-doc-kp-text">{{ kp.text }}</div>
                  <div v-if="kp.ref" class="req-doc-kp-ref">{{ kp.ref }}</div>
                </div>
              </n-scrollbar>
            </n-card>
          </n-gi>

          <n-gi :span="24" :l="14">
            <n-card title="生成用例" size="small" :bordered="true" class="req-doc-panel">
              <n-scrollbar class="req-doc-scroll">
                <n-empty
                  v-if="!cases.length && group.status === 'done'"
                  description="该文档下暂无已保存用例"
                />
                <n-empty
                  v-else-if="!cases.length && (group.status === 'generating' || group.status === 'pending')"
                  description="生成完成后将展示用例"
                />

                <div v-else class="req-doc-case-list">
                  <n-card
                    v-for="c in cases"
                    :key="c.id"
                    size="small"
                    class="req-doc-case-card"
                  >
                    <div class="req-doc-case-head">
                      <div class="req-doc-case-head-main">
                        <span class="req-doc-case-title">{{ c.title || c.name }}</span>
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
                    <div v-if="traceLabel(c)" class="req-doc-trace">溯源：{{ traceLabel(c) }}</div>
                    <ul class="req-doc-steps">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NCard,
  NEmpty,
  NGi,
  NGrid,
  NIcon,
  NScrollbar,
  NSpace,
  NSpin,
  NTag,
  NText,
  NAlert
} from 'naive-ui'
import { LoadingOutlined } from '@vicons/antd'
import {
  fetchGroupCasesBundle,
  type RequirementCaseRow,
  type RequirementGroupDetail
} from '@/api/requirement-groups'

const route = useRoute()
const loading = ref(false)
const loadError = ref<string | null>(null)
const group = ref<RequirementGroupDetail | null>(null)
const cases = ref<RequirementCaseRow[]>([])
const keyPoints = ref<Array<{ id?: string; text?: string; ref?: string }>>([])

let pollTimer: ReturnType<typeof setInterval> | null = null

const groupId = computed(() => {
  const raw = route.params.groupId
  const n = Number(raw)
  return Number.isFinite(n) ? n : NaN
})

const breadcrumbTitle = computed(() => {
  if (!group.value) return '加载中…'
  return formatDocMenuTitle(group.value.docTitle, group.value.version)
})

function formatDocMenuTitle(docTitle: string, version: number) {
  return `${docTitle} v${version}.0`
}

function traceLabel(c: RequirementCaseRow): string {
  const id = c.sourceKeyPointId
  if (!id) return ''
  const kp = keyPoints.value.find((k) => k.id === id)
  const t = kp?.text || ''
  return t.length > 80 ? `${t.slice(0, 80)}…` : t
}

async function loadOnce() {
  if (!Number.isFinite(groupId.value)) {
    loadError.value = '无效的分组 ID'
    return
  }
  loading.value = true
  loadError.value = null
  try {
    const bundle = await fetchGroupCasesBundle(groupId.value)
    group.value = bundle.group
    cases.value = bundle.cases || []
    keyPoints.value = Array.isArray(bundle.group.keyPoints) ? bundle.group.keyPoints : []
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    group.value = null
    cases.value = []
    keyPoints.value = []
  } finally {
    loading.value = false
  }
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function maybeStartPoll() {
  stopPoll()
  const st = group.value?.status
  if (st === 'generating' || st === 'pending') {
    pollTimer = setInterval(() => {
      void loadOnce()
    }, 2500)
  }
}

watch(
  () => route.params.groupId,
  () => {
    stopPoll()
    void loadOnce().then(maybeStartPoll)
  },
  { immediate: true }
)

onBeforeUnmount(stopPoll)
</script>

<style scoped>
.req-doc-view {
  padding: var(--space-6);
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  overflow: auto;
}

.req-doc-view-head {
  margin-bottom: var(--space-4);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.req-doc-view-meta {
  font-size: var(--text-sm);
}

.req-doc-view-alert {
  margin-bottom: var(--space-4);
}

.req-doc-view-status {
  margin-bottom: var(--space-4);
}

.req-doc-spin-icon {
  animation: req-spin 0.9s linear infinite;
}

@keyframes req-spin {
  to {
    transform: rotate(360deg);
  }
}

.req-doc-split {
  min-height: 360px;
}

.req-doc-panel {
  min-height: 360px;
}

.req-doc-scroll {
  max-height: min(560px, calc(100vh - 280px));
}

.req-doc-kp-item {
  padding: var(--space-3);
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
}

.req-doc-kp-text {
  font-size: var(--text-md);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}

.req-doc-kp-ref {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.req-doc-case-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.req-doc-case-card {
  border: 1px solid var(--color-border);
}

.req-doc-case-head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
}

.req-doc-case-head-main {
  flex: 1;
  min-width: 0;
}

.req-doc-case-title {
  display: block;
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
}

.req-doc-trace {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.req-doc-steps {
  margin: var(--space-3) 0 0;
  padding-left: var(--space-5);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
</style>
