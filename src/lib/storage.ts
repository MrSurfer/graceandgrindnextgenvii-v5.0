import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export async function uploadFile(
  file: File | Buffer,
  bucket: string,
  folder: string = "",
  contentType?: string
) {
  if (!supabase) {
    return { error: "Supabase storage is not configured." };
  }

  try {
    const fileExt = contentType?.split("/")[1] || "jpg";
    const fileName = `${folder}/${uuidv4()}.${fileExt}`.replace(/^\/+/, "");

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return { error: error.message };
  }
}

export async function deleteFile(bucket: string, path: string) {
  if (!supabase) {
    return { error: "Supabase storage is not configured." };
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return { error: error.message };
  }
}
