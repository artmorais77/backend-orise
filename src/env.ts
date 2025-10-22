import { envSchema } from "./schemas/env-schemas";

const env = envSchema.parse(process.env);

export { env };
