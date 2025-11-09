/**
 * Automatically bind all methods of a class instance to the instance itself.
 * This prevents the need to manually bind methods in constructors.
 *
 * @param {Object} self - The class instance to bind methods to
 */
function autoBind(self) {
  const proto = Object.getPrototypeOf(self);
  const propertyNames = Object.getOwnPropertyNames(proto);

  propertyNames.forEach((name) => {
    const value = proto[name];

    if (name !== 'constructor' && typeof value === 'function') {
      // eslint-disable-next-line no-param-reassign
      self[name] = value.bind(self);
    }
  });
}

module.exports = autoBind;
