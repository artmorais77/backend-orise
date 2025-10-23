import { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";
import { usersBodySchema } from "@/schemas/users-schemas";
import { storeBodySchema } from "@/schemas/store-schemas";

class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phoneNumber, email, password } = usersBodySchema.parse(
        req.body
      );
      const {
        storeName,
        storeTradeName,
        cnpj,
        StoreEmail,
        StorePhoneNumber,
        street,
        addressNumber,
        neighborhood,
        city,
        state,
      } = storeBodySchema.parse(req.body);

      const existingStore = await prisma.store.findFirst({
        where: { name: storeName },
      });

      if (existingStore) {
        throw new AppError("Ja Existe uma loja com esse nome");
      }

      const userExisting = await prisma.user.findFirst({ where: { email } });

      if (userExisting) {
        throw new AppError("Este email já está cadastrado");
      }

      const hashedPassword = await hash(password, 10);

      const store = await prisma.store.create({
        data: {
          name: storeName,
          tradeName: storeTradeName ?? null, 
          cnpj: cnpj,
          email: StoreEmail ?? null,
          phoneNumber: StorePhoneNumber ?? null,
          street: street ?? null,
          addressNumber: addressNumber ?? null,
          neighborhood: neighborhood ?? null,
          city: city ?? null,
          state: state ?? null,
        }
      })

      const user = await prisma.user.create({
        data: {
          storeId: store.id,
          name: name,
          phoneNumber: phoneNumber,
          email: email,
          password: hashedPassword,
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        user: userWithoutPassword,
        store: store,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export { UserController };
