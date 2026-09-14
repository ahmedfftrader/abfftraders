import React from 'react';
import { HeroConfig } from '../types';

interface Props {
  hero: HeroConfig;
}

export const HeroSection: React.FC<Props> = ({ hero }) => {
  return (
    <section id="store-hero" className="text-center pt-10 pb-8 sm:pt-14 sm:pb-10 px-4 relative z-10">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-tight bg-gradient-to-r from-[#ffb300] via-[#ff3300] to-[#ff0044] bg-clip-text text-transparent animate-hero-glow">
        {hero.headingLine1 || 'Free Fire IDs'}
        <br />
        {hero.headingLine2 || 'Listed'}
      </h1>

      <p className="text-neutral-300 mt-4 text-base sm:text-lg max-w-xl mx-auto font-medium">
        {hero.subtitle || 'We Are Verified With Pak Top Creators ALHUMDULLILAH! 💯'}
      </p>

      <div className="inline-block mt-5 bg-[#ff5500]/15 border border-[#ff5500] text-[#ff9933] px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wider shadow-sm shadow-orange-950">
        {hero.badgeText || '⚡ 100% SAFE & TRUSTED STORE ⚡'}
      </div>
    </section>
  );
};
