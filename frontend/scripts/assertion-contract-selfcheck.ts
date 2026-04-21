import {
  evaluateAssertionRule,
  getAssertionOperatorOptionLabel,
  getAssertionTargetOptionLabel,
  normalizeAssertionConfig,
  normalizeAssertionOperator,
  normalizeAssertionTarget,
  readAssertionExpression,
} from '../src/utils/http-assertion-contract'

type SelfCheckCase = {
  name: string
  run: () => void
}

const cases: SelfCheckCase[] = [
  {
    name: 'normalizes operator aliases',
    run: () => {
      expectEqual(normalizeAssertionOperator('eq'), 'equals', 'eq should normalize to equals')
      expectEqual(
        normalizeAssertionOperator('!='),
        'not_equals',
        '!= should normalize to not_equals'
      )
      expectEqual(
        normalizeAssertionOperator('>='),
        'greater_than_or_equals',
        '>= should normalize to greater_than_or_equals'
      )
    },
  },
  {
    name: 'normalizes target aliases',
    run: () => {
      expectEqual(normalizeAssertionTarget('status'), 'status_code', 'status alias mismatch')
      expectEqual(normalizeAssertionTarget('header'), 'response_header', 'header alias mismatch')
      expectEqual(normalizeAssertionTarget('json'), 'response_json', 'json alias mismatch')
    },
  },
  {
    name: 'normalizes config fields',
    run: () => {
      const cfg = normalizeAssertionConfig({
        target: 'status',
        operator: 'neq',
        json_path: '$.data.items[0].id',
      })
      expectEqual(cfg.target, 'status_code', 'config target normalization mismatch')
      expectEqual(cfg.operator, 'not_equals', 'config operator normalization mismatch')
      expectEqual(cfg.expression, '$.data.items[0].id', 'config expression normalization mismatch')
    },
  },
  {
    name: 'reads nested json path expressions',
    run: () => {
      const actual = readAssertionExpression(
        { data: { items: [{ id: 123, name: 'demo' }] } },
        '$.data.items[0].id'
      )
      expectEqual(actual, 123, 'json path evaluation mismatch')
    },
  },
  {
    name: 'evaluates HTTP status with legacy aliases',
    run: () => {
      const result = evaluateAssertionRule({
        target: 'status',
        operator: 'eq',
        expected: '200',
        statusCode: 200,
      })
      expect(result.passed, 'status assertion should pass')
      expectEqual(result.target, 'status_code', 'status target should be canonicalized')
      expectEqual(result.operator, 'equals', 'status operator should be canonicalized')
      expectEqual(result.actual, 200, 'status actual value mismatch')
    },
  },
  {
    name: 'matches response headers case-insensitively',
    run: () => {
      const result = evaluateAssertionRule({
        target: 'header',
        operator: 'equals',
        expression: 'x-trace-id',
        expected: 'trace-001',
        headers: { 'X-Trace-Id': 'trace-001' },
      })
      expect(result.passed, 'header assertion should pass')
      expectEqual(result.actual, 'trace-001', 'header actual value mismatch')
    },
  },
  {
    name: 'extracts cookies from set-cookie header',
    run: () => {
      const result = evaluateAssertionRule({
        target: 'response_cookie',
        operator: 'equals',
        expression: 'theme',
        expected: 'dark',
        headers: { 'set-cookie': 'session=abc123; Path=/, theme=dark; Path=/' },
      })
      expect(result.passed, 'cookie assertion should pass')
      expectEqual(result.actual, 'dark', 'cookie actual value mismatch')
    },
  },
  {
    name: 'evaluates environment variables',
    run: () => {
      const result = evaluateAssertionRule({
        target: 'env_var',
        operator: 'equals',
        expression: 'token',
        expected: 'secret-token',
        variables: { token: 'secret-token' },
      })
      expect(result.passed, 'env_var assertion should pass')
      expectEqual(result.actual, 'secret-token', 'env_var actual value mismatch')
    },
  },
  {
    name: 'supports response text contains and not_contains',
    run: () => {
      const containsResult = evaluateAssertionRule({
        target: 'text',
        operator: 'contains',
        expected: 'hello',
        data: 'hello world',
      })
      expect(containsResult.passed, 'contains assertion should pass')

      const notContainsResult = evaluateAssertionRule({
        target: 'response_text',
        operator: 'not_contains',
        expected: 'error',
        data: 'hello world',
      })
      expect(notContainsResult.passed, 'not_contains assertion should pass')
    },
  },
  {
    name: 'supports numeric comparison on response JSON',
    run: () => {
      const result = evaluateAssertionRule({
        target: 'response_json',
        operator: 'less_than_or_equals',
        expression: '$.meta.count',
        expected: 5,
        data: { meta: { count: 3 } },
      })
      expect(result.passed, 'numeric comparison assertion should pass')
      expectEqual(result.actual, 3, 'numeric comparison actual value mismatch')
    },
  },
  {
    name: 'provides labels for legacy aliases',
    run: () => {
      expectEqual(
        getAssertionTargetOptionLabel('status', '响应 JSON'),
        'HTTP Code',
        'status label resolution mismatch'
      )
      expectEqual(
        getAssertionOperatorOptionLabel('neq', '等于'),
        '不等于',
        'operator label resolution mismatch'
      )
    },
  },
]

let passedCount = 0
for (const item of cases) {
  item.run()
  passedCount += 1
  console.log(`[assertion-selfcheck] PASS ${item.name}`)
}

console.log(`[assertion-selfcheck] ${passedCount}/${cases.length} checks passed`)

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[assertion-selfcheck] ${message}`)
  }
}

function expectEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(
      `[assertion-selfcheck] ${message}. expected=${String(expected)} actual=${String(actual)}`
    )
  }
}
