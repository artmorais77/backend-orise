import { prisma } from "../../src/database/prisma";

const cleanupDatabase = async () => {
  await prisma.sequence.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
};

export { cleanupDatabase }