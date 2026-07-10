function resolveR2PublicBaseUrl(): string {
  for (const raw of [
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL,
    process.env.R2_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_DOCUMENTS_BASE_URL,
  ]) {
    const t = (raw || "").trim().replace(/\/$/, "");
    if (t.startsWith("http")) return t;
  }
  return "";
}

function inferProvider(storageProvider: string | null | undefined, fileKey: string): "cloudinary" | "r2" {
  const cleanKey = fileKey.replace(/^\/+/, "");
  if (cleanKey.startsWith("practika/")) return "cloudinary";
  if (cleanKey.startsWith("series/")) return "r2";
  const p = (storageProvider || "").toLowerCase();
  if (p === "cloudinary") return "cloudinary";
  return "r2";
}

export function buildStoragePublicUrl(
  storageProvider: string | null | undefined,
  fileKey: string | null | undefined,
): string {
  const key = (fileKey || "").trim();
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;

  const cleanKey = key.replace(/^\/+/, "");
  const provider = inferProvider(storageProvider, cleanKey);

  if (provider === "cloudinary") {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
    if (!cloud) return "";
    if (/\.pdf$/i.test(cleanKey)) {
      return `https://res.cloudinary.com/${cloud}/raw/upload/${cleanKey}`;
    }
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/${cleanKey}`;
  }

  const base = resolveR2PublicBaseUrl();
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/${cleanKey}`;
}
