const { ZodError } = require('zod');

const validate = schema => (req, res, next) => {
  try {
    const parsed = schema.parse({
      query: req.query,
      params: req.params,
      body: req.body,
    });
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    if (parsed.body) req.body = parsed.body;
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        issues: err.issues.map(({ path, message }) => ({ path, message })),
      });
    }
    return next(err);
  }
};

module.exports = validate;
