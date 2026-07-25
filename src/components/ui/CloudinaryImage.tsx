import { useState, useCallback, type CSSProperties, type ImgHTMLAttributes } from "react";

interface CloudinaryImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /** The image source — either a full Cloudinary URL or a public_id */
  src: string;
  /** Alt text (required for a11y) */
  alt: string;
  /** Explicit width for layout stability */
  width?: number;
  /** Explicit height for layout stability */
  height?: number;
  /** CSS object-fit */
  objectFit?: CSSProperties["objectFit"];
  /** Render as a circular avatar */
  rounded?: boolean;
  /** Show a skeleton pulse while loading */
  showSkeleton?: boolean;
  /** Fallback text (initials) shown when image fails */
  fallbackText?: string;
  /** Additional className for the wrapper */
  wrapperClassName?: string;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  objectFit = "cover",
  rounded = false,
  showSkeleton = true,
  fallbackText,
  className = "",
  wrapperClassName = "",
  style,
  ...rest
}: CloudinaryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  // Derive initials from alt text if no fallbackText is provided
  const initials =
    fallbackText ||
    alt
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const borderRadius = rounded ? "50%" : undefined;

  // If there is no valid src or the image errored, show the fallback
  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground font-bold select-none ${wrapperClassName}`}
        style={{
          width: width || "100%",
          height: height || "100%",
          borderRadius,
          fontSize: Math.min((width || 40) * 0.35, 20),
          ...style,
        }}
        aria-label={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{
        width: width || "100%",
        height: height || "100%",
        borderRadius,
        ...style,
      }}
    >
      {/* Skeleton pulse while loading */}
      {showSkeleton && !isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
            backgroundSize: "200% 100%",
            borderRadius,
          }}
        />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          borderRadius,
          display: "block",
        }}
        {...rest}
      />
    </div>
  );
}

export default CloudinaryImage;
