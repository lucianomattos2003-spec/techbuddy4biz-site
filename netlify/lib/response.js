/**
 * HTTP Response helpers for consistent API responses
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Success response
 * @param {object} data - Response payload
 * @param {number} status - HTTP status code (default 200)
 */
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

/**
 * Created response (201)
 */
export function created(data) {
  return json(data, 201);
}

/**
 * No content response (204)
 */
export function noContent() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

/**
 * Error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default 400)
 */
export function error(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: CORS_HEADERS
  });
}

/**
 * Not found response (404)
 */
export function notFound(message = 'Resource not found') {
  return error(message, 404);
}

/**
 * Server error response (500)
 */
export function serverError(message = 'Internal server error') {
  return error(message, 500);
}

/**
 * CORS preflight response
 */
export function cors() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

/**
 * Parse JSON body from request
 * @param {Request} request
 * @returns {Promise<object|null>}
 */
export async function parseBody(request) {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
