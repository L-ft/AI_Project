import execRequest from './exec-request'

export interface RequirementGroupItem {
  id: string
  code: string
  docTitle: string
  uploadTime: string | null
  status: string
  fileHash: string
  version: number
  caseCount: number
}

export interface RequirementGroupDetail {
  id: string
  code: string
  docTitle: string
  uploadTime: string | null
  status: string
  fileHash: string
  version: number
  keyPoints: Array<{ id?: string; text?: string; ref?: string }>
}

export interface RequirementCaseRow {
  id: string
  code: string
  name: string
  caseType: string
  case_type?: string
  requirementGroupId: string | null
  requirement_group_id?: string | null
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

export async function fetchGroupCasesBundle(groupId: string): Promise<{
  group: RequirementGroupDetail
  cases: RequirementCaseRow[]
}> {
  return (await execRequest.get(`/groups/${groupId}/cases`)) as {
    group: RequirementGroupDetail
    cases: RequirementCaseRow[]
  }
}

export async function deleteRequirementGroup(groupId: string): Promise<void> {
  await execRequest.delete(`/groups/${groupId}`)
}
