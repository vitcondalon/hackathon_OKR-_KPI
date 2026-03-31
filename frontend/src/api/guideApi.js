function resolveGuideBase() {
  const raw = import.meta.env.VITE_API_BASE_URL;
  const base = typeof raw === 'string' && raw.trim() ? raw.trim().replace(/\/+$/, '') : '/api';
  return `${base}/guides/user-guide`;
}

export const guideApi = {
  viewUrl() {
    return resolveGuideBase();
  },
  rawUrl() {
    return `${resolveGuideBase()}/raw`;
  },
  downloadUrl() {
    return `${resolveGuideBase()}/download`;
  }
};
