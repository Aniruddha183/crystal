import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`glass-panel rounded-3xl p-6 border-white/5 bg-neutral-900/40 ${className}`}>
      {children}
    </div>
  );
};