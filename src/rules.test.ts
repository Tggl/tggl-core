import { evalRules, Operator } from './index'

test('no rules', () => {
  expect(evalRules({}, [])).toBe(true)
})

test('one rule', () => {
  expect(
    evalRules({}, [{ key: 'foo', negate: false, operator: Operator.Empty }])
  ).toBe(true)
  expect(
    evalRules({}, [{ key: 'foo', negate: true, operator: Operator.Empty }])
  ).toBe(false)
})

test('multiple rules', () => {
  expect(
    evalRules({}, [
      { key: 'foo', negate: false, operator: Operator.Empty },
      { key: 'foo', negate: false, operator: Operator.Empty },
      { key: 'foo', negate: false, operator: Operator.Empty },
      { key: 'foo', negate: false, operator: Operator.Empty },
    ])
  ).toBe(true)
  expect(
    evalRules({}, [
      { key: 'foo', negate: false, operator: Operator.Empty },
      { key: 'foo', negate: false, operator: Operator.Empty },
      { key: 'foo', negate: true, operator: Operator.Empty },
      { key: 'foo', negate: false, operator: Operator.Empty },
    ])
  ).toBe(false)
})
