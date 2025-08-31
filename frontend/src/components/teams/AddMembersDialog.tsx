import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInviteToTeam } from "@/hooks/useApi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName?: string;
};

function parseEmails(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\s,;\n]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export default function AddMembersDialog({ open, onOpenChange, teamId, teamName }: Props) {
  const [emails, setEmails] = React.useState("");
  const invite = useInviteToTeam();
  const busy = invite.isPending;

  const handleClose = (v: boolean) => {
    if (busy) return;
    if (!v) setEmails("");
    onOpenChange(v);
  };

  const handleInvite = async () => {
    const list = parseEmails(emails);
    if (!list.length) return;
    try {
      await Promise.allSettled(list.map((email) => invite.mutateAsync({ teamId, email })));
      setEmails("");
      onOpenChange(false);
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add members{teamName ? ` — ${teamName}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-emails">Emails</Label>
            <Input
              id="invite-emails"
              placeholder="alice@uni.edu, bob@uni.edu"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              disabled={busy}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple emails with commas, spaces, or new lines.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={busy || parseEmails(emails).length === 0}>
            {busy ? "Inviting…" : "Send Invites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}