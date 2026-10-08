const aliases = ['assets', 'components', 'dojo', 'common', 'vommond', 'views', 'canvas', 'page', 'user', 'core',
  'dash', 'public', 'services', 'nls', 'themes', 'export', 'examples', 'help', 'player', 'style', 'src']

// mirror the webpack aliases of vue.config.js
const aliasMap = {}
aliases.forEach(a => {
  aliasMap[`^${a}/(.*)$`] = a === 'src' ? '<rootDir>/src/$1' : `<rootDir>/src/${a}/$1`
})

module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
    ...aliasMap
  }
}
