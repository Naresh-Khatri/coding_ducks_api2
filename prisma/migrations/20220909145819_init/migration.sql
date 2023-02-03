-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullname" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "roll" VARCHAR(12),
    "google_uid" VARCHAR(30) NOT NULL,
    "photo_url" VARCHAR(255) NOT NULL,
    "registeredAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(6),
    "username" VARCHAR(30),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Files" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "lastModified" TIMESTAMP(6),

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_uid_key" ON "User"("google_uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
