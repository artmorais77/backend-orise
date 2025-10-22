import { prisma } from "@/database/prisma";
import { codesSchema } from "@/schemas/codes-schemas";
import { productsBodySchema, productsParamsSchema, productsQuerySchema } from "@/schemas/products-schemas";
import { userIdSchema } from "@/schemas/user-id-schemas";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";

class ProductsController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = userIdSchema.parse(req.user);



      const { name, category, price, page, limit } = productsQuerySchema.parse(
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
      const { userId } = userIdSchema.parse(req.user);
      const { product } = codesSchema.parse(req.codes)

      console.log(product)

      if(!product) {
        throw new AppError("O código do produto é obrigatório")
      }



      const { name, category, price } = productsBodySchema.parse(req.body);

      const productsExisting = await prisma.product.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, userId },
      });

      if (productsExisting) {
        throw new AppError("Ja existe um produto com esse nome");
      }

      const newProduct = await prisma.product.create({
        data: {
          code: product,
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
      const { userId } = userIdSchema.parse(req.user);

      const { productId } = productsParamsSchema.parse(req.params);

      const existingProduct = await prisma.product.findFirst({
        where: { id: productId, userId },
      });

      if (!existingProduct) {
        throw new AppError("Produto inexistente.");
      }

      const { name, category, price } = productsBodySchema.parse(req.body);

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
      const { userId } = userIdSchema.parse(req.user);

      const { productId } = productsParamsSchema.parse(req.params);

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
