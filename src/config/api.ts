// API configuration for ConsentHub.
//
// Every endpoint is served by a single backend, so there is one origin and one
// versioned base path. The service-per-port map that used to live here listed
// twelve ports (3002-3012) that nothing has ever listened on.

/** Backend origin, no path. */
export const API_ORIGIN =
  import.meta.env.VITE_GATEWAY_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001';

/** Versioned API base, e.g. http://localhost:3001/api/v1 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${API_ORIGIN}/api/v1`;
