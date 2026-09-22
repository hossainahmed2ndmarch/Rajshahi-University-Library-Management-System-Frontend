"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookService } from "@/services/book.service";
import { getErrorMessage } from "@/lib/errorUtils";
import {
  IBook,
  IBookQueryParams,
  ICreateBookPayload,
  IUpdateBookPayload,
  IBookOptions,
} from "@/types/book";

// ---------------------------------------------------------------------------
// Query Fetchers & Hooks
// ---------------------------------------------------------------------------

export const useGetBooks = (params?: IBookQueryParams) => {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => BookService.getAllBooks(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useGetBookById = (id: string | number) => {
  return useQuery({
    queryKey: ["book", id],
    queryFn: () => BookService.getBookById(id),
    enabled: Boolean(id),
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateBookPayload): Promise<IBook> => {
      return BookService.createBook(payload);
    },
    onSuccess: (newBook) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Book "${newBook.title}" added to inventory catalog!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add book to inventory."));
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IUpdateBookPayload): Promise<IBook> => {
      return BookService.updateBook(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book inventory updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update book."));
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number): Promise<boolean> => {
      return BookService.deleteBook(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book removed from inventory catalog.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete book."));
    },
  });
};

export const useUploadBookCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      bookId,
    }: {
      file: File;
      bookId?: string | number;
    }): Promise<string> => BookService.uploadBookCover(file, bookId),
    onSuccess: (_, variables) => {
      if (variables.bookId) {
        queryClient.invalidateQueries({ queryKey: ["books"] });
        queryClient.invalidateQueries({ queryKey: ["book", variables.bookId] });
      }
      toast.success("Book cover image uploaded successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload book cover image."));
    },
  });
};

export const useUploadBookImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      bookId,
    }: {
      files: File[];
      bookId?: string | number;
    }): Promise<string[]> => BookService.uploadBookImages(files, bookId),
    onSuccess: (urls, variables) => {
      if (variables.bookId) {
        queryClient.invalidateQueries({ queryKey: ["books"] });
        queryClient.invalidateQueries({ queryKey: ["book", variables.bookId] });
      }
      toast.success(`${urls.length} book image(s) uploaded successfully!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload book images."));
    },
  });
};

export const useGetBookCategories = () => {
  return useQuery<{ category: string; count: number }[]>({
    queryKey: ["book-categories"],
    queryFn: () => BookService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetBookOptions = () => {
  return useQuery<IBookOptions>({
    queryKey: ["book-options"],
    queryFn: () => BookService.getBookOptions(),
    staleTime: 2 * 60 * 1000,
  });
};