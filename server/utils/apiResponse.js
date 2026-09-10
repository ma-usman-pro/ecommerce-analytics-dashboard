function success(res, statusCode, data, extra = {}) {
  return res.status(statusCode).json({ success: true, data, ...extra });
}

function fail(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { success, fail };
