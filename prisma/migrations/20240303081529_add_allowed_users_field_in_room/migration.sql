-- CreateTable
CREATE TABLE "_roomsAllowedForUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_roomsAllowedForUser_AB_unique" ON "_roomsAllowedForUser"("A", "B");

-- CreateIndex
CREATE INDEX "_roomsAllowedForUser_B_index" ON "_roomsAllowedForUser"("B");

-- AddForeignKey
ALTER TABLE "_roomsAllowedForUser" ADD CONSTRAINT "_roomsAllowedForUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roomsAllowedForUser" ADD CONSTRAINT "_roomsAllowedForUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
