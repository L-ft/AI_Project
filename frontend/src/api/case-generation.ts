import execRequest from './exec-request'

export interface KeyPoint {
  id: string
  text: string
  ref?: string
}

export interface GeneratedCase {
  id: string
  title: string
  priority: 'P0' | 'P1' | 'P2'
  kind: 'positive' | 'negative'
  steps: string[]
  sourceKeyPointId?: string
}

export interface JobStatusPayload {
  phase: string
  progress: number
  logs: string[]
  keyPoints: KeyPoint[]
  cases: GeneratedCase[]
  errorMessage: string | null
}

export async function createRequirementJob(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const data = (await execRequest.post(
    '/requirement-cases/jobs',
    fd,
    {
      timeout: 120000,
      onUploadProgress: (e) => {
        if (!e.total || !onProgress) return
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    }
  )) as { taskId: string }
  return data.taskId
}

export async function fetchJobStatus(taskId: string): Promise<JobStatusPayload> {
  return (await execRequest.get(`/requirement-cases/jobs/${taskId}`)) as JobStatusPayload
}
