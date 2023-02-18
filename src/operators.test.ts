import { evalRules, Operator, Rule } from './index'

const expectFalseForAllTypesBut = (
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'array'
    | Array<'string' | 'number' | 'boolean' | 'object' | 'array'>,
  rules: Rule[]
) => {
  expect(evalRules({}, rules)).toBe(false)
  expect(evalRules({ foo: undefined }, rules)).toBe(false)
  expect(evalRules({ foo: null }, rules)).toBe(false)

  const types = Array.isArray(type) ? type : [type]

  if (!types.includes('string')) {
    expect(evalRules({ foo: '' }, rules)).toBe(false)
    expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
    expect(evalRules({ foo: '0' }, rules)).toBe(false)
    expect(evalRules({ foo: '1' }, rules)).toBe(false)
    expect(evalRules({ foo: '9' }, rules)).toBe(false)
    expect(evalRules({ foo: 'true' }, rules)).toBe(false)
    expect(evalRules({ foo: 'false' }, rules)).toBe(false)
  }

  if (!types.includes('number')) {
    expect(evalRules({ foo: 0 }, rules)).toBe(false)
    expect(evalRules({ foo: 1 }, rules)).toBe(false)
  }

  if (!types.includes('boolean')) {
    expect(evalRules({ foo: true }, rules)).toBe(false)
    expect(evalRules({ foo: false }, rules)).toBe(false)
  }

  if (!types.includes('object')) {
    expect(evalRules({ foo: {} }, rules)).toBe(false)
  }

  if (!types.includes('array')) {
    expect(evalRules({ foo: [] }, rules)).toBe(false)
  }
}

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

test('Empty', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Empty,
      negate: false,
    },
  ]

  expect(evalRules({}, rules)).toBe(true)
  expect(evalRules({ foo: undefined }, rules)).toBe(true)
  expect(evalRules({ foo: null }, rules)).toBe(true)
  expect(evalRules({ foo: '' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
  expect(evalRules({ foo: 0 }, rules)).toBe(false)
  expect(evalRules({ foo: 1 }, rules)).toBe(false)
  expect(evalRules({ foo: true }, rules)).toBe(false)
  expect(evalRules({ foo: false }, rules)).toBe(false)
  expect(evalRules({ foo: {} }, rules)).toBe(false)
  expect(evalRules({ foo: [] }, rules)).toBe(false)
})

test('Empty negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Empty,
      negate: true,
    },
  ]

  expect(evalRules({}, rules)).toBe(false)
  expect(evalRules({ foo: undefined }, rules)).toBe(false)
  expect(evalRules({ foo: null }, rules)).toBe(false)
  expect(evalRules({ foo: '' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expect(evalRules({ foo: 0 }, rules)).toBe(true)
  expect(evalRules({ foo: 1 }, rules)).toBe(true)
  expect(evalRules({ foo: true }, rules)).toBe(true)
  expect(evalRules({ foo: false }, rules)).toBe(true)
  expect(evalRules({ foo: {} }, rules)).toBe(true)
  expect(evalRules({ foo: [] }, rules)).toBe(true)
})

test('StrEquals', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrEqual,
      values: ['bar', 'baz', 'true', '1'],
      negate: false,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expect(evalRules({ foo: 'BAR' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bàr' }, rules)).toBe(false)
  expect(evalRules({ foo: 'baz' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('StrEquals negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrEqual,
      values: ['bar', 'baz', 'true', '1'],
      negate: true,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
  expect(evalRules({ foo: 'BAR' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bàr' }, rules)).toBe(true)
  expect(evalRules({ foo: 'baz' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('StrEqualSoft', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrEqualSoft,
      values: ['bar', 'baz', 'true', '1'],
      negate: false,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expect(evalRules({ foo: 'BAR' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bàr' }, rules)).toBe(false)
  expect(evalRules({ foo: 'baz' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bAz' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(false)
  expect(evalRules({ foo: '1' }, rules)).toBe(true)
  expect(evalRules({ foo: 1 }, rules)).toBe(true)
  expectFalseForAllTypesBut(['string', 'number'], rules)
})

test('StrContains', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrContains,
      values: ['bar', 'baz', 'true', '1'],
      negate: false,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expect(evalRules({ foo: '--bAr' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bàr-' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bÂr-' }, rules)).toBe(false)
  expect(evalRules({ foo: 'foobaz--' }, rules)).toBe(true)
  expect(evalRules({ foo: 'foo barbaz' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('StrContains negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrContains,
      values: ['bar', 'baz', 'true', '1'],
      negate: true,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
  expect(evalRules({ foo: '--bAr' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bàr-' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bÂr-' }, rules)).toBe(true)
  expect(evalRules({ foo: 'foobaz--' }, rules)).toBe(false)
  expect(evalRules({ foo: 'foo barbaz' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('StrStartsWith', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrStartsWith,
      values: ['bar', 'baz', 'true', '1'],
      negate: false,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bar--' }, rules)).toBe(true)
  expect(evalRules({ foo: '-bar' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bAr' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bàr' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bÂr' }, rules)).toBe(false)
  expect(evalRules({ foo: 'baz--' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('StrStartsWith negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrStartsWith,
      values: ['bar', 'baz', 'true', '1'],
      negate: true,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar--' }, rules)).toBe(false)
  expect(evalRules({ foo: '-bar' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bAr' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bàr' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bÂr' }, rules)).toBe(true)
  expect(evalRules({ foo: 'baz--' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('StrEndsWith', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrEndsWith,
      values: ['bar', 'baz', 'true', '1'],
      negate: false,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expect(evalRules({ foo: '--bar' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bar-' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bAr' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bàr' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bÂr' }, rules)).toBe(false)
  expect(evalRules({ foo: '--baz' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('StrNotEndsWith negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrEndsWith,
      values: ['bar', 'baz', 'true', '1'],
      negate: true,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
  expect(evalRules({ foo: '--bar' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar-' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bAr' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bàr' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bÂr' }, rules)).toBe(true)
  expect(evalRules({ foo: '--baz' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bor' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('StrRegexp', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.RegExp,
      value: '\\d',
      negate: false,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(false)
  expect(evalRules({ foo: '>3<' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('StrNotRegexp negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.RegExp,
      value: '\\d',
      negate: true,
    },
  ]

  expect(evalRules({ foo: '' }, rules)).toBe(true)
  expect(evalRules({ foo: '>3<' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('StrBefore', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrBefore,
      value: 'bar',
    },
  ]

  expect(evalRules({ foo: 'aaa' }, rules)).toBe(true)
  expect(evalRules({ foo: 'ba' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bà' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expect(evalRules({ foo: 'bara' }, rules)).toBe(false)
  expect(evalRules({ foo: 'zzz' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('StrAfter', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.StrAfter,
      value: 'bar',
    },
  ]

  expect(evalRules({ foo: 'aaa' }, rules)).toBe(false)
  expect(evalRules({ foo: 'ba' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bar' }, rules)).toBe(true)
  expect(evalRules({ foo: 'BAR' }, rules)).toBe(false)
  expect(evalRules({ foo: 'bara' }, rules)).toBe(true)
  expect(evalRules({ foo: 'zzz' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('Eq', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Eq,
      value: 5,
      negate: false,
    },
  ]

  expect(evalRules({ foo: 0 }, rules)).toBe(false)
  expect(evalRules({ foo: 5 }, rules)).toBe(true)
  expect(evalRules({ foo: 10 }, rules)).toBe(false)
  expectFalseForAllTypesBut('number', rules)
})

test('Eq negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Eq,
      value: 5,
      negate: true,
    },
  ]

  expect(evalRules({ foo: 0 }, rules)).toBe(true)
  expect(evalRules({ foo: 5 }, rules)).toBe(false)
  expect(evalRules({ foo: 10 }, rules)).toBe(true)
  expectFalseForAllTypesBut('number', rules)
})

test('Gt', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Gt,
      value: 5,
      negate: false,
    },
  ]

  expect(evalRules({ foo: 0 }, rules)).toBe(false)
  expect(evalRules({ foo: 5 }, rules)).toBe(false)
  expect(evalRules({ foo: 10 }, rules)).toBe(true)
  expectFalseForAllTypesBut('number', rules)
})

test('Gt negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Gt,
      value: 5,
      negate: true,
    },
  ]

  expect(evalRules({ foo: 0 }, rules)).toBe(true)
  expect(evalRules({ foo: 5 }, rules)).toBe(true)
  expect(evalRules({ foo: 10 }, rules)).toBe(false)
  expectFalseForAllTypesBut('number', rules)
})

test('Lt', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Lt,
      value: 5,
      negate: false,
    },
  ]

  expect(evalRules({ foo: 0 }, rules)).toBe(true)
  expect(evalRules({ foo: 5 }, rules)).toBe(false)
  expect(evalRules({ foo: 10 }, rules)).toBe(false)
  expectFalseForAllTypesBut('number', rules)
})

test('Lt negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.Lt,
      value: 5,
      negate: true,
    },
  ]

  expect(evalRules({ foo: 0 }, rules)).toBe(false)
  expect(evalRules({ foo: 5 }, rules)).toBe(true)
  expect(evalRules({ foo: 10 }, rules)).toBe(true)
  expectFalseForAllTypesBut('number', rules)
})

test('True', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.True,
      negate: false,
    },
  ]

  expect(evalRules({ foo: true }, rules)).toBe(true)
  expect(evalRules({ foo: false }, rules)).toBe(false)
  expectFalseForAllTypesBut('boolean', rules)
})

test('True negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.True,
      negate: true,
    },
  ]

  expect(evalRules({ foo: true }, rules)).toBe(false)
  expect(evalRules({ foo: false }, rules)).toBe(true)
  expectFalseForAllTypesBut('boolean', rules)
})

test('ArrOverlap', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.ArrOverlap,
      values: ['bar', 'baz'],
      negate: false,
    },
  ]

  expect(evalRules({ foo: [] }, rules)).toBe(false)
  expect(evalRules({ foo: ['foo', '--'] }, rules)).toBe(false)
  expect(evalRules({ foo: ['foo', 'bar'] }, rules)).toBe(true)
  expect(evalRules({ foo: ['baz', 'foo', 'bar'] }, rules)).toBe(true)
  expect(evalRules({ foo: ['baz', 'foo'] }, rules)).toBe(true)
  expect(evalRules({ foo: ['baz'] }, rules)).toBe(true)
  expect(evalRules({ foo: ['bAz'] }, rules)).toBe(false)
  expect(evalRules({ foo: ['bàz'] }, rules)).toBe(false)
  expect(evalRules({ foo: ['bÁz'] }, rules)).toBe(false)
  expectFalseForAllTypesBut('array', rules)
})

test('ArrOverlap negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.ArrOverlap,
      values: ['bar', 'baz'],
      negate: true,
    },
  ]

  expect(evalRules({ foo: [] }, rules)).toBe(true)
  expect(evalRules({ foo: ['foo', '--'] }, rules)).toBe(true)
  expect(evalRules({ foo: ['foo', 'bar'] }, rules)).toBe(false)
  expect(evalRules({ foo: ['baz', 'foo', 'bar'] }, rules)).toBe(false)
  expect(evalRules({ foo: ['baz', 'foo'] }, rules)).toBe(false)
  expect(evalRules({ foo: ['baz'] }, rules)).toBe(false)
  expect(evalRules({ foo: ['bAz'] }, rules)).toBe(true)
  expect(evalRules({ foo: ['bàz'] }, rules)).toBe(true)
  expect(evalRules({ foo: ['bÁz'] }, rules)).toBe(true)
  expectFalseForAllTypesBut('array', rules)
})

test('DateAfter', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.DateAfter,
      timestamp: 1649846220000,
      iso: '2022-04-13T12:37:00',
    },
  ]

  expect(evalRules({ foo: '1999-01-01' }, rules)).toBe(false)
  expect(evalRules({ foo: '2022-04-13' }, rules)).toBe(true)
  expect(evalRules({ foo: '2100-01-01' }, rules)).toBe(true)
  expect(evalRules({ foo: '2022-04-13T09:37' }, rules)).toBe(false)
  expect(evalRules({ foo: '2022-04-13T12:37' }, rules)).toBe(true)
  expect(evalRules({ foo: '2099-01-01T23:59' }, rules)).toBe(true)
  expect(evalRules({ foo: '2022-04-13T09:37:00' }, rules)).toBe(false)
  expect(evalRules({ foo: '2022-04-13T12:37:00' }, rules)).toBe(true)
  expect(evalRules({ foo: '2099-01-01T23:59:00' }, rules)).toBe(true)
  expect(evalRules({ foo: '2022-04-13T09:37:00Z' }, rules)).toBe(false)
  expect(evalRules({ foo: '2022-04-13T12:37:00Z' }, rules)).toBe(true)
  expect(evalRules({ foo: '2099-01-01T23:59:00Z' }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220 - 1 }, rules)).toBe(false)
  expect(evalRules({ foo: 1649846220000 - 1 }, rules)).toBe(false)
  expect(evalRules({ foo: 1649846220 }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220000 }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220 + 1 }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220000 + 1 }, rules)).toBe(true)
  expectFalseForAllTypesBut(['string', 'number'], rules)
})

test('DateBefore', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.DateBefore,
      timestamp: 1649846220000,
      iso: '2022-04-13T12:37:00',
    },
  ]

  expect(evalRules({ foo: '2022-04-12' }, rules)).toBe(true)
  expect(evalRules({ foo: '2022-04-13' }, rules)).toBe(true)
  expect(evalRules({ foo: '2022-04-14' }, rules)).toBe(false)
  expect(evalRules({ foo: '2022-04-13T23:59' }, rules)).toBe(false)
  expect(evalRules({ foo: '2022-04-13T12:37' }, rules)).toBe(true)
  expect(evalRules({ foo: '2001-01-01T09:24' }, rules)).toBe(true)
  expect(evalRules({ foo: '2022-04-13T23:59:00' }, rules)).toBe(false)
  expect(evalRules({ foo: '2022-04-13T12:37:00' }, rules)).toBe(true)
  expect(evalRules({ foo: '2001-01-01T09:24:00' }, rules)).toBe(true)
  expect(evalRules({ foo: '2022-04-13T23:59:00Z' }, rules)).toBe(false)
  expect(evalRules({ foo: '2022-04-13T12:37:00Z' }, rules)).toBe(true)
  expect(evalRules({ foo: '2001-01-01T09:24:00Z' }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220 - 1 }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220000 - 1 }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220 }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220000 }, rules)).toBe(true)
  expect(evalRules({ foo: 1649846220 + 1 }, rules)).toBe(false)
  expect(evalRules({ foo: 1649846220000 + 1 }, rules)).toBe(false)
  expectFalseForAllTypesBut(['string', 'number'], rules)
})

test('SemverEq', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.SemverEq,
      negate: false,
      version: [1, 20, 4],
    },
  ]

  expect(evalRules({ foo: '1.20.4' }, rules)).toBe(true)
  expect(evalRules({ foo: '01.020.004' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.20.4.6' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.20' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.2.4' }, rules)).toBe(false)
  expect(evalRules({ foo: '3.5.6' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('SemverEq negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.SemverEq,
      negate: true,
      version: [1, 20, 4],
    },
  ]

  expect(evalRules({ foo: '1.20.4' }, rules)).toBe(false)
  expect(evalRules({ foo: '01.020.004' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.20.4.6' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.20' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.2.4' }, rules)).toBe(true)
  expect(evalRules({ foo: '3.5.6' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('SemverGte', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.SemverGte,
      negate: false,
      version: [1, 20, 4],
    },
  ]

  expect(evalRules({ foo: '1.20.4' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.20.4.9' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.20.5' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.21.3' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.100.6' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.0100.6' }, rules)).toBe(true)
  expect(evalRules({ foo: '2.0.0' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.21' }, rules)).toBe(true)
  expect(evalRules({ foo: '2' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.3.6' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.20.3' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.20' }, rules)).toBe(false)
  expect(evalRules({ foo: '1' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('SemverGte negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.SemverGte,
      negate: true,
      version: [1, 20, 4],
    },
  ]

  expect(evalRules({ foo: '1.20.4' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.20.4.9' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.20.5' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.21.3' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.100.6' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.0100.6' }, rules)).toBe(false)
  expect(evalRules({ foo: '2.0.0' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.21' }, rules)).toBe(false)
  expect(evalRules({ foo: '2' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.3.6' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.20.3' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.20' }, rules)).toBe(true)
  expect(evalRules({ foo: '1' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('SemverLte', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.SemverLte,
      negate: false,
      version: [1, 21, 4],
    },
  ]

  expect(evalRules({ foo: '1.21.4' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.21.4.9' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.21.3' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.20.5' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.3.6' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.03.6' }, rules)).toBe(true)
  expect(evalRules({ foo: '0.0.1' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.20' }, rules)).toBe(true)
  expect(evalRules({ foo: '0' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.100.6' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.21.5' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.21' }, rules)).toBe(false)
  expect(evalRules({ foo: '1' }, rules)).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('SemverLte negate', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.SemverLte,
      negate: true,
      version: [1, 21, 4],
    },
  ]

  expect(evalRules({ foo: '1.21.4' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.21.4.9' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.21.3' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.20.5' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.3.6' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.03.6' }, rules)).toBe(false)
  expect(evalRules({ foo: '0.0.1' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.20' }, rules)).toBe(false)
  expect(evalRules({ foo: '0' }, rules)).toBe(false)
  expect(evalRules({ foo: '1.100.6' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.21.5' }, rules)).toBe(true)
  expect(evalRules({ foo: '1.21' }, rules)).toBe(true)
  expect(evalRules({ foo: '1' }, rules)).toBe(true)
  expectFalseForAllTypesBut('string', rules)
})

test('UaBrowser', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.UaBrowser,
      negate: false,
      values: ['chrome', 'firefox'],
    },
  ]

  expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
  expect(
    evalRules(
      {
        foo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
      },
      rules
    )
  ).toBe(true)
  expect(
    evalRules(
      {
        foo: 'Mozilla/5.0 (Windows NT 6.1; rv:15.0) Gecko/20120716 Firefox/15.0a2',
      },
      rules
    )
  ).toBe(true)
  expect(
    evalRules(
      {
        foo: 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.3) Gecko/2008100716 Firefox/3.0.3 Flock/2.0',
      },
      rules
    )
  ).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})

test('UaOs', () => {
  const rules: Rule[] = [
    {
      key: 'foo',
      operator: Operator.UaOs,
      negate: false,
      values: ['mac os', 'windows'],
    },
  ]

  expect(evalRules({ foo: 'bar' }, rules)).toBe(false)
  expect(
    evalRules(
      {
        foo: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; ru) AppleWebKit/522.11.3 (KHTML, like Gecko) Version/3.0 Safari/522.11.3',
      },
      rules
    )
  ).toBe(true)
  expect(
    evalRules(
      {
        foo: 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10.4; en; rv:1.9.0.19) Gecko/2011091218 Camino/2.0.9 (like Firefox/3.0.19)',
      },
      rules
    )
  ).toBe(true)
  expect(
    evalRules(
      {
        foo: 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.3) Gecko/2008100716 Firefox/3.0.3 Flock/2.0',
      },
      rules
    )
  ).toBe(false)
  expectFalseForAllTypesBut('string', rules)
})
