import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  PhoneCall,
  Bell,
  Palette,
  QrCode,
  ChevronDown,
  ExternalLink,
  ConciergeBell,
  LogOut,
  Sun,
  Moon,
  ArrowLeft,
  X,
  Layers,
  Store,
  Tag,
  Hotel,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'catalog'
  | 'stories'
  | 'departments'
  | 'notifications'
  | 'branding'
  | 'qr';

export type CatalogSubTab = 'hubs' | 'categories' | 'items';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  activeCatalogSubTab: CatalogSubTab;
  setActiveCatalogSubTab: (subTab: CatalogSubTab) => void;
  hotelName: string;
  hotelSlug: string;
  logoImage?: string;
  receptionUrl: string;
  userRole?: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  counts?: {
    hubs?: number;
    categories?: number;
    items?: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  activeCatalogSubTab,
  setActiveCatalogSubTab,
  hotelName,
  hotelSlug,
  logoImage,
  receptionUrl,
  userRole,
  isDarkMode,
  setIsDarkMode,
  onLogout,
  isMobileOpen,
  setIsMobileOpen,
  counts,
}) => {
  const navigate = useNavigate();
  const [isCatalogExpanded, setIsCatalogExpanded] = useState<boolean>(true);

  const handleCatalogGroupClick = () => {
    setActiveTab('catalog');
    setIsCatalogExpanded((prev) => !prev);
  };

  const handleSubTabClick = (subTab: CatalogSubTab) => {
    setActiveTab('catalog');
    setActiveCatalogSubTab(subTab);
    setIsMobileOpen(false);
  };

  const handleTabClick = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
      isActive
        ? 'bg-[#A78BFA] text-black shadow-sm font-bold'
        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)]/30'
    }`;

  const subNavItemClass = (isActive: boolean) =>
    `w-full flex items-center justify-between pl-9 pr-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-[#A78BFA]/20 text-[#A78BFA] font-bold border border-[#A78BFA]/40'
        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)]/20'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-card)] border-r border-[var(--border-color)] select-none">
      {/* 1. Header: Logo & Hotel Info */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {logoImage ? (
              <img
                src={logoImage}
                alt={hotelName}
                className="w-10 h-10 rounded-2xl object-cover border border-[var(--border-color)] shadow-sm bg-[var(--bg-subcard)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A78BFA] to-violet-600 flex items-center justify-center text-black font-black text-sm shadow-sm">
                <Hotel size={18} />
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--bg-card)]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-[var(--text-main)] truncate" title={hotelName}>
              {hotelName || 'Otel İdarəetmə'}
            </h1>
            <p className="text-[10px] font-mono text-[#A78BFA] truncate">
              /hotel/{hotelSlug || 'slug'}
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)]/40 transition-colors"
          aria-label="Menyunu bağla"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase opacity-70">
          Əsas Menyu
        </div>

        {/* 1. İcmal & Analitika */}
        <button
          onClick={() => handleTabClick('overview')}
          className={navItemClass(activeTab === 'overview')}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard size={16} />
            <span>İcmal & Analitika</span>
          </div>
        </button>

        {/* 2. Kataloq & Hublar (Accordion with Submodules) */}
        <div>
          <button
            onClick={handleCatalogGroupClick}
            className={navItemClass(activeTab === 'catalog')}
          >
            <div className="flex items-center gap-2.5">
              <UtensilsCrossed size={16} />
              <span>Kataloq & Hublar</span>
            </div>
            <div
              className={`transition-transform duration-200 text-current ${
                isCatalogExpanded ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown size={14} />
            </div>
          </button>

          {/* Sub-modules for Catalog */}
          {isCatalogExpanded && (
            <div className="mt-1 space-y-1 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[var(--border-color)]">
              {/* Hubs */}
              <button
                onClick={() => handleSubTabClick('hubs')}
                className={subNavItemClass(activeTab === 'catalog' && activeCatalogSubTab === 'hubs')}
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} />
                  <span>Əsas Bölmələr (Hubs)</span>
                </div>
                {typeof counts?.hubs === 'number' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--border-color)] font-mono">
                    {counts.hubs}
                  </span>
                )}
              </button>

              {/* Categories */}
              <button
                onClick={() => handleSubTabClick('categories')}
                className={subNavItemClass(
                  activeTab === 'catalog' && activeCatalogSubTab === 'categories'
                )}
              >
                <div className="flex items-center gap-2">
                  <Store size={14} />
                  <span>Məkanlar & Kateqoriyalar</span>
                </div>
                {typeof counts?.categories === 'number' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--border-color)] font-mono">
                    {counts.categories}
                  </span>
                )}
              </button>

              {/* Items & Prices */}
              <button
                onClick={() => handleSubTabClick('items')}
                className={subNavItemClass(activeTab === 'catalog' && activeCatalogSubTab === 'items')}
              >
                <div className="flex items-center gap-2">
                  <Tag size={14} />
                  <span>Məhsullar & Qiymətlər</span>
                </div>
                {typeof counts?.items === 'number' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--border-color)] font-mono">
                    {counts.items}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 3. Story-lər */}
        <button
          onClick={() => handleTabClick('stories')}
          className={navItemClass(activeTab === 'stories')}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} />
            <span>Story-lər</span>
          </div>
        </button>

        {/* 4. Şöbə Əlaqələri */}
        <button
          onClick={() => handleTabClick('departments')}
          className={navItemClass(activeTab === 'departments')}
        >
          <div className="flex items-center gap-2.5">
            <PhoneCall size={16} />
            <span>Şöbə Əlaqələri</span>
          </div>
        </button>

        {/* 5. Bildirişlər & Bot */}
        <button
          onClick={() => handleTabClick('notifications')}
          className={navItemClass(activeTab === 'notifications')}
        >
          <div className="flex items-center gap-2.5">
            <Bell size={16} />
            <span>Bildirişlər & Bot</span>
          </div>
        </button>

        {/* 6. Brendinq & Profil */}
        <button
          onClick={() => handleTabClick('branding')}
          className={navItemClass(activeTab === 'branding')}
        >
          <div className="flex items-center gap-2.5">
            <Palette size={16} />
            <span>Brendinq & Profil</span>
          </div>
        </button>

        {/* 7. Dinamik QR Kod */}
        <button onClick={() => handleTabClick('qr')} className={navItemClass(activeTab === 'qr')}>
          <div className="flex items-center gap-2.5">
            <QrCode size={16} />
            <span>Dinamik QR Kod</span>
          </div>
        </button>
      </div>

      {/* 3. Footer: Quick Action Buttons (Resepşn & Qonaq Portalı - Variant A) */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-subcard)]/40 space-y-2">
        <div className="px-1 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase opacity-70">
          Sürətli Əməliyyatlar
        </div>

        {/* Resepşn Masasına Bax */}
        <button
          onClick={() => {
            navigate(receptionUrl);
            setIsMobileOpen(false);
          }}
          className="w-full px-3 py-2.5 rounded-2xl bg-[#A78BFA] hover:bg-[#9370DB] text-black text-xs font-bold flex items-center justify-between shadow-sm active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-2">
            <ConciergeBell size={16} className="animate-bounce" />
            <span>Resepşn Masası</span>
          </div>
          <span className="text-[10px] bg-black/15 px-2 py-0.5 rounded-full font-semibold">
            Canlı
          </span>
        </button>

        {/* Qonaq Portalı ↗ */}
        <a
          href={`/hotel/${hotelSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-3 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[#A78BFA]/50 text-xs font-semibold transition-all flex items-center justify-between"
        >
          <span>Qonaq Portalı</span>
          <ExternalLink size={13} />
        </a>

        {/* Theme and Logout Controls */}
        <div className="pt-1.5 flex items-center justify-between border-t border-[var(--border-color)]/60">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'İşıqlı rejimə keç' : 'Qaranlıq rejimə keç'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)]/40 transition-colors"
          >
            {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-[#A78BFA]" />}
            <span className="text-[11px]">{isDarkMode ? 'Açıq' : 'Tünd'}</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={14} />
            <span className="text-[11px]">Çıxış</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 shrink-0 h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in Backdrop) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

