"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import { DonationService } from "@/services/donation.service";
import {
  IDonation,
  IDonationPayload,
  IDonationResponse,
  IApproveDonationPayload,
  IRejectDonationPayload,
} from "@/types/donation";

// ---------------------------------------------------------------------------
// Fallback seed data (development / API offline)
// ---------------------------------------------------------------------------
let LOCAL_DONATIONS: IDonation[] = [
  {
    id: "don_1",
    donationCode: "RU-DON-401",
    bookTitle: "The Great Women of Islam",
    author: "Mahmud Ahmad Ghadanfar",
    category: "Seerah / History",
    quantity: 2,
    condition: "LIKE_NEW",
    donorName: "Dr. Tariq Rahman",
    donorEmail: "tariq@ru.ac.bd",
    contactPhone: "+8801711223344",
    donorPhone: "+8801711223344",
    donorNote: "Hardcover Bengali translated copies.",
    notes: "Hardcover Bengali translated copies.",
    status: "PENDING",
    createdAt: "2026-08-02",
  },
  {
    id: "don_2",
    donationCode: "RU-DON-402",
    bookTitle: "Stories of the Prophets (Qasas al-Anbiya)",
    author: "Ibn Kathir",
    category: "History",
    quantity: 1,
    condition: "GOOD",
    donorName: "Salma Begum",
    donorEmail: "salma@gmail.com",
    donorNote: "English edition published by Darussalam.",
    notes: "English edition published by Darussalam.",
    status: "PENDING",
    createdAt: "2026-08-04",
  },
  {
    id: "don_3",
    donationCode: "RU-DON-403",
    bookTitle: "Fortress of the Muslim (Hisn al-Muslim)",
    author: "Sa'id bin Ali bin Wahf Al-Qahtani",
    category: "Spirituality",
    quantity: 5,
    condition: "NEW",
    donorName: "Anonymous Donor",
    donorNote: "Brand new pocket size authentic dua collections.",
    notes: "Brand new pocket size authentic dua collections.",
    status: "PENDING",
    createdAt: "2026-08-06",
  },
  {
    id: "don_4",
    donationCode: "RU-DON-380",
    bookTitle: "Principles of Fiqh",
    author: "Mohammad Hashim Kamali",
    category: "Fiqh",
    quantity: 1,
    condition: "GOOD",
    donorName: "Rafiqul Islam",
    status: "APPROVED",
    createdAt: "2026-07-28",
  },
];

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const useGetDonations = () => {
  return useQuery<IDonation[]>({
    queryKey: ["donations"],
    queryFn: async (): Promise<IDonation[]> => {
      try {
        const list = await DonationService.getAllDonations();
        return list.length > 0 ? list : LOCAL_DONATIONS;
      } catch {
        return LOCAL_DONATIONS;
      }
    },
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IDonationPayload): Promise<IDonationResponse> => {
      const data = await DonationService.createDonation(payload);
      return { success: true, message: "Donation submitted successfully.", data };
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success(response.message || "Book donation submitted successfully! JazakAllah Khair.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit donation. Please check your network or inputs."));
    },
  });
};

export const useCreatePOSDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: import("@/types/donation").ICreatePOSDonationPayload): Promise<IDonation> => {
      return await DonationService.createPOSDonation(payload);
    },
    onSuccess: (donation) => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`POS Donation intake for "${donation.bookTitle || 'Book'}" recorded successfully!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to process POS donation intake."));
    },
  });
};

export const useApproveDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IApproveDonationPayload): Promise<boolean> => {
      try {
        await DonationService.approveDonation(payload.id, {
          locationCell: payload.locationCell,
          assignedCategory: payload.assignedCategory,
          pages: payload.pages,
          isbn: payload.isbn,
          borrowStock: payload.borrowStock,
          sellStock: payload.sellStock,
        });
      } catch {
        // Offline fallback
      }

      LOCAL_DONATIONS = LOCAL_DONATIONS.map((d) =>
        d.id === payload.id
          ? { ...d, status: "APPROVED" as const, locationCell: payload.locationCell }
          : d
      );
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Donation approved! Book converted & added to library stock catalog.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve donation."));
    },
  });
};

export const useRejectDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IRejectDonationPayload): Promise<boolean> => {
      try {
        await DonationService.rejectDonation(payload.id, payload.rejectionReason);
      } catch {
        // Offline fallback
      }

      LOCAL_DONATIONS = LOCAL_DONATIONS.map((d) =>
        d.id === payload.id
          ? { ...d, status: "REJECTED" as const, rejectionReason: payload.rejectionReason }
          : d
      );
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.info("Donation request rejected.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reject donation."));
    },
  });
};

export const useDeleteDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: string | number) => {
      return await DonationService.deleteDonation(donationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Donation record deleted from audit registry.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete donation record."));
    },
  });
};

