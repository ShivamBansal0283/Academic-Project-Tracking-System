// import * as React from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { me } from "@/api/auth";

// export default function RequireAuth({ roles }: { roles?: Array<"STUDENT"|"TEACHER"|"ADMIN"> }) {
//   const loc = useLocation();
//   const q = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

//   if (q.isLoading) {
//     return <div className="min-h-[50vh] grid place-items-center">Checking session…</div>;
//   }
//   if (q.isError) {
//     return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
//   }
//   const role = q.data?.user?.role;
//   if (roles && !roles.includes(role)) {
//     return <Navigate to="/login" replace />;
//   }
//   return <Outlet />;
// }




import * as React from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

type Props = {
  /** Allowed roles. Omit to allow any authenticated user. */
  roles?: Role[];
  /** If true, enforce that the route param (paramName) equals the logged-in user id. */
  self?: boolean;
  /** Which route param carries the user id (default "id"). */
  paramName?: string;
  /** Where to send users that fail the role check (default: "/login"). */
  fallbackPath?: string;
};

export default function RequireAuth({
  roles,
  self = false,
  paramName = "id",
  fallbackPath = "/login",
}: Props) {
  const loc = useLocation();
  const params = useParams();
  const q = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

  // Loading / not logged in
  if (q.isLoading) {
    return <div className="min-h-[50vh] grid place-items-center">Checking session…</div>;
  }
  if (q.isError || !q.data?.user) {
    return <Navigate to={`${fallbackPath}?next=${encodeURIComponent(loc.pathname)}`} replace />;
  }

  const user = q.data.user as { id: string; role: Role };

  // Role check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Self scope check (e.g. /students/:id/** or /teachers/:id/** must match who is logged in)
  if (self) {
    const routeId = params[paramName];
    if (!routeId || routeId !== user.id) {
      const base =
        user.role === "STUDENT"
          ? `/students/${user.id}/dashboard`
          : user.role === "TEACHER"
          ? `/teachers/${user.id}/dashboard`
          : "/";
      return <Navigate to={base} replace />;
    }
  }

  return <Outlet />;
}