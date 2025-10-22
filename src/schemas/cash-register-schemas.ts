import { z } from "zod";

const cashRegisterBodySchema = z.object({
  initialAmount: z
    .number({ message: "O initialAmount deve ser um numero" })
    .positive({ message: "O initialAmount deve ser um numero" }),
});

export { cashRegisterBodySchema };
