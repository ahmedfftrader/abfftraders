import React from 'react';
import { FreeFireItem } from '../types';
import { MessageCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface Props {
  items: FreeFireItem[];
  whatsappNumber: string;
}

export const IdCardsSection: React.FC<Props> = ({ items, whatsappNumber }) => {
  const getImageHeightClass = (styleVariant: string) => {
    switch (styleVariant) {
      case 'big':
        return 'h-[440px] sm:h-[540px]';
      case 'tall':
        return 'h-[320px]';
      case 'bag':
        return 'h-[170px]';
      case 'nom':
      default:
        return 'h-[280px] sm:h-[300px]';
    }
  };

  return (
    <section id="available-ids-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 my-6">
      <div className="text-center my-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide inline-block relative text-white">
          🎮 Available IDs👇
          <span className="block w-20 h-1 mt-2.5 mx-auto bg-gradient-to-r from-[#ff9500] to-[#ff3300] rounded-full shadow-lg shadow-orange-500/50"></span>
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-[#161622] rounded-2xl border border-neutral-800 max-w-md mx-auto">
          <p className="text-neutral-400">Filhal koi Free Fire ID listed nahi hai.</p>
          <p className="text-neutral-500 text-sm mt-1">Admin panel se nayi ID add karein.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
          {items.map((item) => {
            const encodedMsg = encodeURIComponent(
              item.whatsappCustomText?.trim() || `Mujhe ${item.title} buy karni hai (${item.level})`
            );
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

            return (
              <div
                key={item.id}
                id={`card-${item.id}`}
                className={`group bg-gradient-to-b from-[#1a1a24] to-[#12121a] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between relative ${
                  item.isSoldOut
                    ? 'border-red-900/40 opacity-80'
                    : 'border-[#ff5500]/30 hover:border-[#ff5500] hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(255,85,0,0.3)]'
                }`}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden bg-[#14141c] w-full ${getImageHeightClass(item.imageHeightStyle)}`}>
                  <img
                    src={getOptimizedImageUrl(item.imageUrl, item.createdAt)}
                    alt={`${item.title} ${item.level}`}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      item.isSoldOut ? 'filter grayscale contrast-125 brightness-75' : ''
                    }`}
                    onError={(e) => {
                      // Fallback placeholder image if URL broken
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
                    }}
                  />

                  {/* Level Badge */}
                  <span className="absolute top-3 right-3 bg-black/85 border border-[#ff9500] text-[#ffcc00] px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md backdrop-blur-xs">
                    {item.level}
                  </span>

                  {/* Badges on Top Left */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {item.badges && item.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="bg-orange-600/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm backdrop-blur-xs flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Sold Out Overlay Banner */}
                  {item.isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="bg-red-600 text-white font-black text-lg sm:text-xl tracking-widest px-6 py-2 rounded-lg rotate-[-8deg] border-2 border-white shadow-2xl flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-yellow-300" />
                        SOLD OUT ❌
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-[#ffcc66] truncate">
                        {item.title}
                      </h3>
                      {item.guildStatus && (
                        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700">
                          {item.guildStatus}
                        </span>
                      )}
                    </div>

                    {/* Features / Details */}
                    <div className="text-neutral-300 text-xs sm:text-sm leading-relaxed space-y-1 my-3 bg-black/30 p-2.5 rounded-xl border border-neutral-800/60">
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 select-none">›</span>
                          <span className="break-words">{detail.replace(/^✅\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {/* Price */}
                    <div className="my-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                        {item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs sm:text-sm text-neutral-500 line-through font-semibold">
                          {item.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {item.isSoldOut ? (
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salam Ahmed Bhai, ${item.title} sold out ho gayi hai, kya is jesi koi or ID available hai?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 border border-neutral-700"
                      >
                        <MessageCircle className="w-4 h-4 text-neutral-400" />
                        Ask For Similar ID
                      </a>
                    ) : (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-gradient-to-r from-[#ff9500] to-[#ff3300] hover:from-[#ffa726] hover:to-[#ff4500] text-white py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base tracking-wider transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(255,85,0,0.7)] hover:scale-[1.02] flex items-center justify-center gap-2"
                        aria-label={`Buy ${item.title} via WhatsApp`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        BUY NOW ⚡
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
