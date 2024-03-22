-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "contentCSS" TEXT DEFAULT 'h1{
 color: purple;
}',
ADD COLUMN     "contentHTML" TEXT DEFAULT '<h1> Hello world! </h1>',
ADD COLUMN     "contentJS" TEXT DEFAULT 'console.log(''Hello User!'')';
