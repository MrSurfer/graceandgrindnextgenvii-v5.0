"use server";

import { auth } from "@/lib/supabase/server-auth";
import { uploadFile, deleteFile } from "@/lib/storage";

export async function uploadImageAction(formData: FormData, bucket: string = "course-assets") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed" };
  }

  // Validate file size (e.g., 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size must be less than 5MB" };
  }

  const result = await uploadFile(file, bucket, "images", file.type);
  return result;
}
