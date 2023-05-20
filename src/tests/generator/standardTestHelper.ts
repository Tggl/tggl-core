import { Flag, Operator, Rule } from '../../index'
import fs from 'fs/promises'
import path from 'path'

const allTest = new Map<string, any>()

const seenThisRun = new Set()

export const setTest = ({
  name,
  flag,
  expected,
  context = {},
}: {
  name: string
  context?: Record<string, any>
  flag: Flag
  expected: any
}) => {
  if (seenThisRun.has(name)) {
    throw new Error(`Test "${name}" already created for this run`)
  }

  seenThisRun.add(name)

  allTest.set(name, {
    name,
    flag,
    context,
    expected: { active: expected !== undefined, value: expected ?? null },
  })
}

export const saveTests = async () => {
  await fs.writeFile(
    path.join(__dirname, '../standard_tests.json'),
    JSON.stringify([...allTest.values()], null, 2)
  )
}

export const validRule: Rule = {
  key: 'foo',
  negate: false,
  operator: Operator.Empty,
}

export const invalidRule: Rule = {
  key: 'foo',
  negate: true,
  operator: Operator.Empty,
}
