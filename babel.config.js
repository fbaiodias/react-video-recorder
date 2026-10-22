const plugins = [
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-proposal-class-properties',
  [
    'babel-plugin-styled-components',
    {
      displayName: true,
      fileName: true
    }
  ]
]

// Types are stripped before any other plugin runs, so `declare` class fields
// disappear instead of reaching class-properties as `this.x = undefined`.
const typescript = (isTSX) => [
  '@babel/plugin-transform-typescript',
  { isTSX, allowDeclareFields: true }
]

module.exports = {
  presets: ['@babel/preset-react', '@babel/preset-env'],
  overrides: [
    { test: /\.jsx?$/, plugins },
    { test: /\.ts$/, plugins: [typescript(false), ...plugins] },
    { test: /\.tsx$/, plugins: [typescript(true), ...plugins] }
  ],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-runtime']
    }
  }
}
