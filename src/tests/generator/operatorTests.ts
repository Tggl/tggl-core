import { Operator, Rule } from '../../index'
import { setTest } from './standardTestHelper'

const operatorTest = ({
  name,
  expected,
  value,
  rule,
}: {
  name: string
  value?: any
  expected: boolean
  rule: Rule
}) => {
  setTest({
    name,
    flag: {
      conditions: [
        {
          rules: [{ ...rule, key: 'foo' } as Rule],
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
    context: { foo: value },
    expected: expected || undefined,
  })
}

const nameFromValue = (value: any): string => {
  switch (value) {
    case undefined:
      return 'undefined'
    case null:
      return 'null'
    case '':
      return 'empty string'
    case '0':
      return 'zero as string'
    case '1':
      return 'one as string'
    case 'true':
      return 'true as string'
    case 'false':
      return 'false as string'
    case 0:
      return 'zero'
    case 1:
      return 'one'
    case true:
      return 'true'
    case false:
      return 'false'
  }

  if (typeof value === 'string') {
    return 'string'
  }

  if (typeof value === 'number') {
    return 'number'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  if (typeof value === 'object') {
    return 'object'
  }

  throw new Error(`Unknown type ${value}`)
}

let rule: any

const ot = (value: any, expected: boolean, name?: string) => {
  operatorTest({
    name: `${rule.operator}${rule.negate ? ' negate' : ''} - ${
      name ?? nameFromValue(value)
    }`,
    expected,
    value,
    rule,
  })
}

const expectFalseForAllTypesBut = (
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'array'
    | Array<'string' | 'number' | 'boolean' | 'object' | 'array'>
) => {
  ot(undefined, false)
  ot(null, false)

  const types = Array.isArray(type) ? type : [type]

  if (!types.includes('string')) {
    ot('', false)
    ot('bar', false)
    ot('0', false)
    ot('1', false)
    ot('true', false)
    ot('false', false)
  }

  if (!types.includes('number')) {
    ot(0, false)
    ot(1, false)
  }

  if (!types.includes('boolean')) {
    ot(true, false)
    ot(false, false)
  }

  if (!types.includes('object')) {
    ot({}, false)
  }

  if (!types.includes('array')) {
    ot([], false)
  }
}

rule = {
  operator: Operator.Empty,
  negate: false,
}

ot(undefined, true)
ot(null, true)
ot('', true)
ot('bar', false)
ot(0, false)
ot(1, false)
ot(true, false)
ot(false, false)
ot({}, false)
ot([], false)

rule = {
  operator: Operator.Empty,
  negate: true,
}

ot(undefined, false)
ot(null, false)
ot('', false)
ot('bar', true)
ot(0, true)
ot(1, true)
ot(true, true)
ot(false, true)
ot({}, true)
ot([], true)

rule = {
  operator: Operator.StrEqual,
  values: ['bar', 'baz', 'true', '1'],
  negate: false,
}

ot('', false)
ot('bar', true, 'exact match')
ot('BAR', false, 'uppercase')
ot('bàr', false, 'accent')
ot('baz', true, 'another exact match')
ot('bor', false, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrEqual,
  values: ['bar', 'baz', 'true', '1'],
  negate: true,
}

ot('', true)
ot('bar', false, 'exact match')
ot('BAR', true, 'uppercase')
ot('bàr', true, 'accent')
ot('baz', false, 'another exact match')
ot('bor', true, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrEqualSoft,
  values: ['bar', 'baz', 'true', '1'],
  negate: false,
}

ot('', false)
ot('bar', true, 'exact match')
ot('BAR', true, 'uppercase')
ot('bàr', false, 'accent')
ot('baz', true, 'other exact match')
ot('bAz', true, 'one uppercase')
ot('bor', false, 'no match')
ot('1', true, 'exact match number')
ot(1, true, 'soft match number')
expectFalseForAllTypesBut(['string', 'number'])

rule = {
  operator: Operator.StrContains,
  values: ['bar', 'baz', 'true', '1'],
  negate: false,
}

ot('', false)
ot('bar', true, 'exact match')
ot('--bAr', false, 'uppercase')
ot('bàr-', false, 'accent')
ot('bÂr-', false, 'accent uppercase')
ot('foobaz--', true, 'middle')
ot('foo barbaz', true, 'contains two')
ot('bor', false, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrContains,
  values: ['bar', 'baz', 'true', '1'],
  negate: true,
}

ot('', true)
ot('bar', false, 'exact match')
ot('--bAr', true, 'uppercase')
ot('bàr-', true, 'accent')
ot('bÂr-', true, 'accent uppercase')
ot('foobaz--', false, 'middle')
ot('foo barbaz', false, 'contains two')
ot('bor', true, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrStartsWith,
  values: ['bar', 'baz', 'true', '1'],
  negate: false,
}

ot('', false)
ot('bar', true, 'exact match')
ot('bar--', true, 'start')
ot('-bar', false, 'end')
ot('bAr', false, 'uppercase')
ot('bàr', false, 'accent')
ot('bÂr', false, 'uppercase accent')
ot('baz--', true, 'other match start')
ot('bor', false, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrStartsWith,
  values: ['bar', 'baz', 'true', '1'],
  negate: true,
}

ot('', true)
ot('bar', false, 'exact match')
ot('bar--', false, 'start')
ot('-bar', true, 'end')
ot('bAr', true, 'uppercase')
ot('bàr', true, 'accent')
ot('bÂr', true, 'uppercase accent')
ot('baz--', false, 'other match start')
ot('bor', true, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrEndsWith,
  values: ['bar', 'baz', 'true', '1'],
  negate: false,
}

ot('', false)
ot('bar', true, 'exact match')
ot('--bar', true, 'end')
ot('bar-', false, 'start')
ot('bAr', false, 'uppercase')
ot('bàr', false, 'accent')
ot('bÂr', false, 'uppercase accent')
ot('--baz', true, 'other match end')
ot('bor', false, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrEndsWith,
  values: ['bar', 'baz', 'true', '1'],
  negate: true,
}

ot('', true)
ot('bar', false, 'exact match')
ot('--bar', false, 'end')
ot('bar-', true, 'start')
ot('bAr', true, 'uppercase')
ot('bàr', true, 'accent')
ot('bÂr', true, 'uppercase accent')
ot('--baz', false, 'other match end')
ot('bor', true, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.RegExp,
  value: '\\d',
  negate: false,
}

ot('', false)
ot('>3<', true, 'match')
ot('bar', false, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.RegExp,
  value: '\\d',
  negate: true,
}

ot('', true)
ot('>3<', false, 'match')
ot('bar', true, 'no match')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrBefore,
  value: 'bar',
}

ot('aaa', true, 'before')
ot('ba', true, 'sub string of start')
ot('bà', false, 'accent')
ot('bar', true, 'same')
ot('bara', false, 'same with suffix')
ot('zzz', false, 'after')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrBefore,
  value: 'bar',
  negate: true,
}

ot('aaa', false, 'before')
ot('ba', false, 'sub string of start')
ot('bà', true, 'accent')
ot('bar', false, 'same')
ot('bara', true, 'same with suffix')
ot('zzz', true, 'after')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrAfter,
  value: 'bar',
}

ot('aaa', false, 'before')
ot('ba', false, 'sub string of start')
ot('bar', true, 'same')
ot('BAR', false, 'uppercase')
ot('bara', true, 'same with suffix')
ot('zzz', true, 'after')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.StrAfter,
  value: 'bar',
  negate: true,
}

ot('aaa', true, 'before')
ot('ba', true, 'sub string of start')
ot('bar', false, 'same')
ot('BAR', true, 'uppercase')
ot('bara', false, 'same with suffix')
ot('zzz', false, 'after')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.Eq,
  value: 5,
  negate: false,
}

ot(0, false, 'smaller')
ot(5, true, 'equal')
ot(10, false, 'larger')
expectFalseForAllTypesBut('number')

rule = {
  operator: Operator.Eq,
  value: 5,
  negate: true,
}

ot(0, true, 'smaller')
ot(5, false, 'equal')
ot(10, true, 'larger')
expectFalseForAllTypesBut('number')

rule = {
  operator: Operator.Gt,
  value: 5,
  negate: false,
}

ot(0, false, 'smaller')
ot(5, false, 'equal')
ot(10, true, 'larger')
expectFalseForAllTypesBut('number')

rule = {
  operator: Operator.Gt,
  value: 5,
  negate: true,
}

ot(0, true, 'smaller')
ot(5, true, 'equal')
ot(10, false, 'larger')
expectFalseForAllTypesBut('number')

rule = {
  operator: Operator.Lt,
  value: 5,
  negate: false,
}

ot(0, true, 'smaller')
ot(5, false, 'equal')
ot(10, false, 'larger')
expectFalseForAllTypesBut('number')

rule = {
  operator: Operator.Lt,
  value: 5,
  negate: true,
}

ot(0, false, 'smaller')
ot(5, true, 'equal')
ot(10, true, 'larger')
expectFalseForAllTypesBut('number')

rule = {
  operator: Operator.True,
  negate: false,
}

ot(true, true)
ot(false, false)
expectFalseForAllTypesBut('boolean')

rule = {
  operator: Operator.True,
  negate: true,
}

ot(true, false)
ot(false, true)
expectFalseForAllTypesBut('boolean')

rule = {
  operator: Operator.ArrOverlap,
  values: ['bar', 'baz'],
  negate: false,
}

ot([], false, 'empty array')
ot(['foo', '--'], false, 'no overlap')
ot(['foo', 'bar'], true, 'one match')
ot(['baz', 'foo', 'bar'], true, 'two matches')
ot(['baz', 'foo'], true, 'one other match')
ot(['baz'], true, 'single element match')
ot(['bAz'], false, 'uppercase')
ot(['bàz'], false, 'accent')
ot(['bÁz'], false, 'uppercase accent')
expectFalseForAllTypesBut('array')

rule = {
  operator: Operator.ArrOverlap,
  values: ['bar', 'baz'],
  negate: true,
}

ot([], true, 'empty array')
ot(['foo', '--'], true, 'no overlap')
ot(['foo', 'bar'], false, 'one match')
ot(['baz', 'foo', 'bar'], false, 'two matches')
ot(['baz', 'foo'], false, 'one other match')
ot(['baz'], false, 'single element match')
ot(['bAz'], true, 'uppercase')
ot(['bàz'], true, 'accent')
ot(['bÁz'], true, 'uppercase accent')
expectFalseForAllTypesBut('array')

rule = {
  operator: Operator.DateAfter,
  timestamp: 1649846220000,
  iso: '2022-04-13T12:37:00',
}

ot('1999-01-01', false, 'iso date before')
ot('2022-04-13', true, 'iso date same')
ot('2100-01-01', true, 'iso date after')
ot('2022-04-13T09:37', false, 'same date, time before')
ot('2022-04-13T12:37', true, 'same date, same hour / min')
ot('2099-01-01T23:59', true, 'date after, time before')
ot('2022-04-13T09:37:00', false, 'same date, time before with seconds')
ot('2022-04-13T12:37:00', true, 'same date, same time')
ot('2099-01-01T23:59:00', true, 'date time after')
ot('2022-04-13T09:37:00Z', false, 'same date time before with Z')
ot('2022-04-13T12:37:00Z', true, 'same date time with Z')
ot('2099-01-01T23:59:00Z', true, 'date time after with Z')
ot(1649846220 - 1, false, 'timestamp before')
ot(1649846220000 - 1, false, 'timestamp milli before')
ot(1649846220, true, 'same timestamp')
ot(1649846220000, true, 'same timestamp milli')
ot(1649846220 + 1, true, 'timestamp after')
ot(1649846220000 + 1, true, 'timestamp milli after')
expectFalseForAllTypesBut(['string', 'number'])

rule = {
  operator: Operator.DateAfter,
  timestamp: 1649846220000,
  iso: '2022-04-13T12:37:00',
  negate: true,
}

ot('1999-01-01', true, 'iso date before')
ot('2022-04-13', false, 'iso date same')
ot('2100-01-01', false, 'iso date after')
ot('2022-04-13T09:37', true, 'same date, time before')
ot('2022-04-13T12:37', false, 'same date, same hour / min')
ot('2099-01-01T23:59', false, 'date after, time before')
ot('2022-04-13T09:37:00', true, 'same date, time before with seconds')
ot('2022-04-13T12:37:00', false, 'same date, same time')
ot('2099-01-01T23:59:00', false, 'date time after')
ot('2022-04-13T09:37:00Z', true, 'same date time before with Z')
ot('2022-04-13T12:37:00Z', false, 'same date time with Z')
ot('2099-01-01T23:59:00Z', false, 'date time after with Z')
ot(1649846220 - 1, true, 'timestamp before')
ot(1649846220000 - 1, true, 'timestamp milli before')
ot(1649846220, false, 'same timestamp')
ot(1649846220000, false, 'same timestamp milli')
ot(1649846220 + 1, false, 'timestamp after')
ot(1649846220000 + 1, false, 'timestamp milli after')
expectFalseForAllTypesBut(['string', 'number'])

rule = {
  operator: Operator.DateBefore,
  timestamp: 1649846220000,
  iso: '2022-04-13T12:37:00',
}

ot('2022-04-12', true, 'iso date before')
ot('2022-04-13', true, 'iso date same')
ot('2022-04-14', false, 'iso date after')
ot('2022-04-13T23:59', false, 'same date, time after')
ot('2022-04-13T12:37', true, 'same date, same time / hour')
ot('2001-01-01T09:24', true, 'date time before')
ot('2022-04-13T23:59:00', false, 'same date, time after with second')
ot('2022-04-13T12:37:00', true, 'same date time')
ot('2001-01-01T09:24:00', true, 'date time before with second')
ot('2022-04-13T23:59:00Z', false, 'same date, time after with Z')
ot('2022-04-13T12:37:00Z', true, 'same date time with Z')
ot('2001-01-01T09:24:00Z', true, 'date time before with Z')
ot(1649846220 - 1, true, 'timestamp before')
ot(1649846220000 - 1, true, 'timestamp milli before')
ot(1649846220, true, 'same timestamp')
ot(1649846220000, true, 'same timestamp milli')
ot(1649846220 + 1, false, 'timestamp after')
ot(1649846220000 + 1, false, 'timestamp milli after')
expectFalseForAllTypesBut(['string', 'number'])

rule = {
  operator: Operator.DateBefore,
  timestamp: 1649846220000,
  iso: '2022-04-13T12:37:00',
  negate: true,
}

ot('2022-04-12', false, 'iso date before')
ot('2022-04-13', false, 'iso date same')
ot('2022-04-14', true, 'iso date after')
ot('2022-04-13T23:59', true, 'same date, time after')
ot('2022-04-13T12:37', false, 'same date, same time / hour')
ot('2001-01-01T09:24', false, 'date time before')
ot('2022-04-13T23:59:00', true, 'same date, time after with second')
ot('2022-04-13T12:37:00', false, 'same date time')
ot('2001-01-01T09:24:00', false, 'date time before with second')
ot('2022-04-13T23:59:00Z', true, 'same date, time after with Z')
ot('2022-04-13T12:37:00Z', false, 'same date time with Z')
ot('2001-01-01T09:24:00Z', false, 'date time before with Z')
ot(1649846220 - 1, false, 'timestamp before')
ot(1649846220000 - 1, false, 'timestamp milli before')
ot(1649846220, false, 'same timestamp')
ot(1649846220000, false, 'same timestamp milli')
ot(1649846220 + 1, true, 'timestamp after')
ot(1649846220000 + 1, true, 'timestamp milli after')
expectFalseForAllTypesBut(['string', 'number'])

rule = {
  operator: Operator.SemverEq,
  negate: false,
  version: [1, 20, 4],
}

ot('1.20.4', true, 'same')
ot('01.020.004', true, 'same with leading zeros')
ot('1.20.4.6', true, 'same with extra subversion')
ot('1.20', false, 'same missing patch version')
ot('1.2.4', false, 'no match minor')
ot('3.5.6', false, 'different')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.SemverEq,
  negate: true,
  version: [1, 20, 4],
}

ot('1.20.4', false, 'same')
ot('01.020.004', false, 'same with leading zeros')
ot('1.20.4.6', false, 'same with extra subversion')
ot('1.20', true, 'same missing patch version')
ot('1.2.4', true, 'no match minor')
ot('3.5.6', true, 'different')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.SemverGte,
  negate: false,
  version: [1, 20, 4],
}

ot('1.20.4', true, 'same')
ot('1.20.4.9', true, 'same with extra subversion')
ot('1.20.5', true, 'higher patch version')
ot('1.21.3', true, 'higher minor version, lower patch version')
ot('1.100.6', true, 'higher minor version, but smaller alphabetically')
ot('1.0100.6', true, 'leading zero')
ot('2.0.0', true, 'higher major, but lower minor and patch version')
ot('1.21', true, 'higher minor, missing patch version')
ot('2', true, 'higher major, missing minor')
ot('1.3.6', false, 'lower minor, but higher alphabetically')
ot('1.20.3', false, 'smaller patch version')
ot('1.20', false, 'same but missing patch version')
ot('1', false, 'same but missing minor version')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.SemverGte,
  negate: true,
  version: [1, 20, 4],
}

ot('1.20.4', false, 'same')
ot('1.20.4.9', false, 'same with extra subversion')
ot('1.20.5', false, 'higher patch version')
ot('1.21.3', false, 'higher minor version, lower patch version')
ot('1.100.6', false, 'higher minor version, but smaller alphabetically')
ot('1.0100.6', false, 'leading zero')
ot('2.0.0', false, 'higher major, but lower minor and patch version')
ot('1.21', false, 'higher minor, missing patch version')
ot('2', false, 'higher major, missing minor')
ot('1.3.6', true, 'lower minor, but higher alphabetically')
ot('1.20.3', true, 'smaller patch version')
ot('1.20', true, 'same but missing patch version')
ot('1', true, 'same but missing minor version')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.SemverLte,
  negate: false,
  version: [1, 21, 4],
}

ot('1.21.4', true, 'same')
ot('1.21.4.9', true, 'same with extra subversion')
ot('1.21.3', true, 'lower patch version')
ot('1.20.5', true, 'lower minor version, higher patch version')
ot('1.3.6', true, 'lower minor version, but higher alphabetically')
ot('1.03.6', true, 'leading zero')
ot('0.0.1', true, 'lower major minor and patch version')
ot('1.20', true, 'lower minor, missing patch version')
ot('0', true, 'lower major, missing minor')
ot('1.100.6', false, 'higher minor, but lower alphabetically')
ot('1.21.5', false, 'higher patch version')
ot('1.21', false, 'same but missing patch version')
ot('1', false, 'same but missing minor version')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.SemverLte,
  negate: true,
  version: [1, 21, 4],
}

ot('1.21.4', false, 'same')
ot('1.21.4.9', false, 'same with extra subversion')
ot('1.21.3', false, 'lower patch version')
ot('1.20.5', false, 'lower minor version, higher patch version')
ot('1.3.6', false, 'lower minor version, but higher alphabetically')
ot('1.03.6', false, 'leading zero')
ot('0.0.1', false, 'lower major minor and patch version')
ot('1.20', false, 'lower minor, missing patch version')
ot('0', false, 'lower major, missing minor')
ot('1.100.6', true, 'higher minor, but lower alphabetically')
ot('1.21.5', true, 'higher patch version')
ot('1.21', true, 'same but missing patch version')
ot('1', true, 'same but missing minor version')
expectFalseForAllTypesBut('string')

rule = {
  operator: Operator.Percentage,
  seed: 42,
  rangeStart: 0.1,
  rangeEnd: 0.7,
}

ot('rhythm', true, 'rhythm')
ot('live', false, 'live')
ot('peep', false, 'peep')
ot('confuse', false, 'confuse')
ot('abiding', true, 'abiding')
ot('press', true, 'press')
ot('billowy', false, 'billowy')
ot('standing', false, 'standing')
ot('combative', true, 'combative')
ot('earsplitting', true, 'earsplitting')
ot('cautious', true, 'cautious')
ot('square', false, 'square')
ot('judicious', true, 'judicious')
ot('limping', true, 'limping')
ot('rice', true, 'rice')
ot('taste', false, 'taste')
ot('bomb', false, 'bomb')
ot('twig', true, 'twig')
ot('clumsy', false, 'clumsy')
ot('toothpaste', true, 'toothpaste')
ot(1, true, '1')
ot(2, false, '2')
ot(3, true, '3')
ot(4, true, '4')
ot(5, true, '5')
ot(6, false, '6')
ot(7, false, '7')
ot(8, true, '8')
ot(9, true, '9')
ot(10, true, '10')
ot(11, true, '11')
ot(12, true, '12')
ot(13, false, '13')
ot(14, true, '14')
ot(15, true, '15')
ot(16, false, '16')
ot(17, true, '17')
ot(18, true, '18')
ot(19, false, '19')
ot(20, false, '20')
expectFalseForAllTypesBut(['string', 'number'])

rule = {
  operator: Operator.Percentage,
  seed: 42,
  rangeStart: 0.1,
  rangeEnd: 0.7,
  negate: true,
}

ot('rhythm', false, 'rhythm')
ot('live', true, 'live')
ot('peep', true, 'peep')
ot('confuse', true, 'confuse')
ot('abiding', false, 'abiding')
ot('press', false, 'press')
ot('billowy', true, 'billowy')
ot('standing', true, 'standing')
ot('combative', false, 'combative')
ot('earsplitting', false, 'earsplitting')
ot('cautious', false, 'cautious')
ot('square', true, 'square')
ot('judicious', false, 'judicious')
ot('limping', false, 'limping')
ot('rice', false, 'rice')
ot('taste', true, 'taste')
ot('bomb', true, 'bomb')
ot('twig', false, 'twig')
ot('clumsy', true, 'clumsy')
ot('toothpaste', false, 'toothpaste')
ot(1, false, '1')
ot(2, true, '2')
ot(3, false, '3')
ot(4, false, '4')
ot(5, false, '5')
ot(6, true, '6')
ot(7, true, '7')
ot(8, false, '8')
ot(9, false, '9')
ot(10, false, '10')
ot(11, false, '11')
ot(12, false, '12')
ot(13, true, '13')
ot(14, false, '14')
ot(15, false, '15')
ot(16, true, '16')
ot(17, false, '17')
ot(18, false, '18')
ot(19, true, '19')
ot(20, true, '20')
expectFalseForAllTypesBut(['string', 'number'])
