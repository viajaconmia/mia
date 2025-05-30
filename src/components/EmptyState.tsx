import React from 'react';
import { ClipboardX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No data available' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
      <ClipboardX className="w-12 h-12 text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron datos</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;