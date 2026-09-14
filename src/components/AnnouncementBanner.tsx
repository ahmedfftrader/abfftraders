import React from 'react';
import { AnnouncementConfig } from '../types';
import { Megaphone } from 'lucide-react';

interface Props {
  announcement: AnnouncementConfig;
}

export const AnnouncementBanner: React.FC<Props> = ({ announcement }) => {
  if (!announcement.enabled || !announcement.text) return null;

  return (
    <div
      id="store-top-announcement"
      className="relative z-50 bg-gradient-to-r from-[#b32b00] via-[#ff5500] to-[#b32b00] text-white py-2.5 px-4 shadow-lg border-b border-[#ff7733]/40 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-semibold">
        {announcement.marquee ? (
          <div className="flex items-center overflow-hidden w-full select-none">
            <span className="flex-shrink-0 mr-3 px-2.5 py-0.5 rounded-full bg-black/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
              <Megaphone className="w-3.5 h-3.5" />
              {announcement.tag || 'NOTICE'}
            </span>
            <div className="overflow-hidden whitespace-nowrap w-full">
              <div className="animate-marquee inline-block">
                <span className="mx-4">{announcement.text}</span>
                <span className="mx-4 text-amber-200">★</span>
                <span className="mx-4">{announcement.text}</span>
                <span className="mx-4 text-amber-200">★</span>
                <span className="mx-4">{announcement.text}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full text-center flex items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-amber-300 text-xs font-bold uppercase">
              {announcement.tag || 'NOTICE'}
            </span>
            <span>{announcement.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
