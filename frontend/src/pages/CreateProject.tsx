import * as React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, CalendarDays, Weight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import { useCourses, useCreateProject } from "@/hooks/useApi";

interface Task {
  title: string;
  description: string;
  deadline: string; // yyyy-mm-dd
  weightage: number;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [deadline, setDeadline] = useState<string>(""); // yyyy-mm-dd
  const [tasks, setTasks] = useState<Task[]>([
    { title: "", description: "", deadline: "", weightage: 0 },
  ]);

  // data
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  const { data: allCourses, isLoading: coursesLoading } = useCourses();

  const userId = meQuery.data?.user?.id;
    const userRole = (meQuery.data?.user?.role ?? "TEACHER") as "STUDENT" | "TEACHER" | "ADMIN";

    
  const teacherCourses = React.useMemo(
    () => (allCourses || []).filter((c) => c.teacherId === userId),
    [allCourses, userId]
  );

  // mutation
  const createProject = useCreateProject();

  const addTask = () => {
    setTasks((t) => [...t, { title: "", description: "", deadline: "", weightage: 0 }]);
  };

  const removeTask = (index: number) => {
    setTasks((t) => (t.length > 1 ? t.filter((_, i) => i !== index) : t));
  };

  const updateTask = (index: number, field: keyof Task, value: string | number) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value as any } : t))
    );
  };

  const totalWeightage = tasks.reduce((sum, t) => sum + (Number(t.weightage) || 0), 0);

  // Convert yyyy-mm-dd to ISO (end of day UTC for convenience)
  function dateToIsoEndOfDay(d: string) {
    if (!d) return undefined;
    return new Date(`${d}T23:59:59.000Z`).toISOString();
  }

  const canSubmit =
    title.trim().length >= 3 &&
    description.trim().length >= 1 &&
    !!courseId &&
    !createProject.isPending;

  async function handleCreate() {
    if (!canSubmit) return;
    try {
      const result: any = await createProject.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        courseId,
        // departmentId omitted — server derives from course
        deadline: deadline ? dateToIsoEndOfDay(deadline) : undefined,
      });

      // ✅ Redirect to THIS teacher's dashboard (not /projects/:id)
      if (userRole === "TEACHER" && userId) {
        navigate(`/teachers/${userId}/dashboard`, { replace: true });
      } else {
        // Fallback (e.g., admin or missing id)
        navigate(`/teacher-dashboard`, { replace: true });
      }
    } catch {
      // toasts already handled in the mutation hook
    }
  }

  return (
    <Layout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Project Topic</h1>
            <p className="text-muted-foreground mt-1">
              Create a new project topic for your students to work on.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter project title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the project objectives, requirements, and expected outcomes..."
                    className="min-h-32"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select
                      value={courseId}
                      onValueChange={(v) => setCourseId(v)}
                      disabled={coursesLoading || !teacherCourses.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={coursesLoading ? "Loading…" : "Select course"} />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} — {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!teacherCourses.length && !coursesLoading && (
                      <p className="text-xs text-muted-foreground mt-1">
                        You don’t seem to be teaching any courses yet.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Project Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Section (UI only for now) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Tasks</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={totalWeightage === 100 ? "default" : "destructive"}>
                      Total: {totalWeightage}%
                    </Badge>
                    <Button onClick={addTask} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {tasks.map((task, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Task {index + 1}</h4>
                      {tasks.length > 1 && (
                        <Button
                          onClick={() => removeTask(index)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Task Title</Label>
                        <Input
                          value={task.title}
                          onChange={(e) => updateTask(index, "title", e.target.value)}
                          placeholder="Enter task title..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Task Description</Label>
                        <Textarea
                          value={task.description}
                          onChange={(e) => updateTask(index, "description", e.target.value)}
                          placeholder="Describe what students need to accomplish..."
                          className="min-h-20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            Deadline
                          </Label>
                          <Input
                            type="date"
                            value={task.deadline}
                            onChange={(e) => updateTask(index, "deadline", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <Weight className="h-4 w-4" />
                            Weightage (%)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={task.weightage || ""}
                            onChange={(e) =>
                              updateTask(index, "weightage", parseInt(e.target.value) || 0)
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {totalWeightage !== 100 && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning-foreground">
                      ⚠️ Total weightage should equal 100%. Current total: {totalWeightage}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Currently cosmetic; wire up later if you add fields server-side */}
                <div className="space-y-2">
                  <Label>Team Size</Label>
                  <Select defaultValue="3-4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-3">2-3 members</SelectItem>
                      <SelectItem value="3-4">3-4 members</SelectItem>
                      <SelectItem value="4-5">4-5 members</SelectItem>
                      <SelectItem value="5-6">5-6 members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Submission Type</Label>
                  <Select defaultValue="group">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group">Group Submission</SelectItem>
                      <SelectItem value="individual">Individual Submission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select defaultValue="course">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Course Students Only</SelectItem>
                      <SelectItem value="department">Department Wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tasks</span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Weightage</span>
                  <span
                    className={`font-medium ${
                      totalWeightage === 100 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {totalWeightage}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={handleCreate}
                disabled={!canSubmit}
              >
                {createProject.isPending ? "Creating…" : "Create Project Topic"}
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Save as Draft
              </Button>
              {!canSubmit && (
                <p className="text-xs text-muted-foreground text-center">
                  Enter title, description, and choose a course to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;