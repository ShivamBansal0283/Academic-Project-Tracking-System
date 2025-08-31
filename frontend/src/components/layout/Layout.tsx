import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";

interface LayoutProps {
  children: React.ReactNode;
  userRole?: "student" | "teacher" | "admin"; // optional override
  userName?: string;                           // optional override
}

const Layout = ({ children, userRole, userName }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pull session (role & name)
  const { data } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  const sessionRole = data?.user?.role?.toLowerCase() as
    | "student"
    | "teacher"
    | "admin"
    | undefined;

  // Prefer explicit prop, else session, else 'student'
  const effectiveRole = userRole ?? sessionRole ?? "student";

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarCollapsed((v) => !v)}
        userRole={effectiveRole}
        userName={userName}
      />

      <div className="flex">
        <Sidebar userRole={effectiveRole} collapsed={sidebarCollapsed} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;