import React from 'react';

export type LoadingSpinnerProps = {
  size?: number | string;
  message?: string;
};

const sizeToPixels = (size: number | string | undefined): number => {
  if (typeof size === 'number') {
    return size;
  }

  switch (size) {
    case 'sm':
      return 16;
    case 'lg':
      return 48;
    case 'md':
    default:
      return 24;
  }
};

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const pixels = sizeToPixels(size);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5em',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: `${pixels}px`,
          height: `${pixels}px`,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'loading-spinner 0.8s linear infinite',
        }}
      />
      {message ? <span>{message}</span> : <span className="sr-only">Loading</span>}
      <style>{`
        @keyframes loading-spinner {
          to { transform: rotate(360deg); }
        }
      `.sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
