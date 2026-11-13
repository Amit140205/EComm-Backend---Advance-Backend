/*
  Warnings:

  - You are about to drop the column `productImageUrl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productImageUrl",
ADD COLUMN     "productImageUrls" TEXT[];
