"use client";

import { useState } from "react";

export default function Avatar({ 
  src, 
  alt = "User", 
  fallback, 
  size = "md", 
  className = "" 
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-9 h-9 text-sm", 
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // If no src or image failed to load, show fallback
  if (!src || imageError) {
    return (
      <div className={`
        ${sizeClasses[size]} 
        rounded-full bg-blue-100 flex items-center justify-center text-blue-600 
        overflow-hidden border border-white shadow-sm font-bold
        ${className}
      `}>
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`
      ${sizeClasses[size]} 
      rounded-full bg-gray-200 flex items-center justify-center 
      overflow-hidden border border-white shadow-sm
      ${className}
    `}>
      {isLoading && (
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-gray-400 text-xs">
          ...
        </div>
      )}
      <img 
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        referrerPolicy="no-referrer" // Important for Google profile images
      />
    </div>
  );
}