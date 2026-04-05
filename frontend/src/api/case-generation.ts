import axios from 'axios'
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
  groupId?: number | null
}

export interface ConflictGroupInfo {
  id: number
  docTitle: string
  version: number
  uploadTime: string | null
  status: string
  fileHash: string
}

export interface ConflictPayload {
  conflict: true
  fileHash: string
  groups: ConflictGroupInfo[]
}

export type CreateJobSuccess = {
  taskId: string
  groupId: number
  fileHash?: string
}

function parseConflict(error: unknown): ConflictPayload | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) return null
  const raw = error.response.data as {
    data?: { conflict?: boolean; fileHash?: string; groups?: ConflictGroupInfo[] }
  }
  const d = raw?.data
  if (d?.conflict && Array.isArray(d.groups)) {
    return {
      conflict: true,
      fileHash: String(d.fileHash ?? ''),
      groups: d.groups
    }
  }
  return null
}

export async function createRequirementJob(
  file: File,
  opts?: {
    onProgress?: (percent: number) => void
    duplicateAction?: 'overwrite' | 'new_version'
    overwriteGroupId?: number
  }
): Promise<CreateJobSuccess> {
  const fd = new FormData()
  fd.append('file', file)
  if (opts?.duplicateAction) {
    fd.append('duplicate_action', opts.duplicateAction)
  }
  if (opts?.overwriteGroupId != null) {
    fd.append('overwrite_group_id', String(opts.overwriteGroupId))
  }
  try {
    const data = (await execRequest.post('/requirement-cases/jobs', fd, {
      timeout: 120000,
      onUploadProgress: (e) => {
        if (!e.total || !opts?.onProgress) return
        opts.onProgress(Math.round((e.loaded * 100) / e.total))
      }
    })) as CreateJobSuccess
    return data
  } catch (e) {
    const c = parseConflict(e)
    if (c) {
      const err = new Error('REQUIREMENT_CONFLICT') as Error & {
        conflictPayload: ConflictPayload
      }
      err.conflictPayload = c
      throw err
    }
    throw e
  }
}

export async function fetchJobStatus(taskId: string): Promise<JobStatusPayload> {
  return (await execRequest.get(`/requirement-cases/jobs/${taskId}`)) as JobStatusPayload
}
