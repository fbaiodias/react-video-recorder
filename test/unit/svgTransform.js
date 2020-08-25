// https://jestjs.io/docs/en/configuration.html#transform-object-string-string
module.exports = {
  process () {
    return 'module.exports = {};'
  },
  getCacheKey () {
    // The output is always the same.
    return 'svgTransform'
  }
}
