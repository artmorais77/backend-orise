import { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";

class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        name: z
          .string({ message: "O nome deve ser um texto válido." })
          .min(2, "O nome deve ter pelo menos 2 caracteres")
          .trim(),
        email: z.email({ message: "Informe um e-mail válido."}),
        password: z
          .string({ message: "A senha deve ser um texto válido." })
          .min(6, "A senha deve ter pelo menos 6 caracteres")
          .regex(
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
            "A senha deve conter pelo menos uma letra e um número."
          ),
      });

      const { name, email, password } = bodySchema.parse(req.body);

      const userExisting = await prisma.user.findUnique({ where: { email } });

      if (userExisting) {
        throw new AppError("Este email já está cadastrado");
      }

      const hashedPassword = await hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      next(error);
      return;
    }
  }
}

export { UserController };
