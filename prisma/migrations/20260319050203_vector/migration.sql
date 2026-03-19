/*
  Warnings:

  - You are about to alter the column `description_vector` on the `images` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector(3072)")`.
  - You are about to alter the column `content_vector` on the `keeps` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector(3072)")`.
  - You are about to alter the column `summary_vector` on the `keeps` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector(3072)")`.
  - You are about to alter the column `title_vector` on the `keeps` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector(3072)")`.
  - You are about to alter the column `content_vector` on the `moments` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector(3072)")`.

*/
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
ALTER TABLE "images" ALTER COLUMN "description_vector" SET DATA TYPE vector(3072) USING description_vector::text::vector(3072);

-- AlterTable
ALTER TABLE "keeps" ALTER COLUMN "content_vector" SET DATA TYPE vector(3072) USING content_vector::text::vector(3072),
ALTER COLUMN "summary_vector" SET DATA TYPE vector(3072) USING content_vector::text::vector(3072),
ALTER COLUMN "title_vector" SET DATA TYPE vector(3072) USING content_vector::text::vector(3072);

-- AlterTable
ALTER TABLE "moments" ALTER COLUMN "content_vector" SET DATA TYPE vector(3072) USING content_vector::text::vector(3072);

-- CreateIndex
CREATE INDEX "keeps_title_idx" ON "keeps" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "keeps_content_idx" ON "keeps" USING GIN ("content" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "keeps_summary_idx" ON "keeps" USING GIN ("summary" gin_trgm_ops);
