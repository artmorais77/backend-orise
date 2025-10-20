import { authConfig } from "@/config/auth";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface TokenPayload {
  userId: string
}

function ensureAuthenticated(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token não fornecido");
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      throw new AppError("Token não fornecido");
    }

    const { userId } = verify(token, authConfig.jwt.secret) as TokenPayload;

    req.user = {
      id: userId,
    };

    next();
  } catch (error) {
    throw new AppError("Token invalido");
  }
}

export { ensureAuthenticated };
