import React, { useState, useRef } from 'react';
import { FreeFireItem, ImageHeightVariant } from '../../types';
import { Sparkles, Upload } from 'lucide-react';
import { withImageCacheBuster } from '../../utils/imageUtils';
import { AdminToggleSwitch } from './AdminToggleSwitch';

interface AdminItemEditModalProps {
  itemToEdit: FreeFireItem | null; // null means adding a new item
  onClose: () => void;
  onSaveNew: (item: Omit<FreeFireItem, 'id' | 'createdAt'>) => void;
  onSaveUpdate: (id: string, updates: Partial<FreeFireItem>) => void;
  showToast: (msg: string) => void;
}

export const AdminItemEditModal: React.FC<AdminItemEditModalProps> = ({
  itemToEdit,
  onClose,
  onSaveNew,
  onSaveUpdate,
  showToast,
}) => {
  const [title, setTitle] = useState(itemToEdit ? itemToEdit.title : '');
  const [level, setLevel] = useState(itemToEdit ? itemToEdit.level : 'Lv. 60');
  const [guildStatus, setGuildStatus] = useState(itemToEdit ? itemToEdit.guildStatus || '' : 'Solo Verified');
  const [price, setPrice] = useState(itemToEdit ? itemToEdit.price : 'Rs. ');
  const [originalPrice, setOriginalPrice] = useState(itemToEdit ? itemToEdit.originalPrice || '' : 'Rs. ');
  const [imageUrl, setImageUrl] = useState(itemToEdit ? itemToEdit.imageUrl : '');
  const [imageHeightStyle, setImageHeightStyle] = useState<ImageHeightVariant>(
    itemToEdit ? itemToEdit.imageHeightStyle || 'nom' : 'nom'
  );
  const [badges, setBadges] = useState(itemToEdit && itemToEdit.badges ? itemToEdit.badges.join(', ') : 'RARE, HOT');
  const [details, setDetails] = useState(
    itemToEdit ? itemToEdit.details.join('\n') : '200+ LOADED VAULT\n30+ EMOTES\nEVO GUN MAX'
  );
  const [whatsappText, setWhatsappText] = useState(
    itemToEdit ? itemToEdit.whatsappCustomText || '' : 'Mujhe yeh Free Fire ID buy karni hai'
  );
  const [isSoldOut, setIsSoldOut] = useState(itemToEdit ? itemToEdit.isSoldOut : false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size bohot bari hai. Baraye meherbani 5MB se kam ki photo upload karein.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const busted = withImageCacheBuster(result, Date.now());
        setImageUrl(busted);
        showToast('Photo upload ho gayi!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) {
      alert('Title aur Price lazmi bharein!');
      return;
    }

    const badgeList = badges
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const detailsList = details
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => (d.startsWith('✅') ? d : `✅ ${d}`));

    const rawImageUrl =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
    const finalImageUrl = withImageCacheBuster(rawImageUrl, Date.now());

    if (itemToEdit) {
      onSaveUpdate(itemToEdit.id, {
        title: title.trim(),
        level: level.trim(),
        guildStatus: guildStatus.trim() || undefined,
        price: price.trim(),
        originalPrice: originalPrice.trim() || undefined,
        imageUrl: finalImageUrl,
        imageHeightStyle,
        badges: badgeList,
        details: detailsList,
        whatsappCustomText: whatsappText.trim(),
        isSoldOut,
      });
      showToast('ID kamyabi se update ho gayi! ✅');
    } else {
      onSaveNew({
        title: title.trim(),
        level: level.trim() || 'Lv. 60',
        guildStatus: guildStatus.trim() || undefined,
        price: price.trim(),
        originalPrice: originalPrice.trim() || undefined,
        imageUrl: finalImageUrl,
        imageHeightStyle,
        badges: badgeList,
        details: detailsList.length > 0 ? detailsList : ['✅ Loaded Vault', '✅ Rare Guns'],
        whatsappCustomText: whatsappText.trim(),
        isSoldOut,
      });
      showToast('Nayi Free Fire ID list ho gayi! 🔥');
    }

    onClose();
  };

  return (
    <div className="bg-[#181824] border-2 border-[#ff5500] rounded-3xl p-5 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
        <h3 className="text-lg font-black text-[#ffaa33] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          {itemToEdit ? 'ID Edit Karein' : 'Nayi Free Fire ID Upload Karein'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-neutral-800 cursor-pointer"
        >
          Cancel ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              ID Ka Title / Naam <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="input-modal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. RARE ID, OLD ID, LEVEL 6 GUILD"
              className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none"
              required
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Account Level <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="input-modal-level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="e.g. Lv. 65 ya Lv. 70"
              className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Selling Price (Current) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="input-modal-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. Rs. 6,000"
              className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-emerald-400 font-bold text-sm outline-none"
              required
            />
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Kati Hui Purani Price (Optional)
            </label>
            <input
              type="text"
              id="input-modal-original-price"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. Rs. 7,500"
              className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-neutral-400 text-sm outline-none"
            />
          </div>

          {/* Guild Status */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Guild Status / Sub-tag
            </label>
            <input
              type="text"
              id="input-modal-guild-status"
              value={guildStatus}
              onChange={(e) => setGuildStatus(e.target.value)}
              placeholder="e.g. Single Link / Level 6 Guild / Solo"
              className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none"
            />
          </div>

          {/* Badges */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Badges (Comma separated)
            </label>
            <input
              type="text"
              id="input-modal-badges"
              value={badges}
              onChange={(e) => setBadges(e.target.value)}
              placeholder="e.g. RARE, VIP, POPULAR"
              className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-amber-300 text-sm outline-none"
            />
          </div>

          {/* Image Height Style */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Card Image Format / Height
            </label>
            <select
              id="select-modal-height-style"
              value={imageHeightStyle}
              onChange={(e) => setImageHeightStyle(e.target.value as ImageHeightVariant)}
              className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none"
            >
              <option value="nom">Normal Height (300px)</option>
              <option value="tall">Tall Height (320px)</option>
              <option value="big">Big / Full Vertical (540px)</option>
              <option value="bag">Compact / Bag Height (170px)</option>
            </select>
          </div>

          {/* Instant Sold Out Toggle */}
          <div className="flex items-center justify-between bg-[#0e0e16] p-3.5 rounded-xl border border-neutral-700">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">
                Mark as 'SOLD OUT' (Bik chuki hai)
              </span>
              <span className="text-[11px] text-neutral-400">
                {isSoldOut ? 'Card par SOLD OUT watermark lagega' : 'Available for purchase'}
              </span>
            </div>
            <AdminToggleSwitch
              id="switch-modal-sold-out"
              label="Sold Out Status"
              checked={isSoldOut}
              onChange={setIsSoldOut}
            />
          </div>
        </div>

        {/* Image URL & Upload */}
        <div className="bg-[#11111a] p-4 rounded-2xl border border-neutral-700 space-y-3">
          <label className="block text-xs font-bold text-neutral-200">
            ID Screenshot / Photo (URL ya Device se Upload)
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              id="input-modal-image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image link: https://i.ibb.co/..."
              className="flex-1 w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              id="btn-modal-upload-device"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-neutral-600 cursor-pointer flex-shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-orange-400" />
              Device se Upload
            </button>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-16 h-16 rounded-xl object-cover border border-orange-500/50"
              />
              <span className="text-xs text-neutral-400 font-mono">Image Preview OK</span>
            </div>
          )}
        </div>

        {/* Details / Bullets */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">
            Account Features / Details (Har line aik bullet point banegi)
          </label>
          <textarea
            rows={4}
            id="textarea-modal-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="250+ LOADED VAULT&#10;40 LUSH EMOTES&#10;3 ENTRY + 7 EVO GUNS"
            className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none font-mono"
          />
        </div>

        {/* Custom WhatsApp message */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">
            WhatsApp Message Text (Jo buyer ke WhatsApp par pre-typed jaye)
          </label>
          <input
            type="text"
            id="input-modal-whatsapp-text"
            value={whatsappText}
            onChange={(e) => setWhatsappText(e.target.value)}
            placeholder="e.g. Mujhe RARE ID LENI HAI"
            className="w-full px-3.5 py-2.5 bg-[#0e0e16] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none"
          />
        </div>

        {/* Submit buttons */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="submit"
            id="btn-modal-save-item"
            className="bg-gradient-to-r from-[#ff9500] to-[#ff3300] hover:from-[#ffa726] hover:to-[#ff4500] text-white px-6 py-3 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-lg hover:shadow-orange-600/30 cursor-pointer active:scale-98"
          >
            {itemToEdit ? 'Update Save Karein 💾' : 'ID Publish Karein 🚀'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-bold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
