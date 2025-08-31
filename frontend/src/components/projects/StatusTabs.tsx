// src/components/projects/StatusTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ProjectCard, { ACTIONS } from "./ProjectCard";

interface StatusTabsProps {
  projects: {
    new: any[];
    active: any[];
    completed: any[];
    rejected?: any[];
  };
  onProjectAction?: (
    projectId: string,
    action: typeof ACTIONS[keyof typeof ACTIONS]
  ) => void;
  userRole?: "student" | "teacher" | "admin";
  /** Show skeletons / suppress empty states while data is loading */
  isLoading?: boolean;
}

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="border rounded-lg p-4">
        <div className="h-5 w-2/3 bg-muted/50 rounded mb-3" />
        <div className="h-4 w-1/2 bg-muted/40 rounded mb-2" />
        <div className="h-3 w-1/3 bg-muted/30 rounded" />
      </div>
    ))}
  </div>
);

const StatusTabs = ({
  projects,
  onProjectAction,
  userRole = "student",
  isLoading = false,
}: StatusTabsProps) => {
  const showRejected = Array.isArray(projects.rejected);

  const CountBadge = ({ n }: { n: number }) =>
    n > 0 ? (
      <Badge variant="secondary" className="ml-1">
        {n}
      </Badge>
    ) : null;

  const renderGrid = (list: any[]) => {
    if (isLoading) return <SkeletonGrid />;
    if (!list?.length)
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nothing here yet.</p>
        </div>
      );
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onAction={onProjectAction}
            userRole={userRole}
          />
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className={`grid w-full ${showRejected ? "grid-cols-4" : "grid-cols-3"}`}>
        <TabsTrigger value="new" className="flex items-center gap-2">
          New Projects
          {!isLoading && <CountBadge n={projects.new.length} />}
        </TabsTrigger>

        <TabsTrigger value="active" className="flex items-center gap-2">
          Active
          {!isLoading && <CountBadge n={projects.active.length} />}
        </TabsTrigger>

        <TabsTrigger value="completed" className="flex items-center gap-2">
          Completed
          {!isLoading && <CountBadge n={projects.completed.length} />}
        </TabsTrigger>

        {showRejected && (
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Rejected
            {!isLoading && <CountBadge n={projects.rejected!.length} />}
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="new" className="space-y-4">
        {renderGrid(projects.new)}
      </TabsContent>

      <TabsContent value="active" className="space-y-4">
        {renderGrid(projects.active)}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        {renderGrid(projects.completed)}
      </TabsContent>

      {showRejected && (
        <TabsContent value="rejected" className="space-y-4">
          {renderGrid(projects.rejected!)}
        </TabsContent>
      )}
    </Tabs>
  );
};

export default StatusTabs;