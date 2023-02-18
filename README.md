# Tggl Core

This package is used to evaluate flags and serves as a reference implementation.

## Usage
Add the package to your dependencies:
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
