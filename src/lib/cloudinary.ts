// ─── Cloudinary Configuration ────────────────────────────────────────────────
// Single source of truth for all Cloudinary image operations.
// Images are hosted on Cloudinary; Supabase only stores the public_id.

export const CLOUDINARY_CLOUD_NAME = "dssxrvi97";
export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// ─── URL Builders ────────────────────────────────────────────────────────────

/**
 * Build a raw Cloudinary URL from a public_id with optional transformations.
 * If the input is already a full URL, return it as-is.
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations: string[] = ["f_auto", "q_auto"]
): string {
  if (!publicId) return "";
  // Already a full URL — return directly
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }
  const txString = transformations.length > 0 ? transformations.join(",") + "/" : "";
  return `${CLOUDINARY_BASE_URL}/${txString}${publicId}`;
}

/**
 * Optimised image with explicit width/height for responsive delivery.
 * Uses c_fill for cropping, f_auto for WebP/AVIF, q_auto for quality.
 */
export function getOptimizedImage(
  publicId: string,
  width: number,
  height?: number
): string {
  const transforms = [
    "f_auto",
    "q_auto",
    "c_fill",
    `w_${width}`,
    ...(height ? [`h_${height}`] : []),
  ];
  return getCloudinaryUrl(publicId, transforms);
}

/**
 * Small thumbnail (160×160, cropped to fill).
 */
export function getThumbnail(publicId: string): string {
  return getOptimizedImage(publicId, 160, 160);
}

/**
 * Avatar-sized image (80×80, circular-ready).
 */
export function getAvatar(publicId: string): string {
  return getOptimizedImage(publicId, 80, 80);
}

/**
 * Build a srcSet string for responsive images.
 * Returns pairs like "url 400w, url 800w, url 1200w".
 */
export function getSrcSet(
  publicId: string,
  widths: number[] = [400, 800, 1200]
): string {
  return widths
    .map((w) => `${getOptimizedImage(publicId, w)} ${w}w`)
    .join(", ");
}

/**
 * Default fallback image (a neutral grey placeholder).
 */
export const FALLBACK_IMAGE = `${CLOUDINARY_BASE_URL}/f_auto,q_auto,c_fill,w_400,h_300/v1/samples/landscapes/nature-mountains`;

/**
 * Default fallback avatar (initials-style).
 */
export const FALLBACK_AVATAR = "";
