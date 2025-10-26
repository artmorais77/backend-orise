import { z } from "zod";

const cashRegisterParamsSchema = z.object({
  cashRegisterId: z.uuid()
})

const cashRegisterBodySchema = z.object({
  initialAmount: z
    .number({ message: "O initialAmount deve ser um numero" })
    .positive({ message: "O initialAmount deve ser um numero" }),
});

const cashRegisterQuerySchema = z.object({
  code: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().positive().optional()
    ), 
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
})

export { cashRegisterParamsSchema, cashRegisterBodySchema, cashRegisterQuerySchema };
