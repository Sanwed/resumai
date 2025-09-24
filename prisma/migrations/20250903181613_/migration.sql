/*
  Warnings:

  - You are about to drop the column `code` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `tags` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "code",
DROP COLUMN "color",
ADD COLUMN     "variant" TEXT;
