-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('sale', 'admin');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('dinheiro', 'pix', 'debito', 'credito');

-- CreateEnum
CREATE TYPE "TypeMovement" AS ENUM ('entrada', 'saida');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRoles" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "cashRegisterId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_item" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "sale_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_register" (
    "id" SERIAL NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOpen" BOOLEAN NOT NULL,
    "initialAmount" DECIMAL(65,30) NOT NULL,
    "finalAmount" DECIMAL(65,30),
    "openedById" TEXT NOT NULL,
    "closedById" TEXT,

    CONSTRAINT "cash_register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_register_counter" (
    "id" SERIAL NOT NULL,
    "counter" INTEGER NOT NULL,
    "cashRegisterId" INTEGER NOT NULL,

    CONSTRAINT "cash_register_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_movement" (
    "id" SERIAL NOT NULL,
    "cashRegisterId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "saleId" INTEGER,
    "type" "TypeMovement" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cash_register_counter_cashRegisterId_key" ON "cash_register_counter"("cashRegisterId");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "cash_register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register" ADD CONSTRAINT "cash_register_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register" ADD CONSTRAINT "cash_register_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_counter" ADD CONSTRAINT "cash_register_counter_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "cash_register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movement" ADD CONSTRAINT "cash_movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movement" ADD CONSTRAINT "cash_movement_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movement" ADD CONSTRAINT "cash_movement_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "cash_register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
