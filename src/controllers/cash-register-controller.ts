import { prisma } from "@/database/prisma";
import { cashRegisterBodySchema } from "@/schemas/cash-register-schemas";
import { codesSchema } from "@/schemas/codes-schemas";
import { userIdSchema } from "@/schemas/user-id-schemas";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";

class CashRegisterController {
  async openCash(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = userIdSchema.parse(req.user);
      const { cashMovement, cashRegister } = codesSchema.parse(req.codes);
      const { initialAmount } = cashRegisterBodySchema.parse(req.body);

      if (!cashMovement) {
        throw new AppError("O código do cashMovement é obrigatório");
      }
      if (!cashRegister) {
        throw new AppError("O código do cashRegister é obrigatório");
      }

      const existingOpenCash = await prisma.cashRegister.findFirst({
        where: {
          openedById: userId,
          isOpen: true,
        },
      });

      if (existingOpenCash) {
        throw new AppError("Já existe um caixa aberto para este usuário");
      }

      const openCash = await prisma.cashRegister.create({
        data: {
          code: cashRegister,
          initialAmount: initialAmount,
          isOpen: true,
          openedBy: {
            connect: { id: userId },
          },
        },
      });

      const registerCashMovement = await prisma.cashMovement.create({
        data: {
          code: cashMovement,
          cashRegister: {
            connect: { id: openCash.id },
          },
          user: {
            connect: { id: userId },
          },
          type: "entrada",
          description: "Abertura de caixa",
          amount: openCash.initialAmount,
          paymentType: "dinheiro",
        },
      });

      res.status(201).json({
        cashRegister: openCash,
        cashMovement: registerCashMovement,
      });
    } catch (error) {
      next(error);
    }
  }
}

export { CashRegisterController };
