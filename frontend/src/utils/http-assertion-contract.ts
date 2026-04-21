export type AssertionEvalInput = {
  target?: string
  operator?: string
  expression?: string
  expected?: unknown
  statusCode?: number | null
  headers?: Record<string, unknown> | undefined
  data?: unknown
  variables?: Record<string, unknown> | undefined
  cookies?: Record<string, unknown> | undefined
}

export const ASSERTION_TARGET_OPTIONS = [
  { label: 'Response Text', value: 'response_text' },
  { label: 'Response JSON', value: 'response_json' },
  { label: 'Response XML', value: 'response_xml' },
  { label: 'Response Header', value: 'response_header' },
  { label: 'Response Cookie', value: 'response_cookie' },
  { label: 'HTTP Code', value: 'status_code' },
  { label: '环境变量', value: 'env_var' },
  { label: '全局变量', value: 'global_var' }
]

export const ASSERTION_OPERATOR_OPTIONS = [
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'not_equals' },
  { label: '存在', value: 'exists' },
  { label: '不存在', value: 'not_exists' },
  { label: '小于', value: 'less_than' },
  { label: '小于或等于', value: 'less_than_or_equals' },
  { label: '大于', value: 'greater_than' },
  { label: '大于或等于', value: 'greater_than_or_equals' },
  { label: '正则匹配', value: 'regex' },
  { label: '包含', value: 'contains' },
  { label: '不包含', value: 'not_contains' }
]

export const getAssertionTargetOptionLabel = (
  target: string | undefined | null,
  fallback = 'Response JSON'
) => {
  const normalized = normalizeAssertionTarget(String(target || 'response_json'))
  return ASSERTION_TARGET_OPTIONS.find((item) => item.value === normalized)?.label || fallback
}

export const getAssertionOperatorOptionLabel = (
  operator: string | undefined | null,
  fallback = '等于'
) => {
  const normalized = normalizeAssertionOperator(String(operator || 'equals'))
  return ASSERTION_OPERATOR_OPTIONS.find((item) => item.value === normalized)?.label || fallback
}

export const normalizeAssertionOperator = (operator: string) => {
  const value = String(operator || '').trim().toLowerCase()
  if (value === 'eq' || value === '==') return 'equals'
  if (value === 'neq' || value === '!=') return 'not_equals'
  if (value === 'gt' || value === '>') return 'greater_than'
  if (value === 'gte' || value === '>=') return 'greater_than_or_equals'
  if (value === 'lt' || value === '<') return 'less_than'
  if (value === 'lte' || value === '<=') return 'less_than_or_equals'
  return value || 'equals'
}

export const normalizeAssertionTarget = (target: string) => {
  const value = String(target || '').trim().toLowerCase()
  if (value === 'status' || value === 'http_status' || value === 'http_code') return 'status_code'
  if (value === 'header') return 'response_header'
  if (value === 'text' || value === 'body') return 'response_text'
  if (value === 'json' || value === 'response') return 'response_json'
  return value || 'response_json'
}

export const normalizeAssertionConfig = (raw: any) => {
  const cfg = raw && typeof raw === 'object' ? { ...raw } : {}
  return {
    ...cfg,
    target: normalizeAssertionTarget(String(cfg.target || cfg.type || 'response_json')),
    operator: normalizeAssertionOperator(String(cfg.operator || 'equals')),
    expression: String(cfg.expression || cfg.path || cfg.json_path || cfg.field || '')
  }
}

export const readAssertionExpression = (source: unknown, expression: string) => {
  if (!expression) return source
  const normalized = String(expression || '')
    .trim()
    .replace(/^\$\./, '')
    .replace(/^\$/, '')
  if (!normalized) return source

  const segments = normalized
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)

  let current: any = source
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    current = current[segment]
  }
  return current
}

export const resolveAssertionActualValue = (input: AssertionEvalInput) => {
  const target = normalizeAssertionTarget(String(input.target || 'response_json'))
  const expression = String(input.expression || '')
  const headerMap = normalizeHeaderMap(input.headers)
  const variableMap = input.variables || {}

  if (target === 'status_code') return input.statusCode ?? null
  if (target === 'response_header') {
    const expectedKey = expression.trim().toLowerCase()
    const matched = Object.entries(headerMap).find(([key]) => key.toLowerCase() === expectedKey)
    return matched?.[1]
  }
  if (target === 'response_cookie') {
    const cookieKey = expression.trim()
    if (input.cookies && cookieKey in input.cookies) return input.cookies[cookieKey]
    const rawSetCookie = headerMap['set-cookie']
    if (typeof rawSetCookie === 'string' && cookieKey) {
      const cookieMatch = rawSetCookie.match(new RegExp(`(?:^|[,;]\\s*)${escapeRegex(cookieKey)}=([^;]+)`))
      if (cookieMatch) return cookieMatch[1]
    }
    return undefined
  }
  if (target === 'env_var' || target === 'global_var') return variableMap[expression]
  if (target === 'response_text' || target === 'response_xml') return stringifyAssertionData(input.data)
  return readAssertionExpression(parseAssertionData(input.data), expression)
}

export const compareAssertionValue = (actual: unknown, operator: string, expected: unknown) => {
  const normalizedOperator = normalizeAssertionOperator(operator)
  const actualText = actual == null ? '' : String(actual)
  const expectedText = expected == null ? '' : String(expected)

  if (normalizedOperator === 'exists') return actual !== undefined && actual !== null && actualText !== ''
  if (normalizedOperator === 'not_exists') return actual === undefined || actual === null || actualText === ''
  if (normalizedOperator === 'contains') return actualText.includes(expectedText)
  if (normalizedOperator === 'not_contains') return !actualText.includes(expectedText)
  if (normalizedOperator === 'regex') {
    try {
      return new RegExp(expectedText).test(actualText)
    } catch {
      return false
    }
  }
  if (normalizedOperator === 'greater_than') return compareNumber(actual, expected, (a, b) => a > b)
  if (normalizedOperator === 'greater_than_or_equals') return compareNumber(actual, expected, (a, b) => a >= b)
  if (normalizedOperator === 'less_than') return compareNumber(actual, expected, (a, b) => a < b)
  if (normalizedOperator === 'less_than_or_equals') return compareNumber(actual, expected, (a, b) => a <= b)
  if (normalizedOperator === 'not_equals') return !valuesEqual(actual, expected)
  return valuesEqual(actual, expected)
}

export const evaluateAssertionRule = (input: AssertionEvalInput) => {
  const target = normalizeAssertionTarget(String(input.target || 'response_json'))
  const operator = normalizeAssertionOperator(String(input.operator || 'equals'))
  const actual = resolveAssertionActualValue({ ...input, target, operator })
  const passed = compareAssertionValue(actual, operator, input.expected)
  return { target, operator, actual, passed }
}

export const stringifyAssertionData = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data === undefined || data === null) return ''
  try {
    return JSON.stringify(data)
  } catch {
    return String(data)
  }
}

export const parseAssertionData = (data: unknown): unknown => {
  if (typeof data !== 'string') return data
  const text = data.trim()
  if (!text) return data
  try {
    return JSON.parse(text)
  } catch {
    return data
  }
}

const normalizeHeaderMap = (headers: Record<string, unknown> | undefined) => {
  if (!headers || typeof headers !== 'object') return {} as Record<string, string>
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue
    out[key] = Array.isArray(value) ? value.map((item) => String(item)).join(', ') : String(value)
  }
  return out
}

const compareNumber = (
  actual: unknown,
  expected: unknown,
  predicate: (left: number, right: number) => boolean
) => {
  const left = toFiniteNumber(actual)
  const right = toFiniteNumber(expected)
  if (left == null || right == null) return false
  return predicate(left, right)
}

const valuesEqual = (actual: unknown, expected: unknown) => {
  const left = toFiniteNumber(actual)
  const right = toFiniteNumber(expected)
  if (left != null && right != null) return left === right
  return String(actual) === String(expected)
}

const toFiniteNumber = (value: unknown) => {
  if (typeof value === 'boolean') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
