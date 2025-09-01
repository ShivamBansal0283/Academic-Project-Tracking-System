
// import * as React from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { me } from "@/api/auth";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
// import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

// import { Bell, Search, Menu, LogOut, Settings, User } from "lucide-react";

// interface HeaderProps {
//   onMenuClick?: () => void;
//   /** Optional overrides; if omitted we use /auth/me */
//   userRole?: "student" | "teacher" | "admin";
//   userName?: string;
// }

// function titleCaseEmailLocal(email?: string) {
//   const local = (email || "").split("@")[0];
//   if (!local) return "";
//   return local
//     .replace(/[._-]+/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// }

// const Header = ({ onMenuClick, userRole, userName }: HeaderProps) => {
//   const navigate = useNavigate();
//   const qc = useQueryClient();
//   const { data } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

//   const sessionUser = data?.user;
//   const displayName =
//     (userName && userName.trim()) ||
//     (sessionUser?.name && sessionUser.name.trim()) ||
//     titleCaseEmailLocal(sessionUser?.email) ||
//     "Account";

//   const roleDisplay =
//     userRole ||
//     (sessionUser?.role
//       ? (sessionUser.role.toLowerCase() as "student" | "teacher" | "admin")
//       : "student");

//   const initials = displayName
//     .split(" ")
//     .filter(Boolean)
//     .map((p) => p[0]!)
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const avatarUrl = (sessionUser as any)?.avatarUrl as string | undefined;

//   const profilePath =
//     roleDisplay === "student" && sessionUser?.id
//       ? `/students/${sessionUser.id}/profile`
//       : "/profile";

//   async function handleSignOut() {
//     try {
//       await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
//     } catch {
//       // ignore; still clear client state
//     } finally {
//       // Clear client cache and bounce to login
//       qc.clear();
//       window.location.href = "/login";
//     }
//   }

//   return (
//     <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
//       <div className="flex items-center gap-4">
//         {onMenuClick && (
//           <Button variant="ghost" size="sm" onClick={onMenuClick} aria-label="Toggle sidebar">
//             <Menu className="h-5 w-5" />
//           </Button>
//         )}
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
//             <span className="text-white font-bold text-sm">AP</span>
//           </div>
//           <h1 className="text-xl font-semibold text-foreground">AcademiTrack</h1>
//         </div>
//       </div>

//       <div className="flex-1 max-w-md mx-8">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
//           <Input
//             placeholder="Search projects, courses, students..."
//             className="pl-10 bg-muted/50 border-0"
//           />
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
//           <Bell className="h-5 w-5" />
//           <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full h-5 w-5 grid place-items-center">
//             3
//           </span>
//         </Button>

//         {/* Profile: Hover card + click dropdown on the same trigger */}
//         <HoverCard openDelay={120} closeDelay={150}>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <HoverCardTrigger asChild>
//                 <button
//                   type="button"
//                   className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/60 transition-colors"
//                   aria-label="Open profile menu"
//                 >
//                   <Avatar className="h-8 w-8">
//                     {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
//                     <AvatarFallback className="bg-primary text-primary-foreground">
//                       {initials}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="text-left text-sm hidden sm:block">
//                     <p className="font-medium leading-4">{displayName}</p>
//                     <p className="text-muted-foreground capitalize leading-4">{roleDisplay}</p>
//                   </div>
//                 </button>
//               </HoverCardTrigger>
//             </DropdownMenuTrigger>

//             {/* Click menu */}
//             <DropdownMenuContent align="end" className="w-48">
//               <DropdownMenuItem onClick={() => navigate(profilePath)}>
//                 <User className="h-4 w-4 mr-2" />
//                 Profile
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => navigate("/settings")}>
//                 <Settings className="h-4 w-4 mr-2" />
//                 Settings
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Sign out
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Hover card */}
//           <HoverCardContent align="end" className="w-72">
//             <div className="flex items-center gap-3">
//               <Avatar className="h-10 w-10">
//                 {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
//                 <AvatarFallback className="bg-primary text-primary-foreground">
//                   {initials}
//                 </AvatarFallback>
//               </Avatar>
//               <div className="min-w-0">
//                 <p className="font-semibold truncate">{displayName}</p>
//                 {sessionUser?.email && (
//                   <p className="text-xs text-muted-foreground truncate">{sessionUser.email}</p>
//                 )}
//                 <p className="text-xs text-muted-foreground capitalize">{roleDisplay}</p>
//               </div>
//             </div>

//             <div className="mt-3 flex gap-2">
//               <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(profilePath)}>
//                 View Profile
//               </Button>
//               <Button size="sm" className="flex-1" onClick={() => navigate("/settings")}>
//                 Settings
//               </Button>
//             </div>
//           </HoverCardContent>
//         </HoverCard>
//       </div>
//     </header>
//   );
// };

// export default Header;



import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { me } from "@/api/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

import { Bell, Search, Menu, LogOut, Settings, User } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  /** Optional overrides; if omitted we use /auth/me */
  userRole?: "student" | "teacher" | "admin";
  userName?: string;
}

function titleCaseEmailLocal(email?: string) {
  const local = (email || "").split("@")[0];
  if (!local) return "";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const Header = ({ onMenuClick, userRole, userName }: HeaderProps) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["me"], queryFn: me, retry: 0 });

  const sessionUser = data?.user;
  const displayName =
    (userName && userName.trim()) ||
    (sessionUser?.name && sessionUser.name.trim()) ||
    titleCaseEmailLocal(sessionUser?.email) ||
    "Account";

  const roleLower =
    (sessionUser?.role?.toLowerCase() as "student" | "teacher" | "admin") ||
    userRole ||
    "student";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0]!)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl = (sessionUser as any)?.avatarUrl as string | undefined;

  // Role-aware paths
  const studentBase =
    roleLower === "student" && sessionUser?.id ? `/students/${sessionUser.id}` : "";

  const profilePath = studentBase ? `${studentBase}/profile` : "/profile";
  const settingsPath = studentBase ? `${studentBase}/settings` : "/settings";

  function goProfile() {
    navigate(profilePath);
  }
  function goSettings() {
    navigate(settingsPath);
  }

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore; still clear client state
    } finally {
      qc.clear();
      window.location.href = "/";
    }
  }

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="sm" onClick={onMenuClick} aria-label="Toggle sidebar">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AP</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">AcademiTrack</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects, courses, students..."
            className="pl-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full h-5 w-5 grid place-items-center">
            3
          </span>
        </Button>

        {/* Profile: Hover card + click dropdown on the same trigger */}
        <HoverCard openDelay={120} closeDelay={150}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/60 transition-colors"
                  aria-label="Open profile menu"
                >
                  <Avatar className="h-8 w-8">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left text-sm hidden sm:block">
                    <p className="font-medium leading-4">{displayName}</p>
                    <p className="text-muted-foreground capitalize leading-4">{roleLower}</p>
                  </div>
                </button>
              </HoverCardTrigger>
            </DropdownMenuTrigger>

            {/* Click menu */}
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={goProfile}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={goSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hover card */}
          <HoverCardContent align="end" className="w-72">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p
                  className="font-semibold truncate cursor-pointer hover:underline"
                  onClick={goProfile}
                >
                  {displayName}
                </p>
                {sessionUser?.email && (
                  <p className="text-xs text-muted-foreground truncate">{sessionUser.email}</p>
                )}
                <p className="text-xs text-muted-foreground capitalize">{roleLower}</p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={goProfile}>
                View Profile
              </Button>
              <Button size="sm" className="flex-1" onClick={goSettings}>
                Settings
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </header>
  );
};

export default Header;