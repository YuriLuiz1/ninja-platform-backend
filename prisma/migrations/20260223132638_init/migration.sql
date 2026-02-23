-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "average" TEXT NOT NULL,
    "synopisis" TEXT NOT NULL,
    "capeImage" TEXT NOT NULL,
    "opinionNinja" TEXT,
    "categoryId" INTEGER,

    CONSTRAINT "Animes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Animes" ADD CONSTRAINT "Animes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
