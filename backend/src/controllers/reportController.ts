import { Request, Response } from "express";

export async function submitReport(req: Request, res: Response) {
  res.status(201).json({
    message: "Scam report submission endpoint placeholder",
    payload: req.body,
  });
}
