-- CreateTable
CREATE TABLE "StudentProject" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProject_studentId_projectId_key" ON "StudentProject"("studentId", "projectId");

-- AddForeignKey
ALTER TABLE "StudentProject" ADD CONSTRAINT "StudentProject_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProject" ADD CONSTRAINT "StudentProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
