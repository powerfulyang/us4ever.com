/*
  Warnings:

  - Added the required column `duration` to the `videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
