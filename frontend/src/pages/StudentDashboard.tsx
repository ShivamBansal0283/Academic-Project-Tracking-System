// import Layout from "@/components/layout/Layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import StatusTabs from "@/components/projects/StatusTabs";
// import { useMyProjects } from "@/hooks/useApi";
// import { FolderOpen, Clock, Trophy, Users } from "lucide-react";
// import * as React from "react";
// import { useQueries, useQuery } from "@tanstack/react-query";
// import { useParams, Navigate } from "react-router-dom";
// import { getProjectTasks, Task } from "@/api/tasks";
// import { me } from "@/api/auth";

// function usePendingTaskCount(projectIds: string[]) {
//   const queries = useQueries({
//     queries: projectIds.map((id) => ({
//       queryKey: ["tasks", id],
//       queryFn: () => getProjectTasks(id),
//       staleTime: 30_000,
//     })),
//   });

//   const isLoading = queries.some((q) => q.isLoading);
//   const count = queries.reduce((sum, q) => {
//     const tasks: Task[] | undefined = q.data;
//     if (!tasks) return sum;
//     const add = tasks.filter((t) => {
//       const s = String(t.status).toLowerCase();
//       return s === "pending" || s === "in_progress";
//     }).length;
//     return sum + add;
//   }, 0);

//   return { count, isLoading };
// }

// const StudentDashboard = () => {
//   // 1) Enforce "my dashboard" based on /students/:id/dashboard
//   const { id: routeId } = useParams<{ id: string }>();
//   const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

//   if (meQuery.isLoading) {
//     return (
//       <div className="min-h-[50vh] grid place-items-center">
//         Checking session…
//       </div>
//     );
//   }
//   if (meQuery.isError) {
//     return <Navigate to="/login" replace />;
//   }

//   const user = meQuery.data!.user;
//   if (user.role !== "STUDENT") {
//     return <Navigate to="/login" replace />;
//   }
//   if (!routeId || routeId !== user.id) {
//     return <Navigate to={`/students/${user.id}/dashboard`} replace />;
//   }

//   // 2) Load student projects
//   const { data: projects, isLoading: projectsLoading } = useMyProjects();

//   const grouped =
//     projects ?? { new: [], active: [], completed: [], rejected: [] };

//   // 3) Pending tasks across active + new projects
//   const pendingTaskProjectIds = React.useMemo(
//     () => [...grouped.active, ...grouped.new].map((p) => p.id),
//     [grouped.active, grouped.new]
//   );
//   const { count: pendingTasks, isLoading: pendingLoading } =
//     usePendingTaskCount(pendingTaskProjectIds);

//   // 4) Live stats
//   const activeProjects = grouped.active.length;
//   const completedProjects = grouped.completed.length;
//   const teamProjects = React.useMemo(
//     () =>
//       [...grouped.new, ...grouped.active, ...grouped.completed, ...grouped.rejected].filter(
//         (p) => (p.teamMembers?.length ?? 0) > 0
//       ).length,
//     [grouped]
//   );

//   const stats = [
//     {
//       title: "Active Projects",
//       value: projectsLoading ? "…" : activeProjects,
//       icon: FolderOpen,
//       color: "text-status-active",
//     },
//     {
//       title: "Pending Tasks",
//       value: projectsLoading || pendingLoading ? "…" : String(pendingTasks),
//       icon: Clock,
//       color: "text-warning",
//     },
//     {
//       title: "Completed Projects",
//       value: projectsLoading ? "…" : completedProjects,
//       icon: Trophy,
//       color: "text-status-completed",
//     },
//     {
//       title: "Team Projects",
//       value: projectsLoading ? "…" : teamProjects,
//       icon: Users,
//       color: "text-primary",
//     },
//   ];

//   const handleProjectAction = (projectId: string, action: string) => {
//     // hook up when needed
//     console.log(`Action ${action} for project ${projectId}`);
//   };

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
//             <p className="text-muted-foreground mt-1">
//               Welcome back{user.name ? `, ${user.name}` : ""}! Here's an overview of your academic projects.
//             </p>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {stats.map((stat) => (
//             <Card key={stat.title} className="animate-fade-in">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   {stat.title}
//                 </CardTitle>
//                 <stat.icon className={`h-5 w-5 ${stat.color}`} />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{stat.value}</div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Projects Section */}
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-semibold">My Projects</h2>
//           </div>

//           <StatusTabs
//             projects={grouped}
//             onProjectAction={handleProjectAction}
//             userRole="student"
//           />
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default StudentDashboard;







// src/pages/StudentDashboard.tsx
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusTabs from "@/components/projects/StatusTabs";
import { useMyProjects } from "@/hooks/useApi";
import { FolderOpen, Clock, Trophy, Users } from "lucide-react";
import * as React from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { getProjectTasks, Task } from "@/api/tasks";
import { me } from "@/api/auth";
import FormTeamDialog from "@/components/teams/FormTeamDailog"; // <-- add

function usePendingTaskCount(projectIds: string[]) {
  const queries = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ["tasks", id],
      queryFn: () => getProjectTasks(id),
      staleTime: 30_000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const count = queries.reduce((sum, q) => {
    const tasks: Task[] | undefined = q.data;
    if (!tasks) return sum;
    const add = tasks.filter((t) => {
      const s = String(t.status).toLowerCase();
      return s === "pending" || s === "in_progress";
    }).length;
    return sum + add;
  }, 0);

  return { count, isLoading };
}

/** Gate component: only runs the `me` query and redirects; no other hooks here. */
const StudentDashboard: React.FC = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

  if (meQuery.isLoading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        Checking session…
      </div>
    );
  }
  if (meQuery.isError) return <Navigate to="/login" replace />;

  const user = meQuery.data!.user;
  if (user.role !== "STUDENT") return <Navigate to="/login" replace />;
  if (!routeId || routeId !== user.id) {
    return <Navigate to={`/students/${user.id}/dashboard`} replace />;
  }

  // Render the real dashboard (this component uses many hooks safely)
  return <StudentDashboardView userId={user.id} userName={user.name ?? ""} />;
};

const StudentDashboardView: React.FC<{ userId: string; userName: string }> = ({ userId, userName }) => {
  const navigate = useNavigate();

  // 1) Load projects
  const { data: projects, isLoading: projectsLoading, refetch } = useMyProjects();
  const grouped = projects ?? { new: [], active: [], completed: [], rejected: [] };

  // 2) Pending tasks across active + new projects
  const pendingTaskProjectIds = React.useMemo(
    () => [...grouped.active, ...grouped.new].map((p) => p.id),
    [grouped.active, grouped.new]
  );
  const { count: pendingTasks, isLoading: pendingLoading } =
    usePendingTaskCount(pendingTaskProjectIds);

  // 3) Live stats
  const activeProjects = grouped.active.length;
  const completedProjects = grouped.completed.length;
  const teamProjects = React.useMemo(
    () =>
      [...grouped.new, ...grouped.active, ...grouped.completed, ...grouped.rejected].filter(
        (p) => (p.teamMembers?.length ?? 0) > 0
      ).length,
    [grouped]
  );

  const stats = [
    { title: "Active Projects", value: projectsLoading ? "…" : activeProjects, icon: FolderOpen, color: "text-status-active" },
    { title: "Pending Tasks", value: projectsLoading || pendingLoading ? "…" : String(pendingTasks), icon: Clock, color: "text-warning" },
    { title: "Completed Projects", value: projectsLoading ? "…" : completedProjects, icon: Trophy, color: "text-status-completed" },
    { title: "Team Projects", value: projectsLoading ? "…" : teamProjects, icon: Users, color: "text-primary" },
  ];

  // ---- FORM TEAM dialog state (same behavior as Projects.tsx) ----
  const [formTeamOpen, setFormTeamOpen] = React.useState(false);
  const [formTeamProjectId, setFormTeamProjectId] = React.useState<string | null>(null);
  const openFormTeam = (projectId: string) => {
    setFormTeamProjectId(projectId);
    setFormTeamOpen(true);
  };

  // ---- ACTIONS: make the buttons actually work ----
  const onProjectAction = (projectId: string, action: string) => {
    if (action === "formTeam") {
      openFormTeam(projectId);
      return;
    }
    // default: open details
    navigate(`/students/${userId}/projects/${projectId}`);
  };

  return (
    <Layout /* optionally: userRole="student" */>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back{userName ? `, ${userName}` : ""}! Here's an overview of your academic projects.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Projects</h2>
          </div>

          <StatusTabs
            projects={grouped}
            onProjectAction={onProjectAction}   // <-- now wired
            userRole="student"
          />

          {projectsLoading && <div className="text-sm text-muted-foreground">Refreshing…</div>}
        </div>
      </div>

      {/* Team form dialog */}
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
    </Layout>
  );
};

export default StudentDashboard;