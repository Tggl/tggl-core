import standardTests from './standard_tests.json'
import { evalFlag } from '../index'

test.each(standardTests)('$name', ({ flag, context, expected }: any) => {
  expect(evalFlag(context, flag)).toBe(
    expected.active ? expected.value : undefined
  )
})
