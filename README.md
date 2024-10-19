<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://tggl.io/tggl-io-logo-white.svg">
    <img align="center" alt="Tggl Logo" src="https://tggl.io/tggl-io-logo-black.svg" width="200rem" />
  </picture>
</p>

<h1 align="center">Tggl Core</h1>

<p align="center">
  This package is used to evaluate flags and serves as a reference implementation.
</p>

<p align="center">
  <a href="https://tggl.io/">🔗 Website</a>
  •
  <a href="https://tggl.io/developers">📚 Documentation</a>
  •
  <a href="https://www.npmjs.com/package/tggl-core">📦 NPM</a>
  •
  <a href="https://www.youtube.com/@Tggl-io">🎥 Videos</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/Tggl/tggl-core/tests.yml" alt="GitHub Workflow Status (with event)" />
  <img src="https://img.shields.io/coverallsCoverage/github/Tggl/tggl-core" alt="Coveralls branch" />
  <img src="https://img.shields.io/npm/v/tggl-core" alt="npm" />
</p>

## Usage

This library is not intended for direct use, you probably want to use the [client](https://tggl.io/developers/sdks/node) instead. The client nicely wraps this library in a more convenient way.

If you still want to use this library directly, you can add the package to your dependencies:
```
npm i tggl-core
```

And start evaluating flags:
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
    userId: 'abc',
    email: 'john.doe@acme.com'
  },
  flag
)

console.log(result) // => 'foo'
```

## Porting it to another language

If you are porting it to another language, copy [standard_tests.json](./src/tests/standard_tests.json) and write a single unit tests that iterates over all the examples of this file. This is exactly what [standard.test.ts](./src/tests/standard.test.ts) does.
