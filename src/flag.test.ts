import { evalFlag, Operator } from './index'

test('no conditions', () => {
  expect(
    evalFlag(
      {},
      {
        conditions: [],
        defaultVariation: {
          active: false,
          value: 'foo',
        },
      }
    )
  ).toBe(undefined)
  expect(
    evalFlag(
      {},
      {
        conditions: [],
        defaultVariation: {
          active: true,
          value: 'foo',
        },
      }
    )
  ).toBe('foo')
})

test('one conditions', () => {
  expect(
    evalFlag(
      {},
      {
        conditions: [
          {
            rules: [{ key: 'foo', negate: false, operator: Operator.Empty }],
            variation: {
              active: false,
              value: 'bar',
            },
          },
        ],
        defaultVariation: {
          active: true,
          value: 'foo',
        },
      }
    )
  ).toBe(undefined)
  expect(
    evalFlag(
      {},
      {
        conditions: [
          {
            rules: [{ key: 'foo', negate: false, operator: Operator.Empty }],
            variation: {
              active: true,
              value: 'bar',
            },
          },
        ],
        defaultVariation: {
          active: true,
          value: 'foo',
        },
      }
    )
  ).toBe('bar')
  expect(
    evalFlag(
      {},
      {
        conditions: [
          {
            rules: [{ key: 'foo', negate: true, operator: Operator.Empty }],
            variation: {
              active: true,
              value: 'bar',
            },
          },
        ],
        defaultVariation: {
          active: true,
          value: 'foo',
        },
      }
    )
  ).toBe('foo')
})

test('multiple conditions', () => {
  expect(
    evalFlag(
      {},
      {
        conditions: [
          {
            rules: [{ key: 'foo', negate: false, operator: Operator.Empty }],
            variation: {
              active: true,
              value: null,
            },
          },
          {
            rules: [{ key: 'foo', negate: false, operator: Operator.Empty }],
            variation: {
              active: false,
              value: null,
            },
          },
        ],
        defaultVariation: {
          active: true,
          value: 'foo',
        },
      }
    )
  ).toBe(null)
  expect(
    evalFlag(
      {},
      {
        conditions: [
          {
            rules: [{ key: 'foo', negate: true, operator: Operator.Empty }],
            variation: {
              active: true,
              value: null,
            },
          },
          {
            rules: [{ key: 'foo', negate: false, operator: Operator.Empty }],
            variation: {
              active: false,
              value: null,
            },
          },
        ],
        defaultVariation: {
          active: true,
          value: 'foo',
        },
      }
    )
  ).toBe(undefined)
  expect(
    evalFlag(
      {},
      {
        conditions: [
          {
            rules: [{ key: 'foo', negate: true, operator: Operator.Empty }],
            variation: {
              active: true,
              value: null,
            },
          },
          {
            rules: [{ key: 'foo', negate: true, operator: Operator.Empty }],
            variation: {
              active: false,
              value: null,
            },
          },
        ],
        defaultVariation: {
          active: true,
          value: 'foo',
        },
      }
    )
  ).toBe('foo')
})
