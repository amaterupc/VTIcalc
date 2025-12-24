import React from 'react';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
};