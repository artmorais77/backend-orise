import { z } from "zod";
import { PaymentType, SaleStatus } from "@prisma/client";

const saleBodySchema = z.object({
  paymentType: z.enum(PaymentType),
  items: z.array(
    z.object({
      productId: z.uuid(),
      quantity: z
        .number("A quantidade deve ser um numero")
        .positive("A quantidade deve ser um numero positivo"),
    })
  ),
});

const saleParamsSchema = z.object({
  saleId: z.uuid("O saleId deve ser um uuid"),
});

const saleQuerySchema = z.object({
  code: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().optional()
  ),
  total: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().optional()
  ),
  status: z.enum(SaleStatus).optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  page: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().default(1)
  ),
  limit: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().default(10)
  ),
});

export { saleBodySchema, saleParamsSchema, saleQuerySchema };
