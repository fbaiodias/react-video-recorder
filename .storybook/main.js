module.exports = {
  stories: ['../**/*.stories.js'],
  typescript: {
    // react-docgen-typescript in Storybook 6.0 needs TypeScript < 5. The
    // Babel-based react-docgen reads the components' propTypes instead.
    reactDocgen: 'react-docgen'
  }
}
