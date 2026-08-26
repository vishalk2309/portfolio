/**
 * Monitoring utilities for tracking performance and health metrics
 * Helps identify bottlenecks before they become critical at scale
 */

export const metrics = {
  dbQueries: [],
  apiCalls: [],
  errors: [],
};

/**
 * Track database query performance
 * Usage: trackDbQuery('profiles', 150)
 */
export function trackDbQuery(tableName, durationMs) {
  const query = {
    table: tableName,
    duration: durationMs,
    timestamp: Date.now(),
  };
  metrics.dbQueries.push(query);

  // Log slow queries (> 1 second)
  if (durationMs > 1000) {
    console.warn(`[DB] Slow query on ${tableName}: ${durationMs}ms`);
  }

  // Keep only last 100 queries in memory
  if (metrics.dbQueries.length > 100) {
    metrics.dbQueries.shift();
  }
}

/**
 * Track API call performance
 * Usage: trackApiCall('GitHub', 250)
 */
export function trackApiCall(apiName, durationMs) {
  const call = {
    api: apiName,
    duration: durationMs,
    timestamp: Date.now(),
  };
  metrics.apiCalls.push(call);

  if (durationMs > 3000) {
    console.warn(`[API] Slow call to ${apiName}: ${durationMs}ms`);
  }

  if (metrics.apiCalls.length > 100) {
    metrics.apiCalls.shift();
  }
}

/**
 * Track errors for debugging
 */
export function trackError(errorName, error) {
  const errorLog = {
    name: errorName,
    message: error.message,
    stack: error.stack,
    timestamp: Date.now(),
  };
  metrics.errors.push(errorLog);

  if (metrics.errors.length > 50) {
    metrics.errors.shift();
  }

  console.error(`[ERROR] ${errorName}:`, error);
}

/**
 * Get performance summary for debugging
 * Usage in console: window.getMetrics()
 */
export function getMetrics() {
  const avgDbQueryTime =
    metrics.dbQueries.length > 0
      ? (
          metrics.dbQueries.reduce((sum, q) => sum + q.duration, 0) /
          metrics.dbQueries.length
        ).toFixed(2)
      : 0;

  const avgApiTime =
    metrics.apiCalls.length > 0
      ? (
          metrics.apiCalls.reduce((sum, a) => sum + a.duration, 0) /
          metrics.apiCalls.length
        ).toFixed(2)
      : 0;

  return {
    dbQueries: {
      count: metrics.dbQueries.length,
      avgTime: avgDbQueryTime,
      slowQueries: metrics.dbQueries.filter((q) => q.duration > 1000).length,
    },
    apiCalls: {
      count: metrics.apiCalls.length,
      avgTime: avgApiTime,
      slowCalls: metrics.apiCalls.filter((a) => a.duration > 3000).length,
    },
    errors: {
      count: metrics.errors.length,
      recent: metrics.errors.slice(-5),
    },
  };
}

// Expose metrics globally for debugging in console
if (typeof window !== "undefined") {
  window.getMetrics = getMetrics;
  window.trackDbQuery = trackDbQuery;
  window.trackApiCall = trackApiCall;
}
