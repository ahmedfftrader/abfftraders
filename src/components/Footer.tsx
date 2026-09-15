import React from 'react';

interface Props {
  brandName: string;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<Props> = ({ brandName, onOpenAdmin }) => {
  return (
    <footer
      id="main-store-footer"
      className="text-center py-6 sm:py-8 px-4 border-t border-neutral-800/80 text-neutral-500 text-xs sm:text-sm relative z-10 bg-[#0a0a0f]"
    >
      <p className="flex items-center justify-center gap-1.5 flex-wrap">
        <span>Made with <span className="text-[#ff5500] font-bold">🔥</span> — {brandName || 'AHMED BHAI STORE'} © 2026 | All Rights Reserved</span>
        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            id="btn-footer-admin-discreet"
            className="opacity-25 hover:opacity-80 transition-opacity text-[10px] text-neutral-600 hover:text-neutral-300 p-1 cursor-pointer select-none"
            title="Admin Login"
            aria-label="Admin Portal"
          >
            🔒
          </button>
        )}
      </p>
    </footer>
  );
};

