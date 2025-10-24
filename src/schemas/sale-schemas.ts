import { z } from "zod";
import { PaymentType } from "@prisma/client";

const saleBodySchema = z.object({
  paymentType: z.enum(PaymentType),
  items: z.array(
    z.object({
    productId: z.uuid("O productId deve ser um uuid"),
    quantity: z.number("A quantidade deve ser um numero").positive("A quantidade deve ser um numero positivo"),
    price: z.number("A quantidade deve ser um numero").positive("A quantidade deve ser um numero positivo"),
  })),
});

const saleParamsSchema = z.object({
  saleId: z.uuid("O saleId deve ser um uuid")
})

export { saleBodySchema, saleParamsSchema };
