import React from 'react';
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  action,
  className = ''
}) => {
  return (
    <div className={`sm:flex sm:items-center sm:justify-between mb-6 ${className}`}>
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {action}
        </div>
      )}
    </div>
  );
};
export default PageHeader;
