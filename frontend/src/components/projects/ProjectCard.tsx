import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, CheckCircle } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: "new" | "active" | "completed" | "rejected";
    course: string;
    department: string;
    deadline?: string;
    teamMembers?: Array<{ name?: string; avatar?: string }>;
    progress?: number;
    tasks?: { total: number; completed: number };
  };
  onAction?: (projectId: string, action: string) => void;
  userRole?: "student" | "teacher" | "admin";
}

export const ACTIONS = {
  view: "view",
  formTeam: "formTeam",
  viewTasks: "viewTasks",
  viewResults: "viewResults",
  proposeAgain: "proposeAgain",
} as const;

const ProjectCard = ({ project, onAction, userRole = "student" }: ProjectCardProps) => {
  const hasTeam = (project.teamMembers?.length ?? 0) > 0;
  const isStaff = userRole === "teacher" || userRole === "admin";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-status-new text-white";
      case "active":
        return "bg-status-active text-white";
      case "completed":
        return "bg-status-completed text-white";
      case "rejected":
        return "bg-status-rejected text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Primary action follows student-centric lifecycle:
  // NEW (no team)     -> Form Team
  // NEW (team exists) -> View Tasks (should quickly become ACTIVE, but safe-guard)
  // ACTIVE            -> View Tasks
  // COMPLETED         -> View Results
  // REJECTED          -> Propose Again
  const PrimaryAction = () => {
    if (isStaff) {
      return (
        <Button variant="outline" size="sm" onClick={() => onAction?.(project.id, ACTIONS.view)}>
          View Details
        </Button>
      );
    }

    if (project.status === "new" && !hasTeam) {
      return (
        <Button onClick={() => onAction?.(project.id, ACTIONS.formTeam)} className="bg-primary text-primary-foreground">
          Form Team
        </Button>
      );
    }

    if (project.status === "active" || (project.status === "new" && hasTeam)) {
      return (
        <Button variant="outline" onClick={() => onAction?.(project.id, ACTIONS.viewTasks)}>
          View Tasks
        </Button>
      );
    }

    if (project.status === "completed") {
      return (
        <Button variant="outline" onClick={() => onAction?.(project.id, ACTIONS.viewResults)}>
          View Results
        </Button>
      );
    }

    if (project.status === "rejected") {
      return (
        <Button
          onClick={() => onAction?.(project.id, ACTIONS.proposeAgain)}
          className="bg-warning text-warning-foreground"
        >
          Propose Again
        </Button>
      );
    }

    // Fallback (shouldn't hit)
    return (
      <Button variant="outline" onClick={() => onAction?.(project.id, ACTIONS.view)}>
        View Details
      </Button>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {project.course} • {project.department}
            </p>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>

        {project.deadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
          </div>
        )}

        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map((member, i) => {
                const initials = (member.name ?? "User")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <Avatar key={i} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                );
              })}
              {project.teamMembers.length > 3 && (
                <div className="h-6 w-6 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{project.teamMembers.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {project.tasks && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>
              {project.tasks.completed}/{project.tasks.total} tasks completed
            </span>
          </div>
        )}

        {typeof project.progress === "number" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-success h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-2">
        {/* Secondary: View Details always available to students too */}
        <Button variant="outline" onClick={() => onAction?.(project.id, ACTIONS.view)}>
          View Details
        </Button>
        <PrimaryAction />
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;