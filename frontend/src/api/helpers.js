export function unwrap(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export function apiErrorMessage(error, fallback = 'Yêu cầu thất bại') {
  return error?.response?.data?.message || error?.message || fallback;
}
