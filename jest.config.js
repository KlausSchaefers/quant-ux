module.exports = {
  //preset: '@vue/cli-plugin-unit-jest',
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },

  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel'
}
