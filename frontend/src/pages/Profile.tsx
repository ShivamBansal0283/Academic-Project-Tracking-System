import * as React from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpdateProfile, useUploadAvatar } from "@/hooks/useApi";

function initials(name?: string, email?: string) {
  const base = (name && name.trim()) || (email?.split("@")[0] ?? "U");
  return base.split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase();
}

const Profile: React.FC = () => {
  const { id: routeUserId } = useParams<{ id?: string }>();
  const meQuery = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

  if (meQuery.isError) return <Navigate to="/login" replace />;
  if (meQuery.isLoading) return <div className="p-6">Loading…</div>;

  const user = meQuery.data!.user;
  const roleLower = (user.role?.toLowerCase?.() ?? "student") as "student" | "teacher" | "admin";

  // Student path guard: /students/:id/profile must match me
  if (roleLower === "student" && routeUserId && routeUserId !== user.id) {
    return <Navigate to={`/students/${user.id}/profile`} replace />;
  }

  const [name, setName] = React.useState(user.name ?? "");
  const update = useUpdateProfile();
  const upload = useUploadAvatar();

  const onSave = () => update.mutate({ name });

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await upload.mutateAsync(f);
    e.currentTarget.value = ""; // reset file input
  };

  return (
    <Layout userRole={roleLower}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickAvatar}
                />
                <Button asChild variant="outline">
                  <label htmlFor="avatar" className="cursor-pointer">Change avatar</label>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onSave} disabled={update.isPending || name.trim().length < 2}>
                {update.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="outline" onClick={() => setName(user.name ?? "")}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;