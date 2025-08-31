import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, FolderOpen, Users, BookOpen, FileText, Mail } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";

interface SidebarProps {
  userRole: "student" | "teacher" | "admin";
  collapsed?: boolean;
}

const Sidebar = ({ userRole, collapsed = false }: SidebarProps) => {
  const location = useLocation();
  const { data } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  const userId = data?.user?.id;

  // base paths per role
  const studentBase = userRole === "student" && userId ? `/students/${userId}` : "";
  const teacherBase = userRole === "teacher" && userId ? `/teachers/${userId}` : "";

  // Dashboard route per role (scoped where applicable)
  const dashboardPath =
    userRole === "student"
      ? (userId ? `${studentBase}/dashboard` : "/login")
      : userRole === "teacher"
      ? (userId ? `${teacherBase}/dashboard` : "/login")
      : "/departments"; // temporary for admin

  // Active helper: supports dynamic student/teacher dashboards + section roots
  const isActive = (path: string) => {
    if (path === dashboardPath) {
      if (userRole === "student") {
        return (
          location.pathname === dashboardPath ||
          (location.pathname.startsWith("/students/") &&
            location.pathname.endsWith("/dashboard"))
        );
      }
      if (userRole === "teacher") {
        return (
          location.pathname === dashboardPath ||
          (location.pathname.startsWith("/teachers/") &&
            location.pathname.endsWith("/dashboard"))
        );
      }
      return location.pathname === path;
    }
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path + "/"))
    );
  };

  const commonItems = [{ icon: Home, label: "Dashboard", path: dashboardPath }];

  const navigationItems =
    userRole === "student"
      ? [
          ...commonItems,
          { icon: FolderOpen, label: "My Projects", path: `${studentBase}/projects` },
          { icon: Users, label: "Teams", path: `${studentBase}/teams` },
          { icon: Mail, label: "Invitations", path: `${studentBase}/invitations` },
          { icon: BookOpen, label: "Courses", path: `${studentBase}/courses` },
        ]
      : userRole === "teacher"
      ? [
          ...commonItems,
          // Teacher-scoped items (mirror student style)
          { icon: FolderOpen, label: "Projects", path: `${teacherBase}/projects` },
          { icon: FileText, label: "Topics", path: `${teacherBase}/create-project` }, // or `${teacherBase}/topics`
          { icon: BookOpen, label: "Courses", path: `${teacherBase}/courses` },
        ]
      : [
          ...commonItems,
          { icon: BookOpen, label: "Departments", path: "/departments" },
          { icon: FolderOpen, label: "All Projects", path: "/projects" },
        ];

  return (
    <aside
      className={cn(
        "bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link key={item.label} to={item.path}>
              <Button
                variant={active ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  collapsed && "justify-center px-2",
                  active && "bg-primary text-primary-foreground"
                )}
                size={collapsed ? "sm" : "default"}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;