import { AppError } from "@/utils/AppError";
import { Request, Response } from "express";
import { ZodError } from "zod";

function errorHandling(error: any, _: Request, res: Response) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "erro de validação",
      issues: error.format(),
    });
  }

  return res.status(500).json({ message: error.error });
}

export { errorHandling };
