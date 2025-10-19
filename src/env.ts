import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number(),
});

const env = envSchema.parse(process.env);

export { env };