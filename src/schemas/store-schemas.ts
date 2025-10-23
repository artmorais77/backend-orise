import { z } from "zod";

const storeBodySchema = z.object({
  storeName: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim(),
  storeTradeName: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim()
    .optional(),
  cnpj: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim()
    .regex(
      /^\d{14}$/,
      "O CNPJ deve ser composto so port números e ter 14 dígitos"
    ),
  StoreEmail: z.email().optional(),
  StorePhoneNumber: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "O numero de Telefone deve conter de 10 a 11 números")
    .optional(),
  street: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim()
    .optional(),
  addressNumber: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim()
    .optional(),
  neighborhood: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim()
    .optional(),
  city: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim()
    .optional(),
  state: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim()
    .optional(),
});

export { storeBodySchema };
