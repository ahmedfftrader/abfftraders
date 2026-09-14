import React, { useState, useEffect } from 'react';
import { AnnouncementConfig, HeroConfig } from '../../types';
import { Megaphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { AdminToggleSwitch } from './AdminToggleSwitch';

interface AdminAnnouncementTabProps {
  initialAnnouncement: AnnouncementConfig;
  initialHero: HeroConfig;
  onSave: (announcement: AnnouncementConfig, hero: HeroConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminAnnouncementTab: React.FC<AdminAnnouncementTabProps> = ({
  initialAnnouncement,
  initialHero,
  onSave,
  showToast,
}) => {
  // Local unblocked state for instant typing & toggling (< 2ms)
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(initialAnnouncement);
  const [hero, setHero] = useState<HeroConfig>(initialHero);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Sync with initial if changed externally
  useEffect(() => {
    setAnnouncement(initialAnnouncement);
    setHero(initialHero);
    setHasUnsavedChanges(false);
  }, [initialAnnouncement, initialHero]);

  const handleToggleEnabled = (checked: boolean) => {
    const nextAnn = { ...announcement, enabled: checked };
    setAnnouncement(nextAnn);
    onSave(nextAnn, hero);
    showToast(checked ? 'Announcement Banner SHOW kar diya gaya! ✅' : 'Announcement Banner HIDE kar diya gaya! ❌');
  };

  const handleToggleMarquee = (checked: boolean) => {
    const nextAnn = { ...announcement, marquee: checked };
    setAnnouncement(nextAnn);
    onSave(nextAnn, hero);
    showToast(checked ? 'Marquee Scrolling ON ho gayi! 🚀' : 'Marquee Scrolling OFF ho gayi! ⏸️');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(announcement, hero);
    setHasUnsavedChanges(false);
    showToast('Top Announcement aur Hero Banner update ho gaya! 📢');
  };

  return (
    <div className="bg-[#14141e] border border-neutral-800 rounded-3xl p-5 sm:p-7 max-w-3xl mx-auto shadow-xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-500" />
            Top Announcement & Hero Banner Settings
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Yahan se aap website ke sabse upar chalne wala announcement bar aur hero banner text badal sakte hain.
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
        {/* TOP TICKER SECTION */}
        <div className="bg-[#0e0e16] p-4 sm:p-5 rounded-2xl border border-neutral-700 space-y-4">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            Top Announcement Ticker (Sabse Upar Ka Banner)
          </h3>

          {/* Enable toggle with instant trigger */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs sm:text-sm font-medium text-neutral-200 block">
                Announcement Banner Show Karein:
              </span>
              <span className="text-[11px] text-neutral-400">
                {announcement.enabled ? 'Banner is currently VISIBLE' : 'Banner is currently HIDDEN'}
              </span>
            </div>
            <AdminToggleSwitch
              id="switch-announcement-enabled"
              label="Announcement Banner Show"
              checked={announcement.enabled}
              onChange={handleToggleEnabled}
            />
          </div>

          {/* Marquee Continuous Slide toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800 py-1">
            <div>
              <span className="text-xs sm:text-sm font-medium text-neutral-200 block">
                Marquee Animation (Chalta hua scrolling text):
              </span>
              <span className="text-[11px] text-neutral-400">
                {announcement.marquee ? 'Continuous moving ticker' : 'Static centered text'}
              </span>
            </div>
            <AdminToggleSwitch
              id="switch-announcement-marquee"
              label="Marquee Animation"
              checked={announcement.marquee}
              onChange={handleToggleMarquee}
            />
          </div>

          {/* Tag label */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Banner Tag / Badge (e.g. OFFER 🔥, NOTICE, SALE)
            </label>
            <input
              type="text"
              id="input-announcement-tag"
              value={announcement.tag}
              onChange={(e) => {
                setAnnouncement((prev) => ({ ...prev, tag: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              className="w-full px-3.5 py-2 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none font-bold"
            />
          </div>

          {/* Text input */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Announcement Message
            </label>
            <textarea
              rows={2}
              id="textarea-announcement-message"
              value={announcement.text}
              onChange={(e) => {
                setAnnouncement((prev) => ({ ...prev, text: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              placeholder="🔥 MEGA DEAL: Verified Free Fire IDs Available..."
              className="w-full px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none"
            />
          </div>
        </div>

        {/* HERO BANNER TEXT SECTION */}
        <div className="bg-[#0e0e16] p-4 sm:p-5 rounded-2xl border border-neutral-700 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Hero Section Text (Main Heading)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Heading Line 1
              </label>
              <input
                type="text"
                id="input-hero-heading1"
                value={hero.headingLine1}
                onChange={(e) => {
                  setHero((prev) => ({ ...prev, headingLine1: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                placeholder="Free Fire IDs"
                className="w-full px-3.5 py-2 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Heading Line 2
              </label>
              <input
                type="text"
                id="input-hero-heading2"
                value={hero.headingLine2}
                onChange={(e) => {
                  setHero((prev) => ({ ...prev, headingLine2: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                placeholder="Listed"
                className="w-full px-3.5 py-2 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Hero Subtitle (Chhota text)
            </label>
            <input
              type="text"
              id="input-hero-subtitle"
              value={hero.subtitle}
              onChange={(e) => {
                setHero((prev) => ({ ...prev, subtitle: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              className="w-full px-3.5 py-2 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Trust Badge Text
            </label>
            <input
              type="text"
              id="input-hero-badge"
              value={hero.badgeText}
              onChange={(e) => {
                setHero((prev) => ({ ...prev, badgeText: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              className="w-full px-3.5 py-2 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-amber-300 text-xs outline-none font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          id="btn-save-announcement"
          className="w-full bg-gradient-to-r from-[#ff9500] to-[#ff3300] hover:from-[#ffa726] hover:to-[#ff4500] text-white py-3.5 px-4 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-lg hover:shadow-orange-600/30 cursor-pointer active:scale-98"
        >
          Marketing & Hero Changes Save Karein 💾
        </button>
      </form>
    </div>
  );
};
                                            
