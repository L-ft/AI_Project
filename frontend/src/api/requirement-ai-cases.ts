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
