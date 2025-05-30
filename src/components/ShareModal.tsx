import React from 'react';
import {
    EmailIcon,
    EmailShareButton,
    FacebookIcon,
    FacebookMessengerIcon,
    FacebookMessengerShareButton,
    FacebookShareButton,
    GabShareButton,
    HatenaShareButton,
    InstapaperShareButton,
    LineShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    LivejournalShareButton,
    MailruShareButton,
    OKShareButton,
    PinterestShareButton,
    PocketShareButton,
    RedditShareButton,
    TelegramShareButton,
    ThreadsShareButton,
    TumblrShareButton,
    TwitterShareButton,
    ViberShareButton,
    VKShareButton,
    WhatsappIcon,
    WhatsappShareButton,
    WorkplaceShareButton,
  } from "react-share";

const URLFront = "https://mia-prueba.vercel.app"

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description: string;
  id: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  url, 
  title, 
  description,
  id,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg transform transition-all duration-200 ease-in-out
                  ${isOpen ? 'opacity-100 translate-y-0 -translate-x-6' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex gap-2">
        <EmailShareButton url={`${URLFront}/reserva/${id}`}>
            <EmailIcon round={true} size={48}/>
        </EmailShareButton>
        <WhatsappShareButton url={`${URLFront}/reserva/${id}`}>
            <WhatsappIcon round={true} size={48}/>
        </WhatsappShareButton>
        {/* <FacebookMessengerShareButton url={`${URLFront}/reserva/${id}`}>
            <FacebookMessengerIcon   round={true} size={48}/>
        </FacebookMessengerShareButton>
        <LinkedinShareButton url={`${URLFront}/reserva/${id}`}>
            <LinkedinIcon round={true} size={48}/>
        </LinkedinShareButton> */}
      </div>
    </div>
  );
};

export default ShareModal;