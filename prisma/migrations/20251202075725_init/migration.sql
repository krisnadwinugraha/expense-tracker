/*
  Warnings:

  - Changed the type of `type` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'expense');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "description" TEXT,
ADD COLUMN     "rate" TEXT,
ALTER COLUMN "symbol" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PermissionToRole_AB_unique";

-- AlterTable
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RoleToUser_AB_unique";
