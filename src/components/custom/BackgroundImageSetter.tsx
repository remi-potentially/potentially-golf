
"use client";

import Image from 'next/image';
// Corrected import path to .tsx
import { imageUrls as defaultImageUrls } from '@/lib/initial-data.tsx';

export const BackgroundImageSetter = () => {
  // Directly use the image path
  const imagePath = defaultImageUrls.morning;
  const imageHint = "golf course illustration";

  if (!imagePath) {
    console.error("Background image path for 'morning' is undefined. Check initial-data.tsx and its import.");
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10"> {/* Ensure this is behind content */}
      <Image
        src={imagePath} // Use the direct path
        alt="Scenic golf course background"
        fill={true}
        className="object-cover"
        quality={85}
        priority // Add priority for important background images
        data-ai-hint={imageHint}
      />
      <div className="absolute inset-0 bg-custom-bg-overlay" />
    </div>
  );
};

