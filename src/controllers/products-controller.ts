import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

class ProductsController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const reqSchema = z.object({
        userId: z.uuid(),
      });

      const { userId } = reqSchema.parse(req.user);

      const querySchema = z.object({
        name: z.string().trim().optional(),
        category: z.string().trim().optional(),
        price: z.preprocess(
          (val) => (val ? Number(val) : undefined),
          z.number().positive().optional()
        ),
        page: z.preprocess(
          (val) => (val ? Number(val) : undefined),
          z.number().positive().default(1)
        ),
        limit: z.preprocess(
          (val) => (val ? Number(val) : undefined),
          z.number().positive().default(10)
        ),
      });

      const { name, category, price, page, limit } = querySchema.parse(
        req.query
      );

      const skip = (page - 1) * limit;

      const filters: any = {
        userId,
      };

      if (name) filters.name = { equals: name, mode: "insensitive" };
      if (category)
        filters.category = { equals: category, mode: "insensitive" };
      if (price) filters.price = price;

      const [products, totalProducts] = await prisma.$transaction([
        prisma.product.findMany({
          where: filters,
          skip: skip,
          take: limit,
          orderBy: { code: "desc" },
        }),

        prisma.product.count({
          where: filters,
        }),
      ]);

      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).json({
        data: products,
        meta: {
          total: totalProducts,
          page: page,
          limit: limit,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const reqSchema = z.object({
        userId: z.uuid(),
      });

      const { userId } = reqSchema.parse(req.user);

      const bodySchema = z.object({
        name: z
          .string("O nome deve ser um texto válido.")
          .trim()
          .min(1, "O nome deve ter pelo menos 2 caracteres"),
        category: z
          .string("A categoria deve ser um texto válido.")
          .trim()
          .min(1, "A categoria deve ter pelo menos 2 caracteres"),
        price: z
          .number("O preço deve ser um numero")
          .positive("O preço deve ser maior que 0"),
      });

      const { name, category, price } = bodySchema.parse(req.body);

      const productsExisting = await prisma.product.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, userId },
      });

      if (productsExisting) {
        throw new AppError("Ja existe um produto com esse nome");
      }

      const sequence = await prisma.sequence.upsert({
        where: { userId_entity: { userId, entity: "product" } },
        update: {
          lastCode: { increment: 1 },
        },
        create: {
          userId,
          entity: "product",
          lastCode: 1,
        },
      });

      const newProduct = await prisma.product.create({
        data: {
          code: sequence.lastCode,
          name,
          category,
          price: Number(price),
          userId,
        },
      });

      res.status(201).json({
        message: "Produto criado com sucesso",
        product: newProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const reqSchema = z.object({
        userId: z.uuid(),
      });

      const { userId } = reqSchema.parse(req.user);

      const paramsSchema = z.object({
        productId: z.uuid(),
      });

      const bodySchema = z.object({
        name: z
          .string("O nome deve ser um texto válido.")
          .trim()
          .min(1, "O nome deve ter pelo menos 2 caracteres"),
        category: z
          .string("A categoria deve ser um texto válido.")
          .trim()
          .min(1, "A categoria deve ter pelo menos 2 caracteres"),
        price: z
          .number("O preço deve ser um numero")
          .positive("O preço deve ser maior que 0"),
      });

      const { productId } = paramsSchema.parse(req.params);

      const existingProduct = await prisma.product.findFirst({
        where: { id: productId, userId },
      });

      if (!existingProduct) {
        throw new AppError("Produto inexistente.");
      }

      const { name, category, price } = bodySchema.parse(req.body);

      const duplicateProduct = await prisma.product.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          userId,
          NOT: { id: productId },
        },
      });

      if (duplicateProduct) {
        throw new AppError("Ja existe um produto com esse nome");
      }

      const UpdatedProduct = await prisma.product.update({
        data: {
          name,
          category,
          price: Number(price),
        },
        where: {
          id: productId,
          userId,
        },
      });

      res.status(200).json({
        message: "Produto atualizado com sucesso",
        produto: UpdatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const reqSchema = z.object({
        userId: z.uuid(),
      });

      const { userId } = reqSchema.parse(req.user);

      const paramsSchema = z.object({
        productId: z.uuid(),
      });

      const { productId } = paramsSchema.parse(req.params);

      const existingProduct = await prisma.product.findFirst({
        where: { id: productId, userId },
      });

      if (!existingProduct) {
        throw new AppError("Produto inexistente.");
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId, userId },
        data: { isActive: !existingProduct.isActive },
      });

      res.status(200).json({
        message: updatedProduct.isActive
          ? `Produto "${updatedProduct.name}" reativado com sucesso.`
          : `Produto "${updatedProduct.name}" desativado com sucesso.`,
        product: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }
}

export { ProductsController };
