

// import * as React from "react";
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import AppHealthGate from "@/components/AppHealthGate";
// import RequireAuth from "@/components/RequireAuth";

// import Index from "./pages/Index";
// import Login from "./pages/Login";
// import StudentDashboard from "./pages/StudentDashboard";
// import TeacherDashboard from "./pages/TeacherDashboard";
// import Projects from "./pages/Projects";
// import Courses from "./pages/Courses";
// import Teams from "./pages/Teams";
// import ProjectDetails from "./pages/ProjectDetails";
// import TaskDetails from "./pages/TaskDetails";
// import CreateProject from "./pages/CreateProject";
// import Departments from "./pages/Departments";
// import NotFound from "./pages/NotFound";
// import CourseDetails from "./pages/CourseDetails";
// import InvitationsPage from "./pages/Invitations";
// import Settings from "./pages/Settings";
// import Profile from "./pages/Profile";

// import { useQuery } from "@tanstack/react-query";
// import { me } from "@/api/auth";
// import TeacherCourses from "./pages/TeachCourses";

// const queryClient = new QueryClient();

// /* ----------------------------------------------------------------------------
//    Helpers
// ---------------------------------------------------------------------------- */

// // If user is a STUDENT, redirect a generic path to the student-scoped one
// const CanonicalizeStudent: React.FC<{
//   to: (id: string) => string;
//   children: React.ReactNode;
// }> = ({ to, children }) => {
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["me"],
//     queryFn: me,
//     retry: 0,
//   });
//   if (isLoading) return null;
//   if (isError || !data?.user) return <Navigate to="/login" replace />;
//   const user = data.user;
//   if (user.role === "STUDENT") return <Navigate to={to(user.id)} replace />;
//   return <>{children}</>;
// };

// // Role-aware dashboard redirect: students -> /students/:id/dashboard, staff -> /teacher-dashboard
// const RoleDashboardRedirect: React.FC = () => {
//   const { data, isLoading, isError } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
//   if (isLoading) return null;
//   if (isError || !data?.user) return <Navigate to="/login" replace />;
//   const { user } = data;
//   const to = user.role === "STUDENT" ? `/students/${user.id}/dashboard` : "/teacher-dashboard";
//   return <Navigate to={to} replace />;
// };

// // Landing that forwards authenticated users directly to their dashboard
// const Landing: React.FC = () => {
//   const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
//   if (isLoading) return null;
//   if (data?.user) return <RoleDashboardRedirect />;
//   return <Index />;
// };

// /* ----------------------------------------------------------------------------
//    App
// ---------------------------------------------------------------------------- */

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />

//       <AppHealthGate timeoutMs={3000} retryEveryMs={5000}>
//         <BrowserRouter>
//           <Routes>
//             {/* public */}
//             <Route path="/" element={<Landing />} />
//             <Route path="/login" element={<Login />} />

//             {/* Public course details (keep if you want it browsable) */}
//             <Route path="/courses/:id" element={<CourseDetails />} />
//             <Route path="/projects/:projectId" element={<ProjectDetails />} />


//             {/* Canonical dashboard route for any authenticated user */}
//             <Route element={<RequireAuth roles={["STUDENT", "TEACHER", "ADMIN"]} />}>
//               <Route path="/dashboard" element={<RoleDashboardRedirect />} />
//             </Route>

//             {/* STUDENT: canonical, user-scoped routes */}
//             <Route element={<RequireAuth roles={["STUDENT"]} />}>
//               <Route path="/students/:id/dashboard" element={<StudentDashboard />} />
//               <Route path="/students/:id/projects" element={<Projects />} />
//               <Route path="/students/:id/projects/:projectId" element={<ProjectDetails />} />
//               <Route path="/students/:id/courses" element={<Courses />} />
//               <Route path="/students/:id/teams" element={<Teams />} />
//               <Route path="/students/:id/tasks/:taskId" element={<TaskDetails />} />
//               <Route path="/students/:id/invitations" element={<InvitationsPage />} />
//               <Route path="/students/:id/profile" element={<Profile />} />
//               <Route path="/students/:id/settings" element={<Settings />} />
//             </Route>

//             <Route element={<RequireAuth roles={["TEACHER", "ADMIN"]} />}>
//               <Route path="/teachers/:id/dashboard" element={<TeacherDashboard />} />
//               <Route path="/teachers/:id/projects" element={<Projects />} />
//               <Route path="/teachers/:id/courses" element={<TeacherCourses />} /> {/* ← add this */}
//               <Route path="/teachers/:id/create-project" element={<CreateProject />} />
//               {/* Optional detail routes if you want teacher-scoped URLs too: */}
//               <Route path="/teachers/:id/projects/:projectId" element={<ProjectDetails />} />
//               <Route path="/tasks/:id" element={<TaskDetails />} />
//             </Route>

//             {/* Generic /projects → auto-redirect students to scoped list; staff stay here */}
//             <Route element={<RequireAuth roles={["STUDENT", "TEACHER", "ADMIN"]} />}>
//               <Route
//                 path="/projects"
//                 element={
//                   <CanonicalizeStudent to={(id) => `/students/${id}/projects`}>
//                     <Projects />
//                   </CanonicalizeStudent>
//                 }
//               />
//             </Route>

//             {/* Optional general pages (guard as needed). If you want them protected, wrap with RequireAuth */}
//             <Route path="/courses" element={<Courses />} />
//             <Route path="/teams" element={<Teams />} />
//             <Route path="/tasks/:id" element={<TaskDetails />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/settings" element={<Settings />} />

//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </AppHealthGate>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;






import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppHealthGate from "@/components/AppHealthGate";
import RequireAuth from "@/components/RequireAuth";

import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Projects from "./pages/Projects";
import Courses from "./pages/Courses";
import Teams from "./pages/Teams";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import CreateProject from "./pages/CreateProject";
import Departments from "./pages/Departments";
import NotFound from "./pages/NotFound";
import CourseDetails from "./pages/CourseDetails";
import InvitationsPage from "./pages/Invitations";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import TeacherCourses from "./pages/TeachCourses";

const queryClient = new QueryClient();

/* ----------------------------------------------------------------------------
   Helpers
---------------------------------------------------------------------------- */

// If user is a STUDENT, redirect a generic path to the student-scoped one
const CanonicalizeStudent: React.FC<{
  to: (id: string) => string;
  children: React.ReactNode;
}> = ({ to, children }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: me,
    retry: 0,
  });
  if (isLoading) return null;
  if (isError || !data?.user) return <Navigate to="/login" replace />;
  const user = data.user;
  if (user.role === "STUDENT") return <Navigate to={to(user.id)} replace />;
  return <>{children}</>;
};

// Role-aware dashboard redirect: students -> /students/:id/dashboard, staff -> /teacher-dashboard
const RoleDashboardRedirect: React.FC = () => {
  const { data, isLoading, isError } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  if (isLoading) return null;
  if (isError || !data?.user) return <Navigate to="/login" replace />;
  const { user } = data;
  const to = user.role === "STUDENT" ? `/students/${user.id}/dashboard` :  `/teachers/${user.id}/dashboard`; 
  return <Navigate to={to} replace />;
};

// Landing that forwards authenticated users directly to their dashboard
const Landing: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  if (isLoading) return null;
  if (data?.user) return <RoleDashboardRedirect />;
  return <Index />;
};

/* ----------------------------------------------------------------------------
   App
---------------------------------------------------------------------------- */

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <AppHealthGate timeoutMs={3000} retryEveryMs={5000}>
        <BrowserRouter>
          <Routes>
            {/* public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Optional public course details (keep if you want it browsable while logged out) */}
            <Route path="/courses/:id" element={<CourseDetails />} />

            {/* Canonical dashboard route for any authenticated user */}
            <Route element={<RequireAuth roles={["STUDENT", "TEACHER", "ADMIN"]} />}>
              <Route path="/dashboard" element={<RoleDashboardRedirect />} />
            </Route>

            {/* ---------------- STUDENT (self-scoped) ---------------- */}
            <Route element={<RequireAuth roles={["STUDENT"]} self paramName="id" />}>
              <Route path="/students/:id/dashboard" element={<StudentDashboard />} />
              <Route path="/students/:id/projects" element={<Projects />} />
              <Route path="/students/:id/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/students/:id/courses" element={<Courses />} />
              <Route path="/students/:id/teams" element={<Teams />} />
              <Route path="/students/:id/tasks/:taskId" element={<TaskDetails />} />
              <Route path="/students/:id/invitations" element={<InvitationsPage />} />
              <Route path="/students/:id/profile" element={<Profile />} />
              <Route path="/students/:id/settings" element={<Settings />} />
            </Route>

            {/* ---------------- TEACHER (self-scoped) ---------------- */}
            <Route element={<RequireAuth roles={["TEACHER", "ADMIN"]} self paramName="id" />}>
              <Route path="/teachers/:id/dashboard" element={<TeacherDashboard />} />
              <Route path="/teachers/:id/projects" element={<Projects />} />
              <Route path="/teachers/:id/courses" element={<TeacherCourses />} />
              <Route path="/teachers/:id/create-project" element={<CreateProject />} />
              {/* optional teacher-scoped details */}
              <Route path="/teachers/:id/projects/:projectId" element={<ProjectDetails />} />
            </Route>

            {/* ---------------- Teacher/Admin generic detail routes ---------------- */}
            {/* Global routes for reviewing any project or task */}
            <Route element={<RequireAuth roles={["TEACHER", "ADMIN"]} />}>
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/tasks/:taskId" element={<TaskDetails />} />
            </Route>

            {/* Generic /projects → students get redirected to their scoped list; staff stay here */}
            <Route element={<RequireAuth roles={["STUDENT", "TEACHER", "ADMIN"]} />}>
              <Route
                path="/projects"
                element={
                  <CanonicalizeStudent to={(id) => `/students/${id}/projects`}>
                    <Projects />
                  </CanonicalizeStudent>
                }
              />
            </Route>

            {/* Optional general pages (unguarded or guard if you prefer) */}
            {/* Remove the duplicate unguarded /tasks/:id you had earlier; keep only /tasks/:taskId above */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppHealthGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;