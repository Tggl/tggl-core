import xxhash from 'xxhashjs'

export enum Operator {
  Empty = 'EMPTY',
  True = 'TRUE',
  StrEqual = 'STR_EQUAL',
  StrEqualSoft = 'STR_EQUAL_SOFT',
  StrStartsWith = 'STR_STARTS_WITH',
  StrEndsWith = 'STR_ENDS_WITH',
  StrContains = 'STR_CONTAINS',
  Percentage = 'PERCENTAGE',
  ArrOverlap = 'ARR_OVERLAP',
  RegExp = 'REGEXP',
  StrBefore = 'STR_BEFORE',
  StrAfter = 'STR_AFTER',
  Eq = 'EQ',
  Lt = 'LT',
  Gt = 'GT',
  DateAfter = 'DATE_AFTER',
  DateBefore = 'DATE_BEFORE',
  SemverEq = 'SEMVER_EQ',
  SemverGte = 'SEMVER_GTE',
  SemverLte = 'SEMVER_LTE',
}

export type Rule =
  | {
      key: string
      operator: Operator.Empty | Operator.True
      negate: boolean
    }
  | {
      key: string
      operator: Operator.Percentage
      rangeStart: number
      rangeEnd: number
      seed: number
      negate?: boolean
    }
  | {
      key: string
      operator:
        | Operator.StrEqual
        | Operator.StrEqualSoft
        | Operator.StrStartsWith
        | Operator.StrEndsWith
        | Operator.StrContains
        | Operator.ArrOverlap
      values: string[]
      negate: boolean
    }
  | {
      key: string
      operator: Operator.RegExp
      value: string
      negate: boolean
    }
  | {
      key: string
      operator: Operator.StrBefore | Operator.StrAfter
      value: string
      negate?: boolean
    }
  | {
      key: string
      operator: Operator.SemverEq | Operator.SemverGte | Operator.SemverLte
      version: number[]
      negate: boolean
    }
  | {
      key: string
      operator: Operator.Eq | Operator.Lt | Operator.Gt
      value: number
      negate: boolean
    }
  | {
      key: string
      operator: Operator.DateAfter | Operator.DateBefore
      timestamp: number
      iso: string
      negate?: boolean
    }

export type Variation = {
  active: boolean
  value: any
}

export type Condition = {
  rules: Rule[]
  variation: Variation
}

export type Flag = {
  defaultVariation: Variation
  conditions: Condition[]
}

export const evalFlag = (context: Record<string, any>, flag: Flag): any => {
  for (const condition of flag.conditions) {
    if (evalRules(context, condition.rules)) {
      return condition.variation.active ? condition.variation.value : undefined
    }
  }

  return flag.defaultVariation.active ? flag.defaultVariation.value : undefined
}

export const evalRules = (context: Record<string, any>, rules: Rule[]) => {
  return rules.every((rule) => evalRule(rule, context[rule.key]))
}

export const evalRule = (rule: Rule, value: unknown): boolean => {
  if (rule.operator === Operator.Empty) {
    const isEmpty = value === undefined || value === null || value === ''
    return isEmpty !== rule.negate
  }

  if (value === undefined || value === null) {
    return false
  }

  if (rule.operator === Operator.StrEqual) {
    if (typeof value !== 'string') {
      return false
    }
    return rule.values.includes(value) !== rule.negate
  }

  if (rule.operator === Operator.StrEqualSoft) {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return false
    }
    return rule.values.includes(String(value).toLowerCase()) !== rule.negate
  }

  if (rule.operator === Operator.StrContains) {
    if (typeof value !== 'string') {
      return false
    }

    return rule.values.some((val) => value.includes(val)) !== rule.negate
  }

  if (rule.operator === Operator.StrStartsWith) {
    if (typeof value !== 'string') {
      return false
    }
    return rule.values.some((val) => value.startsWith(val)) !== rule.negate
  }

  if (rule.operator === Operator.StrEndsWith) {
    if (typeof value !== 'string') {
      return false
    }
    return rule.values.some((val) => value.endsWith(val)) !== rule.negate
  }

  if (rule.operator === Operator.StrAfter) {
    if (typeof value !== 'string') {
      return false
    }
    return value >= rule.value !== (rule.negate ?? false)
  }

  if (rule.operator === Operator.StrBefore) {
    if (typeof value !== 'string') {
      return false
    }
    return value <= rule.value !== (rule.negate ?? false)
  }

  if (rule.operator === Operator.RegExp) {
    if (typeof value !== 'string') {
      return false
    }
    return new RegExp(rule.value).test(value) !== rule.negate
  }

  if (rule.operator === Operator.True) {
    return value === !rule.negate
  }

  if (rule.operator === Operator.Eq) {
    if (typeof value !== 'number') {
      return false
    }
    return (value === rule.value) !== rule.negate
  }

  if (rule.operator === Operator.Lt) {
    if (typeof value !== 'number') {
      return false
    }
    return value < rule.value !== rule.negate
  }

  if (rule.operator === Operator.Gt) {
    if (typeof value !== 'number') {
      return false
    }
    return value > rule.value !== rule.negate
  }

  if (rule.operator === Operator.ArrOverlap) {
    if (!Array.isArray(value)) {
      return false
    }
    return value.some((val) => rule.values.includes(val)) !== rule.negate
  }

  if (rule.operator === Operator.DateAfter) {
    if (typeof value === 'string') {
      const val =
        value.slice(0, '2000-01-01T23:59:59'.length) +
        '2000-01-01T23:59:59'.slice(value.length)
      return rule.iso <= val !== (rule.negate ?? false)
    }

    if (typeof value === 'number') {
      if (value < 631152000000) {
        return value * 1000 >= rule.timestamp !== (rule.negate ?? false)
      }

      return value >= rule.timestamp !== (rule.negate ?? false)
    }

    return false
  }

  if (rule.operator === Operator.DateBefore) {
    if (typeof value === 'string') {
      const val =
        value.slice(0, '2000-01-01T00:00:00'.length) +
        '2000-01-01T00:00:00'.slice(value.length)
      return rule.iso >= val !== (rule.negate ?? false)
    }

    if (typeof value === 'number') {
      if (value < 631152000000) {
        return value * 1000 <= rule.timestamp !== (rule.negate ?? false)
      }

      return value <= rule.timestamp !== (rule.negate ?? false)
    }

    return false
  }

  if (rule.operator === Operator.SemverEq) {
    if (typeof value !== 'string') {
      return false
    }

    const semVer = value.split('.').map(Number)

    for (let i = 0; i < rule.version.length; i++) {
      if (semVer[i] === undefined || semVer[i] !== rule.version[i]) {
        return rule.negate
      }
    }

    return !rule.negate
  }

  if (rule.operator === Operator.SemverGte) {
    if (typeof value !== 'string') {
      return false
    }

    const semVer = value.split('.').map(Number)

    for (let i = 0; i < rule.version.length; i++) {
      if (semVer[i] === undefined) {
        return rule.negate
      }

      if (semVer[i] > rule.version[i]) {
        return !rule.negate
      }

      if (semVer[i] < rule.version[i]) {
        return rule.negate
      }
    }

    return !rule.negate
  }

  if (rule.operator === Operator.SemverLte) {
    if (typeof value !== 'string') {
      return false
    }

    const semVer = value.split('.').map(Number)

    for (let i = 0; i < rule.version.length; i++) {
      if (semVer[i] === undefined) {
        return rule.negate
      }

      if (semVer[i] < rule.version[i]) {
        return !rule.negate
      }

      if (semVer[i] > rule.version[i]) {
        return rule.negate
      }
    }

    return !rule.negate
  }

  if (rule.operator === Operator.Percentage) {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return false
    }

    let probability =
      (xxhash.h32(String(value), rule.seed).toNumber() >>> 0) / 0xffffffff

    if (probability === 1) {
      probability -= Number.EPSILON
    }

    return (
      (probability >= rule.rangeStart && probability < rule.rangeEnd) !==
      (rule.negate ?? false)
    )
  }

  throw new Error(`Unsupported operator ${rule.operator}`)
}
