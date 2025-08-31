import * as React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useMyTeams,
  usePendingInvitations,
  useAcceptInvitation,
  useDeclineInvitation,
} from "@/hooks/useApi";
import { Users, Plus, Mail, Clock, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import AddMembersDialog from "@/components/teams/AddMembersDialog";

function initials(s: string) {
  const base = s?.trim() || "";
  const parts = base.includes("@")
    ? [base[0], base.split("@")[0].slice(1, 2)]
    : base.split(" ").filter(Boolean);
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
function statusBadgeClass(s?: string) {
  const k = String(s ?? "").toLowerCase();
  if (k === "active") return "bg-status-active text-white";
  if (k === "completed") return "bg-status-completed text-white";
  if (k === "rejected") return "bg-status-rejected text-white";
  return "bg-muted text-muted-foreground";
}

const Teams: React.FC = () => {
  const navigate = useNavigate();

  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  const user = meQuery.data?.user;
  const roleLower =
    (String(user?.role ?? "student").toLowerCase() as "student" | "teacher" | "admin") || "student";

  const { data: teams, isLoading: teamsLoading } = useMyTeams();
  const { data: invitations, isLoading: invitationsLoading } = usePendingInvitations();

  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  const [busyId, setBusyId] = React.useState<string | null>(null);

  // Add Members dialog state
  const [addTeamId, setAddTeamId] = React.useState<string | null>(null);

  const handleAcceptInvitation = async (invitationId: string) => {
    try { setBusyId(invitationId); await accept.mutateAsync(invitationId); }
    finally { setBusyId(null); }
  };
  const handleDeclineInvitation = async (invitationId: string) => {
    try { setBusyId(invitationId); await decline.mutateAsync(invitationId); }
    finally { setBusyId(null); }
  };

  const loading = teamsLoading || invitationsLoading || meQuery.isLoading;
  const myTeams = teams ?? [];
  const pendingInvitations = (invitations ?? []) as any[];

  const selectedTeam = React.useMemo(
    () => (addTeamId ? myTeams.find((t: any) => t.id === addTeamId) : undefined),
    [addTeamId, myTeams]
  );

  return (
    <Layout userRole={roleLower}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
            <p className="text-muted-foreground mt-1">
              Manage your project teams and collaborate with peers.
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground" onClick={() => navigate("/projects")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {loading && (
          <Card><CardContent className="py-8 text-sm text-muted-foreground">Loading…</CardContent></Card>
        )}

        {!loading && pendingInvitations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
              <Badge variant="secondary">{pendingInvitations.length}</Badge>
            </h2>

            <div className="grid gap-4">
              {pendingInvitations.map((inv) => {
                const id: string = inv.id;
                const projectTitle: string = inv.team?.project?.title ?? "Project";
                const courseLabel: string =
                  inv.team?.project?.code || inv.team?.project?.course?.name || "Course";
                const inviter: string = inv.invitedBy?.name || inv.invitedBy?.email || "Someone";
                const created = inv.createdAt ? new Date(inv.createdAt) : null;
                const isBusy = busyId === id || accept.isPending || decline.isPending;

                return (
                  <Card key={id} className="border-warning/20 bg-warning/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{projectTitle}</p>
                            <Badge variant="outline">{courseLabel}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Invited by <span className="font-medium">{inviter}</span>
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {created ? created.toLocaleDateString() : "Pending"}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-success text-success-foreground"
                            onClick={() => handleAcceptInvitation(id)}
                            disabled={isBusy}
                          >
                            {isBusy && busyId === id ? "Accepting…" : "Accept"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineInvitation(id)}
                            disabled={isBusy}
                          >
                            {isBusy && busyId === id ? "Declining…" : "Decline"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Teams
              <Badge variant="secondary">{myTeams.length}</Badge>
            </h2>

            {myTeams.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't joined any teams or received any invitations yet.
                  </p>
                  <Button className="bg-primary text-primary-foreground" onClick={() => navigate("/projects")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Available Projects
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {myTeams.map((team: any) => {
                  const statusLower = String(team.project?.status ?? "NEW").toLowerCase();
                  const projectTitle = team.project?.title ?? "Project";
                  const projectId = team.project?.id;

                  // you can manage if staff, or the team leader
                  const canManage =
                    roleLower !== "student" || (user?.id && user.id === team.leaderId);

                  return (
                    <Card key={team.id} className="animate-fade-in">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">{team.name}</CardTitle>
                            <p className="text-muted-foreground">{projectTitle}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {canManage && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAddTeamId(team.id)}
                                title="Add member"
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add member
                              </Button>
                            )}
                            <Badge className={statusBadgeClass(statusLower)}>{statusLower}</Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">
                            Team Members ({team.members?.length ?? 0})
                          </h4>
                          <div className="space-y-2">
                            {(team.members ?? []).map((m: any, idx: number) => {
                              const name = m.user?.name || m.user?.email || "Member";
                              const email = m.user?.email || "";
                              const avatar = m.user?.avatarUrl || "";
                              return (
                                <div
                                  key={m.user?.id ?? `${team.id}-${idx}`}
                                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={avatar} />
                                      <AvatarFallback>{initials(name || email)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm">{name}</p>
                                      {email && <p className="text-xs text-muted-foreground">{email}</p>}
                                    </div>
                                  </div>
                                  <Badge variant={m.role === "Leader" ? "default" : "secondary"}>
                                    {m.role}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              if (!projectId || !user?.id) return;
                              navigate(`/students/${user.id}/projects/${projectId}`);
                            }}
                            disabled={!projectId || !user?.id}
                          >
                            View Project
                          </Button>
                          <Button className="flex-1 bg-primary text-primary-foreground" disabled>
                            Team Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Members dialog */}
      <AddMembersDialog
        open={!!addTeamId}
        onOpenChange={(v) => !v && setAddTeamId(null)}
        teamId={addTeamId ?? ""}
        teamName={selectedTeam?.name}
      />
    </Layout>
  );
};

export default Teams;