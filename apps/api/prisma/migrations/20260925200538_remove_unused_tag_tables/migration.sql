/*
  Warnings:

  - You are about to drop the `prospect_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "prospect_tags" DROP CONSTRAINT "prospect_tags_prospect_id_fkey";

-- DropForeignKey
ALTER TABLE "prospect_tags" DROP CONSTRAINT "prospect_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_user_id_fkey";

-- DropTable
DROP TABLE "prospect_tags";

-- DropTable
DROP TABLE "tags";
