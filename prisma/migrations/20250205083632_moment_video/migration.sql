-- CreateTable
CREATE TABLE "moment_videos" (
    "id" SERIAL NOT NULL,
    "videoId" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moment_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "moment_videos_unique" ON "moment_videos"("videoId", "momentId");

-- AddForeignKey
ALTER TABLE "moment_videos" ADD CONSTRAINT "moment_videos_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moment_videos" ADD CONSTRAINT "moment_videos_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "moments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
