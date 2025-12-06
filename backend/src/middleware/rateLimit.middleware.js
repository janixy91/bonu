import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for code redemption endpoint
 * Limits to 10 attempts per 15 minutes per IP
 */
export const codeRedemptionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Demasiados intentos. Por favor, intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`[RATE LIMIT] Blocked request from IP ${req.ip} for code redemption`);
    res.status(429).json({
      error: 'Demasiados intentos. Por favor, intenta de nuevo en 15 minutos.',
    });
  },
});

