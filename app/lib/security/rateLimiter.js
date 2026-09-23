import rateLimit from 'express-rate-limit';
import { jsonError } from '../api/response';
import { ApiError } from '../api/errors';

/**
 * Simple in‑memory rate limiter for API routes.
 * For production you would replace this with a Redis backed limiter.
 */
export function createRateLimiter({ windowMs = 60 * 1000, max = 10, keyGenerator = (req) => req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') }) {
  const limiter = rateLimit({
    windowMs,
    max,
    keyGenerator,
    handler: (req, res) => {
      const error = new ApiError('Too many requests, please try again later', 'RATE_LIMIT_EXCEEDED', 429);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 429;
      res.end(JSON.stringify(jsonError(error.message, error.code, error.status)));
    },
    legacyHeaders: false,
    standardHeaders: true,
  });

  // Adapt Express middleware to Next.js API (which receives a Request object)
  return async function nextRateLimiter(req) {
    return new Promise((resolve, reject) => {
      // The Express middleware expects (req, res, next)
      const res = {
        setHeader: (k, v) => {},
        statusCode: 200,
        end: (payload) => {
          if (res.statusCode >= 400) {
            reject(new ApiError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', res.statusCode));
          } else {
            resolve();
          }
        },
        status: (code) => {
          res.statusCode = code;
          return res;
        },
      };
      limiter(req, res, () => resolve());
    });
  };
}
