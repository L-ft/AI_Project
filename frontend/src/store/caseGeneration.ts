import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createRequirementJob,
  fetchJobStatus,
  type KeyPoint,
  type GeneratedCase,
  type ConflictPayload
} from '@/api/case-generation'

export type JobPhase =
  | 'idle'
  | 'uploading'
  | 'pending'
  | 'parsing'
  | 'generating'
  | 'done'
  | 'failed'

export const useCaseGenerationStore = defineStore('caseGeneration', () => {
  const taskId = ref<string | null>(null)
  const phase = ref<JobPhase>('idle')
  const progress = ref(0)
  const logs = ref<string[]>([])
  const keyPoints = ref<KeyPoint[]>([])
  const cases = ref<GeneratedCase[]>([])
  const errorMessage = ref<string | null>(null)
  const uploadPercent = ref(0)
  const currentFileName = ref<string | null>(null)
  const groupId = ref<number | null>(null)

  let pollTimer: ReturnType<typeof setInterval> | null = null

  const isBusy = computed(
    () =>
      phase.value === 'uploading' ||
      phase.value === 'pending' ||
      phase.value === 'parsing' ||
      phase.value === 'generating'
  )

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function applyJobPayload(p: {
    phase: string
    progress: number
    logs: string[]
    keyPoints: KeyPoint[]
    cases: GeneratedCase[]
    errorMessage: string | null
    groupId?: number | null
  }) {
    progress.value = p.progress
    logs.value = [...p.logs]
    keyPoints.value = p.keyPoints ?? []
    cases.value = p.cases ?? []
    errorMessage.value = p.errorMessage
    if (p.groupId != null) groupId.value = p.groupId
    const ph = p.phase as JobPhase
    if (
      ph === 'pending' ||
      ph === 'parsing' ||
      ph === 'generating' ||
      ph === 'done' ||
      ph === 'failed'
    ) {
      phase.value = ph
    }
    if (ph === 'done' || ph === 'failed') {
      stopPolling()
    }
  }

  async function pollOnce() {
    if (!taskId.value) return
    try {
      const data = await fetchJobStatus(taskId.value)
      applyJobPayload(data)
    } catch {
      stopPolling()
    }
  }

  function startPolling(intervalMs = 1500) {
    stopPolling()
    void pollOnce()
    pollTimer = setInterval(() => {
      void pollOnce()
    }, intervalMs)
  }

  async function runUpload(
    file: File,
    onUploadProgress?: (percent: number) => void,
    duplicateOpts?: {
      duplicateAction?: 'overwrite' | 'new_version'
      overwriteGroupId?: number
    }
  ) {
    reset()
    currentFileName.value = file.name
    phase.value = 'uploading'
    uploadPercent.value = 0
    try {
      const res = await createRequirementJob(file, {
        onProgress: (pct) => {
          uploadPercent.value = pct
          onUploadProgress?.(pct)
        },
        ...duplicateOpts
      })
      taskId.value = res.taskId
      groupId.value = res.groupId ?? null
      phase.value = 'pending'
      startPolling()
    } catch (e) {
      const cp = (e as { conflictPayload?: ConflictPayload }).conflictPayload
      if (cp) {
        phase.value = 'idle'
        uploadPercent.value = 0
        throw e
      }
      phase.value = 'failed'
      errorMessage.value =
        e instanceof Error ? e.message : '上传或任务创建失败'
      throw e
    }
  }

  function reset() {
    stopPolling()
    taskId.value = null
    phase.value = 'idle'
    progress.value = 0
    logs.value = []
    keyPoints.value = []
    cases.value = []
    errorMessage.value = null
    uploadPercent.value = 0
    currentFileName.value = null
    groupId.value = null
  }

  function removeCase(id: string) {
    cases.value = cases.value.filter((c) => c.id !== id)
  }

  function updateCase(id: string, patch: Partial<GeneratedCase>) {
    const i = cases.value.findIndex((c) => c.id === id)
    if (i >= 0) {
      cases.value[i] = { ...cases.value[i], ...patch }
    }
  }

  return {
    taskId,
    phase,
    progress,
    logs,
    keyPoints,
    cases,
    errorMessage,
    uploadPercent,
    currentFileName,
    groupId,
    isBusy,
    reset,
    stopPolling,
    startPolling,
    runUpload,
    removeCase,
    updateCase
  }
})
