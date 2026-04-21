/**
 * 场景步骤 HTTP 执行（供单步发送与批量运行复用）
 */
import execRequest from '@/api/exec-request'
import {
  buildProxyExtraFields,
  defaultStepReqSettings,
  normalizeStepReqSettings,
  type StepReqSettings
} from '@/utils/req-settings'
import {
  evaluateAssertionRule,
  normalizeAssertionConfig
} from '@/utils/http-assertion-contract'

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

export type ScenarioAssertionResult = {
  name: string
  passed: boolean
  message: string
}

export const evaluatePostAssertions = (
  statusCode: number | null | undefined,
  headers: Record<string, string> | undefined,
  data: unknown,
  postOps: any[] | undefined
): { pass: boolean; results: ScenarioAssertionResult[] } => {
  const headerMap = headers || {}
  const ops = Array.isArray(postOps) ? postOps.filter((op) => op?.type === 'assertion' && op?.enabled !== false) : []
  const results = ops.map((op, index) => {
    const cfg = normalizeAssertionConfig(op?.config || op || {})
    const evaluation = evaluateAssertionRule({
      target: cfg.target,
      operator: cfg.operator,
      expression: cfg.expression,
      expected: cfg.value,
      statusCode,
      headers: headerMap,
      data
    })
    const actual = evaluation.actual
    const passed = evaluation.passed
    const operator = evaluation.operator
    const name = String(op?.config?.name || op?.name || `断言 ${index + 1}`)
    const actualText = actual == null ? '空值' : String(actual)
    const expectedText = cfg.value == null ? '' : String(cfg.value)
    const message = passed
      ? `实际值 ${actualText} 校验通过`
      : `实际值 ${actualText}，期望 ${expectedText || operator}`
    return { name, passed, message }
  })
  return { pass: results.every((item) => item.passed), results }
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

function buildProxyHeadersFromRows(
  rows: any[],
  bodyType: string,
  autoContentType = true
): Record<string, string> {
  const h: Record<string, string> = {}
  for (const row of rows) {
    const k = String(row.name || '').trim()
    if (!k) continue
    h[k] = String(row.example ?? row.value ?? '')
  }
  if (autoContentType && bodyType === 'json') {
    if (!h['Content-Type'] && !h['content-type']) h['Content-Type'] = 'application/json'
  }
  return h
}

function applyAuthConfigToRequest(headers: Record<string, string>, queryParams: any[], authConfig: any, vars: Record<string, string> = {}) {
  if (!authConfig || typeof authConfig !== 'object') return
  const mode = String(authConfig.mode || 'none')
  if (mode === 'bearer') {
    const token = resolveTemplateText(String(authConfig?.bearer?.token || '').trim(), vars)
    if (!token) return
    const prefix = String(authConfig?.bearer?.prefix || 'Bearer').trim() || 'Bearer'
    headers.Authorization = `${prefix} ${token}`
    return
  }
  if (mode === 'basic') {
    const username = resolveTemplateText(String(authConfig?.basic?.username || '').trim(), vars)
    if (!username) return
    const password = resolveTemplateText(String(authConfig?.basic?.password || ''), vars)
    const encoded = btoa(unescape(encodeURIComponent(`${username}:${password}`)))
    headers.Authorization = `Basic ${encoded}`
    return
  }
  if (mode === 'apikey') {
    const key = String(authConfig?.apikey?.key || '').trim()
    const value = resolveTemplateText(String(authConfig?.apikey?.value || '').trim(), vars)
    if (!key || !value) return
    if (authConfig?.apikey?.position === 'query') {
      const existing = queryParams.find((row) => String(row?.name || '').trim() === key)
      if (existing) existing.example = value
      else queryParams.push({ name: key, example: value })
      return
    }
    headers[key] = value
  }
}

function resolveTemplateText(text: string, vars: Record<string, string>) {
  return String(text || '').replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => vars[key] ?? '')
}

function toWaitMilliseconds(duration: unknown, unit: string) {
  const value = Math.max(0, Number(duration || 0))
  if (unit === 'm') return value * 60 * 1000
  if (unit === 's') return value * 1000
  return value
}

function parseOperationJson(text: unknown, fallback: Record<string, any> = {}) {
  const raw = String(text || '').trim()
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

async function runPreScript(
  script: string,
  ctx: {
    headers: Record<string, string>
    queryParams: any[]
    vars: Record<string, string>
    tempVars?: Record<string, any>
    setBody: (value: string) => void
    setUrl: (value: string) => void
    setMethod: (value: string) => void
  }
) {
  if (!String(script || '').trim()) return
  const context = {
    get method() {
      return ctx.tempVars?.__method ?? ''
    },
    get path() {
      return ctx.tempVars?.__path ?? ''
    },
    setHeader: (name: string, value: string) => {
      if (!name) return
      ctx.headers[String(name)] = String(value)
    },
    setQuery: (name: string, value: string) => {
      if (!name) return
      const existing = ctx.queryParams.find((row) => String(row?.name || '').trim() === String(name).trim())
      if (existing) existing.example = String(value)
      else ctx.queryParams.push({ name: String(name), example: String(value) })
    },
    setVar: (name: string, value: string) => {
      if (!name) return
      ctx.vars[String(name)] = String(value)
    },
    getVar: (name: string) => ctx.vars[String(name)],
    setTempVar: (name: string, value: any) => {
      if (!name) return
      if (!ctx.tempVars) ctx.tempVars = {}
      ctx.tempVars[String(name)] = value
    },
    getTempVar: (name: string) => ctx.tempVars?.[String(name)],
    setBody: ctx.setBody,
    setUrl: ctx.setUrl,
    setMethod: ctx.setMethod
  }
  await Promise.resolve(new Function('context', script)(context))
}

async function applyPreOpsToRequest(queryParams: any[], headers: Record<string, string>, preOps: any[]) {
  const vars: Record<string, string> = {}
  const tempVars: Record<string, any> = {}
  let bodyText = ''
  let urlText = ''
  let methodText = ''
  for (const op of Array.isArray(preOps) ? preOps : []) {
    if (op?.enabled === false) continue
    if (op?.type === 'wait') {
      const duration = toWaitMilliseconds(op?.config?.duration, String(op?.config?.unit || 'ms'))
      if (duration > 0) await new Promise((resolve) => setTimeout(resolve, duration))
      continue
    }
    if (op?.type === 'db') {
      const key = String(op?.config?.result_var || '').trim()
      if (key) vars[key] = '__db_pending__'
      continue
    }
    if (op?.type === 'set_var') {
      const key = String(op?.config?.name || '').trim()
      if (!key) continue
      vars[key] = String(op?.config?.value || '')
      continue
    }
    if (op?.type === 'public_script') {
      const registry: Record<string, string> = {
        inject_timestamp: `
const varName = params.varName || 'timestamp'
const mode = params.mode || 'ms'
const value = mode === 's' ? Math.floor(Date.now() / 1000) : Date.now()
context.setVar(varName, value)
`,
        bearer_from_env: `
const tokenVar = params.tokenVar || 'token'
const headerName = params.headerName || 'Authorization'
const prefix = params.prefix || 'Bearer '
const token = context.getVar(tokenVar)
if (!token) throw new Error(\`未找到环境变量 \${tokenVar}\`)
context.setHeader(headerName, \`\${prefix}\${token}\`)
`,
        sign_demo: `
const secretVar = params.secretVar || 'secret'
const headerName = params.headerName || 'X-Debug-Sign'
const timestampVar = params.timestampVar || 'timestamp'
const secret = context.getVar(secretVar) || ''
const timestamp = context.getVar(timestampVar) || Date.now()
const raw = \`\${context.method}|\${context.path}|\${timestamp}|\${secret}\`
const signature = btoa(unescape(encodeURIComponent(raw)))
context.setHeader(headerName, signature)
context.setVar('signature', signature)
`,
      }
      const script = registry[String(op?.config?.script_key || '')]
      if (!script) continue
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const runner = new AsyncFunction('context', 'params', script)
      await runner(
        {
          get method() {
            return methodText || ''
          },
          get path() {
            return urlText || ''
          },
          setHeader: (name: string, value: string) => {
            if (!name) return
            headers[String(name)] = String(value)
          },
          setQuery: (name: string, value: string) => {
            if (!name) return
            const existing = queryParams.find((row) => String(row?.name || '').trim() === String(name).trim())
            if (existing) existing.example = String(value)
            else queryParams.push({ name: String(name), example: String(value) })
          },
          setVar: (name: string, value: any) => {
            if (!name) return
            vars[String(name)] = String(value ?? '')
          },
          getVar: (name: string) => vars[String(name)],
          setTempVar: (name: string, value: any) => {
            if (!name) return
            tempVars[String(name)] = value
          },
          getTempVar: (name: string) => tempVars[String(name)],
        },
        parseOperationJson(op?.config?.params, {})
      )
      continue
    }
    if (op?.type === 'script') {
      if (String(op?.config?.language || 'javascript') !== 'javascript') continue
      await runPreScript(String(op?.config?.script || ''), {
        headers,
        queryParams,
        vars,
        tempVars: {
          ...tempVars,
          __method: methodText || '',
          __path: urlText || ''
        },
        setBody: (value) => { bodyText = String(value) },
        setUrl: (value) => { urlText = String(value) },
        setMethod: (value) => { methodText = String(value || '') }
      })
      continue
    }
    const key = String(op?.config?.name || '').trim()
    if (!key) continue
    const value = resolveTemplateText(String(op?.config?.value || ''), vars)
    if (op?.type === 'set_header') {
      headers[key] = value
      continue
    }
    if (op?.type === 'set_query') {
      const existing = queryParams.find((row) => String(row?.name || '').trim() === key)
      if (existing) existing.example = value
      else queryParams.push({ name: key, example: value })
    }
  }
  Object.keys(headers).forEach((key) => {
    headers[key] = resolveTemplateText(headers[key], vars)
  })
  queryParams.forEach((row) => {
    row.example = resolveTemplateText(String(row.example ?? row.value ?? ''), vars)
  })
  return { vars, bodyText, urlText, methodText }
}

export type StepExecContext = {
  stepName: string
  method: string
  rawUrl: string
  queryParams: any[]
  headerParams: any[]
  preOps: any[]
  bodyType: string
  bodyContent: string
  postOps: any[]
  authConfig?: any
  /** 与单接口调试「设置」一致；缺省为 defaultStepReqSettings */
  reqSettings?: StepReqSettings
}

/**
 * 拉取用例 + 接口定义，组装与步骤编辑器一致的请求上下文；无法执行时返回 null。
 */
export async function loadStepExecContext(
  step: any,
  envId: number | null
): Promise<StepExecContext | null> {
  if (step?.source === 'http' || step?.source === 'curl') {
    return {
      stepName: String(step?.name || '').trim() || '未命名步骤',
      method: String(step?.method || 'GET').toUpperCase(),
      rawUrl: String(step?.custom_url || step?.url || '').trim(),
      queryParams: cloneParamRows(step?.query_params),
      headerParams: cloneParamRows(step?.header_params),
      preOps: cloneParamRows(step?.pre_operations),
      bodyType: String(step?.body_type || 'none'),
      bodyContent: String(step?.body_content || ''),
      postOps: mergePostOpsWithValidateResponse(cloneParamRows(step?.post_operations)),
      authConfig: step?.auth_config,
      reqSettings: normalizeStepReqSettings(step?.req_settings)
    }
  }
  if (step?.source === 'interface' && step?.interface_id) {
    try {
      const ifaceRaw: any = await execRequest.get(`/interfaces/${step.interface_id}`)
      const iface = unwrapEntity(ifaceRaw) ?? ifaceRaw
      if (!iface?.id) return null
      const path = iface.path || ''
      const base = await fetchEnvBaseUrl(envId)
      const p = path.startsWith('/') ? path : path ? `/${path}` : ''
      const rawContent = step?.body_content ?? iface?.body_definition?.content ?? ''
      return {
        stepName: String(step?.name || iface?.name || '').trim() || '未命名步骤',
        method: String(iface?.method || step?.method || 'GET').toUpperCase(),
        rawUrl: base ? `${base}${p}` : p || '',
        queryParams: cloneParamRows(step?.query_params?.length ? step.query_params : iface?.query_params),
        headerParams: cloneParamRows(step?.header_params?.length ? step.header_params : iface?.header_params),
        preOps: cloneParamRows(step?.pre_operations),
        bodyType: String(step?.body_type || iface?.body_definition?.type || 'none'),
        bodyContent: typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent, null, 2),
        postOps: mergePostOpsWithValidateResponse(cloneParamRows(step?.post_operations)),
        authConfig: step?.auth_config,
        reqSettings: normalizeStepReqSettings(step?.req_settings)
      }
    } catch {
      return null
    }
  }
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
    const preOps = Array.isArray(tc?.pre_operations)
      ? cloneParamRows(tc.pre_operations)
      : cloneParamRows(step?.pre_operations)
    const stepName = String(step?.name || '').trim() || '未命名步骤'
    return {
      stepName,
      method: m,
      rawUrl,
      queryParams,
      headerParams,
      preOps,
      bodyType,
      bodyContent,
      postOps,
      authConfig: step?.auth_config,
      reqSettings: normalizeStepReqSettings(step?.req_settings)
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
  let methodValue = String(ctx.method || 'GET').toUpperCase()
  let runtimeUrl = String(ctx.rawUrl || '').trim()
  let runtimeBody = String(ctx.bodyContent || '')
  const queryParams = cloneParamRows(ctx.queryParams)
  const rs = ctx.reqSettings ?? defaultStepReqSettings
  const headers: Record<string, string> = {
    ...buildProxyHeadersFromRows(ctx.headerParams, ctx.bodyType, rs.autoContentType)
  }
  const preRuntime = await applyPreOpsToRequest(queryParams, headers, ctx.preOps)
  if (preRuntime.methodText) methodValue = String(preRuntime.methodText).toUpperCase()
  if (preRuntime.urlText) runtimeUrl = resolveTemplateText(preRuntime.urlText, preRuntime.vars)
  if (preRuntime.bodyText) runtimeBody = resolveTemplateText(preRuntime.bodyText, preRuntime.vars)
  applyAuthConfigToRequest(headers, queryParams, ctx.authConfig, preRuntime.vars)
  const upper = methodValue
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(upper)
  const hasParamRows = queryParams.some((r) => String(r.name || '').trim())
  const urlBase = runtimeUrl.split('?')[0]
  let finalUrl = runtimeUrl
  let body: any = null

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
    finalUrl = buildUrlWithQueryString(runtimeUrl, queryParams)
  } else if (isWrite && ctx.bodyType === 'none' && hasParamRows) {
    finalUrl = urlBase
    body = buildFormBodyFromParamRows(queryParams)
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  } else if (isWrite && ctx.bodyType === 'x-www-form-urlencoded') {
    finalUrl = urlBase
    body = buildFormBodyFromParamRows(queryParams)
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  } else {
    finalUrl = buildUrlWithQueryString(runtimeUrl, queryParams)
    if (isWrite) {
      if (ctx.bodyType === 'json' && runtimeBody.trim()) {
        try {
          body = JSON.parse(runtimeBody)
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
            requestBodySnippet: buildRequestBodySnippet(runtimeBody),
            ...evaluateValidateResponsePass(null, ctx.postOps)
          }
        }
      } else if (ctx.bodyType === 'text') {
        body = runtimeBody
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
      {
        url: finalUrl,
        method: upper,
        headers,
        body,
        ...buildProxyExtraFields(rs)
      },
      { timeout: rs.timeout > 0 ? rs.timeout + 5000 : 35000 }
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
    const assertionEval = evaluatePostAssertions(code, rh, env.data, ctx.postOps)
    const { text, bytes } = stringifyResponseForLog(env.data)
    return {
      id,
      at: now,
      pass: ev.pass && assertionEval.pass,
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
