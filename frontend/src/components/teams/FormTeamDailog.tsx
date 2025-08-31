import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTeam, useInviteToTeam } from "@/hooks/useApi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  /** kept for API symmetry if you pass it from parent, not used server-side */
  leaderId?: string;
  onCreated?: (teamId: string) => void;
};

export default function FormTeamDialog({ open, onOpenChange, projectId, onCreated }: Props) {
  const [name, setName] = React.useState("");
  const [emails, setEmails] = React.useState("");

  const createTeam = useCreateTeam();
  const invite = useInviteToTeam();

  const busy = createTeam.isPending || invite.isPending;

  const reset = () => {
    setName("");
    setEmails("");
  };

  const parseEmails = (raw: string) =>
    Array.from(
      new Set(
        raw
          .split(/[\s,;\n]+/)
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
      )
    );

  const handleSubmit = async () => {
    const teamName = name.trim();
    if (teamName.length < 2) return;

    try {
      // 1) create team (leader = current user from cookie/session on server)
      const created: any = await createTeam.mutateAsync({ name: teamName, projectId });
      const teamId: string = created?.id ?? created?.team?.id;
      if (!teamId) throw new Error("Team creation did not return an id");

      // 2) send invites (optional)
      const list = parseEmails(emails);
      if (list.length) {
        await Promise.allSettled(list.map((email) => invite.mutateAsync({ teamId, email })));
      }

      // 3) close & reset
      reset();
      onOpenChange(false);
      onCreated?.(teamId);
    } catch {
      // errors are toasted in hooks already
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (busy) return; // prevent closing while submitting
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form a Team</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Team Alpha"
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-emails">Invite members (optional)</Label>
            <Input
              id="invite-emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="a@uni.edu, b@uni.edu (comma/space/newline separated)"
              disabled={busy}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy || name.trim().length < 2}>
            {busy ? "Creating…" : "Create team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}