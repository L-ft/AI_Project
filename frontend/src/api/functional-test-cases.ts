import execRequest from './exec-request'

export interface FunctionalCaseStep {
  order: number
  action: string
  expected: string
}

export interface FunctionalTestCaseRow {
  id: string
  code: string
  module: string
  case_code: string | null
  caseCode?: string | null
  title: string
  priority: string
  category: string
  preconditions: string | null
  steps: FunctionalCaseStep[] | null
  expected_result: string | null
  expectedResult?: string | null
  remark: string | null
  status: string
}

export interface FunctionalCaseListResult {
  items: FunctionalTestCaseRow[]
  total: number
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export async function fetchFunctionalCases(params: {
  page?: number
  page_size?: number
  module?: string
  keyword?: string
}): Promise<FunctionalCaseListResult> {
  return (await execRequest.get('/functional-test-cases', {
    params
  })) as FunctionalCaseListResult
}

export async function getFunctionalCase(id: string): Promise<FunctionalTestCaseRow> {
  return (await execRequest.get(`/functional-test-cases/${id}`)) as FunctionalTestCaseRow
}

export async function createFunctionalCase(
  body: Partial<FunctionalTestCaseRow> & { title: string }
): Promise<FunctionalTestCaseRow> {
  return (await execRequest.post('/functional-test-cases', body)) as FunctionalTestCaseRow
}

export async function updateFunctionalCase(
  id: string,
  body: Partial<FunctionalTestCaseRow>
): Promise<FunctionalTestCaseRow> {
  return (await execRequest.patch(`/functional-test-cases/${id}`, body)) as FunctionalTestCaseRow
}

export async function deleteFunctionalCase(id: string): Promise<void> {
  await execRequest.delete(`/functional-test-cases/${id}`)
}

export async function importFunctionalCasesExcel(file: File): Promise<ImportResult> {
  const fd = new FormData()
  fd.append('file', file)
  return (await execRequest.post('/functional-test-cases/import/excel', fd, {
    timeout: 120000
  })) as ImportResult
}

export async function importFunctionalCasesXmind(file: File): Promise<ImportResult> {
  const fd = new FormData()
  fd.append('file', file)
  return (await execRequest.post('/functional-test-cases/import/xmind', fd, {
    timeout: 120000
  })) as ImportResult
}
