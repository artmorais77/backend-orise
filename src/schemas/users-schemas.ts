import { z } from "zod";

const usersBodySchema = z.object({
  name: z
    .string({ message: "O nome deve ser um texto válido." })
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .trim(),
  email: z.email({ message: "Informe um e-mail válido." }),
  password: z
    .string({ message: "A senha deve ser um texto válido." })
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
      "A senha deve conter pelo menos uma letra e um número."
    ),
});

export { usersBodySchema };
