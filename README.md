# Tggl Core

This package is used to evaluate flags and serves as a reference implementation.

If you are porting it to another language, copy [standard_tests.json](./src/tests/standard_tests.json) and write a single unit tests that iterates over all the examples of this file. This is exactly what [standard.test.ts](./src/tests/standard.test.ts) does.

## Usage

You probably want to use the [client](https://doc.tggl.io/docs/sdks/list/node) rather than this library. The client nicely wraps this library in a more convenient way.

If you still want to use this library directly, add the package to your dependencies:
```
npm i tggl-core
```

Start evaluating flags:
```typescript
import { evalFlag, Flag, Operator } from 'tggl-core'

const flag: Flag = {
  conditions: [
    {
      rules: [
        {
          key: 'email',
          operator: Operator.StrEndsWith,
          values: ['@acme.com'],
          negate: false,
        }
      ],
      variation: {
        active: true,
        value: 'foo'
      }
    },
  ],
  defaultVariation: {
    active: false,
    value: null,
  },
}

const result = evalFlag(
  {
    userId: 'foo',
    email: 'john.doe@acme.com'
  },
  flag
)

console.log(result) // => 'foo'
```
