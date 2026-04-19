/**
 * Thin HTTP helpers around fetch (no extra dependencies).
 * Apps get JSON and predictable errors without repeating boilerplate.
 */

/**
 * @param {RequestInfo} input
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
async function coreFetch(input, init) {
  const res = await fetch(input, init);
  return res;
}

/**
 * Reads Response body as JSON or throws with status text.
 * @param {Response} res
 * @returns {Promise<unknown>}
 */
async function parseJson(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/**
 * Namespaced HTTP helpers for GET/POST JSON.
 */
export const http = {
  /**
   * GET request; parses JSON by default.
   * @param {string} url
   * @param {RequestInit} [init]
   */
  async get(url, init) {
    const res = await coreFetch(url, { ...init, method: "GET" });
    return parseJson(res);
  },

  /**
   * POST with JSON body; parses JSON response by default.
   * @param {string} url
   * @param {unknown} body
   * @param {RequestInit} [init]
   */
  async post(url, body, init) {
    const res = await coreFetch(url, {
      ...init,
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(init?.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },
};
