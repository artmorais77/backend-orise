import { z } from "zod";

const userIdSchema = z.object({
  userId: z.uuid(),
  storeId: z.uuid(),
});

export { userIdSchema };
