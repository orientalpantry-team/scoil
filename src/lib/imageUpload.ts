const HEIC_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];

// iPhones save photos as HEIC, which only Safari can display.
export function isHeic(file: File): boolean {
  return HEIC_TYPES.includes(file.type.toLowerCase()) || /\.(heic|heif)$/i.test(file.name);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || isHeic(file);
}

// Converts HEIC/HEIF photos to JPEG so every browser can show them.
// Other files are returned unchanged.
export async function toWebImage(file: File): Promise<File> {
  if (!isHeic(file)) return file;

  // Loaded on demand: the converter is large and only needed for HEIC files.
  const { heicTo } = await import("heic-to");
  const blob = await heicTo({ blob: file, type: "image/jpeg", quality: 0.85 });
  const name = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
