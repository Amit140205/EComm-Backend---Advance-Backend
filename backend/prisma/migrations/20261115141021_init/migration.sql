/*
  Warnings:

  - The `addressType` column on the `Address` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK', 'OTHER');

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "addressType",
ADD COLUMN     "addressType" "AddressType" NOT NULL DEFAULT 'HOME';
