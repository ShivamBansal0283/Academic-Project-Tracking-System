import * as React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar } from "lucide-react";
import { useCourses, useEnrollInCourse } from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import { Navigate, useNavigate } from "react-router-dom";

type RoleLower = "student" | "teacher" | "admin";
const lc = (s?: string): RoleLower =>
  (String(s ?? "").toLowerCase() as RoleLower) || "student";

const Courses: React.FC = () => {
  const navigate = useNavigate();

  // who am I
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  if (meQuery.isLoading) return <div className="p-6">Loading…</div>;
  if (meQuery.isError) return <Navigate to="/login" replace />;

  const user = meQuery.data!.user;
  const roleLower = lc(user.role);

  // data
  const { data: courses, isLoading: coursesLoading, isError } = useCourses();
  const enrollMutation = useEnrollInCourse();

  const handleEnrollment = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  return (
    <Layout userRole={roleLower}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {roleLower === "student" ? "Courses" : "All Courses"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse courses and enroll (students) or review (staff).
            </p>
          </div>
        </div>

        {/* Loading / error / empty states */}
        {coursesLoading && (
          <div className="text-sm text-muted-foreground">Loading courses…</div>
        )}
        {isError && (
          <div className="text-sm text-destructive">Failed to load courses.</div>
        )}
        {!coursesLoading && !isError && (!courses || courses.length === 0) && (
          <div className="text-sm text-muted-foreground">No courses found.</div>
        )}

        {/* Courses grid */}
        {!coursesLoading && !isError && courses && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const enrolled =
                roleLower === "student" &&
                course.students?.some((s) => s.id === user.id);

              return (
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-shadow animate-fade-in"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">
                          {course.code} — {course.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{course.department}</Badge>
                          {enrolled && <Badge>Enrolled</Badge>}
                        </div>
                      </div>
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Instructor</span>
                        <span className="font-medium">
                          {course.teacher?.name || "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Students</span>
                        </div>
                        <span className="font-medium">
                          {course.students?.length ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        View Course Details
                      </Button>

                      {roleLower === "student" && (
                        <Button
                          className="w-full bg-primary text-primary-foreground"
                          disabled={enrolled || enrollMutation.isPending}
                          onClick={() => handleEnrollment(course.id)}
                        >
                          {enrolled
                            ? "Already Enrolled"
                            : enrollMutation.isPending
                              ? "Enrolling…"
                              : "Enroll"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Optional: static schedule block */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              This Week's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">EEE101 — Digital Systems</p>
                  <p className="text-sm text-muted-foreground">
                    Monday, 10:00 AM – 12:00 PM
                  </p>
                </div>
                <Badge>Today</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium">EEE201 — Power Electronics</p>
                  <p className="text-sm text-muted-foreground">
                    Wednesday, 2:00 PM – 4:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium">CSE101 — Data Structures</p>
                  <p className="text-sm text-muted-foreground">
                    Friday, 9:00 AM – 11:00 AM
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Courses;