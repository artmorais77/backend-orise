import { z } from "zod";

const sessionBodySchema = z.object({
  email: z.email({ message: "Informe um e-mail válido." }),
  password: z.string({ message: "A senha deve ser um texto válido." }),
});

export { sessionBodySchema };
