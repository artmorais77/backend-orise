import { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";
import { usersBodySchema } from "@/schemas/users-schemas";

class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = usersBodySchema.parse(req.body);

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
