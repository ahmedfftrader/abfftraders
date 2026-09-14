import React, { useState, useCallback } from 'react';
import {
  StoreState,
  FreeFireItem,
  AnnouncementConfig,
  ContactConfig,
  HeroConfig,
} from '../types';
import { AdminItemCard } from './AdminItemCard';
import { AdminItemEditModal } from './admin/AdminItemEditModal';
import { AdminAnnouncementTab } from './admin/AdminAnnouncementTab';
import { AdminContactTab } from './admin/AdminContactTab';
import { AdminSecurityTab } from './admin/AdminSecurityTab';
import {
  Megaphone,
  Gamepad2,
  PhoneCall,
  Settings,
  Plus,
  Eye,
  Check,
  AlertCircle,
  Lock,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface Props {
  state: StoreState;
  isCloudSynced?: boolean;
  lastSyncedAt?: number | null;
  onForceSync?: () => Promise<void> | void;
  onUpdateAnnouncement: (announcement: AnnouncementConfig) => void;
  onUpdateHero: (hero: HeroConfig) => void;
  onUpdateContact: (contact: ContactConfig) => void;
  onAddItem: (item: Omit<FreeFireItem, 'id' | 'createdAt'>) => void;
  onUpdateItem: (id: string, item: Partial<FreeFireItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleSoldOut: (id: string) => void;
  onQuickUpdatePrice?: (id: string, price: string) => void;
  onQuickUpdateTitle?: (id: string, title: string) => void;
  onQuickUpdateImage?: (id: string, imageUrl: string) => void;
  onUpdateAdminPin: (pin: string) => void;
  onResetToDefault: () => void;
  onImportData: (data: StoreState) => void;
  onBackToStore: () => void;
}

export const AdminPanel: React.FC<Props> = ({
  state,
  isCloudSynced,
  onForceSync,
  onUpdateAnnouncement,
  onUpdateHero,
  onUpdateContact,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleSoldOut,
  onQuickUpdatePrice,
  onQuickUpdateTitle,
  onQuickUpdateImage,
  onUpdateAdminPin,
  onResetToDefault,
  onImportData,
  onBackToStore,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ahmed_bhai_admin_auth') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'items' | 'announcement' | 'contact' | 'settings'>('items');

  // Item Modal State (Isolated from main render loop)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FreeFireItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Stable memoized callbacks for AdminItemCards
  const handleToggleSoldOut = useCallback((id: string) => {
    onToggleSoldOut(id);
  }, [onToggleSoldOut]);

  const handleDeleteItem = useCallback((id: string) => {
    onDeleteItem(id);
  }, [onDeleteItem]);

  const handleQuickUpdatePrice = useCallback((id: string, price: string) => {
    if (onQuickUpdatePrice) {
      onQuickUpdatePrice(id, price);
    } else {
      onUpdateItem(id, { price });
    }
  }, [onQuickUpdatePrice, onUpdateItem]);

  const handleQuickUpdateTitle = useCallback((id: string, title: string) => {
    if (onQuickUpdateTitle) {
      onQuickUpdateTitle(id, title);
    } else {
      onUpdateItem(id, { title });
    }
  }, [onQuickUpdateTitle, onUpdateItem]);

  const handleOpenAddModal = useCallback(() => {
    setItemToEdit(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((item: FreeFireItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setItemToEdit(null);
  }, []);

  // Save Announcement & Hero
  const handleSaveAnnouncementAndHero = useCallback((announcement: AnnouncementConfig, hero: HeroConfig) => {
    onUpdateAnnouncement(announcement);
    onUpdateHero(hero);
  }, [onUpdateAnnouncement, onUpdateHero]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = enteredPin.trim();
    const validPins = [state.adminPin, 'opahmimetr1x', '[opahmimetr1x]'].filter(Boolean);
    if (validPins.includes(cleanPin)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ahmed_bhai_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Ghalat Password! Baraye meherbani sahi password darj karein.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ahmed_bhai_admin_auth');
    onBackToStore();
  };

  // ==========================================
  // 1. LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div
        id="admin-login-screen"
        className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4 relative"
      >
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full bg-[#13131c] border border-[#ff5500]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#ff3300] to-[#ff9900] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-600/30 mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">
              Admin Login Portal
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              AHMED BHAI - Store Management Panel
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Admin Passcode / Password
              </label>
              <input
                type="password"
                id="admin-pin-input"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter password..."
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-neutral-700 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] rounded-xl text-white outline-none transition-all font-mono"
                autoFocus
              />
            </div>

            <button
              type="submit"
              id="admin-login-submit"
              className="w-full bg-gradient-to-r from-[#ff9500] to-[#ff3300] hover:from-[#ffa726] hover:to-[#ff4500] text-white py-3 px-4 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-lg hover:shadow-orange-600/40 cursor-pointer active:scale-98"
            >
              LOGIN TO ADMIN ⚡
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
            <button
              type="button"
              onClick={onBackToStore}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              ← Back to Free Fire Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div id="admin-dashboard" className="min-h-screen bg-[#0d0d14] text-neutral-100 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-semibold text-sm animate-bounce">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-[#12121b] border-b border-[#ff5500]/30 px-4 sm:px-8 py-3.5 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-950">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white leading-none">
                  STORE ADMIN PANEL
                </h1>
                <span
                  title={isCloudSynced ? 'Sync Active: Changes reflect live on all visitors devices' : 'Connecting to Live Cloud Storage...'}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                    isCloudSynced
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isCloudSynced ? 'LIVE CLOUD SYNC ACTIVE' : 'CONNECTING...'}
                </span>
              </div>
              <span className="text-[11px] text-orange-400 font-semibold">
                {state.contact.brandName} • Live Cross-Device Sync Enabled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onForceSync && (
              <button
                type="button"
                onClick={async () => {
                  showToast('Syncing with online cloud store...');
                  await onForceSync();
                  showToast('Live cloud store synced successfully! ⚡');
                }}
                id="admin-btn-force-sync"
                className="px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-700 cursor-pointer active:scale-95"
                title="Force Cloud Sync across all devices"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sync Cloud</span>
              </button>
            )}
            <button
              type="button"
              onClick={onBackToStore}
              id="admin-btn-view-store"
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-700 cursor-pointer active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Store Dekhein</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              id="admin-btn-logout"
              className="px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-red-800/60 cursor-pointer active:scale-95"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-[#14141e] rounded-2xl border border-neutral-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('items');
              setIsModalOpen(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'items'
                ? 'bg-[#ff5500] text-white shadow-md shadow-orange-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>1. Manage IDs ({state.items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('announcement')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'announcement'
                ? 'bg-[#ff5500] text-white shadow-md shadow-orange-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>2. Marketing Banner & Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#ff5500] text-white shadow-md shadow-orange-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>3. WhatsApp & Payment Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#ff5500] text-white shadow-md shadow-orange-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>4. Security & Backup</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: MANAGE FREE FIRE IDS & ACCOUNTS               */}
        {/* ==================================================== */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141e] p-4 sm:p-5 rounded-2xl border border-neutral-800">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <span>Free Fire IDs & Guilds List</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30">
                    Total: {state.items.length}
                  </span>
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                  Yahan se aap new ID add kar sakte hain, price change kar sakte hain ya Sold Out mark kar sakte hain.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddModal}
                id="btn-admin-add-id"
                className="bg-gradient-to-r from-[#ff9500] to-[#ff3300] hover:from-[#ffa726] hover:to-[#ff4500] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Nayi ID Add Karein +</span>
              </button>
            </div>

            {/* ADD / EDIT MODAL (Isolated, zero parent lag) */}
            {isModalOpen && (
              <AdminItemEditModal
                itemToEdit={itemToEdit}
                onClose={handleCloseModal}
                onSaveNew={onAddItem}
                onSaveUpdate={onUpdateItem}
                showToast={showToast}
              />
            )}

            {/* IDS LIST TABLE / CARDS */}
            {state.items.length === 0 ? (
              <div className="text-center py-12 bg-[#14141e] rounded-2xl border border-neutral-800">
                <p className="text-neutral-400 text-sm">Filhal koi Free Fire ID listed nahi hai.</p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="mt-3 text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Nayi ID List Karein +
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {state.items.map((item) => (
                  <AdminItemCard
                    key={item.id}
                    item={item}
                    onToggleSoldOut={handleToggleSoldOut}
                    onDeleteItem={handleDeleteItem}
                    onEditItem={handleOpenEditModal}
                    onQuickUpdatePrice={handleQuickUpdatePrice}
                    onQuickUpdateTitle={handleQuickUpdateTitle}
                    onQuickUpdateImage={onQuickUpdateImage}
                    showToast={showToast}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: MARKETING BANNER & HERO CUSTOMIZATION        */}
        {/* ==================================================== */}
        {activeTab === 'announcement' && (
          <AdminAnnouncementTab
            initialAnnouncement={state.announcement}
            initialHero={state.hero}
            onSave={handleSaveAnnouncementAndHero}
            showToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 3: CONTACT / WHATSAPP & PAYMENT DETAILS        */}
        {/* ==================================================== */}
        {activeTab === 'contact' && (
          <AdminContactTab
            initialContact={state.contact}
            onSave={onUpdateContact}
            showToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 4: SECURITY, PASSWORD & DATA BACKUP             */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <AdminSecurityTab
            state={state}
            onUpdateAdminPin={onUpdateAdminPin}
            onResetToDefault={onResetToDefault}
            onImportData={onImportData}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
};
