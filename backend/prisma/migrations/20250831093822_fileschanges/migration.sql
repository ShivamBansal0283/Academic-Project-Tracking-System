/*
  Warnings:

  - You are about to drop the column `uploadedAt` on the `File` table. All the data in the column will be lost.
  - Added the required column `mime` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_submissionId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "uploadedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mime" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ALTER COLUMN "submissionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
