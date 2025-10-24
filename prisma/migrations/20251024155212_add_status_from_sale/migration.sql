-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('invoiced', 'cancele');

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "status" "SaleStatus" NOT NULL DEFAULT 'invoiced';
