// Only Storybook uses Babel now; lib/ is built with tsc.
const plugins = [
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-proposal-class-properties'
]

module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-env'
  ],
  overrides: [
    { test: /\.jsx?$/, plugins },
    {
      // Types go first, so `declare` fields never reach class-properties.
      test: /\.tsx?$/,
      plugins: [
        [
          '@babel/plugin-transform-typescript',
          { isTSX: true, allowDeclareFields: true }
        ],
        ...plugins
      ]
    }
  ]
}
