export function unwrap(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export function apiErrorMessage(error, fallback = 'Request failed') {
  return error?.response?.data?.message || error?.message || fallback;
}
