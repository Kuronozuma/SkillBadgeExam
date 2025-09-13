const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = {
      message: 'Validation Error',
      details: message
    };
    return res.status(400).json({
      success: false,
      message: error.message,
      details: error.details
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    const message = `${field} already exists`;
    error = {
      message: 'Duplicate Entry',
      details: message
    };
    return res.status(409).json({
      success: false,
      message: error.message,
      details: error.details
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = {
      message: 'Invalid Reference',
      details: 'Referenced record does not exist'
    };
    return res.status(400).json({
      success: false,
      message: error.message,
      details: error.details
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid Token',
      details: 'Token is malformed'
    };
    return res.status(401).json({
      success: false,
      message: error.message,
      details: error.details
    });
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token Expired',
      details: 'Please login again'
    };
    return res.status(401).json({
      success: false,
      message: error.message,
      details: error.details
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
