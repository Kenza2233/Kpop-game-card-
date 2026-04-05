'use client';

import React, { useState } from 'react';
import { useIdolImage } from '../hooks/useIdolImage';

export function ImageWithFallback({ group, idol, alt, className }: { group: string; idol: string; alt: string; className?: string }) {
  const { imageUrl, isLoading } = useIdolImage(group, idol);
  const [error, setError] = useState(false);

  if (isLoading) {
    return <div className={`${className} bg-white/5 animate-pulse rounded-lg`} />;
  }

  if (error || !imageUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center rounded-lg`}>
        <span className="text-white/20 font-black text-xs">{idol.charAt(0)}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
