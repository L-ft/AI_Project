import execRequest from './exec-request'

/** 需求文档 AI 生成并落库的用例（与 functional_test_cases 手动库区分） */
export interface RequirementAiCaseRow {
  id: string
  code: string
  requirementGroupId: string
  requirement_group_id?: string
  docTitle: string
  groupVersion: number
  name: string
  caseType: string
  case_type?: string
  priority?: string
  kind?: string
  steps: unknown[]
}

/** GET /test-cases/:code 返回的接口用例详情（AI 生成用例的扩展字段在 body_definition） */
export interface ApiTestCaseDetail {
  id: string
  code: string
  interface_id: string | null
  interfaceCode?: string | null
  requirement_group_id: string | null
  requirementGroupCode?: string | null
  name: string
  case_type: string
  caseType?: string
  body_definition?: Record<string, unknown> | null
  bodyDefinition?: Record<string, unknown> | null
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

export async function getApiTestCase(caseId: string): Promise<ApiTestCaseDetail> {
  return (await execRequest.get(`/test-cases/${caseId}`)) as ApiTestCaseDetail
}

export async function updateApiTestCase(
  caseId: string,
  body: {
    name?: string
    case_type?: string
    body_definition?: Record<string, unknown> | null
  }
): Promise<ApiTestCaseDetail> {
  return (await execRequest.patch(`/test-cases/${caseId}`, body)) as ApiTestCaseDetail
}

export async function deleteApiTestCase(caseId: string): Promise<void> {
  await execRequest.delete(`/test-cases/${caseId}`)
}
