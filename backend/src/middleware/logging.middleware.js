/**
 * Middleware for logging API requests
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, url, body, user } = req;

  // Log request
  console.log(`[${new Date().toISOString()}] ${method} ${url}`, {
    userId: user?._id || 'anonymous',
    body: method === 'POST' || method === 'PUT' ? body : undefined,
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} (${duration}ms)`);
    return originalJson(data);
  };

  next();
};

/**
 * Middleware for logging code redemption attempts
 */
export const codeRedemptionLogger = (req, res, next) => {
  const { code } = req.body;
  const userId = req.user?._id || 'anonymous';
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[CODE REDEMPTION] Attempt by user ${userId} from IP ${ip}`, {
    code: code ? code.toUpperCase() : 'N/A',
    timestamp: new Date().toISOString(),
  });

  next();
};

