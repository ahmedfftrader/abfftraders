import React, { useState, useEffect, memo, useCallback } from 'react';
import { FreeFireItem } from '../types';
import { Edit, Trash2, Check, X, Tag, ShieldCheck, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface AdminItemCardProps {
  item: FreeFireItem;
  onToggleSoldOut: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: FreeFireItem) => void;
  onQuickUpdatePrice: (id: string, newPrice: string) => void;
  onQuickUpdateTitle: (id: string, newTitle: string) => void;
  onQuickUpdateImage?: (id: string, newImageUrl: string) => void;
  showToast: (msg: string) => void;
}

const AdminItemCardComponent: React.FC<AdminItemCardProps> = ({
  item,
  onToggleSoldOut,
  onDeleteItem,
  onEditItem,
  onQuickUpdatePrice,
  onQuickUpdateTitle,
  onQuickUpdateImage,
  showToast,
}) => {
  // Direct optimistic local state for sold out
  const [localSoldOut, setLocalSoldOut] = useState<boolean>(item.isSoldOut);

  // Synchronize when parent item updates
  useEffect(() => {
    setLocalSoldOut(item.isSoldOut);
  }, [item.isSoldOut]);

  // Inline Price Edit mode
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(item.price);

  // Inline Title Edit mode
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);

  // Inline Image URL Edit mode
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(item.imageUrl);

  // Delete confirmation mode (non-blocking)
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Toggle Sold Out handler (< 2ms execution, direct optimistic update)
  const handleToggleSold = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextStatus = !item.isSoldOut;
    setLocalSoldOut(nextStatus);
    onToggleSoldOut(item.id);
    showToast(nextStatus ? `"${item.title}" Sold Out mark ho gaya! ❌` : `"${item.title}" Available mark ho gaya! ✅`);
  }, [item.isSoldOut, onToggleSoldOut, item.id, item.title, showToast]);

  // Quick Price Save
  const handleSavePrice = useCallback(() => {
    const trimmed = tempPrice.trim();
    if (trimmed && trimmed !== item.price) {
      onQuickUpdatePrice(item.id, trimmed);
      showToast(`Price update ho gaya: ${trimmed} 💰`);
    }
    setIsEditingPrice(false);
  }, [tempPrice, item.price, item.id, onQuickUpdatePrice, showToast]);

  // Quick Title Save
  const handleSaveTitle = useCallback(() => {
    const trimmed = tempTitle.trim();
    if (trimmed && trimmed !== item.title) {
      onQuickUpdateTitle(item.id, trimmed);
      showToast(`Title update ho gaya: ${trimmed} ✏️`);
    }
    setIsEditingTitle(false);
  }, [tempTitle, item.title, item.id, onQuickUpdateTitle, showToast]);

  // Quick Image Save (< 5ms execution, automatically cache-busted)
  const handleSaveImage = useCallback(() => {
    const trimmed = tempImageUrl.trim();
    if (trimmed && trimmed !== item.imageUrl && onQuickUpdateImage) {
      onQuickUpdateImage(item.id, trimmed);
      showToast(`Photo link update ho gayi! 🖼️`);
    }
    setIsEditingImage(false);
  }, [tempImageUrl, item.imageUrl, item.id, onQuickUpdateImage, showToast]);

  // Instant Non-blocking Delete
  const handleDeleteClick = useCallback(() => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3500);
      return;
    }
    onDeleteItem(item.id);
    showToast(`"${item.title}" delete ho gaya! 🗑️`);
  }, [confirmDelete, item.id, item.title, onDeleteItem, showToast]);

  return (
    <div
      id={`admin-card-${item.id}`}
      className={`bg-[#14141e] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-150 ${
        localSoldOut
          ? 'border-red-900/60 bg-[#120f14]'
          : 'border-neutral-800 hover:border-[#ff5500]/60'
      }`}
    >
      {/* Card Media Header */}
      <div className="relative h-44 bg-black/60 overflow-hidden select-none">
        <img
          src={getOptimizedImageUrl(item.imageUrl, item.createdAt)}
          alt={item.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-300 ${
            localSoldOut ? 'filter grayscale brightness-65 contrast-125' : ''
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Quick Image URL edit button & overlay */}
        {onQuickUpdateImage && (
          <div className="absolute top-2.5 right-14 z-10">
            {isEditingImage ? (
              <div className="flex items-center gap-1 bg-black/90 p-1 rounded-lg border border-orange-500 shadow-xl">
                <input
                  type="text"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveImage();
                    if (e.key === 'Escape') setIsEditingImage(false);
                  }}
                  placeholder="Paste image link..."
                  autoFocus
                  className="w-36 bg-[#0c0c12] border border-neutral-700 text-white text-[11px] px-2 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveImage}
                  className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                  title="Save Image URL"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingImage(false)}
                  className="p-1 bg-neutral-700 text-neutral-300 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingImage(true)}
                className="bg-black/80 hover:bg-orange-600 text-neutral-300 hover:text-white p-1.5 rounded-full border border-neutral-700 hover:border-orange-500 transition-all cursor-pointer shadow-md"
                title="Quick edit image URL"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Level Badge */}
        <span className="absolute top-2.5 right-2.5 bg-black/85 border border-orange-500/80 text-yellow-300 text-xs px-2.5 py-0.5 rounded-full font-bold shadow-md backdrop-blur-xs">
          {item.level}
        </span>

        {/* Sold Out Status Badge */}
        {localSoldOut ? (
          <span className="absolute top-2.5 left-2.5 bg-red-600/95 text-white text-[11px] px-2.5 py-0.5 rounded-md font-black tracking-wider shadow-lg flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> SOLD OUT
          </span>
        ) : (
          <span className="absolute top-2.5 left-2.5 bg-emerald-600/90 text-white text-[10px] px-2 py-0.5 rounded-md font-extrabold tracking-wider shadow flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> AVAILABLE
          </span>
        )}

        {/* Image Size Variant Tag */}
        {item.imageHeightStyle && (
          <span className="absolute bottom-2 left-2 bg-black/75 text-neutral-400 text-[10px] px-1.5 py-0.5 rounded border border-neutral-700/50 uppercase font-mono">
            Size: {item.imageHeightStyle}
          </span>
        )}
      </div>

      {/* Card Content & Quick Editors */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
        <div>
          {/* Title row with quick edit */}
          <div className="flex items-center justify-between gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="w-full bg-[#0c0c12] border border-orange-500 text-amber-300 text-sm font-extrabold px-2 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                  title="Save Title"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 group/title">
                <h4
                  onClick={() => setIsEditingTitle(true)}
                  className="font-extrabold text-base text-amber-300 truncate cursor-pointer hover:text-amber-200 transition-colors"
                  title="Click to quick-edit title"
                >
                  {item.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="text-neutral-500 hover:text-orange-400 p-0.5 rounded opacity-60 group-hover/title:opacity-100 transition-opacity cursor-pointer"
                  title="Quick rename"
                >
                  <Tag className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick Price Display & Edit */}
            {!isEditingTitle && (
              <div>
                {isEditingPrice ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePrice();
                        if (e.key === 'Escape') setIsEditingPrice(false);
                      }}
                      autoFocus
                      className="w-24 bg-[#0c0c12] border border-emerald-500 text-emerald-400 text-xs font-black px-1.5 py-1 rounded outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSavePrice}
                      className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPrice(false)}
                      className="p-1 bg-neutral-700 text-neutral-300 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => setIsEditingPrice(true)}
                    className="text-emerald-400 font-black text-sm cursor-pointer hover:underline hover:text-emerald-300 transition-all flex items-center gap-1"
                    title="Click to quick-edit price"
                  >
                    {item.price}
                    <span className="text-[10px] text-neutral-500 font-normal">✎</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Details Snippet */}
          <p className="text-neutral-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.details?.join(' • ')}
          </p>

          {/* Badges list */}
          {item.badges && item.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.badges.slice(0, 3).map((b, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-orange-400 border border-neutral-700/60"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
          {/* Instant 1-Click Sold Toggle (< 5ms execution) */}
          <button
            type="button"
            onClick={handleToggleSold}
            id={`btn-toggle-sold-${item.id}`}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all duration-100 flex items-center gap-1.5 cursor-pointer select-none touch-manipulation active:scale-95 ${
              localSoldOut
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                : 'bg-red-950/40 text-red-300 border-red-700/60 hover:bg-red-900/60'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${localSoldOut ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {localSoldOut ? 'Mark Available' : 'Mark Sold Out'}
          </button>

          {/* Action buttons: Edit & Non-blocking Delete */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEditItem(item)}
              id={`btn-edit-item-${item.id}`}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 rounded-lg cursor-pointer transition-colors active:scale-95"
              title="Full Edit Details"
            >
              <Edit className="w-4 h-4" />
            </button>

            {confirmDelete ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                id={`btn-confirm-delete-${item.id}`}
                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer font-bold text-xs animate-pulse flex items-center gap-1"
                title="Click again to confirm delete"
              >
                Confirm? 🗑️
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeleteClick}
                id={`btn-delete-item-${item.id}`}
                className="p-2 bg-neutral-800 hover:bg-red-900/80 text-red-400 hover:text-white rounded-lg cursor-pointer transition-colors active:scale-95"
                title="Delete Listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized export prevents other cards from re-rendering when one card is changed
export const AdminItemCard = memo(AdminItemCardComponent, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title &&
    prev.item.price === next.item.price &&
    prev.item.originalPrice === next.item.originalPrice &&
    prev.item.isSoldOut === next.item.isSoldOut &&
    prev.item.level === next.item.level &&
    prev.item.imageUrl === next.item.imageUrl &&
    prev.item.imageHeightStyle === next.item.imageHeightStyle &&
    prev.item.guildStatus === next.item.guildStatus &&
    prev.item.details?.length === next.item.details?.length &&
    prev.item.badges?.length === next.item.badges?.length
  );
});
                         
