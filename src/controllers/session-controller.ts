import { authConfig } from "@/config/auth";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { compare } from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { sign } from "jsonwebtoken";
import { z } from "zod";

class SessionController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        email: z
          .string({ message: "O e-mail deve ser um texto válido." })
          .email("Informe um e-mail válido."),
        password: z
          .string({ message: "A senha deve ser um texto válido." }),
      });

      const { email, password } = bodySchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new AppError("Email e/ou senha inválidos");
      }

      const passwordMatched = await compare(password, user?.password);

      if (!passwordMatched) {
        throw new AppError("Email e/ou senha inválidos");
      }

      const { secret, expiresIn } = authConfig.jwt;

      if (!secret) throw new AppError("JWT secret não definido", 500);
      if (!expiresIn) throw new AppError("JWT expiresIn não definido", 500);

      const token = sign({ userId: user.id }, secret, {
        expiresIn,
      });

      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export { SessionController };
