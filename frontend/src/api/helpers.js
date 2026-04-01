export function unwrap(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export function apiErrorMessage(error, fallback = 'Yeu cau that bai') {
  return error?.response?.data?.message || error?.message || fallback;
}
