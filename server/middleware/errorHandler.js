export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(err.errors ? { errors: err.errors } : {}),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found' });
}
