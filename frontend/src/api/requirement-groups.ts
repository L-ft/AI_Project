import execRequest from './exec-request'

export interface RequirementGroupItem {
  id: number
  docTitle: string
  uploadTime: string | null
  status: string
  fileHash: string
  version: number
  caseCount: number
}

export interface RequirementGroupDetail {
  id: number
  docTitle: string
  uploadTime: string | null
  status: string
  fileHash: string
  version: number
  keyPoints: Array<{ id?: string; text?: string; ref?: string }>
}

export interface RequirementCaseRow {
  id: number
  name: string
  caseType: string
  requirementGroupId: number | null
  title: string
  priority?: string
  kind?: string
  steps: string[]
  sourceKeyPointId?: string
  externalId?: string
}

export async function fetchRequirementGroups(): Promise<RequirementGroupItem[]> {
  return (await execRequest.get('/groups')) as RequirementGroupItem[]
}

export async function fetchGroupCasesBundle(groupId: number): Promise<{
  group: RequirementGroupDetail
  cases: RequirementCaseRow[]
}> {
  return (await execRequest.get(`/groups/${groupId}/cases`)) as {
    group: RequirementGroupDetail
    cases: RequirementCaseRow[]
  }
}

export async function deleteRequirementGroup(groupId: number): Promise<void> {
  await execRequest.delete(`/groups/${groupId}`)
}
