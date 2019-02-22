module.exports = {
  presets: ['@babel/preset-react', '@babel/preset-env'],
  plugins: [
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
}
