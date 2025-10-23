import { z } from "zod";

const usersBodySchema = z.object({
  name: z
    .string("O nome deve ser um texto válido.")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim(),
  phoneNumber: z
    .string()
    .trim()
    .regex(
      /^\d{10,11}$/,
      "O numero de Telefone deve conter de 10 a 11 números"
    ),
  email: z.email("Informe um e-mail válido."),
  password: z
    .string("A senha deve ser um texto válido.")
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
      "A senha deve conter pelo menos uma letra e um número."
    ),
});

export { usersBodySchema };
