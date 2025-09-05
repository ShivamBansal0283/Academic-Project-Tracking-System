import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qc = useQueryClient();

  // only allow internal redirects
  const rawNext = params.get("next") || "";
  const safeNext = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: ({ user }) => {
      // Warm /auth/me so guards resolve instantly
      qc.setQueryData(["me"], { user });

      const isStaff = user.role === "TEACHER" || user.role === "ADMIN";
      const defaultDest = isStaff
        ? `/teachers/${user.id}/dashboard`
        : `/students/${user.id}/dashboard`;

      navigate(safeNext || defaultDest, { replace: true });
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate();
  }

  return (
    <div className="min-h-[100dvh] grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">Use your email and password.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-red-600">Invalid credentials</p> : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Demo accounts : s1@univ.edu / student123, rao@univ.edu / teacher123
        </CardFooter>
      </Card>
    </div>
  );
}
