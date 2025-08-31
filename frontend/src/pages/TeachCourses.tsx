// src/pages/TeacherCourses.tsx
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { me } from "@/api/auth";
import { useCourses } from "@/hooks/useApi";
import { BookOpen, Users } from "lucide-react";

const TeacherCourses: React.FC = () => {
  const navigate = useNavigate();
  const { id: routeTeacherId } = useParams<{ id: string }>();

  // who am i?
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  const myId = meQuery.data?.user?.id;

  // all courses → filter to mine
  const { data: allCourses, isLoading } = useCourses();
  const teacherId = routeTeacherId || myId || "";
  const myCourses = React.useMemo(
    () => (allCourses || []).filter((c) => c.teacherId === teacherId),
    [allCourses, teacherId]
  );

  return (
    <Layout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
            <p className="text-muted-foreground mt-1">
              Courses you teach. Click a course to see details and projects.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Courses</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{isLoading ? "—" : myCourses.length}</div>
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoading
                  ? "—"
                  : new Set(myCourses.flatMap((c) => c.students.map((s) => s.id))).size}
              </div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Courses you teach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {!isLoading && myCourses.length === 0 && (
              <div className="text-sm text-muted-foreground">No courses assigned to you yet.</div>
            )}

            {!isLoading &&
              myCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between border rounded-md px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {course.code} — {course.name}
                      </span>
                      <Badge variant="secondary">{course.department}</Badge>
                    </div>
                    {course.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{course.students.length} students</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherCourses;