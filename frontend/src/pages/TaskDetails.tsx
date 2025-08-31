// import * as React from "react";
// import Layout from "@/components/layout/Layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Textarea } from "@/components/ui/textarea";
// import { CalendarDays, Clock, Weight, Upload, CheckCircle2, AlertCircle, X } from "lucide-react";
// import { useParams, Navigate, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { me } from "@/api/auth";
// import { useTask, useSubmitTask, useMyTeams } from "@/hooks/useApi";

// type Normalized = "completed" | "submitted" | "evaluated" | "in_progress" | "pending";

// function normalizeStatus(s?: string | null): Normalized {
//   const u = String(s ?? "").toUpperCase();
//   if (u === "COMPLETED") return "completed";
//   if (u === "SUBMITTED") return "submitted";
//   if (u === "EVALUATED") return "evaluated";
//   if (u === "IN_PROGRESS") return "in_progress";
//   return "pending";
// }
// function statusBadgeClass(s: Normalized) {
//   switch (s) {
//     case "completed":
//     case "evaluated":
//       return "bg-status-completed text-white";
//     case "submitted":
//       return "bg-warning text-warning-foreground";
//     case "in_progress":
//       return "bg-status-active text-white";
//     default:
//       return "bg-muted text-muted-foreground";
//   }
// }
// function statusIcon(s: Normalized) {
//   switch (s) {
//     case "completed":
//     case "evaluated":
//       return <CheckCircle2 className="h-4 w-4" />;
//     case "submitted":
//       return <Clock className="h-4 w-4" />;
//     case "in_progress":
//       return <AlertCircle className="h-4 w-4" />;
//     default:
//       return <Clock className="h-4 w-4" />;
//   }
// }
// function lc<T extends string>(s?: T | null, fb: T = "" as T): T {
//   return String(s ?? fb).toLowerCase() as T;
// }
// function formatBytes(n: number) {
//   if (!Number.isFinite(n)) return "";
//   const u = ["B", "KB", "MB", "GB"];
//   let i = 0;
//   while (n >= 1024 && i < u.length - 1) {
//     n /= 1024;
//     i++;
//   }
//   return `${n.toFixed(1)} ${u[i]}`;
// }

// const TaskDetails: React.FC = () => {
//   const navigate = useNavigate();
//   const { id: routeUserId, taskId } = useParams<{ id?: string; taskId?: string }>();

//   // hooks (always)
//   const [notes, setNotes] = React.useState("");
//   const [files, setFiles] = React.useState<File[]>([]);
//   const [dragOver, setDragOver] = React.useState(false);
//   const fileInputRef = React.useRef<HTMLInputElement | null>(null);

//   const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
//   const taskQuery = useTask(taskId || "");
//   const myTeamsQuery = useMyTeams(); // used for hints / team inference
//   const submitTask = useSubmitTask();

//   const user = meQuery.data?.user;
//   const roleLower = lc<"student" | "teacher" | "admin">((user?.role?.toLowerCase() as any) || "student", "student");

//   // guards
//   if (meQuery.isError) return <Navigate to="/login" replace />;
//   if (user?.role === "STUDENT" && routeUserId && routeUserId !== user.id) {
//     return <Navigate to={`/students/${user.id}/tasks/${taskId}`} replace />;
//   }
//   if (meQuery.isLoading || taskQuery.isLoading) {
//     return (
//       <Layout userRole={roleLower}>
//         <div className="p-6">Loading task…</div>
//       </Layout>
//     );
//   }
//   if (taskQuery.isError || !taskQuery.data) {
//     return (
//       <Layout userRole={roleLower}>
//         <div className="p-6 text-sm text-muted-foreground">Task not found.</div>
//       </Layout>
//     );
//   }

//   const t = taskQuery.data as any;
//   const normalized = normalizeStatus(t.status);
//   const deadline = t.deadline ? new Date(t.deadline) : null;

//   // infer team for hints (not to gate the button)
//   const inferredTeamId = myTeamsQuery.data?.find((tm) => tm.projectId === t.projectId)?.id;
//   const teamId: string | undefined = t.teamId ?? inferredTeamId;

//   // ONLY gate by task status (as requested)
//   const isClosed = normalized === "submitted" || normalized === "completed" || normalized === "evaluated";

//   // file handling
//   const addFiles = (list: FileList | File[]) => {
//     const incoming = Array.from(list);
//     const key = (f: File) => `${f.name}_${f.size}_${f.lastModified}`;
//     const prev = new Set(files.map(key));
//     setFiles([...files, ...incoming.filter((f) => !prev.has(key(f)))]);
//   };
//   const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) addFiles(e.target.files);
//     e.target.value = "";
//   };
//   const onChooseFiles = () => fileInputRef.current?.click();
//   const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
//   const onDragLeave = () => setDragOver(false);
//   const onDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(false);
//     if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
//   };
//   const removeFile = (idx: number) => setFiles((arr) => arr.filter((_, i) => i !== idx));

//   const onSubmit = async () => {
//     if (!taskId) return;

//     // If not on a team, nudge to Projects to form one (and auto-open the dialog)
//     if (!teamId) {
//       if (user?.role === "STUDENT" && user.id && t.projectId) {
//         navigate(`/students/${user.id}/projects`, { state: { openFormForProjectId: t.projectId } });
//       }
//       return;
//     }

//     try {
//       await submitTask.mutateAsync({ taskId, teamId, notes, files });
//       setNotes("");
//       setFiles([]);
//     } catch {}
//   };

//   return (
//     <Layout userRole={roleLower}>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
//             <p className="text-muted-foreground mt-1">Task details and submission</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <Badge className={statusBadgeClass(normalized)}>
//             {statusIcon(normalized)}
//             <span className="ml-1 capitalize">{normalized.replace("_", " ")}</span>
//           </Badge>
//           {!teamId && (
//             <span className="text-xs text-muted-foreground">
//               Join or form a team for this project to submit.
//             </span>
//           )}
//         </div>

//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* Left */}
//           <div className="lg:col-span-2 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Task Description</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-muted-foreground leading-relaxed">{t.description || "No description provided."}</p>
//               </CardContent>
//             </Card>

//             {/* Submission */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Submit Your Work</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   multiple
//                   className="hidden"
//                   onChange={onFileInputChange}
//                 />

//                 <div
//                   onDragOver={onDragOver}
//                   onDragLeave={onDragLeave}
//                   onDrop={onDrop}
//                   className={[
//                     "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
//                     dragOver ? "border-primary bg-primary/5" : "border-border",
//                     isClosed ? "opacity-60" : "",
//                   ].join(" ")}
//                   title={isClosed ? "This task is already submitted or completed." : undefined}
//                 >
//                   <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
//                   <p className="text-sm text-muted-foreground mb-2">
//                     Drag and drop files here, or click to browse
//                   </p>
//                   <Button variant="outline" size="sm" onClick={onChooseFiles} type="button">
//                     Choose Files
//                   </Button>
//                 </div>

//                 {files.length > 0 && (
//                   <div className="space-y-2">
//                     <p className="text-sm font-medium">Files to upload</p>
//                     <ul className="space-y-2">
//                       {files.map((f, i) => (
//                         <li key={`${f.name}_${f.size}_${f.lastModified}`} className="flex items-center justify-between gap-3 border rounded-md px-3 py-2">
//                           <div className="truncate">
//                             <span className="font-medium truncate">{f.name}</span>
//                             <span className="ml-2 text-xs text-muted-foreground">({formatBytes(f.size)})</span>
//                           </div>
//                           <Button variant="ghost" size="icon" onClick={() => removeFile(i)} aria-label="Remove file" type="button">
//                             <X className="h-4 w-4" />
//                           </Button>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Submission Notes</label>
//                   <Textarea
//                     placeholder="Add any notes or explanations about your submission..."
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     className="min-h-24"
//                     disabled={isClosed}
//                   />
//                 </div>

//                 <Button
//                   className="w-full bg-primary text-primary-foreground"
//                   onClick={onSubmit}
//                   type="button"
//                   disabled={isClosed || submitTask.isPending}
//                   title={isClosed ? "This task is already submitted or completed." : undefined}
//                 >
//                   {submitTask.isPending ? "Submitting…" : "Submit Task"}
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right */}
//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Task Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <CalendarDays className="h-5 w-5 text-muted-foreground" />
//                   <div>
//                     <p className="text-sm font-medium">Deadline</p>
//                     <p className="text-sm text-muted-foreground">{deadline ? deadline.toLocaleDateString() : "No deadline set"}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <Weight className="h-5 w-5 text-muted-foreground" />
//                   <div>
//                     <p className="text-sm font-medium">Weightage</p>
//                     <p className="text-sm text-muted-foreground">
//                       {typeof t.weightage === "number" ? `${t.weightage}% of total grade` : "—"}
//                     </p>
//                   </div>
//                 </div>

//                 {typeof t.grade === "number" && (
//                   <div className="pt-2 border-t">
//                     <p className="text-sm font-medium mb-2">Your Grade</p>
//                     <div className="flex items-center gap-2">
//                       <Progress value={t.grade} className="flex-1" />
//                       <span className="text-sm font-medium">{t.grade}%</span>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             <Button
//               variant="outline"
//               className="w-full"
//               onClick={() => {
//                 if (user?.role === "STUDENT" && user.id && t.projectId) {
//                   navigate(`/students/${user.id}/projects/${t.projectId}`);
//                 } else if (t.projectId) {
//                   navigate(`/projects/${t.projectId}`);
//                 } else {
//                   navigate(-1);
//                 }
//               }}
//               type="button"
//             >
//               Back to Project
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default TaskDetails;

























import * as React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, Weight, Upload, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import { useTask, useSubmitTask, useMyTeams } from "@/hooks/useApi";

type Normalized = "completed" | "submitted" | "evaluated" | "in_progress" | "pending";

function normalizeStatus(s?: string | null): Normalized {
  const u = String(s ?? "").toUpperCase();
  if (u === "COMPLETED") return "completed";
  if (u === "SUBMITTED") return "submitted";
  if (u === "EVALUATED") return "evaluated";
  if (u === "IN_PROGRESS") return "in_progress";
  return "pending";
}
function statusBadgeClass(s: Normalized) {
  switch (s) {
    case "completed":
    case "evaluated":
      return "bg-status-completed text-white";
    case "submitted":
      return "bg-warning text-warning-foreground";
    case "in_progress":
      return "bg-status-active text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}
function statusIcon(s: Normalized) {
  switch (s) {
    case "completed":
    case "evaluated":
      return <CheckCircle2 className="h-4 w-4" />;
    case "submitted":
      return <Clock className="h-4 w-4" />;
    case "in_progress":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}
function lc<T extends string>(s?: T | null, fb: T = "" as T): T {
  return String(s ?? fb).toLowerCase() as T;
}
function formatBytes(n: number) {
  if (!Number.isFinite(n)) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${u[i]}`;
}

const TaskDetails: React.FC = () => {
  const navigate = useNavigate();

  // Params support BOTH shapes:
  // - /students/:id/tasks/:taskId  (student scoped)
  // - /tasks/:id                   (global/teacher)
  const { id: idParam, taskId: taskIdParamRaw } = useParams<{ id?: string; taskId?: string }>();
  const isStudentScoped = Boolean(taskIdParamRaw);
  const studentIdParam = isStudentScoped ? idParam : undefined;
  const taskId = isStudentScoped ? taskIdParamRaw! : idParam!; // <-- the important bit

  // local state
  const [notes, setNotes] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // queries
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  const taskQuery = useTask(taskId || "");
  const myTeamsQuery = useMyTeams();
  const submitTask = useSubmitTask();

  const user = meQuery.data?.user;
  const roleLower = lc<"student" | "teacher" | "admin">((user?.role?.toLowerCase() as any) || "student", "student");

  // guards
  if (meQuery.isError) return <Navigate to="/login" replace />;

  // Only enforce student id matching on the student-scoped route
  if (user?.role === "STUDENT" && isStudentScoped && studentIdParam && studentIdParam !== user.id) {
    return <Navigate to={`/students/${user.id}/tasks/${taskId}`} replace />;
  }

  if (meQuery.isLoading || taskQuery.isLoading) {
    return (
      <Layout userRole={roleLower}>
        <div className="p-6">Loading task…</div>
      </Layout>
    );
  }
  if (taskQuery.isError || !taskQuery.data) {
    return (
      <Layout userRole={roleLower}>
        <div className="p-6 text-sm text-muted-foreground">Task not found.</div>
      </Layout>
    );
  }

  const t = taskQuery.data as any;
  const normalized = normalizeStatus(t.status);
  const deadline = t.deadline ? new Date(t.deadline) : null;

  // infer team for hints (not to gate the button)
  const inferredTeamId = myTeamsQuery.data?.find((tm) => tm.projectId === t.projectId)?.id;
  const teamId: string | undefined = t.teamId ?? inferredTeamId;

  // gate by status (teachers will simply see it read-only)
  const isClosed =
    normalized === "submitted" || normalized === "completed" || normalized === "evaluated";

  // file helpers
  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    const key = (f: File) => `${f.name}_${f.size}_${f.lastModified}`;
    const prev = new Set(files.map(key));
    setFiles([...files, ...incoming.filter((f) => !prev.has(key(f)))]);
  };
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };
  const onChooseFiles = () => fileInputRef.current?.click();
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };
  const removeFile = (idx: number) => setFiles((arr) => arr.filter((_, i) => i !== idx));

  const onSubmit = async () => {
    if (!taskId) return;

    // If not on a team, nudge to Projects to form one (student only)
    if (!teamId) {
      if (user?.role === "STUDENT" && user.id && t.projectId) {
        navigate(`/students/${user.id}/projects`, { state: { openFormForProjectId: t.projectId } });
      }
      return;
    }

    try {
      await submitTask.mutateAsync({ taskId, teamId, notes, files });
      setNotes("");
      setFiles([]);
    } catch {}
  };

  return (
    <Layout userRole={roleLower}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground mt-1">Task details and submission</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={statusBadgeClass(normalized)}>
            {statusIcon(normalized)}
            <span className="ml-1 capitalize">{normalized.replace("_", " ")}</span>
          </Badge>
          {!teamId && (
            <span className="text-xs text-muted-foreground">
              Join or form a team for this project to submit.
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {/* Submission */}
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onFileInputChange}
                />

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={[
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragOver ? "border-primary bg-primary/5" : "border-border",
                    isClosed ? "opacity-60" : "",
                  ].join(" ")}
                  title={isClosed ? "This task is already submitted or completed." : undefined}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <Button variant="outline" size="sm" onClick={onChooseFiles} type="button">
                    Choose Files
                  </Button>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Files to upload</p>
                    <ul className="space-y-2">
                      {files.map((f, i) => (
                        <li
                          key={`${f.name}_${f.size}_${f.lastModified}`}
                          className="flex items-center justify-between gap-3 border rounded-md px-3 py-2"
                        >
                          <div className="truncate">
                            <span className="font-medium truncate">{f.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({formatBytes(f.size)})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(i)}
                            aria-label="Remove file"
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Submission Notes</label>
                  <Textarea
                    placeholder="Add any notes or explanations about your submission..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-24"
                    disabled={isClosed}
                  />
                </div>

                <Button
                  className="w-full bg-primary text-primary-foreground"
                  onClick={onSubmit}
                  type="button"
                  disabled={isClosed || submitTask.isPending}
                  title={isClosed ? "This task is already submitted or completed." : undefined}
                >
                  {submitTask.isPending ? "Submitting…" : "Submit Task"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Information</CardTitle>
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

                <div className="flex items-center gap-3">
                  <Weight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Weightage</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof t.weightage === "number" ? `${t.weightage}% of total grade` : "—"}
                    </p>
                  </div>
                </div>

                {typeof t.grade === "number" && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Your Grade</p>
                    <div className="flex items-center gap-2">
                      <Progress value={t.grade} className="flex-1" />
                      <span className="text-sm font-medium">{t.grade}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (user?.role === "STUDENT" && user.id && t.projectId && isStudentScoped) {
                  navigate(`/students/${user.id}/projects/${t.projectId}`);
                } else if (t.projectId) {
                  navigate(`/projects/${t.projectId}`);
                } else {
                  navigate(-1);
                }
              }}
              type="button"
            >
              Back to Project
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskDetails;