import { Request, Response } from "express";

export async function checkRecruiter(req: Request, res: Response) {
  res.json({
    message: "Recruiter verification endpoint placeholder",
    payload: req.body,
  });
}
