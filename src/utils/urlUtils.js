// URL utility functions
export const getBaseUrl = () => {
  // In development, use localhost
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  // In production, use the configured URL or default to the production domain
  return process.env.REACT_APP_BASE_URL || "https://oglasheabutter.com";
};
