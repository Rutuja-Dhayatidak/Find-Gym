import React from 'react';

const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-950/40 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3 mb-6 animate-in fade-in duration-300">
      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>{message}</div>
    </div>
  );
};

export default ErrorAlert;
