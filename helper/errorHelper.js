exports.sendError = (res, status, errors, msg) => {
  const response = {};
  response.errors = errors;
  response.msg = msg;
  // SET render error page
  return res.status(status).json(response);
}

exports.throwError = (message, code, data = null) => {
  const error = new Error(message);
  error.statusCode = code;
  error.data = data;
  throw error;
}