// src/pages/CourseDetails.tsx
import * as React from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, CalendarDays } from "lucide-react";
import { useCourse, useEnrollInCourse } from "@/hooks/useApi";
import type { StudentProjectStatus } from "@/api/courses";

type RoleLower = "student" | "teacher" | "admin";
const lc = (s?: string): RoleLower =>
  (String(s ?? "").toLowerCase() as RoleLower) || "student";

const badgeForGlobal = (s: "NEW" | "ACTIVE" | "COMPLETED" | "REJECTED") => {
  switch (s) {
    case "ACTIVE": return "bg-status-active text-white";
    case "COMPLETED": return "bg-status-completed text-white";
    case "REJECTED": return "bg-status-rejected text-white";
    default: return "bg-muted text-muted-foreground"; // NEW
  }
};

const badgeForDerived = (s?: StudentProjectStatus | null) => {
  switch (s) {
    case "active": return "bg-status-active text-white";
    case "completed": return "bg-status-completed text-white";
    case "rejected": return "bg-status-rejected text-white";
    case "new":
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  if (meQuery.isLoading) return <div className="p-6">Loading…</div>;
  if (meQuery.isError) return <Navigate to="/login" replace />;

  const user = meQuery.data!.user;
  const roleLower = lc(user.role);
  const isStudent = roleLower === "student";

  const { data: course, isLoading, isError } = useCourse(id || "");
  const enroll = useEnrollInCourse();

  if (isLoading) {
    return (
      <Layout userRole={roleLower}>
        <div className="p-6">Loading course…</div>
      </Layout>
    );
  }
  if (isError || !course) {
    return (
      <Layout userRole={roleLower}>
        <div className="p-6 text-sm text-muted-foreground">Course not found.</div>
      </Layout>
    );
  }

  const studentIds = new Set(course.students.map((s) => s.id));
  const isEnrolled = studentIds.has(user.id);

  // Global counts (staff/admin)
  const globalCounts = course.projects.reduce(
    (acc, p) => {
      acc.total += 1;
      acc[p.status] += 1;
      return acc;
    },
    { total: 0, NEW: 0, ACTIVE: 0, COMPLETED: 0, REJECTED: 0 } as Record<
      "total" | "NEW" | "ACTIVE" | "COMPLETED" | "REJECTED",
      number
    >
  );

  // Derived counts (student) – based on myStatus from the server
  const derivedCounts = course.projects.reduce(
    (acc, p) => {
      if (p.myStatus) {
        acc.total += 1;
        acc[p.myStatus] += 1 as any;
      }
      return acc;
    },
    { total: 0, new: 0, active: 0, completed: 0, rejected: 0 } as Record<
      "total" | "new" | "active" | "completed" | "rejected",
      number
    >
  );

  // What to show in the cards
  const projectsTotal = course.projects.length; // number of topics
  const activeCount = isStudent ? derivedCounts.active : globalCounts.ACTIVE;
  const completedCount = isStudent ? derivedCounts.completed : globalCounts.COMPLETED;

  return (
    <Layout userRole={roleLower}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {course.code} — {course.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">{course.department}</Badge>
              <span className="text-sm text-muted-foreground">
                Instructor: <span className="font-medium">{course.teacher?.name || "—"}</span>
              </span>
            </div>
          </div>

          {isStudent && (
            <Button
              className="bg-primary text-primary-foreground"
              disabled={isEnrolled || enroll.isPending}
              onClick={() => enroll.mutate(course.id)}
            >
              {isEnrolled ? "Already Enrolled" : enroll.isPending ? "Enrolling…" : "Enroll"}
            </Button>
          )}
        </div>

        {course.description && (
          <Card>
            <CardHeader>
              <CardTitle>About this course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Students</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{course.students.length}</div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Projects</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{projectsTotal}</div>
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{isStudent ? "My Active" : "Active"}</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{activeCount}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{isStudent ? "My Completed" : "Completed"}</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{completedCount}</CardContent>
          </Card>
        </div>

        {/* Projects list */}
        <Card>
          <CardHeader>
            <CardTitle>Projects in this course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {course.projects.length === 0 && (
              <div className="text-sm text-muted-foreground">No projects yet.</div>
            )}

            {course.projects.map((p) => {
              const badgeClass = isStudent ? badgeForDerived(p.myStatus) : badgeForGlobal(p.status);
              const badgeLabel = isStudent
                ? (p.myStatus ? p.myStatus.toUpperCase() : "NEW")
                : p.status;

              return (
                <div key={p.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{p.title}</span>
                      <Badge className={badgeClass}>{badgeLabel}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {p.deadline ? new Date(p.deadline).toLocaleDateString() : "No deadline"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isStudent) {
                          // IMPORTANT: open the student's OWN copy if it exists
                          const myId = p.myProjectId;
                          if (myId) {
                            navigate(`/students/${user.id}/projects/${myId}`);
                          } else {
                            // fallback: still no copy (e.g., not enrolled yet)
                            // keep the user in course page or you can disable the button
                          }
                        } else {
                          // staff/admin can open the template topic
                          navigate(`/projects/${p.id}`);
                        }
                      }}
                    >
                      {isStudent ? "Open My Project" : "View Project"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Students list (compact) */}
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {course.students.map((s) => (
              <div key={s.id} className="border rounded-md p-3">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.email}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}