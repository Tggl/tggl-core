import { invalidRule, setTest, validRule } from './standardTestHelper'

setTest({
  name: 'no conditions, inactive default variation',
  flag: {
    conditions: [],
    defaultVariation: {
      active: false,
      value: 'foo',
    },
  },
  expected: undefined,
})

setTest({
  name: 'no conditions, active default variation',
  flag: {
    conditions: [],
    defaultVariation: {
      active: true,
      value: 'foo',
    },
  },
  expected: 'foo',
})

setTest({
  name: 'one condition, inactive variation',
  flag: {
    conditions: [
      {
        rules: [validRule],
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
  },
  expected: undefined,
})

setTest({
  name: 'one condition, active variation',
  flag: {
    conditions: [
      {
        rules: [validRule],
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
  },
  expected: 'bar',
})

setTest({
  name: 'one condition, invalid rule',
  flag: {
    conditions: [
      {
        rules: [invalidRule],
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
  },
  expected: 'foo',
})

setTest({
  name: 'multiple conditions, first valid and active',
  flag: {
    conditions: [
      {
        rules: [validRule],
        variation: {
          active: true,
          value: null,
        },
      },
      {
        rules: [validRule],
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
  },
  expected: null,
})

setTest({
  name: 'multiple conditions, second valid and inactive',
  flag: {
    conditions: [
      {
        rules: [invalidRule],
        variation: {
          active: true,
          value: null,
        },
      },
      {
        rules: [validRule],
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
  },
  expected: undefined,
})

setTest({
  name: 'multiple conditions, all invalid',
  flag: {
    conditions: [
      {
        rules: [invalidRule],
        variation: {
          active: true,
          value: null,
        },
      },
      {
        rules: [invalidRule],
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
  },
  expected: 'foo',
})
