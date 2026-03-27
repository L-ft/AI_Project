/**
 * 场景步骤 HTTP 执行（供单步发送与批量运行复用）
 */
import execRequest from '@/api/exec-request'

export type ScenarioSendLogEntry = {
  id: string
  at: number
  pass: boolean
  name: string
  method: string
  url: string
  statusCode: number | null
  elapsedMs: number | null
  error?: string
  responseBodyText?: string
  responseSizeBytes?: number
  responseHeaders?: Record<string, string>
  requestHeaders?: Record<string, string>
  requestBodySnippet?: string
  expectedStatusCode?: number
  validateResponseEnabled?: boolean
  jsonBusinessCode?: string | null
  jsonBusinessOk?: boolean
}

const VALIDATE_RESPONSE_TYPE = 'validate_response'

const defaultValidateResponseOp = () => ({
  type: VALIDATE_RESPONSE_TYPE,
  enabled: true,
  expect_status: 200,
  check_json_code: true
})

const mergePostOpsWithValidateResponse = (raw: any[]): any[] => {
  const list = Array.isArray(raw) ? raw.map((x) => ({ ...x })) : []
  const idx = list.findIndex((o) => o?.type === VALIDATE_RESPONSE_TYPE)
  if (idx >= 0) {
    const cur = list[idx]
    const n = Number(cur.expect_status ?? cur.expected_status ?? 200)
    list[idx] = {
      type: VALIDATE_RESPONSE_TYPE,
      enabled: cur.enabled !== false,
      expect_status: Number.isFinite(n) ? n : 200,
      check_json_code: cur.check_json_code !== false
    }
    return list
  }
  return [defaultValidateResponseOp(), ...list]
}

const getValidateResponseConfigFromPostOps = (ops: any[] | undefined) => {
  const list = Array.isArray(ops) ? ops : []
  const op = list.find((o) => o?.type === VALIDATE_RESPONSE_TYPE)
  if (!op) {
    return { enabled: true as boolean, expect_status: 200, check_json_code: true as boolean }
  }
  const n = Number(op.expect_status ?? 200)
  return {
    enabled: op.enabled !== false,
    expect_status: Number.isFinite(n) ? n : 200,
    check_json_code: op.check_json_code !== false
  }
}

const checkJsonEnvelopeBusinessSuccess = (
  data: unknown
): { skipped: boolean; ok: boolean; displayCode: string | null } => {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return { skipped: true, ok: true, displayCode: null }
  }
  const o = data as Record<string, unknown>
  if (o.success === false) {
    return { skipped: false, ok: false, displayCode: null }
  }
  if (!('code' in o)) {
    return { skipped: true, ok: true, displayCode: null }
  }
  const raw = o.code
  if (raw === undefined || raw === null) {
    return { skipped: true, ok: true, displayCode: null }
  }
  const s = String(raw).trim()
  const n = Number(s)
  const ok = s === '200' || s === '0' || n === 200 || n === 0
  return { skipped: false, ok, displayCode: s }
}

export const evaluateValidateResponsePass = (
  statusCode: number | null | undefined,
  postOps: any[] | undefined,
  responseData?: unknown
): {
  pass: boolean
  expectedStatusCode: number
  validateResponseEnabled: boolean
  jsonBusinessCode?: string | null
  jsonBusinessOk?: boolean
} => {
  const cfg = getValidateResponseConfigFromPostOps(postOps)
  const c =
    statusCode != null && Number.isFinite(Number(statusCode)) ? Number(statusCode) : null
  if (!cfg.enabled) {
    return {
      pass: c != null && c >= 200 && c < 400,
      expectedStatusCode: cfg.expect_status,
      validateResponseEnabled: false
    }
  }
  if (c == null) {
    return { pass: false, expectedStatusCode: cfg.expect_status, validateResponseEnabled: true }
  }
  const httpPass = c === cfg.expect_status
  let jsonBusinessCode: string | null | undefined
  let jsonBusinessOk: boolean | undefined

  if (cfg.check_json_code && httpPass && responseData !== undefined) {
    const biz = checkJsonEnvelopeBusinessSuccess(responseData)
    if (!biz.skipped) {
      jsonBusinessCode = biz.displayCode
      jsonBusinessOk = biz.ok
    }
  }

  const pass = httpPass && (jsonBusinessOk === undefined || jsonBusinessOk === true)

  return {
    pass,
    expectedStatusCode: cfg.expect_status,
    validateResponseEnabled: true,
    jsonBusinessCode,
    jsonBusinessOk
  }
}

export const normalizeExecProxyResponse = (raw: unknown) => {
  const pick = (o: Record<string, unknown>) => ({
    status_code: o.status_code != null ? Number(o.status_code) : null,
    headers: o.headers,
    data: o.data,
    elapsed:
      o.elapsed != null && !Number.isNaN(Number(o.elapsed)) ? Number(o.elapsed) : null,
    error: o.error != null ? String(o.error) : undefined,
    msg: o.msg != null ? String(o.msg) : undefined
  })

  if (raw == null || typeof raw !== 'object') {
    return pick({ status_code: null, headers: undefined, data: undefined, elapsed: null })
  }
  const r = raw as Record<string, unknown>
  if ('status_code' in r || r.error != null) {
    return pick(r)
  }
  const inner = r.data
  if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>
    if ('status_code' in d || d.error != null || (d.headers != null && 'data' in d)) {
      return pick(d)
    }
  }
  return {
    status_code: null as number | null,
    headers: undefined as unknown,
    data: raw,
    elapsed: null as number | null,
    error: undefined as string | undefined,
    msg: undefined as string | undefined
  }
}

export const stringifyResponseForLog = (data: unknown): { text: string; bytes: number } => {
  if (data === undefined || data === null) {
    return { text: '(空响应体)', bytes: 0 }
  }
  if (data === '') {
    return { text: '(空响应体)', bytes: 0 }
  }
  let text: string
  if (typeof data === 'string') {
    text = data
  } else {
    try {
      const s = JSON.stringify(data, null, 2)
      text = s === undefined ? String(data) : s
    } catch {
      text = String(data)
    }
  }
  const bytes = new TextEncoder().encode(text).byteLength
  return { text, bytes }
}

export const buildRequestBodySnippet = (b: unknown): string => {
  if (b == null || b === '') return ''
  if (typeof b === 'string') {
    return b.length > 8000 ? `${b.slice(0, 8000)}…` : b
  }
  try {
    const s = JSON.stringify(b)
    return s.length > 8000 ? `${s.slice(0, 8000)}…` : s
  } catch {
    const s = String(b)
    return s.length > 8000 ? `${s.slice(0, 8000)}…` : s
  }
}

export const normalizeProxyHeaderMap = (h: unknown): Record<string, string> => {
  if (!h || typeof h !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
    if (v == null) continue
    out[String(k)] = Array.isArray(v) ? (v as unknown[]).map(String).join(', ') : String(v)
  }
  return out
}

export const buildUrlWithQueryString = (url: string, rows: any[]): string => {
  const params = new URLSearchParams()
  for (const row of rows) {
    const k = String(row.name || '').trim()
    if (!k) continue
    params.append(k, String(row.example ?? row.value ?? ''))
  }
  const qs = params.toString()
  if (!qs) return url
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

export const buildFormBodyFromParamRows = (rows: any[]): string => {
  const params = new URLSearchParams()
  for (const row of rows) {
    const k = String(row.name || '').trim()
    if (!k) continue
    params.append(k, String(row.example ?? row.value ?? ''))
  }
  return params.toString()
}

const cloneParamRows = (raw: any): any[] =>
  Array.isArray(raw) ? raw.map((x: any) => ({ ...x })) : []

const unwrapEntity = (res: any): any => {
  if (!res || typeof res !== 'object') return null
  if ('id' in res) return res
  if (res.data && typeof res.data === 'object' && 'id' in res.data) return res.data
  return null
}

async function fetchEnvBaseUrl(envId: number | null): Promise<string> {
  if (envId == null) return ''
  try {
    const envRaw: any = await execRequest.get(`/environments/${envId}`)
    const env = unwrapEntity(envRaw) || envRaw
    return String(env?.base_url || '').replace(/\/$/, '')
  } catch {
    return ''
  }
}

function buildProxyHeadersFromRows(rows: any[], bodyType: string): Record<string, string> {
  const h: Record<string, string> = {}
  for (const row of rows) {
    const k = String(row.name || '').trim()
    if (!k) continue
    h[k] = String(row.example ?? row.value ?? '')
  }
  if (bodyType === 'json') {
    if (!h['Content-Type'] && !h['content-type']) h['Content-Type'] = 'application/json'
  }
  return h
}

export type StepExecContext = {
  stepName: string
  method: string
  rawUrl: string
  queryParams: any[]
  headerParams: any[]
  bodyType: string
  bodyContent: string
  postOps: any[]
}

/**
 * 拉取用例 + 接口定义，组装与步骤编辑器一致的请求上下文；无法执行时返回 null。
 */
export async function loadStepExecContext(
  step: any,
  envId: number | null
): Promise<StepExecContext | null> {
  if (!step?.case_id || !step?.interface_id) return null
  try {
    const [tcRaw, ifaceRaw] = await Promise.all([
      execRequest.get(`/test-cases/${step.case_id}`),
      execRequest.get(`/interfaces/${step.interface_id}`)
    ])
    const tc = unwrapEntity(tcRaw) ?? tcRaw
    const iface = unwrapEntity(ifaceRaw) ?? ifaceRaw
    if (!iface?.id) return null
    const m = String(iface.method ?? 'GET').toUpperCase()
    const path = iface.path || ''
    const base = await fetchEnvBaseUrl(envId)
    const p = path.startsWith('/') ? path : path ? `/${path}` : ''
    const rawUrl = base ? `${base}${p}` : p || ''
    const qpTc = cloneParamRows(tc?.query_params)
    const qpIface = cloneParamRows(iface.query_params)
    const queryParams = qpTc.length ? qpTc : qpIface
    const hpTc = cloneParamRows(tc?.header_params)
    const hpIface = cloneParamRows(iface.header_params)
    const headerParams = hpTc.length ? hpTc : hpIface
    const bd = tc?.body_definition || iface.body_definition || { type: 'none', content: '' }
    const bodyType = bd.type || 'none'
    const c = bd.content
    const bodyContent =
      typeof c === 'string' ? c : c != null ? JSON.stringify(c, null, 2) : ''
    const rawPost = Array.isArray(tc?.post_operations) ? cloneParamRows(tc.post_operations) : []
    const postOps = mergePostOpsWithValidateResponse(rawPost)
    const stepName = String(step?.name || '').trim() || '未命名步骤'
    return {
      stepName,
      method: m,
      rawUrl,
      queryParams,
      headerParams,
      bodyType,
      bodyContent,
      postOps
    }
  } catch {
    return null
  }
}

/**
 * 根据上下文发起 /proxy 请求，返回完整日志行（含 id、at）。
 */
export async function runStepExecContext(ctx: StepExecContext): Promise<ScenarioSendLogEntry> {
  const now = Date.now()
  const id = `${now}-${Math.random().toString(36).slice(2, 10)}`
  const upper = String(ctx.method || 'GET').toUpperCase()
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(upper)
  const hasParamRows = ctx.queryParams.some((r) => String(r.name || '').trim())
  const urlBase = ctx.rawUrl.trim().split('?')[0]
  let finalUrl = ctx.rawUrl.trim()
  let body: any = null
  const headers: Record<string, string> = { ...buildProxyHeadersFromRows(ctx.headerParams, ctx.bodyType) }

  if (!finalUrl) {
    return {
      id,
      at: now,
      pass: false,
      name: ctx.stepName,
      method: upper,
      url: '',
      statusCode: null,
      elapsedMs: null,
      error: '未配置环境 base_url 或接口 path，无法组成 URL',
      requestHeaders: headers,
      requestBodySnippet: '',
      ...evaluateValidateResponsePass(null, ctx.postOps)
    }
  }

  if (upper === 'GET' || upper === 'HEAD') {
    finalUrl = buildUrlWithQueryString(ctx.rawUrl.trim(), ctx.queryParams)
  } else if (isWrite && ctx.bodyType === 'none' && hasParamRows) {
    finalUrl = urlBase
    body = buildFormBodyFromParamRows(ctx.queryParams)
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  } else if (isWrite && ctx.bodyType === 'x-www-form-urlencoded') {
    finalUrl = urlBase
    body = buildFormBodyFromParamRows(ctx.queryParams)
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  } else {
    finalUrl = buildUrlWithQueryString(ctx.rawUrl.trim(), ctx.queryParams)
    if (isWrite) {
      if (ctx.bodyType === 'json' && ctx.bodyContent.trim()) {
        try {
          body = JSON.parse(ctx.bodyContent)
        } catch {
          return {
            id,
            at: now,
            pass: false,
            name: ctx.stepName,
            method: upper,
            url: finalUrl,
            statusCode: null,
            elapsedMs: null,
            error: 'Body JSON 无法解析',
            requestHeaders: { ...headers },
            requestBodySnippet: buildRequestBodySnippet(ctx.bodyContent),
            ...evaluateValidateResponsePass(null, ctx.postOps)
          }
        }
      } else if (ctx.bodyType === 'text') {
        body = ctx.bodyContent
      } else if (ctx.bodyType === 'form-data') {
        return {
          id,
          at: now,
          pass: false,
          name: ctx.stepName,
          method: upper,
          url: finalUrl,
          statusCode: null,
          elapsedMs: null,
          error: 'form-data 暂不支持批量运行，请改用 JSON 或 x-www-form-urlencoded',
          requestHeaders: { ...headers },
          requestBodySnippet: '',
          ...evaluateValidateResponsePass(null, ctx.postOps)
        }
      }
    }
  }

  const requestHeadersSnapshot = { ...headers }
  const requestBodySnippet = buildRequestBodySnippet(body)

  try {
    const res: any = await execRequest.post(
      '/proxy',
      { url: finalUrl, method: upper, headers, body },
      { timeout: 35000 }
    )
    const env = normalizeExecProxyResponse(res)
    if (env.error) {
      const ev = evaluateValidateResponsePass(env.status_code ?? null, ctx.postOps, env.data)
      return {
        id,
        at: now,
        pass: false,
        name: ctx.stepName,
        method: upper,
        url: finalUrl,
        statusCode: env.status_code != null ? Number(env.status_code) : null,
        elapsedMs: env.elapsed,
        error: String(env.error),
        requestHeaders: requestHeadersSnapshot,
        requestBodySnippet,
        expectedStatusCode: ev.expectedStatusCode,
        validateResponseEnabled: ev.validateResponseEnabled,
        jsonBusinessCode: ev.jsonBusinessCode,
        jsonBusinessOk: ev.jsonBusinessOk
      }
    }
    const code = Number(env.status_code ?? 0)
    const ev = evaluateValidateResponsePass(code, ctx.postOps, env.data)
    const rh = normalizeProxyHeaderMap(env.headers)
    const { text, bytes } = stringifyResponseForLog(env.data)
    return {
      id,
      at: now,
      pass: ev.pass,
      name: ctx.stepName,
      method: upper,
      url: finalUrl,
      statusCode: code,
      elapsedMs: env.elapsed,
      responseBodyText: text,
      responseSizeBytes: bytes,
      responseHeaders: rh,
      requestHeaders: requestHeadersSnapshot,
      requestBodySnippet,
      expectedStatusCode: ev.expectedStatusCode,
      validateResponseEnabled: ev.validateResponseEnabled,
      jsonBusinessCode: ev.jsonBusinessCode,
      jsonBusinessOk: ev.jsonBusinessOk
    }
  } catch (err: any) {
    const status = err?.response?.status
    let text = '网络或执行引擎异常'
    const data = err?.response?.data
    if (typeof data?.detail === 'string') text = data.detail
    else if (err?.code === 'ERR_NETWORK' || !err?.response) {
      text = '无法连接执行引擎'
    } else if (status != null) {
      const body =
        data && typeof data === 'object' ? JSON.stringify(data) : String(data ?? '')
      text = `HTTP ${status}${body ? `：${body.slice(0, 400)}` : ''}`
    }
    const evCatch = evaluateValidateResponsePass(status ?? null, ctx.postOps)
    return {
      id,
      at: now,
      pass: false,
      name: ctx.stepName,
      method: upper,
      url: finalUrl,
      statusCode: status != null ? Number(status) : null,
      elapsedMs: null,
      error: text,
      requestHeaders: requestHeadersSnapshot,
      requestBodySnippet,
      expectedStatusCode: evCatch.expectedStatusCode,
      validateResponseEnabled: evCatch.validateResponseEnabled
    }
  }
}

export function computeSummaryForLogEntries(logs: ScenarioSendLogEntry[]) {
  const total = logs.length
  let pass = 0
  let fail = 0
  let sumMs = 0
  let nMs = 0
  for (const e of logs) {
    if (e.pass) pass++
    else fail++
    if (e.elapsedMs != null && !Number.isNaN(e.elapsedMs)) {
      sumMs += e.elapsedMs
      nMs++
    }
  }
  return {
    total,
    pass,
    fail,
    untested: 0,
    sumMs,
    avgMs: nMs > 0 ? sumMs / nMs : 0,
    nMs
  }
}
