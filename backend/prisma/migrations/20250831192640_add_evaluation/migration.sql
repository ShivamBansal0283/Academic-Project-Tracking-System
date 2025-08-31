-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_teamId_fkey";

-- DropIndex
DROP INDEX "Submission_taskId_teamId_key";

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "grade" INTEGER;

-- CreateTable
CREATE TABLE "_SubmissionToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SubmissionToTeam_AB_unique" ON "_SubmissionToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_SubmissionToTeam_B_index" ON "_SubmissionToTeam"("B");

-- AddForeignKey
ALTER TABLE "_SubmissionToTeam" ADD CONSTRAINT "_SubmissionToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubmissionToTeam" ADD CONSTRAINT "_SubmissionToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
