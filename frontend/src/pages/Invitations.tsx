import * as React from "react";
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, Clock, CheckCircle2, XCircle, Users } from "lucide-react";
import { useInvitations, useAcceptInvitation, useDeclineInvitation } from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";

function Row({
  inv,
  busyId,
  onAccept,
  onDecline,
}: {
  inv: any;
  busyId: string | null;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const id: string = inv.id;
  const projectTitle: string = inv.team?.project?.title ?? "Project";
  const courseLabel: string =
    inv.team?.project?.course?.name || inv.team?.project?.code || "Course";
  const inviter: string = inv.invitedBy?.name || inv.invitedBy?.email || inv.email || "Someone";
  const created = inv.createdAt ? new Date(inv.createdAt) : null;
  const responded = inv.respondedAt ? new Date(inv.respondedAt) : null;
  const status = String(inv.status ?? "PENDING").toUpperCase();
  const isBusy = busyId === id;

  return (
    <Card key={id} className="border-muted">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{projectTitle}</p>
              <Badge variant="outline">{courseLabel}</Badge>
              <Badge variant={status === "PENDING" ? "secondary" : status === "ACCEPTED" ? "default" : "outline"}>
                {status.toLowerCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Invited by <span className="font-medium">{inviter}</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {created ? created.toLocaleString() : "—"}
              </span>
              {responded && (
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Responded {responded.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {status === "PENDING" ? (
            <div className="flex gap-2">
              <Button size="sm" className="bg-success text-success-foreground" disabled={isBusy} onClick={() => onAccept(id)}>
                {isBusy ? "Accepting…" : "Accept"}
              </Button>
              <Button size="sm" variant="outline" disabled={isBusy} onClick={() => onDecline(id)}>
                {isBusy ? "Declining…" : "Decline"}
              </Button>
            </div>
          ) : status === "ACCEPTED" ? (
            <div className="flex gap-2">
              <Badge className="bg-status-completed text-white">Accepted</Badge>
            </div>
          ) : (
            <div className="flex gap-2">
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" /> Declined
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const InvitationsPage: React.FC = () => {
  const { id: routeUserId } = useParams<{ id: string }>();
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

  if (meQuery.isError) return <Navigate to="/login" replace />;
  const user = meQuery.data?.user;
  const userId = user?.id;

  // student path guard
  if (user?.role === "STUDENT" && routeUserId && routeUserId !== userId) {
    return <Navigate to={`/students/${userId}/invitations`} replace />;
  }

  const [tab, setTab] = React.useState<"pending" | "accepted" | "declined">("pending");
  const { data: pending, isLoading: loadingPending } = useInvitations("pending");
  const { data: accepted, isLoading: loadingAccepted } = useInvitations("accepted");
  const { data: declined, isLoading: loadingDeclined } = useInvitations("declined");

  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const onAccept = async (id: string) => {
    try { setBusyId(id); await accept.mutateAsync(id); } finally { setBusyId(null); }
  };
  const onDecline = async (id: string) => {
    try { setBusyId(id); await decline.mutateAsync(id); } finally { setBusyId(null); }
  };

  const roleLower = String(user?.role ?? "student").toLowerCase() as "student" | "teacher" | "admin";

  const lists = {
    pending: pending ?? [],
    accepted: accepted ?? [],
    declined: declined ?? [],
  };
  const loading = loadingPending || loadingAccepted || loadingDeclined || meQuery.isLoading;

  return (
    <Layout userRole={roleLower}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
            <p className="text-muted-foreground mt-1">View and manage your team invitations.</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Mail className="h-4 w-4" /> {lists.pending.length} pending
          </Badge>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({lists.pending.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({lists.accepted.length})</TabsTrigger>
            <TabsTrigger value="declined">Declined ({lists.declined.length})</TabsTrigger>
          </TabsList>

          {(["pending", "accepted", "declined"] as const).map((key) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {loading ? (
                <Card><CardContent className="py-8 text-sm text-muted-foreground">Loading…</CardContent></Card>
              ) : lists[key].length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No {key} invitations</h3>
                    <p className="text-muted-foreground">You have no {key} invitations right now.</p>
                  </CardContent>
                </Card>
              ) : (
                lists[key].map((inv: any) => (
                  <Row key={inv.id} inv={inv} busyId={busyId} onAccept={onAccept} onDecline={onDecline} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default InvitationsPage;