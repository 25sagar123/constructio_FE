const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
    endpoint: req.originalUrl,
    method: req.method
  });
};

module.exports = notFound;