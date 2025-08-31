// import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
// import * as projectsApi from "@/api/projects";
// import * as coursesApi from "@/api/courses";
// import * as teamsApi from "@/api/teams";
// import * as tasksApi from "@/api/tasks";
// import { toast } from "@/hooks/use-toast";

// /* =========================
//    PROJECTS
//    ========================= */

// export const useMyProjects = () => {
//   return useQuery({
//     queryKey: ["projects", "mine"],
//     queryFn: projectsApi.getMyProjects, // grouped { new, active, completed, rejected }
//     retry: false,
//     meta: { errorMessage: "Failed to fetch my projects" },
//   });
// };

// export const useProjects = (status?: "NEW" | "ACTIVE" | "COMPLETED" | "REJECTED") => {
//   return useQuery({
//     queryKey: ["projects", status ?? "ALL"],
//     queryFn: () => projectsApi.getProjects(status),
//     retry: false,
//     meta: { errorMessage: "Failed to fetch projects" },
//   });
// };

// // Generic version so you can pass options (like enabled) from callers
// export const useProject = <T = any>(
//   id: string,
//   options?: Omit<UseQueryOptions<T, unknown, T, [string, string]>, "queryKey" | "queryFn">
// ) => {
//   return useQuery({
//     queryKey: ["projects", id],
//     queryFn: () => projectsApi.getProject(id) as Promise<T>,
//     enabled: !!id,
//     retry: false,
//     ...options,
//   });
// };

// export const useCreateProject = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: projectsApi.createProject,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["projects"] });
//       toast({ title: "Success", description: "Project topic created successfully" });
//     },
//     onError: () => {
//       toast({ title: "Error", description: "Failed to create project topic", variant: "destructive" });
//     },
//   });
// };

// export const useApproveProject = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: projectsApi.approveProject,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["projects"] });
//       toast({ title: "Success", description: "Project approved successfully" });
//     },
//     onError: () => {
//       toast({ title: "Error", description: "Failed to approve project", variant: "destructive" });
//     },
//   });
// };

// export const useRejectProject = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ projectId, reason }: { projectId: string; reason: string }) =>
//       projectsApi.rejectProject(projectId, reason),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["projects"] });
//       toast({ title: "Success", description: "Project rejected" });
//     },
//     onError: () => {
//       toast({ title: "Error", description: "Failed to reject project", variant: "destructive" });
//     },
//   });
// };

// /* =========================
//    COURSES
//    ========================= */

// export const useCourse = (id: string) => {
//   return useQuery({
//     queryKey: ["courses", "detail", id],
//     enabled: !!id,
//     retry: false,
//     queryFn: () => coursesApi.getCourse(id),
//   });
// };

// export const useCourses = () => {
//   return useQuery({
//     queryKey: ["courses"],
//     queryFn: coursesApi.getCourses,
//     retry: false,
//   });
// };

// export const useMyCourses = () => {
//   return useQuery({
//     queryKey: ["courses", "mine"],
//     queryFn: coursesApi.getMyCourses,
//     retry: false,
//   });
// };

// export const useCreateCourse = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: coursesApi.createCourse,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["courses"] });
//       qc.invalidateQueries({ queryKey: ["courses", "mine"] });
//       toast({ title: "Success", description: "Course created successfully" });
//     },
//     onError: () => {
//       toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
//     },
//   });
// };

// export const useEnrollInCourse = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: coursesApi.enrollInCourse,
//     onSuccess: () => {
//       // After enroll, backend creates NEW student projects for that course.
//       qc.invalidateQueries({ queryKey: ["courses"] });
//       qc.invalidateQueries({ queryKey: ["courses", "mine"] });
//       qc.invalidateQueries({ queryKey: ["projects"] });       // <-- important for NEW projects to appear
//       toast({ title: "Success", description: "Enrolled in course successfully" });
//     },
//     onError: () => {
//       toast({ title: "Error", description: "Failed to enroll in course", variant: "destructive" });
//     },
//   });
// };

// export const useDepartments = () => {
//   return useQuery({
//     queryKey: ["departments"],
//     queryFn: coursesApi.getDepartments,
//     retry: false,
//   });
// };

// /* =========================
//    TEAMS
//    ========================= */

// export const useMyTeams = () =>
//   useQuery({
//     queryKey: ["teams", "mine"],
//     queryFn: teamsApi.getMyTeams,
//     retry: false,
//   });

// export const usePendingInvitations = () =>
//   useQuery({
//     queryKey: ["team-invitations", "pending"],
//     queryFn: teamsApi.getPendingInvitations,
//     retry: false,
//   });

// export const useCreateTeam = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ name, projectId }: { name: string; projectId: string }) =>
//       teamsApi.createTeam({ name, projectId }),
//     onSuccess: () => {
//       // Team creation flips project to ACTIVE via lifecycle job; refresh all project views.
//       qc.invalidateQueries({ queryKey: ["teams"] });
//       qc.invalidateQueries({ queryKey: ["projects"] });
//       toast({ title: "Success", description: "Team created successfully" });
//     },
//     onError: (e: any) => {
//       toast({
//         title: "Error",
//         description: e?.message?.includes("409")
//           ? "A team already exists for this project"
//           : "Failed to create team",
//         variant: "destructive",
//       });
//     },
//   });
// };

// export const useInviteToTeam = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ teamId, email }: { teamId: string; email: string }) =>
//       teamsApi.inviteToTeam(teamId, email),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["teams"] });
//       toast({ title: "Success", description: "Invitation sent" });
//     },
//     onError: (e: any) => {
//       toast({
//         title: "Error",
//         description: e?.message?.includes("409")
//           ? "User is already a member / pending"
//           : "Failed to send invitation",
//         variant: "destructive",
//       });
//     },
//   });
// };

// export const useAcceptInvitation = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: teamsApi.acceptInvitation,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["teams"] });
//       qc.invalidateQueries({ queryKey: ["team-invitations"] });
//       qc.invalidateQueries({ queryKey: ["projects"] }); // membership might affect project views
//       toast({ title: "Success", description: "Invitation accepted" });
//     },
//     onError: () => {
//       toast({ title: "Error", description: "Failed to accept invitation", variant: "destructive" });
//     },
//   });
// };

// export const useDeclineInvitation = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: teamsApi.declineInvitation,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["team-invitations"] });
//       toast({ title: "Success", description: "Invitation declined" });
//     },
//     onError: () => {
//       toast({ title: "Error", description: "Failed to decline invitation", variant: "destructive" });
//     },
//   });
// };

// /* =========================
//    TASKS
//    ========================= */

// export const useProjectTasks = (projectId: string) => {
//   return useQuery({
//     queryKey: ["tasks", "project", projectId],
//     queryFn: () => tasksApi.getProjectTasks(projectId),
//     enabled: !!projectId,
//     retry: false,
//     meta: { errorMessage: "Failed to fetch project tasks" },
//   });
// };

// export const useTask = (id: string) => {
//   return useQuery({
//     queryKey: ["tasks", "detail", id],
//     queryFn: () => tasksApi.getTask(id),
//     enabled: !!id,
//     retry: false,
//     meta: { errorMessage: "Failed to fetch task" },
//   });
// };

// export const useSubmitTask = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       taskId,
//       teamId,
//       notes,
//       files,
//     }: { taskId: string; teamId: string; notes: string; files?: File[] }) =>
//       tasksApi.submitTask(taskId, teamId, notes, files),
//     onSuccess: (_data, vars) => {
//       qc.invalidateQueries({ queryKey: ["tasks"] });
//       qc.invalidateQueries({ queryKey: ["tasks", "detail", vars.taskId] });
//       qc.invalidateQueries({ queryKey: ["projects"] }); // lifecycle may switch to COMPLETED
//       toast({ title: "Success", description: "Task submitted successfully" });
//     },
//     onError: () => {
//       toast({ title: "Error", description: "Failed to submit task", variant: "destructive" });
//     },
//   });
// };


import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import * as projectsApi from "@/api/projects";
import * as coursesApi from "@/api/courses";
import * as teamsApi from "@/api/teams";
import * as tasksApi from "@/api/tasks";
import { toast } from "@/hooks/use-toast";

// ---- PROFILE / SETTINGS ----
import * as usersApi from "@/api/users";

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast({ title: "Saved", description: "Profile updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });
};

export const useUploadAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.uploadAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast({ title: "Updated", description: "Avatar updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload avatar", variant: "destructive" });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => {
      toast({ title: "Password changed", description: "Your password has been updated" });
    },
    onError: (e: any) => {
      const msg = e?.message?.includes("incorrect")
        ? "Current password is incorrect"
        : "Failed to change password";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });
};

/* =========================
   PROJECTS
   ========================= */

export const useMyProjects = () => {
  return useQuery({
    queryKey: ["projects", "mine"],
    queryFn: projectsApi.getMyProjects, // grouped { new, active, completed, rejected }
    retry: false,
    meta: { errorMessage: "Failed to fetch my projects" },
  });
};

export const useProjects = (status?: "NEW" | "ACTIVE" | "COMPLETED" | "REJECTED") => {
  return useQuery({
    queryKey: ["projects", status ?? "ALL"],
    queryFn: () => projectsApi.getProjects(status),
    retry: false,
    meta: { errorMessage: "Failed to fetch projects" },
  });
};

// Generic version so you can pass options (like enabled) from callers
export const useProject = <T = any>(
  id: string,
  options?: Omit<UseQueryOptions<T, unknown, T, [string, string]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.getProject(id) as Promise<T>,
    enabled: !!id,
    retry: false,
    ...options,
  });
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Success", description: "Project topic created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project topic", variant: "destructive" });
    },
  });
};

export const useApproveProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.approveProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Success", description: "Project approved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve project", variant: "destructive" });
    },
  });
};

export const useRejectProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, reason }: { projectId: string; reason: string }) =>
      projectsApi.rejectProject(projectId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Success", description: "Project rejected" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject project", variant: "destructive" });
    },
  });
};

/* =========================
   COURSES
   ========================= */

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ["courses", "detail", id],
    enabled: !!id,
    retry: false,
    queryFn: () => coursesApi.getCourse(id),
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.getCourses,
    retry: false,
  });
};

export const useMyCourses = () => {
  return useQuery({
    queryKey: ["courses", "mine"],
    queryFn: coursesApi.getMyCourses,
    retry: false,
  });
};

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["courses", "mine"] });
      toast({ title: "Success", description: "Course created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
    },
  });
};

export const useEnrollInCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.enrollInCourse,
    onSuccess: () => {
      // After enroll, backend creates NEW student projects for that course.
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["courses", "mine"] });
      qc.invalidateQueries({ queryKey: ["projects"] }); // ensure My Projects refresh
      toast({ title: "Success", description: "Enrolled in course successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to enroll in course", variant: "destructive" });
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: coursesApi.getDepartments,
    retry: false,
  });
};

/* =========================
   TEAMS
   ========================= */

export const useMyTeams = () =>
  useQuery({
    queryKey: ["teams", "mine"],
    queryFn: teamsApi.getMyTeams,
    retry: false,
  });

// NEW: generic invitations hook for any status
export const useInvitations = (status: "pending" | "accepted" | "declined" = "pending") =>
  useQuery({
    queryKey: ["team-invitations", status],
    queryFn: () => teamsApi.getInvitations(status),
    retry: false,
  });

// Kept for convenience in places already using it
export const usePendingInvitations = () =>
  useQuery({
    queryKey: ["team-invitations", "pending"],
    queryFn: () => teamsApi.getInvitations("pending"),
    retry: false,
  });

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, projectId }: { name: string; projectId: string }) =>
      teamsApi.createTeam({ name, projectId }),
    onSuccess: () => {
      // Team creation flips project to ACTIVE via lifecycle job; refresh all project views.
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Success", description: "Team created successfully" });
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e?.message?.includes("409")
          ? "A team already exists for this project"
          : "Failed to create team",
        variant: "destructive",
      });
    },
  });
};

export const useInviteToTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, email }: { teamId: string; email: string }) =>
      teamsApi.inviteToTeam(teamId, email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast({ title: "Success", description: "Invitation sent" });
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e?.message?.includes("409")
          ? "User is already a member / pending"
          : "Failed to send invitation",
        variant: "destructive",
      });
    },
  });
};

export const useAcceptInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.acceptInvitation,
    onSuccess: () => {
      // Accepting usually adds you to a team
      qc.invalidateQueries({ queryKey: ["teams"] });                // refresh /mine
      qc.invalidateQueries({ queryKey: ["team-invitations"] });     // refresh all tabs
      qc.invalidateQueries({ queryKey: ["projects"] });             // team membership may affect project views
      toast({ title: "Success", description: "Invitation accepted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to accept invitation", variant: "destructive" });
    },
  });
};

export const useDeclineInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.declineInvitation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-invitations"] });
      toast({ title: "Success", description: "Invitation declined" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to decline invitation", variant: "destructive" });
    },
  });
};

/* =========================
   TASKS
   ========================= */

export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: ["tasks", "project", projectId],
    queryFn: () => tasksApi.getProjectTasks(projectId),
    enabled: !!projectId,
    retry: false,
    meta: { errorMessage: "Failed to fetch project tasks" },
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ["tasks", "detail", id],
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
    retry: false,
    meta: { errorMessage: "Failed to fetch task" },
  });
};

export const useSubmitTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      teamId,
      notes,
      files,
    }: { taskId: string; teamId: string; notes: string; files?: File[] }) =>
      tasksApi.submitTask(taskId, teamId, notes, files),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["tasks", "detail", vars.taskId] });
      qc.invalidateQueries({ queryKey: ["projects"] }); // lifecycle may switch to COMPLETED
      toast({ title: "Success", description: "Task submitted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit task", variant: "destructive" });
    },
  });
};


export const useTeacherSubmissions = (filters: { courseId?: string; projectId?: string; q?: string }) => {
  return useQuery({
    queryKey: ["teacher-submissions", filters],
    queryFn: () => tasksApi.getTeacherSubmissions(filters),
    retry: false,
    meta: { errorMessage: "Failed to fetch submissions" },
  });
};

export type TeacherSubmissionRow = {
  id: string; // task id
  title: string;
  status: "SUBMITTED" | "COMPLETED" | string;
  deadline: string | null;
  project: { id: string; title: string };
  course: { id: string; code: string; name: string };
  team: {
    id: string | null;
    memberCount: number;
    members: Array<{ id: string; name: string; email: string; avatarUrl: string | null }>;
  };
  submission: null | {
    id: string;
    notes: string | null;
    submittedAt: string | null;
    grade: number | null;
    feedback: string | null;
    files: Array<{ id: string; name: string; url: string; size: number; mime: string }>;
  };
};