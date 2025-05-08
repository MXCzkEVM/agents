// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
  },
  {
    rules: {
      'no-extend-native': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'ts/explicit-function-return-type': 'off',
    },
  },
)
