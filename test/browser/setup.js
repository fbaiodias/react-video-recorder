expect.extend({
  toBeWithinRange (received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      }
    }

    return {
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass: false
    }
  }
})
