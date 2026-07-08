const API_BASE_URL_FROM_ENV = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL =
  API_BASE_URL_FROM_ENV || "http://localhost:5353/api";

if (!API_BASE_URL_FROM_ENV) {
  console.warn(
    "NEXT_PUBLIC_API_BASE_URL is not configured. Falling back to http://localhost:5353/api. For production, set NEXT_PUBLIC_API_BASE_URL in your .env or hosting provider settings.",
  );
}

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const TRIAL_DAYS = Number(
  process.env.NEXT_PUBLIC_TRIAL_DAYS ?? process.env.TRIAL_DAYS ?? 31,
);

export function assertPublicEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Please set ${name} in your .env file or hosting provider config.`,
    );
  }
  return value;
}
