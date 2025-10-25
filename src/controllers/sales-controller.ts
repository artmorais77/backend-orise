import { prisma } from "@/database/prisma";
import { codesSchema } from "@/schemas/codes-schemas";
import {
  saleBodySchema,
  saleParamsSchema,
  saleQuerySchema,
} from "@/schemas/sale-schemas";
import { userIdSchema } from "@/schemas/user-id-schemas";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";

class SalesController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentType, productId, quantity } = saleBodySchema.parse(
        req.body
      );
      const { sale, cashMovement } = codesSchema.parse(req.codes);

      const productIsActive = await prisma.product.findFirst({
        where: {
          id: productId,
          isActive: true,
        },
      });

      if (!productIsActive) {
        throw new AppError("O Produto selecionado está inativo");
      }

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

      const price = Number(productIsActive.price);

      const total = price * quantity;

      const newSale = await prisma.sale.create({
        data: {
          storeId,
          code: sale,
          cashRegisterId: openedCash.id,
          userId,
          total,
          paymentType,
          saleItems: {
            create: {
              storeId,
              productId: productId,
              name: productIsActive.name,
              quantity: quantity,
              price: price,
              subtotal: price * quantity,
            },
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
      const { productId, quantity, paymentType } = saleBodySchema.parse(
        req.body
      );

      const existingSale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          cashMovements: true,
        },
      });

      if (!existingSale) {
        throw new AppError("Venda Inexistente");
      }

      if (existingSale.storeId !== storeId) {
        throw new AppError("Não é possível alterar uma venda de outra loja");
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

      const productIsActive = await prisma.product.findFirst({
        where: {
          id: productId,
          isActive: true,
        },
      });

      if (!productIsActive) {
        throw new AppError("O Produto selecionado está inativo");
      }

      const price = Number(productIsActive.price)

      const total = price * quantity

      const [_deleteSaleItem, updateSale, _updateCashMovement] =
        await prisma.$transaction([
          prisma.saleItem.deleteMany({ where: { saleId } }),
          prisma.sale.update({
            data: {
              paymentType,
              total,
              saleItems: {
                create: {
                  storeId,
                  productId: productId,
                  name: productIsActive.name,
                  quantity: quantity,
                  price: price,
                  subtotal: price * quantity,
                },
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

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { saleId } = saleParamsSchema.parse(req.params);
      const { storeId, userId } = userIdSchema.parse(req.user);
      const { cashMovement } = codesSchema.parse(req.codes);

      if (!cashMovement) {
        throw new AppError("O código de cashMovement é obrigatório");
      }

      const existingSale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          cashMovements: true,
        },
      });

      if (!existingSale) {
        throw new AppError("Venda Inexistente");
      }

      if (existingSale.storeId !== storeId) {
        throw new AppError("Não é possível cancelar uma venda de outra loja");
      }

      if (existingSale.status === "canceled") {
        throw new AppError(
          "Não é possível cancelar uma venda que já foi cancelada."
        );
      }

      const openedCash = await prisma.cashRegister.findFirst({
        where: {
          storeId,
          isOpen: true,
        },
      });

      if (openedCash?.id !== existingSale.cashRegisterId) {
        throw new AppError(
          "Esta venda só pode ser cancelada no mesmo caixa em que foi registrada."
        );
      }

      await prisma.$transaction([
        prisma.sale.update({
          where: {
            id: saleId,
          },
          data: {
            status: "canceled",
          },
        }),
        prisma.cashMovement.create({
          data: {
            storeId,
            code: cashMovement,
            cashRegisterId: openedCash.id,
            userId,
            saleId,
            type: "saida",
            description: `Cancelamento da venda #${existingSale.code}`,
            amount: existingSale.total,
            paymentType: existingSale.paymentType,
          },
        }),
      ]);

      res.status(200).json({
        message: "Venda cancelada",
      });
    } catch (error) {
      return next(error);
    }
  }

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId } = userIdSchema.parse(req.user);
      const { code, total, status, page, limit, startDate, endDate } =
        saleQuerySchema.parse(req.query);

      const skip = (page - 1) * limit;

      const filters: any = {
        storeId,
      };

      if (code) filters.code = code;
      if (status) filters.status = status;
      if (total) filters.total = total;
      if (startDate && endDate)
        filters.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };

      const [sales, totalSales] = await prisma.$transaction([
        prisma.sale.findMany({
          where: filters,
          skip: skip,
          take: limit,
          orderBy: { code: "desc" },
        }),

        prisma.sale.count({
          where: filters,
        }),
      ]);

      const totalPages = Math.ceil(totalSales / limit);

      res.status(200).json({
        data: sales,
        meta: {
          total: totalSales,
          page: page,
          limit: limit,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { saleId } = saleParamsSchema.parse(req.params);

      const existingSale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: { saleItems: true },
      });

      if (!existingSale) {
        throw new AppError("Venda inexistente");
      }

      return res.status(200).json(existingSale);
    } catch (error) {
      return next(error);
    }
  }
}

export { SalesController };
