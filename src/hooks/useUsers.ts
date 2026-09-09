"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import { UserService } from "@/services/user.service";
import { IUser, UserRole, UserStatus } from "@/types/auth";

// ---------------------------------------------------------------------------
// Fallback seed data (development / API offline)
// ---------------------------------------------------------------------------
let LOCAL_USERS: IUser[] = [
  {
    id: "usr_101",
    name: "System Super Admin",
    email: "superadmin@ru.ac.bd",
    role: "SUPER_ADMIN",
    phoneNumber: "+8801710000001",
    isActive: true,
    status: "ACTIVE",
    createdAt: "2026-01-10",
  },
  {
    id: "usr_102",
    name: "Dr. Abdur Rahman",
    email: "admin.rahman@ru.ac.bd",
    role: "ADMIN",
    phoneNumber: "+8801710000002",
    isActive: true,
    status: "ACTIVE",
    createdAt: "2026-02-15",
  },
  {
    id: "usr_103",
    name: "Hasan Mahmud (Shifter)",
    email: "shifter.hasan@ru.ac.bd",
    role: "SHIFTER",
    phoneNumber: "+8801710000003",
    isActive: true,
    status: "ACTIVE",
    createdAt: "2026-03-20",
  },
  {
    id: "usr_104",
    name: "Nusrat Jahan",
    email: "nusrat.student@ru.ac.bd",
    role: "MEMBER",
    phoneNumber: "+8801710000004",
    isActive: true,
    status: "ACTIVE",
    createdAt: "2026-04-12",
  },
];

export const useGetUsers = (params?: Record<string, string | number | boolean>) => {
  return useQuery<IUser[]>({
    queryKey: ["users", params],
    queryFn: async (): Promise<IUser[]> => {
      try {
        const list = await UserService.getAllUsers(params);
        return list.length > 0 ? list : LOCAL_USERS;
      } catch {
        return LOCAL_USERS;
      }
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string | number;
      role: UserRole;
    }): Promise<IUser> => {
      try {
        return await UserService.updateUser(userId, { role });
      } catch {
        // Offline fallback
      }

      LOCAL_USERS = LOCAL_USERS.map((u) =>
        String(u.id) === String(userId) ? { ...u, role } : u
      );
      return LOCAL_USERS.find((u) => String(u.id) === String(userId))!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User role updated to ${variables.role}!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update user role."));
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string | number;
      status: UserStatus;
    }): Promise<IUser> => {
      try {
        return await UserService.updateUser(userId, { status });
      } catch {
        // Offline fallback
      }

      LOCAL_USERS = LOCAL_USERS.map((u) =>
        String(u.id) === String(userId)
          ? { ...u, status, isActive: status === "ACTIVE" }
          : u
      );
      return LOCAL_USERS.find((u) => String(u.id) === String(userId))!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User account status updated to ${variables.status}.`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update user status."));
    },
  });
};

export const useApproveCashPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      amount,
    }: {
      userId: string | number;
      amount?: number;
    }) => {
      return await UserService.approveCashPayment(userId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Cash membership payment approved & member activated!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve cash payment."));
    },
  });
};

export const useApproveMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      try {
        return await UserService.approveMembership(userId);
      } catch {
        // Offline fallback
        LOCAL_USERS = LOCAL_USERS.map((u) =>
          String(u.id) === String(userId)
            ? { ...u, status: "ACTIVE" as const, isActive: true }
            : u
        );
        return LOCAL_USERS.find((u) => String(u.id) === String(userId))!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Membership application approved! Member account is now ACTIVE.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve membership."));
    },
  });
};

export const useRegisterMemberByStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      phone: string;
      password: string;
      studentOrVoterId: string;
      department?: string;
      session?: string;
      institution?: string;
      paymentMethod?: string;
      status?: UserStatus;
      isPaid?: boolean;
      membershipStartedAt?: string;
      membershipExpiresAt?: string;
    }) => {
      try {
        return await UserService.registerMemberByStaff(payload);
      } catch {
        // Offline fallback – create local user entry
        const isOfflinePaid = payload.isPaid ?? (payload.status === "ACTIVE");
        const defaultStatus: UserStatus = payload.status
          ? payload.status
          : isOfflinePaid
          ? "ACTIVE"
          : payload.paymentMethod === "CASH"
          ? "PENDING_APPROVAL"
          : "PENDING_PAYMENT";

        const newUser: IUser = {
          id: `usr_${Date.now()}`,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          phoneNumber: payload.phone,
          role: "MEMBER",
          status: defaultStatus,
          studentOrVoterId: payload.studentOrVoterId,
          department: payload.department,
          session: payload.session,
          institution: payload.institution,
          isPaid: isOfflinePaid,
          membershipStartedAt: payload.membershipStartedAt,
          membershipExpiresAt: payload.membershipExpiresAt,
          isActive: defaultStatus === "ACTIVE",
          createdAt: new Date().toISOString(),
        };
        LOCAL_USERS = [...LOCAL_USERS, newUser];
        return newUser;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      const statusLabel =
        data.status === "ACTIVE"
          ? "Account is ACTIVE with valid membership."
          : data.status === "PENDING_APPROVAL"
          ? "Awaiting desk approval."
          : "Awaiting payment.";
      toast.success(`Member "${data.name}" registered successfully! ${statusLabel}`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to register member."));
    },
  });
};

export const useUpdateMemberDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string | number;
      payload: {
        name?: string;
        phone?: string;
        department?: string;
        session?: string;
        institution?: string;
        status?: UserStatus;
        isPaid?: boolean;
        membershipStartedAt?: string;
        membershipExpiresAt?: string;
      };
    }) => {
      try {
        return await UserService.updateUser(userId, payload);
      } catch {
        LOCAL_USERS = LOCAL_USERS.map((u) =>
          String(u.id) === String(userId) ? { ...u, ...payload, isActive: payload.status === "ACTIVE" || u.isActive } : u
        );
        return LOCAL_USERS.find((u) => String(u.id) === String(userId))!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Member record and membership dates updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update member record."));
    },
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      avatarUrl?: string;
      department?: string;
      session?: string;
      institution?: string;
      phone?: string;
    }) => {
      return await UserService.updateProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update profile."));
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      return await UserService.uploadAvatar(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Profile photo updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload profile photo. Please try again."));
    },
  });
};

export const useRenewMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      paymentMethod?: "CASH" | "ONLINE";
      amount?: number;
    }) => {
      return await UserService.renewMembership(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Membership renewed successfully for 6 months!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to renew membership."));
    },
  });
};

export const useSendNoticeToUser = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      subject,
      message,
    }: {
      userId: string | number;
      subject?: string;
      message: string;
    }) => {
      return await UserService.sendNoticeToUser(userId, { subject, message });
    },
    onSuccess: () => {
      toast.success("Notice alert dispatched to member successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to dispatch notice alert."));
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      return await UserService.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Member account removed from library records.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete user account."));
    },
  });
};

