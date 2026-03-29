function validate(schema, target = 'body') {
  return (req, res, next) => {
    try {
      req[target] = schema.parse(req[target]);
      return next();
    } catch (error) {
      error.status = 400;
      return next(error);
    }
  };
}

module.exports = validate;
