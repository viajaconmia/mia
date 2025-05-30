import React, { useState, useEffect, useRef } from 'react';
import { Share2 } from 'lucide-react';
import ShareModal from './ShareModal';

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  id?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  url = window.location.href,
  id = "",
  title = document.title,
  description = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleOpenModal = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={buttonRef} className="relative">
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
        aria-label="Compartir"
        aria-expanded={isOpen}
      >
        <Share2 className="w-4 h-4" />
        <span>Compartir</span>
      </button>

      <ShareModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        url={url}
        id={id}
        title={title}
        description={description}
      />
    </div>
  );
};

export default ShareButton;