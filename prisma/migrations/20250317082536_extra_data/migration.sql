-- AlterTable
ALTER TABLE "buckets" ADD COLUMN     "extraData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "extraData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "keeps" ADD COLUMN     "extraData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "mindmaps" ADD COLUMN     "extraData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "moments" ADD COLUMN     "extraData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "todos" ADD COLUMN     "extraData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "extraData" JSONB NOT NULL DEFAULT '{}';
