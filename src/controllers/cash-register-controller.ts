import { prisma } from "@/database/prisma";
import {
  cashRegisterBodySchema,
  cashRegisterParamsSchema,
} from "@/schemas/cash-register-schemas";
import { codesSchema } from "@/schemas/codes-schemas";
import { userIdSchema } from "@/schemas/user-id-schemas";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";

class CashRegisterController {
  async openCash(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, storeId } = userIdSchema.parse(req.user);
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
          storeId: storeId,
          code: cashRegister,
          initialAmount: initialAmount,
          isOpen: true,
          openedById: userId,
        },
      });

      const registerCashMovement = await prisma.cashMovement.create({
        data: {
          storeId: storeId,
          code: cashMovement,
          cashRegisterId: openCash.id,
          userId: userId,
          type: "entrada",
          description: "Abertura de caixa",
          amount: openCash.initialAmount,
          paymentType: "dinheiro",
        },
      });

      return res.status(201).json({
        cashRegister: openCash,
        cashMovement: registerCashMovement,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async closeCash(req: Request, res: Response, next: NextFunction) {
    try {
      const { cashRegisterId } = cashRegisterParamsSchema.parse(req.params);
      const { userId, storeId } = userIdSchema.parse(req.user);
      const { cashMovement } = codesSchema.parse(req.codes);

      if (!cashMovement) {
        throw new AppError("O código do cashMovement é obrigatório");
      }

      const existingCashRegister = await prisma.cashRegister.findFirst({
        where: {
          id: cashRegisterId,
        },
      });

      if (existingCashRegister?.isOpen === false) {
        throw new AppError("O caixa ja está fechado");
      }

      const cashRegisterEntrada = await prisma.cashMovement.findMany({
        where: {
          cashRegisterId: cashRegisterId,
          type: "entrada",
        },
      });
      const cashRegisterSaida = await prisma.cashMovement.findMany({
        where: {
          cashRegisterId: cashRegisterId,
          type: "saida",
        },
      });

      const totalEntrada = cashRegisterEntrada.reduce((acc, item) => {
        return acc + Number(item.amount);
      }, 0);

      const totalSaida = cashRegisterSaida.reduce((acc, item) => {
        return acc + Number(item.amount);
      }, 0);

      const saldoFinal = totalEntrada - totalSaida;

      const closeCash = await prisma.cashRegister.update({
        where: { id: cashRegisterId },
        data: { isOpen: false, closedById: userId, finalAmount: saldoFinal },
      });

      const registerCashMovement = await prisma.cashMovement.create({
        data: {
          storeId: storeId,
          code: cashMovement,
          cashRegisterId: cashRegisterId,
          userId: userId,
          type: "saida",
          description: "Fechamento de caixa",
          amount: saldoFinal,
          paymentType: "dinheiro",
        },
      });

      return res.status(200).json({
        closeCash: closeCash,
        registerCashMovement: registerCashMovement,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId } = userIdSchema.parse(req.user);

      const OpenedCash = await prisma.cashRegister.findFirst({
        where: {
          storeId: storeId,
          isOpen: true,
        },
        include: {
          cashMovements: true,
        },
      });

      return res.status(200).json(OpenedCash);
    } catch (error) {
      return next(error);
    }
  }
}

export { CashRegisterController };
