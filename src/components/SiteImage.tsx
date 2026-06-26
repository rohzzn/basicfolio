import React from 'react';

type SiteImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'width' | 'height' | 'alt'
> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  unoptimized?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
};

/** Direct <img> — bypasses Vercel / next/image optimization. */
export default function SiteImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  sizes,
  unoptimized,
  quality,
  placeholder,
  blurDataURL,
  style,
  loading,
  ...rest
}: SiteImageProps) {
  void sizes;
  void unoptimized;
  void quality;
  void placeholder;
  void blurDataURL;

  const imgLoading = loading ?? (priority ? 'eager' : 'lazy');

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={[className, 'absolute inset-0 h-full w-full'].filter(Boolean).join(' ')}
        style={style}
        loading={imgLoading}
        decoding="async"
        draggable={false}
        {...rest}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={imgLoading}
      decoding="async"
      draggable={false}
      {...rest}
    />
  );
}
