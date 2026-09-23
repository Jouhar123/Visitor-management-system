// lib/api/response.js
export function jsonSuccess(data = null, message = 'Success', status = 200) {
  return { status, message, data };
}

export function jsonError(message = 'Error', code = 'UNKNOWN', status = 500) {
  return { status, error: { code, message } };
}
