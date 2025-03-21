-- AlterTable
ALTER TABLE "buckets" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "extraData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "mindmaps" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "todos" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'default';
