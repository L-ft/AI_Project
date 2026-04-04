/**
 * 与单接口调试（ApiDebugView）「设置」Tab 一致的结构，供场景步骤复用。
 */
export type StepReqSettings = {
  timeout: number
  maxRedirects: number
  followRedirects: boolean
  sslVerify: boolean
  keepCookies: boolean
  autoContentType: boolean
  useProxy: boolean
  proxyUrl: string
  proxyUser: string
  proxyPass: string
  responseEncoding: string
  maxResponseSize: number
  autoParseJson: boolean
  showTiming: boolean
}

export const defaultStepReqSettings: StepReqSettings = {
  timeout: 30000,
  maxRedirects: 5,
  followRedirects: true,
  sslVerify: true,
  keepCookies: true,
  autoContentType: true,
  useProxy: false,
  proxyUrl: '',
  proxyUser: '',
  proxyPass: '',
  responseEncoding: 'utf-8',
  maxResponseSize: 10240,
  autoParseJson: true,
  showTiming: true
}

export function normalizeStepReqSettings(raw: unknown): StepReqSettings {
  const d = { ...defaultStepReqSettings }
  if (!raw || typeof raw !== 'object') return d
  const o = raw as Record<string, unknown>
  const num = (v: unknown, def: number) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : def
  }
  const bool = (v: unknown, def: boolean) => (typeof v === 'boolean' ? v : def)
  const str = (v: unknown, def: string) => (typeof v === 'string' ? v : def)
  return {
    timeout: num(o.timeout, d.timeout),
    maxRedirects: num(o.maxRedirects, d.maxRedirects),
    followRedirects: bool(o.followRedirects, d.followRedirects),
    sslVerify: bool(o.sslVerify, d.sslVerify),
    keepCookies: bool(o.keepCookies, d.keepCookies),
    autoContentType: bool(o.autoContentType, d.autoContentType),
    useProxy: bool(o.useProxy, d.useProxy),
    proxyUrl: str(o.proxyUrl, d.proxyUrl),
    proxyUser: str(o.proxyUser, d.proxyUser),
    proxyPass: str(o.proxyPass, d.proxyPass),
    responseEncoding: str(o.responseEncoding, d.responseEncoding),
    maxResponseSize: num(o.maxResponseSize, d.maxResponseSize),
    autoParseJson: bool(o.autoParseJson, d.autoParseJson),
    showTiming: bool(o.showTiming, d.showTiming)
  }
}

/** 与 ApiDebugView 的 /proxy 负载扩展字段一致 */
export function buildProxyExtraFields(rs: StepReqSettings): Record<string, unknown> {
  const out: Record<string, unknown> = {
    timeout: rs.timeout > 0 ? rs.timeout / 1000 : null,
    follow_redirects: rs.followRedirects,
    max_redirects: rs.maxRedirects,
    verify_ssl: rs.sslVerify
  }
  if (rs.useProxy && rs.proxyUrl) {
    out.proxy = rs.proxyUrl
  }
  return out
}
