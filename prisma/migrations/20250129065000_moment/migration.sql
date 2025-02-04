-- CreateTable
CREATE TABLE "moments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "moments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moment_images" (
    "id" SERIAL NOT NULL,
    "imageId" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moment_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "moment_images_unique" ON "moment_images"("imageId", "momentId");

-- AddForeignKey
ALTER TABLE "moment_images" ADD CONSTRAINT "moment_images_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moment_images" ADD CONSTRAINT "moment_images_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "moments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
