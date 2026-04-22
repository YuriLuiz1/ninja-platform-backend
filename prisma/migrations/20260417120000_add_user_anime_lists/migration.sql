-- CreateEnum
CREATE TYPE "AnimeListType" AS ENUM ('WANT_TO_WATCH', 'WATCHED', 'LIKED', 'DISLIKED');

-- CreateTable
CREATE TABLE "UserAnimeList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "listType" "AnimeListType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAnimeList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAnimeList_userId_animeId_listType_key" ON "UserAnimeList"("userId", "animeId", "listType");

-- CreateIndex
CREATE INDEX "UserAnimeList_userId_listType_idx" ON "UserAnimeList"("userId", "listType");

-- CreateIndex
CREATE INDEX "UserAnimeList_animeId_idx" ON "UserAnimeList"("animeId");

-- AddForeignKey
ALTER TABLE "UserAnimeList" ADD CONSTRAINT "UserAnimeList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnimeList" ADD CONSTRAINT "UserAnimeList_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
