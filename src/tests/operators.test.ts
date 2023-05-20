import { evalRules, Operator, Rule } from '../index'

test('Unknown', () => {
  expect(() =>
    evalRules({ foo: 'bar' }, [
      {
        key: 'foo',
        // @ts-ignore
        operator: 'FOO',
      },
    ])
  ).toThrow()
})

test('Percentage', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Percentage,
      seed: 42,
      rangeStart: 0.1,
      rangeEnd: 0.7,
    },
  ]

  let counter = 0

  for (let i = 0; i < 1000; i++) {
    if (evalRules({ foo: i }, rules)) {
      counter++
    }
  }

  expect(counter).toBe(609)
})
