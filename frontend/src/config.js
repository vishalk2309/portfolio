/**
 * Application Configuration
 * Centralized config object to manage environment variables and settings
 */

export const config = {
  // Error Tracking (Sentry)
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || null,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN,
  },

  // Environment
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  // API
  backendUrl:
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080",
};
