import { Rule } from '../../index'
import { invalidRule, setTest, validRule } from './standardTestHelper'

const setConditionTest = ({
  name,
  rules,
  expected,
  context,
}: {
  name: string
  context?: Record<string, any>
  rules: Rule[]
  expected: boolean
}) => {
  setTest({
    name,
    flag: {
      conditions: [
        {
          rules,
          variation: {
            active: true,
            value: true,
          },
        },
      ],
      defaultVariation: {
        active: false,
        value: null,
      },
    },
    context,
    expected: expected || undefined,
  })
}

setConditionTest({
  name: 'no rules',
  rules: [],
  expected: true,
})

setConditionTest({
  name: 'one rule, valid',
  rules: [validRule],
  expected: true,
})

setConditionTest({
  name: 'one rule, invalid',
  rules: [invalidRule],
  expected: false,
})

setConditionTest({
  name: 'multiple rules, all valid',
  rules: [validRule, validRule, validRule, validRule],
  expected: true,
})

setConditionTest({
  name: 'multiple rules, one invalid',
  rules: [validRule, validRule, invalidRule, validRule],
  expected: false,
})
