import { body } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Validation middleware for job analysis requests.
 * Supports both frontend schema (text, recruiter_email, job_url)
 * and alternative user-specified schema (description, email, url)
 * by dynamically mapping aliases during pre-processing.
 */
export const validateJobAnalysis = [
  // 1. Alias mapping middleware
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) {
      // Map description <-> text
      if (req.body.description !== undefined && req.body.text === undefined) {
        req.body.text = req.body.description;
      } else if (req.body.text !== undefined && req.body.description === undefined) {
        req.body.description = req.body.text;
      }

      // Map email <-> recruiter_email
      if (req.body.email !== undefined && req.body.recruiter_email === undefined) {
        req.body.recruiter_email = req.body.email;
      } else if (req.body.recruiter_email !== undefined && req.body.email === undefined) {
        req.body.email = req.body.recruiter_email;
      }

      // Map url <-> job_url
      if (req.body.url !== undefined && req.body.job_url === undefined) {
        req.body.job_url = req.body.url;
      } else if (req.body.job_url !== undefined && req.body.url === undefined) {
        req.body.url = req.body.job_url;
      }
    }
    next();
  },

  // 2. Validate description (aliases mapped from text if needed)
  body("description")
    .isString()
    .withMessage("Job description/text must be a string")
    .isLength({ min: 20, max: 5000 })
    .withMessage("Job description/text must be between 20 and 5000 characters")
    .trim(),

  // 3. Validate email (aliases mapped from recruiter_email if needed)
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid recruiter email format"),

  // 4. Validate url (aliases mapped from job_url if needed)
  body("url")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Invalid job URL format")
];

export function validateRequest(_req: Request, _res: Response, next: NextFunction) {
  next();
}
