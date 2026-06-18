import React, { useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={`${className} transition-all duration-500 ${
        loaded ? "blur-0 opacity-100" : "blur-sm opacity-80"
      }`}
    />
  );
};
