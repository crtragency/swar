import Image, { type StaticImageData } from "next/image";

/** Renders next/image for bundled static photos, and a plain <img> for
    developer-provided image URLs (so any external/uploaded URL just works
    without remote-image config). */
export default function SmartImage({
  src,
  alt,
  fill,
  sizes,
  className = "",
  priority,
}: {
  src: StaticImageData | string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (typeof src === "string") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className}`}
      />
    );
  }
  return <Image src={src} alt={alt} fill={fill} sizes={sizes} priority={priority} className={className} />;
}
