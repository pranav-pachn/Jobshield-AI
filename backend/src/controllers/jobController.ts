import { Request, Response } from "express";

export async function analyzeJob(req: Request, res: Response) {
  res.json({
    message: "Job analysis endpoint placeholder",
    payload: req.body,
  });
}
