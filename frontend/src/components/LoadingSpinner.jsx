import React from "react";
import { cn } from "../lib/utils";

const LoadingSpinner = ({ 
  size = "md", 
  className, 
  text,
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-border border-t-primary",
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="mt-3 text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Skeleton loading components for better UX
export const PlayerCardSkeleton = () => (
  <div className="rounded-lg border border-border p-4 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-muted"></div>
      <div className="flex-1">
        <div className="h-4 bg-muted rounded mb-2"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-3 bg-muted rounded w-1/3"></div>
        <div className="h-3 bg-muted rounded w-1/4"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-3 bg-muted rounded w-1/4"></div>
        <div className="h-3 bg-muted rounded w-1/3"></div>
      </div>
    </div>
    
    <div className="h-9 bg-muted rounded mt-4"></div>
  </div>
);

export const TournamentCardSkeleton = () => (
  <div className="rounded-lg border border-border p-6 animate-pulse">
    <div className="mb-4">
      <div className="h-5 bg-muted rounded mb-2"></div>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="flex gap-2">
        <div className="h-5 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-24"></div>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between">
        <div className="h-3 bg-muted rounded w-1/3"></div>
        <div className="h-3 bg-muted rounded w-1/4"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-3 bg-muted rounded w-1/4"></div>
        <div className="h-3 bg-muted rounded w-1/3"></div>
      </div>
    </div>
    
    <div className="h-9 bg-muted rounded mt-4"></div>
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="text-center p-4 rounded-lg border border-border animate-pulse">
    <div className="h-8 bg-muted rounded mb-2 mx-auto w-16"></div>
    <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
  </div>
);

export default LoadingSpinner;