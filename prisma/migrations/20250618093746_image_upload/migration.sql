-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_compressed_id_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_original_id_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_thumbnail_768x_id_fkey";

-- AlterTable
ALTER TABLE "images" ALTER COLUMN "thumbnail_768x_id" DROP NOT NULL,
ALTER COLUMN "compressed_id" DROP NOT NULL,
ALTER COLUMN "original_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_thumbnail_768x_id_fkey" FOREIGN KEY ("thumbnail_768x_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_compressed_id_fkey" FOREIGN KEY ("compressed_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_original_id_fkey" FOREIGN KEY ("original_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
