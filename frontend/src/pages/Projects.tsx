


// src/pages/Projects.tsx
// import * as React from "react";
// import Layout from "@/components/layout/Layout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import StatusTabs from "@/components/projects/StatusTabs";
// import { useMyProjects, useMyCourses } from "@/hooks/useApi";
// import { useTeacherSubmissions } from "@/hooks/useApi";
// import { Search, Filter, Plus } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { me } from "@/api/auth";
// import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
// import FormTeamDialog from "../components/teams/FormTeamDailog";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";

// /* -------------------- shared helpers -------------------- */


// type Groups<T> = { new: T[]; active: T[]; completed: T[]; rejected: T[] };

// function filterGroupsByCourse<T extends { course?: string }>(
//   groups: Groups<T>,
//   courseName?: string | null
// ): Groups<T> {
//   if (!courseName || courseName === "ALL") return groups;
//   const pick = (arr: T[]) => arr.filter((p) => (p.course ?? "") === courseName);
//   return {
//     new: pick(groups.new),
//     active: pick(groups.active),
//     completed: pick(groups.completed),
//     rejected: pick(groups.rejected),
//   };
// }

// async function evaluateSubmission(submissionId: string, grade: number, feedback?: string) {
//   const res = await fetch(`/api/submissions/${submissionId}/evaluate`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ grade, feedback }),
//   });
//   if (!res.ok) throw new Error("Failed to evaluate submission");
//   return res.json();
// }

// /* -------------------- student subpage -------------------- */
// const StudentProjects: React.FC<{ userId: string }> = ({ userId }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { data: groupedRaw, isLoading: loadingProjects, refetch } = useMyProjects();
//   const groups = groupedRaw ?? { new: [], active: [], completed: [], rejected: [] };

//   const { data: myCourses } = useMyCourses();

//   const [courseFilter, setCourseFilter] = React.useState<string>("ALL");
//   const selectedCourseName =
//     courseFilter === "ALL"
//       ? "ALL"
//       : myCourses?.find((c) => c.id === courseFilter)?.name ?? "ALL";

//   const filteredGroups = filterGroupsByCourse(groups, selectedCourseName);

//   // Form Team
//   const [formTeamOpen, setFormTeamOpen] = React.useState(false);
//   const [formTeamProjectId, setFormTeamProjectId] = React.useState<string | null>(null);
//   const openFormTeam = (projectId: string) => {
//     setFormTeamProjectId(projectId);
//     setFormTeamOpen(true);
//   };

//   // handle deep link from TaskDetails
//   React.useEffect(() => {
//     const st = location.state as { openFormForProjectId?: string } | undefined;
//     if (st?.openFormForProjectId) {
//       openFormTeam(st.openFormForProjectId);
//       navigate(location.pathname, { replace: true, state: {} });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.state]);

//   const onAction = (projectId: string, action: string) => {
//     if (action === "formTeam") {
//       openFormTeam(projectId);
//       return;
//     }
//     navigate(`/students/${userId}/projects/${projectId}`);
//   };

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
//           <p className="text-muted-foreground mt-1">Manage and track all your academic projects.</p>
//         </div>
//         <Button className="bg-primary text-primary-foreground">
//           <Plus className="h-4 w-4 mr-2" />
//           Join Project
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
//           <Input placeholder="Search projects..." className="pl-10" />
//         </div>

//         <Select value={courseFilter} onValueChange={setCourseFilter}>
//           <SelectTrigger className="w-56">
//             <SelectValue placeholder="Filter by course" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="ALL">All Courses</SelectItem>
//             {(myCourses ?? []).map((c) => (
//               <SelectItem key={c.id} value={c.id}>
//                 {c.code ? `${c.code} — ${c.name}` : c.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Button variant="outline">
//           <Filter className="h-4 w-4 mr-2" />
//           More Filters
//         </Button>
//       </div>

//       {/* Projects */}
//       <StatusTabs
//         projects={filteredGroups}
//         onProjectAction={onAction}
//         userRole="student"
//       />

//       {loadingProjects && <div className="text-sm text-muted-foreground">Refreshing…</div>}

//       {/* Dialog */}
//       {formTeamProjectId && (
//         <FormTeamDialog
//           open={formTeamOpen}
//           onOpenChange={setFormTeamOpen}
//           projectId={formTeamProjectId}
//           leaderId={userId}
//           onCreated={() => {
//             setFormTeamProjectId(null);
//             refetch();
//           }}
//         />
//       )}
//     </>
//   );
// };

// /* -------------------- teacher subpage -------------------- */
// const TeacherSubmissions: React.FC<{ userId: string }> = ({ userId }) => {
//   const navigate = useNavigate();
//   const qc = useQueryClient();


//   // filters – always non-empty strings
//   const [courseId, setCourseId] = React.useState("ALL");
//   const [projectId, setProjectId] = React.useState("ALL");
//   const [q, setQ] = React.useState("");

//   // call the hook with a single filter object (no second arg)
//   const { data: submissions = [], isLoading } = useTeacherSubmissions({
//     courseId: courseId === "ALL" ? undefined : courseId,
//     projectId: projectId === "ALL" ? undefined : projectId,
//     q: q.trim() || undefined,
//   });

//   // derive options from data
//   const courseOptions = React.useMemo(() => {
//     const map = new Map<string, { id: string; code: string; name: string }>();
//     for (const s of submissions) map.set(s.course.id, s.course);
//     return Array.from(map.values());
//   }, [submissions]);

//   const projectOptions = React.useMemo(() => {
//     const filtered =
//       courseId === "ALL" ? submissions : submissions.filter((s) => s.course.id === courseId);
//     const map = new Map<string, { id: string; title: string }>();
//     for (const s of filtered) map.set(s.project.id, s.project);
//     return Array.from(map.values());
//   }, [submissions, courseId]);

//   const clear = () => {
//     setCourseId("ALL");
//     setProjectId("ALL");
//     setQ("");
//   };

//   // evaluate dialog
//   const [open, setOpen] = React.useState(false);
//   const [subj, setSubj] = React.useState<{ id: string; title: string; team: string } | null>(null);
//   const [grade, setGrade] = React.useState<number | "">("");
//   const [feedback, setFeedback] = React.useState("");

//   const openEval = (s: any) => {
//     setSubj({
//       id: s.id,
//       title: s.title,
//       team: s.team?.members?.map((m: any) => m.name || m.email).join(", ") || "Team",
//     });
//     setGrade(typeof s.grade === "number" ? s.grade : "");
//     setFeedback(s.feedback || "");
//     setOpen(true);
//   };

//   const evalMutation = useMutation({
//     mutationFn: async () => {
//       if (!subj || grade === "") throw new Error("Grade is required");
//       return evaluateSubmission(subj.id, Number(grade), feedback || undefined);
//     },
//     onSuccess: () => {
//       setOpen(false);
//       qc.invalidateQueries({ queryKey: ["teacher-submissions"] });
//     },
//   });

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Project Submissions</h1>
//           <p className="text-muted-foreground mt-1">
//             Review and evaluate student submissions across your courses.
//           </p>
//         </div>

//         <Button
//           className="bg-primary text-primary-foreground"
//           onClick={() => navigate(`/teachers/${userId}/create-project`)}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Create Topic
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-card p-4 rounded-lg border">
//         <div className="space-y-1">
//           <label className="text-sm text-muted-foreground">Course</label>
//           <Select
//             value={courseId}
//             onValueChange={(v) => {
//               setCourseId(v);
//               setProjectId("ALL");
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="All courses" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="ALL">All Courses</SelectItem>
//               {courseOptions.map((c) => (
//                 <SelectItem key={c.id} value={c.id}>
//                   {c.code ? `${c.code} — ${c.name}` : c.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-1">
//           <label className="text-sm text-muted-foreground">Project</label>
//           <Select
//             value={projectId}
//             onValueChange={setProjectId}
//             disabled={!projectOptions.length}
//           >
//             <SelectTrigger>
//               <SelectValue
//                 placeholder={projectOptions.length ? "All projects" : "No projects"}
//               />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="ALL">All Projects</SelectItem>
//               {projectOptions.map((p) => (
//                 <SelectItem key={p.id} value={p.id}>
//                   {p.title}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-1">
//           <label className="text-sm text-muted-foreground">Student</label>
//           <Input
//             placeholder="Search name or email…"
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//           />
//         </div>

//         <div className="flex items-end">
//           <Button variant="outline" className="w-full" onClick={clear}>
//             Clear
//           </Button>
//         </div>
//       </div>

//       {/* List */}
//       <div className="space-y-3">
//         {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
//         {!isLoading && submissions.length === 0 && (
//           <div className="text-sm text-muted-foreground">No submissions match your filters.</div>
//         )}
//         {!isLoading &&
//           submissions.map((s) => (
//             <div
//               key={s.id}
//               className="flex items-center justify-between border rounded-md px-3 py-2"
//             >
//               <div className="min-w-0">
//                 <div className="font-medium truncate">{s.title}</div>
//                 <div className="text-xs text-muted-foreground mt-1">
//                   {s.course.code} — {s.course.name} • {s.project.title}
//                   {s.deadline ? ` • Due ${new Date(s.deadline).toLocaleDateString()}` : ""}
//                   {s.team.memberCount ? ` • Team (${s.team.memberCount})` : ""}
//                 </div>
//                 {s.team.members?.length ? (
//                   <div className="text-xs text-muted-foreground mt-1 truncate">
//                     {s.team.members.map((m: any) => m.name || m.email).join(", ")}
//                   </div>
//                 ) : null}
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => navigate(`/teachers/${userId}/projects/${s.project.id}`)}
//                 >
//                   Open Project
//                 </Button>
//                 <Button size="sm" onClick={() => openEval(s)}>Evaluate</Button>
//               </div>
//             </div>
//           ))}
//       </div>

//       {/* Evaluate dialog */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Evaluate submission</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <div className="text-sm">
//               <div className="font-medium">{subj?.title}</div>
//               <div className="text-muted-foreground">{subj?.team}</div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="grade">Grade (%)</Label>
//               <Input
//                 id="grade"
//                 type="number"
//                 min={0}
//                 max={100}
//                 value={grade}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setGrade(v === "" ? "" : Math.max(0, Math.min(100, Number(v))));
//                 }}
//                 placeholder="e.g. 85"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="feedback">Feedback</Label>
//               <Textarea
//                 id="feedback"
//                 value={feedback}
//                 onChange={(e) => setFeedback(e.target.value)}
//                 placeholder="Optional feedback for the team…"
//                 className="min-h-24"
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)} disabled={evalMutation.isPending}>
//               Cancel
//             </Button>
//             <Button onClick={() => evalMutation.mutate()} disabled={evalMutation.isPending || grade === ""}>
//               {evalMutation.isPending ? "Saving…" : "Save"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// /* -------------------- wrapper (role-aware) -------------------- */
// const Projects: React.FC = () => {
//   const { id: routeId } = useParams<{ id?: string }>();
//   const { data, isLoading, isError } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

//   if (isLoading) return <div className="p-6">Loading…</div>;
//   if (isError || !data?.user) return <Navigate to="/login" replace />;

//   const user = data.user;
//   const role = (user.role || "STUDENT") as "STUDENT" | "TEACHER" | "ADMIN";

//   // scope URL guard
//   if (role === "STUDENT" && routeId && routeId !== user.id) {
//     return <Navigate to={`/students/${user.id}/projects`} replace />;
//   }
//   if (role === "TEACHER" && routeId && routeId !== user.id) {
//     return <Navigate to={`/teachers/${user.id}/projects`} replace />;
//   }

//   return (
//     <Layout userRole={role === "TEACHER" ? "teacher" : "student"}>
//       <div className="space-y-6">
//         {role === "TEACHER" ? (
//           <TeacherSubmissions userId={user.id} />
//         ) : (
//           <StudentProjects userId={user.id} />
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default Projects;












// import * as React from "react";
// import Layout from "@/components/layout/Layout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import StatusTabs from "@/components/projects/StatusTabs";
// import { useMyProjects, useMyCourses } from "@/hooks/useApi";
// import { useTeacherSubmissions } from "@/hooks/useApi";
// import { Search, Filter, Plus } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { me } from "@/api/auth";
// import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
// import FormTeamDialog from "@/components/teams/FormTeamDailog";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";

// /* -------------------- helpers & types -------------------- */
// type Groups<T> = { new: T[]; active: T[]; completed: T[]; rejected: T[] };

// function filterGroupsByCourse<T extends { course?: string }>(
//   groups: Groups<T>,
//   courseName?: string | null
// ): Groups<T> {
//   if (!courseName || courseName === "ALL") return groups;
//   const pick = (arr: T[]) => arr.filter((p) => (p.course ?? "") === courseName);
//   return {
//     new: pick(groups.new),
//     active: pick(groups.active),
//     completed: pick(groups.completed),
//     rejected: pick(groups.rejected),
//   };
// }

// function formatBytes(n?: number) {
//   if (!n && n !== 0) return "";
//   const u = ["B", "KB", "MB", "GB"];
//   let i = 0;
//   let x = n;
//   while (x >= 1024 && i < u.length - 1) {
//     x /= 1024;
//     i++;
//   }
//   return `${x.toFixed(1)} ${u[i]}`;
// }

// async function evaluateSubmission(submissionId: string, grade: number, feedback?: string) {
//   const res = await fetch(`/api/submissions/${submissionId}/evaluate`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ grade, feedback }),
//   });
//   if (!res.ok) throw new Error("Failed to evaluate submission");
//   return res.json();
// }

// type TeacherSubmissionItem = {
//   id: string; // task id
//   title: string;
//   status: string;
//   deadline: string | null;
//   project: { id: string; title: string };
//   course: { id: string; code: string; name: string };
//   team: {
//     id: string | null;
//     memberCount: number;
//     members: Array<{ id: string; name: string; email: string; avatarUrl: string | null }>;
//   };
//   submission: null | {
//     id: string;
//     notes: string | null;
//     submittedAt: string | null;
//     grade?: number | null;
//     feedback?: string | null;
//     files: Array<{ id: string; name: string; url: string; size?: number; mime?: string }>;
//   };
// };

// /* -------------------- student subpage -------------------- */
// const StudentProjects: React.FC<{ userId: string }> = ({ userId }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { data: groupedRaw, isLoading: loadingProjects, refetch } = useMyProjects();
//   const groups = groupedRaw ?? { new: [], active: [], completed: [], rejected: [] };

//   const { data: myCourses } = useMyCourses();

//   const [courseFilter, setCourseFilter] = React.useState<string>("ALL");
//   const selectedCourseName =
//     courseFilter === "ALL"
//       ? "ALL"
//       : myCourses?.find((c) => c.id === courseFilter)?.name ?? "ALL";

//   const filteredGroups = filterGroupsByCourse(groups, selectedCourseName);

//   // Form Team
//   const [formTeamOpen, setFormTeamOpen] = React.useState(false);
//   const [formTeamProjectId, setFormTeamProjectId] = React.useState<string | null>(null);
//   const openFormTeam = (projectId: string) => {
//     setFormTeamProjectId(projectId);
//     setFormTeamOpen(true);
//   };

//   // handle deep link from TaskDetails
//   React.useEffect(() => {
//     const st = location.state as { openFormForProjectId?: string } | undefined;
//     if (st?.openFormForProjectId) {
//       openFormTeam(st.openFormForProjectId);
//       navigate(location.pathname, { replace: true, state: {} });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.state]);

//   const onAction = (projectId: string, action: string) => {
//     if (action === "formTeam") {
//       openFormTeam(projectId);
//       return;
//     }
//     navigate(`/students/${userId}/projects/${projectId}`);
//   };

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
//           <p className="text-muted-foreground mt-1">Manage and track all your academic projects.</p>
//         </div>
//         <Button className="bg-primary text-primary-foreground">
//           <Plus className="h-4 w-4 mr-2" />
//           Join Project
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
//           <Input placeholder="Search projects..." className="pl-10" />
//         </div>

//         <Select value={courseFilter} onValueChange={setCourseFilter}>
//           <SelectTrigger className="w-56">
//             <SelectValue placeholder="Filter by course" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="ALL">All Courses</SelectItem>
//             {(myCourses ?? []).map((c) => (
//               <SelectItem key={c.id} value={c.id}>
//                 {c.code ? `${c.code} — ${c.name}` : c.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Button variant="outline">
//           <Filter className="h-4 w-4 mr-2" />
//           More Filters
//         </Button>
//       </div>

//       {/* Projects */}
//       <StatusTabs projects={filteredGroups} onProjectAction={onAction} userRole="student" />

//       {loadingProjects && <div className="text-sm text-muted-foreground">Refreshing…</div>}

//       {/* Dialog */}
//       {formTeamProjectId && (
//         <FormTeamDialog
//           open={formTeamOpen}
//           onOpenChange={setFormTeamOpen}
//           projectId={formTeamProjectId}
//           leaderId={userId}
//           onCreated={() => {
//             setFormTeamProjectId(null);
//             refetch();
//           }}
//         />
//       )}
//     </>
//   );
// };

// /* -------------------- teacher subpage -------------------- */
// const TeacherSubmissions: React.FC<{ userId: string }> = ({ userId }) => {
//   const navigate = useNavigate();
//   const qc = useQueryClient();

//   // filters – always non-empty strings
//   const [courseId, setCourseId] = React.useState("ALL");
//   const [projectId, setProjectId] = React.useState("ALL");
//   const [q, setQ] = React.useState("");

//   // query
//   const { data: submissions = [], isLoading } = useTeacherSubmissions({
//     courseId: courseId === "ALL" ? undefined : courseId,
//     projectId: projectId === "ALL" ? undefined : projectId,
//     q: q.trim() || undefined,
//   }) as { data: TeacherSubmissionItem[] | undefined; isLoading: boolean };

//   // options derived from data
//   const courseOptions = React.useMemo(() => {
//     const map = new Map<string, { id: string; code: string; name: string }>();
//     for (const s of submissions) map.set(s.course.id, s.course);
//     return Array.from(map.values());
//   }, [submissions]);

//   const projectOptions = React.useMemo(() => {
//     const filtered =
//       courseId === "ALL" ? submissions : submissions.filter((s) => s.course.id === courseId);
//     const map = new Map<string, { id: string; title: string }>();
//     for (const s of filtered) map.set(s.project.id, s.project);
//     return Array.from(map.values());
//   }, [submissions, courseId]);

//   const clear = () => {
//     setCourseId("ALL");
//     setProjectId("ALL");
//     setQ("");
//   };

//   // evaluate dialog
//   const [open, setOpen] = React.useState(false);
//   const [subj, setSubj] = React.useState<{ id: string; title: string; team: string } | null>(null);
//   const [grade, setGrade] = React.useState<number | "">("");
//   const [feedback, setFeedback] = React.useState("");

//   const openEval = (s: TeacherSubmissionItem) => {
//     setSubj({
//       id: s.submission?.id || "", // submission id
//       title: s.title,
//       team: s.team?.members?.map((m: any) => m.name || m.email).join(", ") || "Team",
//     });
//     setGrade(typeof s.submission?.grade === "number" ? s.submission.grade : "");
//     setFeedback(s.submission?.feedback || "");
//     setOpen(true);
//   };

//   const evalMutation = useMutation({
//     mutationFn: async () => {
//       if (!subj || !subj.id || grade === "") throw new Error("Grade is required");
//       return evaluateSubmission(subj.id, Number(grade), feedback || undefined);
//     },
//     onSuccess: () => {
//       setOpen(false);
//       qc.invalidateQueries({ queryKey: ["teacher-submissions"] });
//     },
//   });

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Project Submissions</h1>
//           <p className="text-muted-foreground mt-1">
//             Review and evaluate student submissions across your courses.
//           </p>
//         </div>

//         <Button
//           className="bg-primary text-primary-foreground"
//           onClick={() => navigate(`/teachers/${userId}/create-project`)}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Create Topic
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-card p-4 rounded-lg border">
//         <div className="space-y-1">
//           <label className="text-sm text-muted-foreground">Course</label>
//           <Select
//             value={courseId}
//             onValueChange={(v) => {
//               setCourseId(v);
//               setProjectId("ALL");
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="All courses" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="ALL">All Courses</SelectItem>
//               {courseOptions.map((c) => (
//                 <SelectItem key={c.id} value={c.id}>
//                   {c.code ? `${c.code} — ${c.name}` : c.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-1">
//           <label className="text-sm text-muted-foreground">Project</label>
//           <Select
//             value={projectId}
//             onValueChange={setProjectId}
//             disabled={!projectOptions.length}
//           >
//             <SelectTrigger>
//               <SelectValue
//                 placeholder={projectOptions.length ? "All projects" : "No projects"}
//               />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="ALL">All Projects</SelectItem>
//               {projectOptions.map((p) => (
//                 <SelectItem key={p.id} value={p.id}>
//                   {p.title}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-1">
//           <label className="text-sm text-muted-foreground">Student</label>
//           <Input
//             placeholder="Search name or email…"
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//           />
//         </div>

//         <div className="flex items-end">
//           <Button variant="outline" className="w-full" onClick={clear}>
//             Clear
//           </Button>
//         </div>
//       </div>

//       {/* List */}
//       <div className="space-y-3">
//         {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
//         {!isLoading && submissions.length === 0 && (
//           <div className="text-sm text-muted-foreground">No submissions match your filters.</div>
//         )}
//         {!isLoading &&
//           submissions.map((s) => (
//             <div
//               key={s.id}
//               className="flex items-start justify-between gap-3 border rounded-md px-3 py-2"
//             >
//               <div className="min-w-0 flex-1">
//                 <div className="font-medium truncate">{s.title}</div>
//                 <div className="text-xs text-muted-foreground mt-1">
//                   {s.course.code} — {s.course.name} • {s.project.title}
//                   {s.deadline ? ` • Due ${new Date(s.deadline).toLocaleDateString()}` : ""}
//                   {s.team.memberCount ? ` • Team (${s.team.memberCount})` : ""}
//                 </div>

//                 {s.team.members?.length ? (
//                   <div className="text-xs text-muted-foreground mt-1 truncate">
//                     {s.team.members.map((m: any) => m.name || m.email).join(", ")}
//                   </div>
//                 ) : null}

//                 {/* Submission details */}
//                 {s.submission && (
//                   <div className="mt-2 space-y-1 text-xs">
//                     {s.submission.submittedAt && (
//                       <div className="text-muted-foreground">
//                         Submitted on {new Date(s.submission.submittedAt).toLocaleString()}
//                       </div>
//                     )}
//                     {s.submission.notes && (
//                       <div>
//                         <span className="font-medium">Notes:</span>{" "}
//                         <span className="text-muted-foreground">{s.submission.notes}</span>
//                       </div>
//                     )}
//                     {Array.isArray(s.submission.files) && s.submission.files.length > 0 && (
//                       <div>
//                         <div className="font-medium">Files:</div>
//                         <ul className="mt-1 space-y-1">
//                           {s.submission.files.map((f) => (
//                             <li key={f.id} className="flex items-center gap-2">
//                               <a
//                                 href={f.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="underline truncate"
//                                 title={f.name}
//                               >
//                                 {f.name}
//                               </a>
//                               {typeof f.size === "number" && (
//                                 <span className="text-muted-foreground">
//                                   ({formatBytes(f.size)})
//                                 </span>
//                               )}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
//                     <div className="text-muted-foreground">
//                       {typeof s.submission.grade === "number"
//                         ? `Grade: ${s.submission.grade}%`
//                         : "Not graded yet"}
//                       {s.submission.feedback ? ` • Feedback: ${s.submission.feedback}` : ""}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex items-center gap-2 shrink-0">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => navigate(`/teachers/${userId}/projects/${s.project.id}`)}
//                 >
//                   Open Project
//                 </Button>
//                 <Button size="sm" onClick={() => openEval(s)} disabled={!s.submission}>
//                   Evaluate
//                 </Button>
//               </div>
//             </div>
//           ))}
//       </div>

//       {/* Evaluate dialog */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Evaluate submission</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <div className="text-sm">
//               <div className="font-medium">{subj?.title}</div>
//               <div className="text-muted-foreground">{subj?.team}</div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="grade">Grade (%)</Label>
//               <Input
//                 id="grade"
//                 type="number"
//                 min={0}
//                 max={100}
//                 value={grade}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setGrade(v === "" ? "" : Math.max(0, Math.min(100, Number(v))));
//                 }}
//                 placeholder="e.g. 85"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="feedback">Feedback</Label>
//               <Textarea
//                 id="feedback"
//                 value={feedback}
//                 onChange={(e) => setFeedback(e.target.value)}
//                 placeholder="Optional feedback for the team…"
//                 className="min-h-24"
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)} disabled={evalMutation.isPending}>
//               Cancel
//             </Button>
//             <Button onClick={() => evalMutation.mutate()} disabled={evalMutation.isPending || grade === ""}>
//               {evalMutation.isPending ? "Saving…" : "Save"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// /* -------------------- wrapper (role-aware) -------------------- */
// const Projects: React.FC = () => {
//   const { id: routeId } = useParams<{ id?: string }>();
//   const { data, isLoading, isError } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

//   if (isLoading) return <div className="p-6">Loading…</div>;
//   if (isError || !data?.user) return <Navigate to="/login" replace />;

//   const user = data.user;
//   const role = (user.role || "STUDENT") as "STUDENT" | "TEACHER" | "ADMIN";

//   // scope URL guard
//   if (role === "STUDENT" && routeId && routeId !== user.id) {
//     return <Navigate to={`/students/${user.id}/projects`} replace />;
//   }
//   if (role === "TEACHER" && routeId && routeId !== user.id) {
//     return <Navigate to={`/teachers/${user.id}/projects`} replace />;
//   }

//   return (
//     <Layout userRole={role === "TEACHER" ? "teacher" : "student"}>
//       <div className="space-y-6">
//         {role === "TEACHER" ? (
//           <TeacherSubmissions userId={user.id} />
//         ) : (
//           <StudentProjects userId={user.id} />
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default Projects;













// src/pages/Projects.tsx
import * as React from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { httpPost } from "@/api/_client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusTabs from "@/components/projects/StatusTabs";
import { useMyProjects, useMyCourses } from "@/hooks/useApi";
import { useTeacherSubmissions } from "@/hooks/useApi";
import { Search, Filter, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { me } from "@/api/auth";
import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import FormTeamDialog from "@/components/teams/FormTeamDailog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/* -------------------- helpers & types -------------------- */
type Groups<T> = { new: T[]; active: T[]; completed: T[]; rejected: T[] };

function filterGroupsByCourse<T extends { course?: string }>(
  groups: Groups<T>,
  courseName?: string | null
): Groups<T> {
  if (!courseName || courseName === "ALL") return groups;
  const pick = (arr: T[]) => arr.filter((p) => (p.course ?? "") === courseName);
  return {
    new: pick(groups.new),
    active: pick(groups.active),
    completed: pick(groups.completed),
    rejected: pick(groups.rejected),
  };
}

function formatBytes(n?: number) {
  if (!n && n !== 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let x = n;
  while (x >= 1024 && i < u.length - 1) {
    x /= 1024;
    i++;
  }
  return `${x.toFixed(1)} ${u[i]}`;
}

// Calls the backend evaluate route: POST /api/submissions/:id/evaluate
async function evaluateSubmission(submissionId: string, grade: number, feedback?: string) {
  // hits http://localhost:4000/api/... (or VITE_API_BASE_URL)
  return httpPost(`/api/submissions/${submissionId}/evaluate`, { grade, feedback });
}

type TeacherSubmissionItem = {
  id: string; // task id
  title: string;
  status: string;
  deadline: string | null;
  project: { id: string; title: string };
  course: { id: string; code: string; name: string };
  team: {
    id: string | null;
    memberCount: number;
    members: Array<{ id: string; name: string; email: string; avatarUrl: string | null }>;
  };
  submission: null | {
    id: string; // submission id (used by evaluate)
    notes: string | null;
    submittedAt: string | null;
    grade?: number | null;
    feedback?: string | null;
    files: Array<{ id: string; name: string; url: string; size?: number; mime?: string }>;
  };
};

/* -------------------- student subpage -------------------- */
const StudentProjects: React.FC<{ userId: string }> = ({ userId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: groupedRaw, isLoading: loadingProjects, refetch } = useMyProjects();
  const groups = groupedRaw ?? { new: [], active: [], completed: [], rejected: [] };

  const { data: myCourses } = useMyCourses();

  const [courseFilter, setCourseFilter] = React.useState<string>("ALL");
  const selectedCourseName =
    courseFilter === "ALL"
      ? "ALL"
      : myCourses?.find((c) => c.id === courseFilter)?.name ?? "ALL";

  const filteredGroups = filterGroupsByCourse(groups, selectedCourseName);

  // Form Team
  const [formTeamOpen, setFormTeamOpen] = React.useState(false);
  const [formTeamProjectId, setFormTeamProjectId] = React.useState<string | null>(null);
  const openFormTeam = (projectId: string) => {
    setFormTeamProjectId(projectId);
    setFormTeamOpen(true);
  };

  // handle deep link from TaskDetails
  React.useEffect(() => {
    const st = location.state as { openFormForProjectId?: string } | undefined;
    if (st?.openFormForProjectId) {
      openFormTeam(st.openFormForProjectId);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const onAction = (projectId: string, action: string) => {
    if (action === "formTeam") {
      openFormTeam(projectId);
      return;
    }
    navigate(`/students/${userId}/projects/${projectId}`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your academic projects.</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Join Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search projects..." className="pl-10" />
        </div>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Courses</SelectItem>
            {(myCourses ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code ? `${c.code} — ${c.name}` : c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Projects */}
      <StatusTabs projects={filteredGroups} onProjectAction={onAction} userRole="student" />

      {loadingProjects && <div className="text-sm text-muted-foreground">Refreshing…</div>}

      {/* Dialog */}
      {formTeamProjectId && (
        <FormTeamDialog
          open={formTeamOpen}
          onOpenChange={setFormTeamOpen}
          projectId={formTeamProjectId}
          leaderId={userId}
          onCreated={() => {
            setFormTeamProjectId(null);
            refetch();
          }}
        />
      )}
    </>
  );
};

/* -------------------- teacher subpage -------------------- */
const TeacherSubmissions: React.FC<{ userId: string }> = ({ userId }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // filters – always non-empty strings
  const [courseId, setCourseId] = React.useState("ALL");
  const [projectId, setProjectId] = React.useState("ALL");
  const [q, setQ] = React.useState("");

  // query
  const { data: submissions = [], isLoading } = useTeacherSubmissions({
    courseId: courseId === "ALL" ? undefined : courseId,
    projectId: projectId === "ALL" ? undefined : projectId,
    q: q.trim() || undefined,
  }) as { data: TeacherSubmissionItem[] | undefined; isLoading: boolean };

  // options derived from data
  const courseOptions = React.useMemo(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    for (const s of submissions) map.set(s.course.id, s.course);
    return Array.from(map.values());
  }, [submissions]);

  const projectOptions = React.useMemo(() => {
    const filtered =
      courseId === "ALL" ? submissions : submissions.filter((s) => s.course.id === courseId);
    const map = new Map<string, { id: string; title: string }>();
    for (const s of filtered) map.set(s.project.id, s.project);
    return Array.from(map.values());
  }, [submissions, courseId]);

  const clear = () => {
    setCourseId("ALL");
    setProjectId("ALL");
    setQ("");
  };

  // evaluate dialog
  const [open, setOpen] = React.useState(false);
  const [subj, setSubj] = React.useState<{ id: string; title: string; team: string } | null>(null);
  const [grade, setGrade] = React.useState<number | "">("");
  const [feedback, setFeedback] = React.useState("");

  const openEval = (s: TeacherSubmissionItem) => {
    console.log("openEval payload", s.submission?.id, s); // <-- should log a submission id

    setSubj({
      id: s.submission?.id || "",   // <-- submission id (NOT task id)
      title: s.title,
      team: s.team?.members?.map((m) => m.name || m.email).join(", ") || "Team",
    });
    setGrade(typeof s.submission?.grade === "number" ? s.submission.grade : "");
    setFeedback(s.submission?.feedback || "");
    setOpen(true);
  };

  const evalMutation = useMutation({
    mutationFn: async () => {
      if (!subj || !subj.id || grade === "") throw new Error("Grade is required");
      return evaluateSubmission(subj.id, Number(grade), feedback || undefined);
    },
    onSuccess: () => {
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["teacher-submissions"] });
    },
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Submissions</h1>
          <p className="text-muted-foreground mt-1">
            Review and evaluate student submissions across your courses.
          </p>
        </div>

        <Button
          className="bg-primary text-primary-foreground"
          onClick={() => navigate(`/teachers/${userId}/create-project`)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Topic
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-card p-4 rounded-lg border">
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Course</label>
          <Select
            value={courseId}
            onValueChange={(v) => {
              setCourseId(v);
              setProjectId("ALL");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Courses</SelectItem>
              {courseOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code ? `${c.code} — ${c.name}` : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Project</label>
          <Select
            value={projectId}
            onValueChange={setProjectId}
            disabled={!projectOptions.length}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={projectOptions.length ? "All projects" : "No projects"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Projects</SelectItem>
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
          <Input
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={clear}>
            Clear
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && submissions.length === 0 && (
          <div className="text-sm text-muted-foreground">No submissions match your filters.</div>
        )}
        {!isLoading &&
          submissions.map((s) => (
            <div
              key={s.id}
              className="flex items-start justify-between gap-3 border rounded-md px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {s.course.code} — {s.course.name} • {s.project.title}
                  {s.deadline ? ` • Due ${new Date(s.deadline).toLocaleDateString()}` : ""}
                  {s.team.memberCount ? ` • Team (${s.team.memberCount})` : ""}
                </div>

                {s.team.members?.length ? (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {s.team.members.map((m: any) => m.name || m.email).join(", ")}
                  </div>
                ) : null}

                {/* Submission details */}
                {s.submission && (
                  <div className="mt-2 space-y-1 text-xs">
                    {s.submission.submittedAt && (
                      <div className="text-muted-foreground">
                        Submitted on {new Date(s.submission.submittedAt).toLocaleString()}
                      </div>
                    )}
                    {s.submission.notes && (
                      <div>
                        <span className="font-medium">Notes:</span>{" "}
                        <span className="text-muted-foreground">{s.submission.notes}</span>
                      </div>
                    )}
                    {Array.isArray(s.submission.files) && s.submission.files.length > 0 && (
                      <div>
                        <div className="font-medium">Files:</div>
                        <ul className="mt-1 space-y-1">
                          {s.submission.files.map((f) => (
                            <li key={f.id} className="flex items-center gap-2">
                              {/* Force download so PDFs and others save reliably */}
                              <a
                                href={`${API_BASE}${f.url}`}
                                download={f.name}
                                className="underline truncate"
                                title={f.name}
                              >
                                {f.name}
                              </a>
                              {typeof f.size === "number" && (
                                <span className="text-muted-foreground">
                                  ({formatBytes(f.size)})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      {typeof s.submission.grade === "number"
                        ? `Grade: ${s.submission.grade}%`
                        : "Not graded yet"}
                      {s.submission.feedback ? ` • Feedback: ${s.submission.feedback}` : ""}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/teachers/${userId}/projects/${s.project.id}`)}
                >
                  Open Project
                </Button>
                <Button size="sm" onClick={() => openEval(s)} disabled={!s.submission}>
                  Evaluate
                </Button>
              </div>
            </div>
          ))}
      </div>

      {/* Evaluate dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluate submission</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">{subj?.title}</div>
              <div className="text-muted-foreground">{subj?.team}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade (%)</Label>
              <Input
                id="grade"
                type="number"
                min={0}
                max={100}
                value={grade}
                onChange={(e) => {
                  const v = e.target.value;
                  setGrade(v === "" ? "" : Math.max(0, Math.min(100, Number(v))));
                }}
                placeholder="e.g. 85"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional feedback for the team…"
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={evalMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => evalMutation.mutate()}
              disabled={evalMutation.isPending || grade === ""}
            >
              {evalMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* -------------------- wrapper (role-aware) -------------------- */
const Projects: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const { data, isLoading, isError } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data?.user) return <Navigate to="/login" replace />;

  const user = data.user;
  const role = (user.role || "STUDENT") as "STUDENT" | "TEACHER" | "ADMIN";

  // scope URL guard
  if (role === "STUDENT" && routeId && routeId !== user.id) {
    return <Navigate to={`/students/${user.id}/projects`} replace />;
  }
  if (role === "TEACHER" && routeId && routeId !== user.id) {
    return <Navigate to={`/teachers/${user.id}/projects`} replace />;
  }

  return (
    <Layout userRole={role === "TEACHER" ? "teacher" : "student"}>
      <div className="space-y-6">
        {role === "TEACHER" ? (
          <TeacherSubmissions userId={user.id} />
        ) : (
          <StudentProjects userId={user.id} />
        )}
      </div>
    </Layout>
  );
};

export default Projects;