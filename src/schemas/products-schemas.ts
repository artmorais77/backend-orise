import { z } from "zod";

const productsParamsSchema = z.object({
  productId: z.uuid(),
});

const productsQuerySchema = z.object({
  code: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().optional()
  ),
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

const productsBodySchema = z.object({
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

export { productsParamsSchema, productsQuerySchema, productsBodySchema };
