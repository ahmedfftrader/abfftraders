import React, { useState, useEffect, useRef } from 'react';
import { ContactConfig } from '../../types';
import { PhoneCall, CheckCircle2 } from 'lucide-react';
import { withImageCacheBuster } from '../../utils/imageUtils';

interface AdminContactTabProps {
  initialContact: ContactConfig;
  onSave: (contact: ContactConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminContactTab: React.FC<AdminContactTabProps> = ({
  initialContact,
  onSave,
  showToast,
}) => {
  const [contact, setContact] = useState<ContactConfig>(initialContact);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setContact(initialContact);
    setHasUnsavedChanges(false);
  }, [initialContact]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setContact((prev) => ({ ...prev, logoUrl: busted }));
        setHasUnsavedChanges(true);
        showToast('Logo photo upload ho gayi!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.whatsappNumber.trim()) {
      alert('WhatsApp number lazmi bharein!');
      return;
    }
    onSave(contact);
    setHasUnsavedChanges(false);
    showToast('Contact & Payment details kamyabi se save ho gayi! 📞');
  };

  return (
    <div className="bg-[#14141e] border border-neutral-800 rounded-3xl p-5 sm:p-7 max-w-3xl mx-auto shadow-xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            Contact & Payment Information
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            WhatsApp number badalne se tamam cards ke "BUY NOW" buttons aur floating button naye number par link ho jayenge.
          </p>
        </div>

        {hasUnsavedChanges ? (
          <span className="self-start sm:self-auto text-[11px] font-bold px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full animate-pulse">
            Unsaved Changes
          </span>
        ) : (
          <span className="self-start sm:self-auto text-[11px] font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WHATSAPP & SOCIAL */}
        <div className="bg-[#0e0e16] p-4 sm:p-5 rounded-2xl border border-neutral-700 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>WhatsApp & Social Accounts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                WhatsApp Number (Bina '+' ya '00' ke, jaise: 923132478759) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="input-contact-whatsapp"
                value={contact.whatsappNumber}
                onChange={(e) => {
                  setContact((prev) => ({ ...prev, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') }));
                  setHasUnsavedChanges(true);
                }}
                placeholder="923132478759"
                className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-emerald-500 rounded-xl text-emerald-400 font-mono font-bold text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Display WhatsApp (Website par dikhane ke liye)
              </label>
              <input
                type="text"
                id="input-contact-whatsapp-display"
                value={contact.whatsappDisplay}
                onChange={(e) => {
                  setContact((prev) => ({ ...prev, whatsappDisplay: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                placeholder="+92 313 2478759"
                className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-emerald-500 rounded-xl text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              TikTok Profile URL
            </label>
            <input
              type="url"
              id="input-contact-tiktok"
              value={contact.tiktokUrl}
              onChange={(e) => {
                setContact((prev) => ({ ...prev, tiktokUrl: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              placeholder="https://www.tiktok.com/@ahmed_bhai05"
              className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none"
            />
          </div>
        </div>

        {/* PAYMENT DETAILS */}
        <div className="bg-[#0e0e16] p-4 sm:p-5 rounded-2xl border border-neutral-700 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Payment Account (Easypaisa / Jazzcash)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Payment Account Number
              </label>
              <input
                type="text"
                id="input-contact-payment-number"
                value={contact.paymentNumber}
                onChange={(e) => {
                  setContact((prev) => ({ ...prev, paymentNumber: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                placeholder="03403782084"
                className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-amber-500 rounded-xl text-amber-300 font-mono font-bold text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Account Title / Name
              </label>
              <input
                type="text"
                id="input-contact-payment-name"
                value={contact.paymentName}
                onChange={(e) => {
                  setContact((prev) => ({ ...prev, paymentName: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                placeholder="Iram Sabeen"
                className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-amber-500 rounded-xl text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Available Payment Methods Text
            </label>
            <input
              type="text"
              id="input-contact-payment-methods"
              value={contact.paymentMethods}
              onChange={(e) => {
                setContact((prev) => ({ ...prev, paymentMethods: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              placeholder="Easypaisa / Jazzcash / Bank Transfer"
              className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Security & Delivery Note (Process Step 4)
            </label>
            <textarea
              rows={2}
              id="textarea-contact-delivery-note"
              value={contact.deliverySecurityNote}
              onChange={(e) => {
                setContact((prev) => ({ ...prev, deliverySecurityNote: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none"
            />
          </div>
        </div>

        {/* BRAND DETAILS */}
        <div className="bg-[#0e0e16] p-4 sm:p-5 rounded-2xl border border-neutral-700 space-y-4">
          <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
            Store Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                id="input-contact-brand-name"
                value={contact.brandName}
                onChange={(e) => {
                  setContact((prev) => ({ ...prev, brandName: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Tagline
              </label>
              <input
                type="text"
                id="input-contact-brand-tagline"
                value={contact.brandTagline}
                onChange={(e) => {
                  setContact((prev) => ({ ...prev, brandTagline: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Store Logo Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="input-contact-logo-url"
                value={contact.logoUrl}
                onChange={(e) => {
                  setContact((prev) => ({ ...prev, logoUrl: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 px-3.5 py-2 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none"
              />
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                id="btn-upload-logo"
                onClick={() => logoInputRef.current?.click()}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-xl border border-neutral-700 cursor-pointer"
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          id="btn-save-contact"
          className="w-full bg-gradient-to-r from-[#ff9500] to-[#ff3300] hover:from-[#ffa726] hover:to-[#ff4500] text-white py-3.5 px-4 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-lg hover:shadow-orange-600/30 cursor-pointer active:scale-98"
        >
          Contact Details Save Karein 💾
        </button>
      </form>
    </div>
  );
};
