import { prisma } from "@/database/prisma";
import { codesSchema } from "@/schemas/codes-schemas";
import { saleBodySchema, saleParamsSchema } from "@/schemas/sale-schemas";
import { userIdSchema } from "@/schemas/user-id-schemas";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";

class SaleController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentType, items } = saleBodySchema.parse(req.body);
      const { sale, cashMovement } = codesSchema.parse(req.codes);

      items.map(async (item) => {
        try {
          const productIsActive = await prisma.product.findFirst({
            where: {
              id: item.productId,
              isActive: true,
            },
          });

          if (!productIsActive) {
            throw new AppError("O Produto selecionado está inativo");
          }
        } catch (error) {
          next(error);
        }
      });

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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId } = userIdSchema.parse(req.user);
      const { saleId } = saleParamsSchema.parse(req.params);
      const { items, paymentType } = saleBodySchema.parse(req.body);

      const existingSale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          cashMovements: true,
        },
      });

      if (!existingSale) {
        throw new AppError("Venda Inexistente");
      }

      if (existingSale.status === "canceled") {
        throw new AppError(
          "Não é possível editar uma venda que já foi cancelada."
        );
      }

      const cashMovementId = existingSale.cashMovements[0]?.id;

      if (!cashMovementId) {
        throw new AppError("Id de movimentação inexistente");
      }

      const openedCash = await prisma.cashRegister.findFirst({
        where: {
          storeId,
          isOpen: true,
        },
      });

      if (openedCash?.id !== existingSale.cashRegisterId) {
        throw new AppError(
          "Esta venda só pode ser alterada no mesmo caixa em que foi registrada."
        );
      }

      items.map(async (item) => {
        try {
          const productIsActive = await prisma.product.findFirst({
            where: {
              id: item.productId,
              isActive: true,
            },
          });

          if (!productIsActive) {
            throw new AppError("O Produto selecionado está inativo");
          }
        } catch (error) {
          next(error);
        }
      });

      const total = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const [_deleteSaleItem, updateSale, _updateCashMovement] =
        await prisma.$transaction([
          prisma.saleItem.deleteMany({ where: { saleId } }),
          prisma.sale.update({
            data: {
              paymentType,
              total,
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
            include: { saleItems: true },
            where: { id: saleId },
          }),
          prisma.cashMovement.update({
            data: {
              amount: total,
              paymentType,
            },
            where: { id: cashMovementId },
          }),
        ]);

      return res.status(200).json({
        message: "Venda Atualizada",
        sale: updateSale,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export { SaleController };
