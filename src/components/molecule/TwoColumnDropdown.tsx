// components/molecule/TwoColumnDropdown.tsx
import React from 'react';

interface TwoColumnDropdownProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const TwoColumnDropdown: React.FC<TwoColumnDropdownProps> = ({
  leftContent,
  rightContent
}) => {
  return (
    <div className="flex justify-around w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex-1 px-4 text-center">
        {leftContent}
      </div>
      <div className="flex-1 px-4 text-center border-l border-gray-200">
        {rightContent}
      </div>
    </div>
  );
};

export default TwoColumnDropdown;