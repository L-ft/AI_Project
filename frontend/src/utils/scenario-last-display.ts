/**
 * 列表/统计用「最近结果」：优先较新的 last_report（报告摘要），并与 last_result 快照对齐。
 */

export type LastDisplayStatus = 'passed' | 'failed' | 'running' | null

export type ScenarioLastRow = {
  last_result?: {
    status?: string
    finished_at?: string
    at?: number
  } | null
  last_report?: {
    created_at?: string
    status?: string
    summary?: Record<string, unknown>
  } | null
}

function parseServerTime(iso: string | undefined): number {
  if (!iso) return 0
  const t = Date.parse(iso.replace(' ', 'T'))
  return Number.isFinite(t) ? t : 0
}

/**
 * 与列表列、统计卡片一致：用于展示「最近通过/失败/运行中」与「最近结果」徽标。
 */
export function getScenarioLastDisplayStatus(row: ScenarioLastRow): LastDisplayStatus {
  const lr = row.last_result
  const rep = row.last_report

  if (lr?.status === 'running') {
    return 'running'
  }

  const repT = parseServerTime(rep?.created_at)
  const lrT = lr?.finished_at ? parseServerTime(lr.finished_at) : 0

  const fromReport = (): LastDisplayStatus => {
    const st = rep?.status
    if (st === 'passed') return 'passed'
    if (st === 'failed') return 'failed'
    return null
  }

  const fromResult = (): LastDisplayStatus => {
    const st = lr?.status
    if (st === 'passed') return 'passed'
    if (st === 'failed') return 'failed'
    if (st === 'running') return 'running'
    return null
  }

  if (rep && lr) {
    if (repT >= lrT) {
      const r = fromReport()
      return r !== null ? r : fromResult()
    }
    return fromResult()
  }

  if (rep) return fromReport()
  if (lr) return fromResult()
  return null
}
