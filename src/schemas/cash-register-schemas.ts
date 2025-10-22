import { z } from "zod";

const cashRegisterParamsSchema = z.object({
  cashRegisterId: z.uuid()
})

const cashRegisterBodySchema = z.object({
  initialAmount: z
    .number({ message: "O initialAmount deve ser um numero" })
    .positive({ message: "O initialAmount deve ser um numero" }),
});

export { cashRegisterParamsSchema, cashRegisterBodySchema };
