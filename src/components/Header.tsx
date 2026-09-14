import React from 'react';
import { ContactConfig } from '../types';

interface Props {
  contact: ContactConfig;
}

export const Header: React.FC<Props> = ({ contact }) => {
  return (
    <header
      id="main-store-header"
      className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b-2 border-[#ff5500] flex items-center justify-between shadow-xl transition-all"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        <img
          src={contact.logoUrl || 'https://i.ibb.co/67pk7bC9/304173.png'}
          alt={`${contact.brandName} Logo`}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 sm:border-[3px] border-[#ff6600] shadow-md shadow-orange-950"
          loading="eager"
        />
        <div className="header-text">
          <h1 className="text-xl sm:text-2xl font-black tracking-wide leading-none animate-shine uppercase">
            {contact.brandName || 'AHMED BHAI'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
            {contact.brandTagline || 'Buy & Sell Game IDs & Resources'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <a
          href={`https://wa.me/${contact.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>WhatsApp Online</span>
        </a>
      </div>
    </header>
  );
};

