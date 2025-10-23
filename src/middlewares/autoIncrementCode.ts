import { prisma } from "@/database/prisma";
import { userIdSchema } from "@/schemas/user-id-schemas";
import { Request, Response, NextFunction } from "express";

type EntityType = "product" | "cashRegister" | "cashMovement" | "sale";

function autoIncrementCode(entities: EntityType[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { storeId } = userIdSchema.parse(req.user);

      const codes = {} as any;

      for (const entity of entities) {
        const sequence = await prisma.sequence.upsert({
          where: { storeId_entity: { storeId, entity } },
          update: {
            lastCode: { increment: 1 },
          },
          create: {
            storeId,
            entity,
            lastCode: 1,
          },
        });

        codes[entity] = sequence.lastCode;
      }

      req.codes = codes;

      return next();
    } catch (error) {
      next(error);
    }
  };
}

export { autoIncrementCode };
