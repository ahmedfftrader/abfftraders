import { useState, useEffect } from 'react';
import { useStoreState } from './useStoreState';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { IdCardsSection } from './components/IdCardsSection';
import { BuyingStepsSection } from './components/BuyingStepsSection';
import { FloatingSocials } from './components/FloatingSocials';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const {
    state,
    isCloudSynced,
    lastSyncedAt,
    syncFromCloud,
    updateAnnouncement,
    updateHero,
    updateContact,
    addItem,
    updateItem,
    deleteItem,
    toggleSoldOut,
    quickUpdateItemPrice,
    quickUpdateItemTitle,
    quickUpdateItemImage,
    updateAdminPin,
    resetToDefault,
    importData,
  } = useStoreState();

  // Route state: 'store' or 'admin'
  const isSecretAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash.startsWith('#admin') ||
      path.endsWith('/admin')
    );
  };

  const [currentRoute, setCurrentRoute] = useState<'store' | 'admin'>(() => {
    return isSecretAdminRoute() ? 'admin' : 'store';
  });

  // Listen to popstate and hashchange (browser URL changes)
  useEffect(() => {
    const handleUrlChange = () => {
      if (isSecretAdminRoute()) {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('store');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Optional hidden shortcut: pressing Alt+A or typing secret sequence
    const handleKeyDown = (e: KeyboardEvent) => {
      // If admin wants to open using Alt+A shortcut
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        navigateToAdmin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigateToAdmin = () => {
    setCurrentRoute('admin');
    try {
      window.history.pushState({ route: 'admin' }, '', '/admin');
    } catch {
      window.location.hash = '#admin';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = () => {
    setCurrentRoute('store');
    try {
      window.history.pushState({ route: 'store' }, '', '/');
    } catch {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="store-main-app" className="min-h-screen bg-[#0a0a0f] text-white store-bg-glow selection:bg-orange-500 selection:text-white">
      {currentRoute === 'admin' ? (
        <AdminPanel
          state={state}
          isCloudSynced={isCloudSynced}
          lastSyncedAt={lastSyncedAt}
          onForceSync={syncFromCloud}
          onUpdateAnnouncement={updateAnnouncement}
          onUpdateHero={updateHero}
          onUpdateContact={updateContact}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onToggleSoldOut={toggleSoldOut}
          onQuickUpdatePrice={quickUpdateItemPrice}
          onQuickUpdateTitle={quickUpdateItemTitle}
          onQuickUpdateImage={quickUpdateItemImage}
          onUpdateAdminPin={updateAdminPin}
          onResetToDefault={resetToDefault}
          onImportData={importData}
          onBackToStore={navigateToStore}
        />
      ) : (
        <div id="customer-storefront-view" className="flex flex-col min-h-screen">
          {/* Top Announcement Bar */}
          <AnnouncementBanner announcement={state.announcement} />

          {/* Header without any admin button */}
          <Header contact={state.contact} />

          {/* Main Content Area */}
          <main className="flex-grow">
            {/* Hero Section */}
            <HeroSection hero={state.hero} />

            {/* Available IDs Grid */}
            <IdCardsSection
              items={state.items}
              whatsappNumber={state.contact.whatsappNumber}
            />

            {/* Buying Process 4 Steps */}
            <BuyingStepsSection contact={state.contact} />
          </main>

          {/* Floating WhatsApp and TikTok icons */}
          <FloatingSocials contact={state.contact} />

          {/* Footer with subtle admin access */}
          <Footer brandName={state.contact.brandName} onOpenAdmin={navigateToAdmin} />
        </div>
      )}
    </div>
  );
    }
