function sendSuccess(res, data, message = 'OK', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data
  });
}

function sendCreated(res, data, message = 'Created') {
  return sendSuccess(res, data, message, 201);
}

module.exports = {
  sendSuccess,
  sendCreated
};
