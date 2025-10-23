import { prisma } from "@/database/prisma";
import { codesSchema } from "@/schemas/codes-schemas";
import { saleBodySchema } from "@/schemas/sale-schemas";
import { userIdSchema } from "@/schemas/user-id-schemas";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";

class SaleController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentType, items } = saleBodySchema.parse(req.body);
      const { sale, cashMovement } = codesSchema.parse(req.codes);

      if (!cashMovement) {
        throw new AppError("O código de cashMovement é obrigatório");
      }

      if (!sale) {
        throw new AppError("O código da venda é obrigatório");
      }

      const { storeId, userId } = userIdSchema.parse(req.user);

      const openedCash = await prisma.cashRegister.findFirst({
        where: {
          storeId: storeId,
          isOpen: true,
        },
      });

      if (!openedCash) {
        throw new AppError("O caixa esta fechado");
      }

      const total = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const newSale = await prisma.sale.create({
        data: {
          storeId,
          code: sale,
          cashRegisterId: openedCash.id,
          userId,
          total,
          paymentType,
          saleItems: {
            create: items.map((item: any) => ({
              storeId,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
            })),
          },
        },
        include: {
          saleItems: true,
        },
      });

      await prisma.cashMovement.create({
        data: {
          storeId: storeId,
          code: cashMovement,
          cashRegisterId: openedCash.id,
          userId: userId,
          saleId: newSale.id,
          type: "entrada",
          description: `Venda #${newSale.code}`,
          amount: newSale.total,
          paymentType: newSale.paymentType,
        },
      });

      return res.status(201).json({
        message: "Venda Criada",
        sale: newSale,
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
}

export { SaleController };
