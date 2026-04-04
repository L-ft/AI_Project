import type { ScenarioSendLogEntry } from '@/utils/scenario-step-exec'

/** 步骤列表行展示用 DTO（与详情/大对象解耦） */
export type ScenarioStepListItem = {
  listKey: string
  idx: number
  step: Record<string, unknown>
  stepName: string
  method: string
  statusText: string
  statusClass: 'pending' | 'passed' | 'failed'
  lastCode: string
  lastElapsed: string
  lastRunAt: string
  metaLine: string
  metaClass: string
  failureSummary: string | null
}

export function getMethodBadgeStyle(method: string): string {
  const map: Record<string, string> = {
    GET: 'color:#389e0d;background:#f6ffed;border:1px solid #b7eb8f;',
    POST: 'color:#d46b08;background:#fff7e6;border:1px solid #ffd591;',
    PUT: 'color:#096dd9;background:#e6f7ff;border:1px solid #91d5ff;',
    DELETE: 'color:#cf1322;background:#fff1f0;border:1px solid #ffa39e;',
    PATCH: 'color:#531dab;background:#f9f0ff;border:1px solid #d3adf7;'
  }
  return map[method] || 'color:#595959;background:#f5f5f5;border:1px solid #d9d9d9;'
}

/** 与原先模板中 step-li-meta / *--iface / *--http 等 class 对齐 */
export function buildStepMetaDisplay(step: Record<string, unknown> | undefined): { line: string; metaClass: string } {
  if (!step) return { line: '', metaClass: 'step-li-meta' }
  if (step.case_id) {
    const line =
      step.source === 'interface_case'
        ? `接口用例 #${step.case_id}`
        : `调试用例 #${step.case_id}`
    return { line, metaClass: 'step-li-meta' }
  }
  if (step.source === 'interface' && step.interface_id) {
    return { line: `接口 #${step.interface_id}`, metaClass: 'step-li-meta step-li-meta--iface' }
  }
  if (step.source === 'http' || step.source === 'curl') {
    return {
      line: step.source === 'curl' ? 'cURL 请求' : 'HTTP 请求',
      metaClass: 'step-li-meta step-li-meta--http'
    }
  }
  if (step.source === 'wait_step') return { line: '等待', metaClass: 'step-li-meta step-li-meta--http' }
  if (step.source === 'script_step') return { line: '脚本', metaClass: 'step-li-meta step-li-meta--http' }
  if (step.source === 'group_step') return { line: '步骤组', metaClass: 'step-li-meta step-li-meta--iface' }
  if (step.source === 'db_step') return { line: '数据库', metaClass: 'step-li-meta step-li-meta--http' }
  return { line: '', metaClass: 'step-li-meta' }
}

/** 列表行首屏失败摘要（来自执行日志） */
export function computeScenarioStepFailureSummary(log: ScenarioSendLogEntry | undefined): string | null {
  if (!log || log.pass) return null
  const err = (log.error || '').trim()
  if (err) {
    const one = err.split(/\r?\n/)[0]
    return one.length > 80 ? `${one.slice(0, 77)}…` : one
  }
  const sc = log.statusCode
  const exp = log.expectedStatusCode
  if (log.validateResponseEnabled && exp != null && sc != null && exp !== sc) {
    return `HTTP ${sc}，期望 ${exp}`
  }
  if (log.jsonBusinessOk === false && log.jsonBusinessCode != null && String(log.jsonBusinessCode).length) {
    return `业务 code ${log.jsonBusinessCode}`
  }
  if (log.jsonBusinessOk === false) {
    return '业务校验未通过'
  }
  if (sc != null && (sc < 200 || sc >= 400)) {
    return `HTTP ${sc}`
  }
  return '校验未通过'
}
