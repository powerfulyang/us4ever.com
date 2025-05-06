-- AlterTable
ALTER TABLE "images" ADD COLUMN     "description_vector" JSONB;

-- AlterTable
ALTER TABLE "keeps" ADD COLUMN     "content_vector" JSONB,
ADD COLUMN     "summary_vector" JSONB,
ADD COLUMN     "title_vector" JSONB;

-- AlterTable
ALTER TABLE "moments" ADD COLUMN     "content_vector" JSONB;
