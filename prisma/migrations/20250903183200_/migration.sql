/*
  Warnings:

  - The `variant` column on the `tags` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."TagVariant" AS ENUM ('green', 'red', 'orange', 'blue', 'neutral');

-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "variant",
ADD COLUMN     "variant" "public"."TagVariant";
