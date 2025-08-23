
export const setAuthCookie = (token: string) => {
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
};

export const clearAuthCookie = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
};
