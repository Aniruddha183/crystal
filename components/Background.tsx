import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-black">
      {/* Top Left - Subtle White/Grey */}
      <div className="blob bg-neutral-800 w-[800px] h-[800px] rounded-full -top-40 -left-40 opacity-20"></div>
      
      {/* Top Right - Dark Slate */}
      <div className="blob bg-slate-900 w-[600px] h-[600px] rounded-full top-0 -right-20 opacity-30 animation-delay-2000"></div>
      
      {/* Bottom Center - Deep Grey */}
      <div className="blob bg-zinc-900 w-[900px] h-[500px] rounded-full -bottom-40 left-1/2 -translate-x-1/2 opacity-40 animation-delay-4000"></div>
      
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
      }}></div>
    </div>
  );
};