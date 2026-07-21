// ─── utils/responseHandler.js ─────────────────────────────────────────────────
// Standardised API response format per 06_Backend_Architecture.md §25:
//   Success: { success:true,  message, data }
//   Error:   { success:false, message }

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {any}    options.data     - Payload to include
 * @param {string} [options.message]
 * @param {number} [options.status] - HTTP status (default 200)
 */
const success = (res, { data = null, message = 'Success', status = 200 } = {}) => {
  const body = { success: true, message };
  if (data !== null && data !== undefined) body.data = data;
  return res.status(status).json(body);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string} [options.message]
 * @param {number} [options.status]  - HTTP status (default 500)
 * @param {string} [options.code]    - Machine-readable code
 */
const error = (res, { message = 'Internal server error', status = 500, code } = {}) => {
  const body = { success: false, message };
  if (code) body.code = code;
  return res.status(status).json(body);
};

/**
 * Send a paginated list response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {Array}  options.items
 * @param {number} options.total
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string} [options.message]
 */
const paginated = (res, { items, total, page, limit, message = 'Success' }) => {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page:  Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = { success, error, paginated };
