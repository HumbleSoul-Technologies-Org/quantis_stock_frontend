const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.warn(
    "Cloudinary configuration missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env",
  );
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  original_filename?: string;
  format?: string;
  resource_type?: string;
}

async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "auto" = "image",
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration not found");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as CloudinaryUploadResult;
  return data;
}

export async function uploadImage(file: File): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, "image");
}

export async function uploadFile(file: File): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, "auto");
}
