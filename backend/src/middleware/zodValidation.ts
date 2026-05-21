import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const analyzeSchema = z.object({
  text: z.string().min(10).max(5000),
  email: z.string().email().optional(),
  domain: z.string().optional(),
  recruiter_email: z.string().email().optional(),
  job_url: z.string().url().optional(),
});

export const threatAnalyzeSchema = z.object({
  job_text: z.string().min(10).max(5000),
  original_risk_score: z.number().min(0).max(100).optional(),
});

export const threatLogSchema = z.object({
  job_text: z.string().min(10).max(5000),
  original_risk_score: z.number().min(0).max(100),
  risk_level: z.enum(["Low", "Medium", "High"]),
  job_analysis_id: z.string().optional(),
});

export const domainAnalyzeSchema = z
  .object({
    domain: z.string().min(1).optional(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  })
  .refine((data) => Boolean(data.domain || data.email || data.url), {
    message: "At least one of domain, email, or url is required",
  });

export const domainBulkCheckSchema = z.object({
  domains: z.array(z.string().min(1)).min(1).max(10),
});

export const emailAnalyzeSchema = z.object({
  email: z.string().email(),
  includeDomainAnalysis: z.boolean().optional(),
});

export const emailExtractAnalyzeSchema = z.object({
  text: z.string().min(1).max(10000),
  includeDomainAnalysis: z.boolean().optional(),
});

export const emailBulkCheckSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(10),
  includeDomainAnalysis: z.boolean().optional(),
});

export function validateAnalyzeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && req.body.recruiter_email !== undefined && req.body.email === undefined) {
    req.body.email = req.body.recruiter_email;
  }

  if (req.body && req.body.job_url !== undefined && req.body.domain === undefined) {
    req.body.domain = req.body.job_url;
  }

  const parsed = analyzeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  next();
}

export function validateThreatAnalyzeInput(req: Request, res: Response, next: NextFunction) {
  const parsed = threatAnalyzeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  next();
}

export function validateThreatLogInput(req: Request, res: Response, next: NextFunction) {
  const parsed = threatLogSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  next();
}

export function validateDomainAnalyzeInput(req: Request, res: Response, next: NextFunction) {
  const parsed = domainAnalyzeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  next();
}

export function validateDomainBulkCheckInput(req: Request, res: Response, next: NextFunction) {
  const parsed = domainBulkCheckSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  next();
}

export function validateEmailAnalyzeInput(req: Request, res: Response, next: NextFunction) {
  const parsed = emailAnalyzeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  next();
}

export function validateEmailExtractAnalyzeInput(req: Request, res: Response, next: NextFunction) {
  const parsed = emailExtractAnalyzeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  next();
}

export function validateEmailBulkCheckInput(req: Request, res: Response, next: NextFunction) {
  const parsed = emailBulkCheckSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  next();
}
