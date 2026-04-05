import execRequest from './exec-request'

/** 需求文档 AI 生成并落库的用例（与 functional_test_cases 手动库区分） */
export interface RequirementAiCaseRow {
  id: number
  requirementGroupId: number
  docTitle: string
  groupVersion: number
  name: string
  caseType: string
  priority?: string
  kind?: string
  steps: unknown[]
}

/** GET /test-cases/:id 返回的接口用例详情（需求用例的字段在 body_definition） */
export interface ApiTestCaseDetail {
  id: number
  interface_id: number | null
  requirement_group_id: number | null
  name: string
  case_type: string
  body_definition?: Record<string, unknown> | null
}

export async function fetchRequirementAiCases(params?: {
  keyword?: string
  docKeyword?: string
}): Promise<RequirementAiCaseRow[]> {
  return (await execRequest.get('/test-cases/requirement-generated', {
    params: {
      keyword: params?.keyword || undefined,
      docKeyword: params?.docKeyword || undefined
    }
  })) as RequirementAiCaseRow[]
}

export async function getApiTestCase(caseId: number): Promise<ApiTestCaseDetail> {
  return (await execRequest.get(`/test-cases/${caseId}`)) as ApiTestCaseDetail
}

export async function updateApiTestCase(
  caseId: number,
  body: {
    name?: string
    case_type?: string
    body_definition?: Record<string, unknown> | null
  }
): Promise<ApiTestCaseDetail> {
  return (await execRequest.patch(`/test-cases/${caseId}`, body)) as ApiTestCaseDetail
}

export async function deleteApiTestCase(caseId: number): Promise<void> {
  await execRequest.delete(`/test-cases/${caseId}`)
}
