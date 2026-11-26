import React from 'react';

export const PageLoader: React.FC = () => {
  const isStaffRoute =
    typeof window !== 'undefined' &&
    /^\/(admin|super-admin|reception|login)(\/|$)/.test(window.location.pathname);

  if (isStaffRoute) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fs-portal min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 border border-[var(--fs-border)] border-t-[var(--fs-text)] rounded-full animate-spin" />
      <span className="fs-kicker text-[var(--fs-text-muted)]">Concierge</span>
    </div>
  );
};
