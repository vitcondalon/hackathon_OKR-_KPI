function buildEnvelope({
  success,
  message,
  data = null,
  meta = null,
  errors = null
}) {
  return {
    success,
    message,
    data,
    meta,
    errors
  };
}

function sendSuccess(res, data, message = 'OK', status = 200, meta = null) {
  return res.status(status).json(
    buildEnvelope({
      success: true,
      message,
      data,
      meta,
      errors: null
    })
  );
}

function sendCreated(res, data, message = 'Created', meta = null) {
  return sendSuccess(res, data, message, 201, meta);
}

function sendNoContent(res) {
  return res.status(204).send();
}

function sendError(res, status, message, errors = null, meta = null) {
  return res.status(status).json(
    buildEnvelope({
      success: false,
      message,
      data: null,
      meta,
      errors
    })
  );
}

module.exports = {
  buildEnvelope,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendError
};
