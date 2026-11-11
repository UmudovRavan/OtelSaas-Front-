import React from 'react';

export const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
  </div>
);

