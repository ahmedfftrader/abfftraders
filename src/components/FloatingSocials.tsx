import React from 'react';
import { ContactConfig } from '../types';

interface Props {
  contact: ContactConfig;
}

export const FloatingSocials: React.FC<Props> = ({ contact }) => {
  return (
    <div
      id="floating-social-buttons"
      className="fixed bottom-6 right-6 flex flex-col gap-3.5 z-50 pointer-events-auto"
    >
      {/* TikTok Button */}
      {contact.tiktokUrl && (
        <a
          id="btn-float-tiktok"
          href={contact.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit TikTok Profile"
          className="w-14 h-14 rounded-full bg-black border border-[#ff0050] shadow-[0_5px_20px_rgba(255,0,80,0.5)] flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 group"
        >
          <img
            src="https://i.ibb.co/Wv5vWCrh/tiktok-icon-free-png.png"
            alt="TikTok"
            className="w-7 h-7 object-contain group-hover:rotate-6 transition-transform"
          />
        </a>
      )}

      {/* WhatsApp Button */}
      {contact.whatsappNumber && (
        <a
          id="btn-float-whatsapp"
          href={`https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent('Assalam o Alaikum Ahmed Bhai! Mujhe Free Fire ID ke baray mein maloomat chahiye.')}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          className="w-14 h-14 rounded-full bg-[#25d366] shadow-[0_5px_20px_rgba(37,211,102,0.5)] flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 animate-pulse-glow"
        >
          <img
            src="https://i.ibb.co/V0RMypB7/whatsapp-logo-on-a-transparent-background-free-png.png"
            alt="WhatsApp"
            className="w-8 h-8 object-contain"
          />
        </a>
      )}
    </div>
  );
};
