/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Upload, X, Image } from "lucide-react";

const IMGBB_API_KEY = "8c92f0aa791a5e9d6864ec1f327948be";

interface ImageUploadSectionProps {
  addForm: Record<string, any>;
  setAddForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  addForm,
  setAddForm,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      const imageUrl = data.data.url;

      // Update form with new image URL
      setAddForm((prev) => ({
        ...prev,
        images: Array.isArray(prev.images)
          ? [...prev.images, imageUrl]
          : [imageUrl],
      }));

      // Clear the input value to allow uploading the same image again
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setAddForm((prev) => ({
      ...prev,
      images: prev.images.filter(
        (_: any, index: number) => index !== indexToRemove
      ),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 mb-4">
        {Array.isArray(addForm.images) &&
          addForm.images.map((imageUrl: string, index: number) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Uploaded image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

        {(!addForm.images || addForm.images.length === 0) && (
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Image className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">No images yet</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="image-upload"
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Image"}
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {uploadError && (
        <p className="text-sm text-red-500 mt-2">{uploadError}</p>
      )}

      <p className="text-xs text-gray-500">
        Upload images of your service. First image will be used as the main
        image.
      </p>
    </div>
  );
};

export default ImageUploadSection;
