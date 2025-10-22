import { z } from "zod";

const codesSchema = z.object({
  product: z.number().optional(),
  cashRegister: z.number().optional(),
  cashMovement: z.number().optional(),
  sale: z.number().optional(),
});

export { codesSchema };
