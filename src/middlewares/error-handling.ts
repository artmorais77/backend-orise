import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

function errorHandling(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "erro de validação",
      issues: error.format(),
    });
  }

  return res.status(500).json({ message: error.message || "Error interno do servidor" });
}

export { errorHandling };
