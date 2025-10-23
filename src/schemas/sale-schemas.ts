import { z } from "zod";
import { PaymentType } from "@prisma/client";

const saleBodySchema = z.object({
  paymentType: z.enum(PaymentType),
  items: z.array(
    z.object({
    productId: z.uuid(),
    quantity: z.number().positive(),
    price: z.number().positive(),
  })),
});

export { saleBodySchema };
