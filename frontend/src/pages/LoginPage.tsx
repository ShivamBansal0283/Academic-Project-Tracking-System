import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialRole = (params.get("role")?.toUpperCase() as Role) || "STUDENT";
  const [role, setRole] = React.useState<Role>(initialRole);
  const [userId, setUserId] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = userId.trim();
    if (!id) {
      alert("Please paste your userId (cuid) from Prisma Studio or seed.");
      return;
    }
    localStorage.setItem("userId", id);
    localStorage.setItem("role", role);

    // redirect based on role
    if (role === "TEACHER") navigate("/teacher-dashboard");
    else if (role === "ADMIN") navigate("/teacher-dashboard"); // change later if you add /admin-dashboard
    else navigate("/student-dashboard");
  }

  return (
    <div className="min-h-[100dvh] grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Dev login for now—sets headers via localStorage.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full border rounded-md h-10 px-3 bg-background"
              >
                <option value="STUDENT">STUDENT</option>
                <option value="TEACHER">TEACHER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID (cuid)</Label>
              <Input
                id="userId"
                placeholder="e.g. ckt9x0... (copy from Prisma Studio)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                This is temporary for dev—backend reads it from <code>X-User-Id</code>.
              </p>
            </div>

            <Button type="submit" className="w-full">Continue</Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Tip: seed or open <code>prisma studio</code> to copy a real user id.
        </CardFooter>
      </Card>
    </div>
  );
}