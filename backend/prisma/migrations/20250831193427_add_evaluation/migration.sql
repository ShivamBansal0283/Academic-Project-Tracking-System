/*
  Warnings:

  - You are about to drop the `_SubmissionToTeam` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[taskId,teamId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_SubmissionToTeam" DROP CONSTRAINT "_SubmissionToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubmissionToTeam" DROP CONSTRAINT "_SubmissionToTeam_B_fkey";

-- DropTable
DROP TABLE "_SubmissionToTeam";

-- CreateIndex
CREATE UNIQUE INDEX "Submission_taskId_teamId_key" ON "Submission"("taskId", "teamId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
