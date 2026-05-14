import React from 'react';
import { Loader2 } from 'lucide-react';
export const LoadingSpinner = ({
  size = 'md',
  variant = 'default',
  message,
  progress,
  fullscreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  const containerClasses = fullscreen ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50' : 'flex items-center justify-center';
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{
            animationDelay: '0ms'
          }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{
            animationDelay: '150ms'
          }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{
            animationDelay: '300ms'
          }} />
          </div>;
      case 'pulse':
        return <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse" />;
      case 'skeleton':
        return <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
          </div>;
      default:
        return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />;
    }
  };
  const content = <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        {renderSpinner()}

        {progress !== undefined && <div className="w-48 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
          width: `${Math.min(100, Math.max(0, progress))}%`
        }} />
          </div>}

        {message && <p className="text-sm text-gray-600 text-center max-w-xs">
            {message}
          </p>}
      </div>
    </div>;
  return fullscreen ? <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        {content}
      </div>
    </div> : content;
};
export const InlineLoading = ({
  size = 'sm',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  return <div className="flex items-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>;
};
export const SkeletonLoader = ({
  lines = 3,
  variant = 'text'
}) => {
  const renderTextSkeleton = () => <div className="space-y-3">
      {Array.from({
      length: lines
    }).map((_, i) => <div key={i} className="h-4 bg-gray-300 rounded animate-pulse" style={{
      width: `${Math.random() * 40 + 60}%`
    }} />)}
    </div>;
  const renderCardSkeleton = () => <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4" />
      <div className="space-y-2">
        {Array.from({
        length: lines
      }).map((_, i) => <div key={i} className="h-3 bg-gray-300 rounded" style={{
        width: `${Math.random() * 30 + 70}%`
      }} />)}
      </div>
    </div>;
  const renderListSkeleton = () => <div className="space-y-4">
      {Array.from({
      length: lines
    }).map((_, i) => <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg animate-pulse">
          <div className="h-12 w-12 bg-gray-300 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-300 rounded w-1/2" />
          </div>
        </div>)}
    </div>;
  const variants = {
    text: renderTextSkeleton,
    card: renderCardSkeleton,
    list: renderListSkeleton
  };
  return variants[variant] || renderTextSkeleton();
};
export const ProgressLoader = ({
  progress = 0,
  message,
  indeterminate = false
}) => {
  return <div className="w-full max-w-md mx-auto">
      {message && <p className="text-sm text-gray-600 mb-2 text-center">{message}</p>}

      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2">
          {!indeterminate && <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
          width: `${Math.min(100, Math.max(0, progress))}%`
        }} />}
          {indeterminate && <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/3" />}
        </div>

        <span className="absolute -top-6 right-0 text-xs text-gray-500">
          {!indeterminate ? `${Math.round(progress)}%` : 'Loading...'}
        </span>
      </div>
    </div>;
};
export default LoadingSpinner;
