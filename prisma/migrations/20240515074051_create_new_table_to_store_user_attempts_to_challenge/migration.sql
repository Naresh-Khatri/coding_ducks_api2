-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('submitted', 'notSubmitted');

-- CreateTable
CREATE TABLE "ChallengeAttempt" (
    "id" SERIAL NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "contentHEAD" TEXT NOT NULL DEFAULT '',
    "contentHTML" TEXT NOT NULL DEFAULT '<div class="main"> Hello from coding ducks! </div>',
    "contentCSS" TEXT NOT NULL DEFAULT 'body{
  margin: 0px;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;}',
    "contentJS" TEXT NOT NULL DEFAULT '// write your js here',
    "status" "ChallengeStatus" NOT NULL DEFAULT 'notSubmitted',
    "score" INTEGER NOT NULL DEFAULT 0,
    "lastSubmitted" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ChallengeAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
