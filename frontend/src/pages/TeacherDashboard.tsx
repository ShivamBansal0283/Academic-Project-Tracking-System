import * as React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import { useCourses } from "@/hooks/useApi";
import { useTeacherSubmissions } from "@/hooks/useApi";
import { Plus, FolderOpen, Users, BookOpen, CheckCircle } from "lucide-react";

const TeacherDashboard: React.FC = () => {

  const navigate = useNavigate();

  // who am i?
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  const meId = meQuery.data?.user?.id;
  const teacherBase = meId ? `/teachers/${meId}` : "";

  // courses I teach
  const { data: allCourses = [], isLoading: coursesLoading } = useCourses();
  const teacherCourses = React.useMemo(
    () => allCourses.filter((c) => c.teacherId === meId),
    [allCourses, meId]
  );

  // filters (string | undefined so placeholder can represent "All")
  const [courseId, setCourseId] = React.useState<string | undefined>(undefined);
  const [projectId, setProjectId] = React.useState<string | undefined>(undefined);
  const [q, setQ] = React.useState<string>("");

  // submissions
  const { data: submissions = [], isLoading: subsLoading } = useTeacherSubmissions({
    courseId,
    projectId,
    q: q.trim() || undefined,
  });

  // project options from current submissions (optionally scoped to course)
  const projectOptions = React.useMemo(() => {
    const byCourse = courseId ? submissions.filter((s) => s.course.id === courseId) : submissions;
    const map = new Map<string, { id: string; title: string }>();
    for (const s of byCourse) map.set(s.project.id, s.project);
    return Array.from(map.values());
  }, [submissions, courseId]);

  const loading = coursesLoading || meQuery.isLoading || subsLoading;

  // stats
  const uniqueStudentCount = React.useMemo(() => {
    const s = new Set<string>();
    for (const c of teacherCourses) for (const st of c.students) s.add(st.id);
    return s.size;
  }, [teacherCourses]);

  const pendingReviewCount = submissions.filter((t) => t.status === "SUBMITTED").length;
  const activeProjectCount = new Set(submissions.map((s) => s.project.id)).size;

  const stats = [
    { title: "Active Projects", value: activeProjectCount, icon: FolderOpen, color: "text-status-active" },
    { title: "Students Enrolled", value: uniqueStudentCount, icon: Users, color: "text-primary" },
    { title: "Courses Teaching", value: teacherCourses.length, icon: BookOpen, color: "text-secondary" },
    { title: "Pending Reviews", value: pendingReviewCount, icon: CheckCircle, color: "text-warning" },
  ];

  function resetFilters() {
    setCourseId(undefined);
    setProjectId(undefined);
    setQ("");
  }

  return (
    <Layout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Review student submissions and track progress across your courses.
            </p>
          </div>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => meId && navigate(`/teachers/${meId}/create-project`)}
            disabled={!meId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Topic
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "—" : stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Submissions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Course</label>
              <Select
                value={courseId}
                onValueChange={(v) => {
                  setCourseId(v);
                  setProjectId(undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  {/* NOTE: No "All" item; empty value is reserved */}
                  {teacherCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Project</label>
              <Select value={projectId} onValueChange={setProjectId} disabled={!projectOptions.length}>
                <SelectTrigger>
                  <SelectValue placeholder={projectOptions.length ? "All projects" : "No projects"} />
                </SelectTrigger>
                <SelectContent>
                  {/* NOTE: No "All" item; empty value is reserved */}
                  {projectOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Student</label>
              <Input placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions list */}
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {!loading && submissions.length === 0 && (
              <div className="text-sm text-muted-foreground">No submissions match your filters.</div>
            )}

            {!loading &&
              submissions.map((t) => (
                <div key={t.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{t.title}</span>
                      <Badge
                        className={
                          t.status === "SUBMITTED"
                            ? "bg-warning text-white"
                            : "bg-status-completed text-white"
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t.course.code} — {t.course.name} • {t.project.title}
                      {t.deadline ? ` • Due ${new Date(t.deadline).toLocaleDateString()}` : ""}
                      {t.team.memberCount ? ` • Team (${t.team.memberCount})` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/projects/${t.project.id}`)} // ⬅️ use global route
                    >
                      Open Project
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

export default TeacherDashboard;