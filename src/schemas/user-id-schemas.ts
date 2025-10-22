import { z } from "zod";

const userIdSchema = z.object({
  userId: z.uuid(),
});

export { userIdSchema };
