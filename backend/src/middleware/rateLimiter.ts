import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: {
    message: "Too many requests",
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

export const investigationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 LLM requests per window
  message: {
    message: "Too many investigation requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
