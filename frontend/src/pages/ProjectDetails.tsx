import * as React from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import { useProject } from "@/hooks/useApi";

type TaskLike = {
  id: string;
  title: string;
  description?: string | null;
  deadline?: string | Date | null;
  weightage?: number | null;
  status?: string | null;
  grade?: number | null;
  submittedAt?: string | Date | null;
};

function lc(s?: string | null, fb = "") {
  return String(s ?? fb).toLowerCase();
}
function statusBadgeClass(s: string) {
  switch (s) {
    case "new": return "bg-status-new text-white";
    case "active": return "bg-status-active text-white";
    case "completed": return "bg-status-completed text-white";
    case "rejected": return "bg-status-rejected text-white";
    default: return "bg-muted text-muted-foreground";
  }
}
function normalizeTaskStatus(s?: string | null): "completed" | "submitted" | "in_progress" | "pending" {
  const u = String(s ?? "").toUpperCase();
  if (u === "COMPLETED") return "completed";
  if (u === "SUBMITTED") return "submitted";
  if (u === "IN_PROGRESS") return "in_progress";
  return "pending";
}
function taskStatusClass(s: ReturnType<typeof normalizeTaskStatus>) {
  switch (s) {
    case "completed": return "bg-status-completed text-white";
    case "submitted": return "bg-warning text-warning-foreground";
    case "in_progress": return "bg-status-active text-white";
    default: return "bg-muted text-muted-foreground";
  }
}
function taskStatusIcon(s: ReturnType<typeof normalizeTaskStatus>) {
  switch (s) {
    case "completed": return <CheckCircle2 className="h-4 w-4" />;
    case "submitted": return <Clock className="h-4 w-4" />;
    case "in_progress": return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

const ProjectDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id: routeUserId, projectId } = useParams<{ id?: string; projectId?: string }>();

  // hooks first
  const [tab, setTab] = React.useState<"overview" | "tasks" | "submissions">("overview");
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  const projectQuery = useProject(projectId || "");

  if (meQuery.isError) return <Navigate to="/login" replace />;

  const user = meQuery.data?.user;
  const roleLower = lc(user?.role, "student") as "student" | "teacher" | "admin";

  if (user?.role === "STUDENT" && routeUserId && routeUserId !== user.id) {
    return <Navigate to={`/students/${user.id}/projects/${projectId}`} replace />;
  }

  if (meQuery.isLoading || projectQuery.isLoading) {
    return (
      <Layout userRole={roleLower}>
        <div className="p-6">Loading project…</div>
      </Layout>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <Layout userRole={roleLower}>
        <div className="p-6 text-sm text-muted-foreground">Project not found.</div>
      </Layout>
    );
  }

  const p: any = projectQuery.data;
  const title: string = p.title;
  const courseName: string = p?.course?.name ?? p.course ?? "";
  const departmentName: string = p?.department?.name ?? p.department ?? "";
  const statusLower = lc(p.status, "new");
  const deadline = p.deadline ? new Date(p.deadline) : null;

  const teamMembers: Array<{ name: string; avatar?: string | null }> =
    p?.team?.members?.map((m: any) => ({
      name: m?.user?.name ?? m?.user?.email ?? "Member",
      avatar: m?.user?.avatarUrl ?? null,
    })) ?? p.teamMembers ?? [];

  const tasks: TaskLike[] = Array.isArray(p?.tasks) ? p.tasks : [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => String(t.status).toUpperCase() === "COMPLETED").length;
  const progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const onOpenTask = (taskId: string) => {
    if (user?.role === "STUDENT" && user.id) {
      navigate(`/students/${user.id}/tasks/${taskId}`);
    } else {
      navigate(`/tasks/${taskId}`);
    }
  };

  return (
    <Layout userRole={roleLower}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1">
              {courseName} {departmentName ? `• ${departmentName}` : ""}
            </p>
          </div>
          <Badge className={statusBadgeClass(statusLower)}>
            {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6">
                {p.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{p.description}</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{progressPct}%</span>
                      </div>
                      <Progress value={progressPct} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-status-completed">{completedTasks}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{totalTasks - completedTasks}</p>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks */}
              <TabsContent value="tasks" className="space-y-4">
                {tasks.length === 0 && (
                  <Card>
                    <CardContent className="py-6 text-sm text-muted-foreground">No tasks yet.</CardContent>
                  </Card>
                )}

                {tasks.map((t) => {
                  const normalized = normalizeTaskStatus(t.status);
                  const due = t.deadline ? new Date(t.deadline) : null;
                  return (
                    <Card key={t.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{t.title}</h3>
                              <Badge className={taskStatusClass(normalized)}>
                                {taskStatusIcon(normalized)}
                                <span className="ml-1">{normalized.replace("_", " ")}</span>
                              </Badge>
                            </div>
                            {t.description && (
                              <p className="text-sm text-muted-foreground">{t.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              {due && <span>Due: {due.toLocaleDateString()}</span>}
                              {typeof t.weightage === "number" && <span>Weight: {t.weightage}%</span>}
                              {typeof t.grade === "number" && <span>Grade: {t.grade}%</span>}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => onOpenTask(t.id)}>
                            Open Task
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Submissions */}
              <TabsContent value="submissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks
                        .filter((t) => !!t.submittedAt)
                        .map((t) => (
                          <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{t.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Submitted on {new Date(t.submittedAt as any).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              {typeof t.grade === "number" ? (
                                <Badge className="bg-status-completed text-white">{t.grade}%</Badge>
                              ) : (
                                <Badge variant="outline">Pending Review</Badge>
                              )}
                            </div>
                          </div>
                        ))}

                      {tasks.filter((t) => !!t.submittedAt).length === 0 && (
                        <p className="text-sm text-muted-foreground">No submissions yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {deadline ? deadline.toLocaleDateString() : "No deadline set"}
                    </p>
                  </div>
                </div>

                {courseName && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 opacity-0" />
                    <div>
                      <p className="text-sm font-medium">Course</p>
                      <p className="text-sm text-muted-foreground">{courseName}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No team members yet</p>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={m.avatar ?? undefined} />
                          <AvatarFallback>
                            {m.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button className="w-full bg-primary text-primary-foreground" onClick={() => setTab("tasks")}>
                View All Tasks
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Team Discussion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetails;