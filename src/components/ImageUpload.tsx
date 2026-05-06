"use client";

import { useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { uploadImageAction } from "@/app/actions/storage";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  bucket = "course-assets",
  label = "Upload Image",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImageAction(formData, bucket);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        onChange(result.url);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      
      {value ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-800 bg-gray-900 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center aspect-video w-full rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-amber-500/50 transition-all cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
            ) : (
              <Upload className="w-10 h-10 text-gray-500 group-hover:text-amber-500 mb-3 transition-colors" />
            )}
            <p className="mb-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 italic">PNG, JPG or WebP (max. 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
