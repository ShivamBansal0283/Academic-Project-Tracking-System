import * as React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { me } from "@/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { http } from "@/api/_client";

function lcRole(r?: string): "student" | "teacher" | "admin" {
  return (String(r ?? "student").toLowerCase() as any) || "student";
}

export default function Settings() {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });
  if (meQuery.isError) return <Navigate to="/login" replace />;

  const user = meQuery.data?.user;
  const roleLower = lcRole(user?.role);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const valid =
    currentPassword.trim().length >= 6 &&
    newPassword.trim().length >= 8 &&
    newPassword === confirm;

  async function onSubmit() {
    if (!valid || submitting) return;
    try {
      setSubmitting(true);
      await http("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast({ title: "Password updated", description: "Your password has been changed." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Could not change password.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout userRole={roleLower}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Current password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="•••••••"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Confirm new password</label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={onSubmit}
                disabled={!valid || submitting}
                className="bg-primary text-primary-foreground"
              >
                {submitting ? "Updating…" : "Update password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}