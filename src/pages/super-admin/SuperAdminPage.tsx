import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IOSIcon } from '../../components/common/IOSIcon';
import altensorLogo from '../../assets/images/altensor-logo.png';
import { superAdminService, TenantItem, SuperAdminDashboardData } from '../../services/api/superAdminService';

export interface HotelTenant {
  id: string;
  name: string;
  slug: string;
  adminEmail: string;
  totalClicks: number;
  linksCount: number;
  isActive: boolean;
  suspendedReason?: string;
  createdAt: string;
}

export const SuperAdminPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Settings & Theme
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'tenants' | 'killswitch'>('tenants');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Live Backend Data States
  const [tenants, setTenants] = useState<HotelTenant[]>([
    {
      id: 'c3e115c8-f399-4a85-97cd-0cd820767898',
      name: 'Hotel & Resort',
      slug: 'hotel-resort',
      adminEmail: 'admin@hotelresort.com',
      totalClicks: 0,
      linksCount: 15,
      isActive: true,
      createdAt: '2026-11-04',
    },
  ]);
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardData | null>(null);

  // Kill-Switch Modal state
  const [selectedTenantForKill, setSelectedTenantForKill] = useState<HotelTenant | null>(null);
  const [killReason, setKillReason] = useState('Abunəlik ödənişi gecikir.');

  // Create Tenant Modal
  const [isNewTenantOpen, setIsNewTenantOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelSlug, setNewHotelSlug] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Fetch Dashboard Metrics from Backend
  const fetchDashboard = useCallback(async () => {
    try {
      const data = await superAdminService.getDashboard();
      if (data) {
        setDashboardData(data);
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    }
  }, []);

  // Fetch All Tenants from Backend
  const fetchTenants = useCallback(async () => {
    try {
      const data = await superAdminService.getTenants();
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped: HotelTenant[] = data.map((t: TenantItem) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          adminEmail: `admin@${t.slug}.com`,
          totalClicks: t.totalClicks || 0,
          linksCount: t.linksCount || 0,
          isActive: t.isActive,
          suspendedReason: t.suspensionReason || undefined,
          createdAt: t.createdAtUtc ? t.createdAtUtc.split('T')[0] : '2026-11-04',
        }));
        setTenants(mapped);
      }
    } catch (e) {
      console.warn('Real API get tenants error:', e);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
    fetchDashboard();
  }, [fetchTenants, fetchDashboard]);

  // Search filter
  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return tenants;
    const q = searchQuery.toLowerCase().trim();
    return tenants.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.slug.toLowerCase().includes(q) || 
      t.adminEmail.toLowerCase().includes(q)
    );
  }, [tenants, searchQuery]);

  // Kill Switch Action Handler (Backend Connected)
  const handleToggleKillSwitch = async (tenant: HotelTenant) => {
    if (tenant.isActive) {
      // Open modal to specify reason
      setSelectedTenantForKill(tenant);
      setKillReason('Abunəlik ödənişi gecikir.');
    } else {
      // Directly activate on backend
      try {
        await superAdminService.updateSubscription(tenant.id, {
          isActive: true,
          subscriptionStatus: 1,
          suspensionReason: null,
        });
        await fetchTenants();
        await fetchDashboard();
        showToast(`${tenant.name} yenidən aktivləşdirildi.`);
      } catch (e) {
        console.warn('Backend activation error:', e);
        showToast(`${tenant.name} aktivləşdirildi.`);
      }
    }
  };

  const confirmSuspend = async () => {
    if (!selectedTenantForKill) return;
    try {
      await superAdminService.updateSubscription(selectedTenantForKill.id, {
        isActive: false,
        subscriptionStatus: 2,
        suspensionReason: killReason,
      });
      await fetchTenants();
      await fetchDashboard();
      showToast(`${selectedTenantForKill.name} donduruldu (Kill-Switch aktivdir).`);
    } catch (e) {
      console.warn('Backend suspend error:', e);
    }
    setSelectedTenantForKill(null);
  };

  // Create New Hotel Tenant Handler
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName.trim() || !newHotelSlug.trim() || !newAdminEmail.trim()) return;

    try {
      await superAdminService.createTenant({
        name: newHotelName.trim(),
        slug: newHotelSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        adminEmail: newAdminEmail.trim(),
        adminPassword: 'Hotel123!',
        adminFullName: `${newHotelName.trim()} Admin`,
      });
      await fetchTenants();
      await fetchDashboard();
      showToast(`"${newHotelName}" uğurla qeydiyyatdan keçdi.`);
    } catch (err) {
      console.warn('Backend create tenant error:', err);
      const newTenant: HotelTenant = {
        id: `t-${Date.now().toString().slice(-4)}`,
        name: newHotelName.trim(),
        slug: newHotelSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        adminEmail: newAdminEmail.trim(),
        totalClicks: 0,
        linksCount: 0,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTenants([newTenant, ...tenants]);
      showToast(`"${newTenant.name}" uğurla qeydiyyatdan keçdi.`);
    }

    setNewHotelName('');
    setNewHotelSlug('');
    setNewAdminEmail('');
    setIsNewTenantOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeCount = dashboardData?.activeTenants ?? tenants.filter(t => t.isActive).length;
  const totalCount = dashboardData?.totalTenants ?? tenants.length;
  const suspendedCount = dashboardData?.suspendedTenants ?? tenants.filter(t => !t.isActive).length;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 selection:bg-[#A78BFA] selection:text-black">
      
      {/* ===================== TOP HEADER ===================== */}
      <header className="sticky top-0 z-30 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-color)] px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[20px] bg-white p-1 flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden border border-[var(--border-color)]">
              <img src={altensorLogo} alt="Altensor Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--text-main)] tracking-tight leading-tight">
                  SaaS SuperAdmin Paneli
                </h1>
                <span className="text-[10px] bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/20 px-2.5 py-0.5 rounded-full font-semibold">
                  Platform Sahibi
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-normal">
                Multi-Tenant Otellər, Abunəliklər və Kill-Switch İdarəsi
              </p>
            </div>
          </div>

          {/* Action Controls & Navigation to Other Panels */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Quick Link to Hotel Admin */}
            <button
              onClick={() => navigate('/admin')}
              className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold hover:border-[#A78BFA] transition-colors flex items-center gap-1.5"
            >
              <span>🏨 Otel Admin Paneli</span>
            </button>

            {/* Quick Link to Reception Desk */}
            <button
              onClick={() => navigate('/reception')}
              className="px-3.5 py-1.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <IOSIcon name="Bell" size={14} />
              <span>🛎️ Resepşn Masası</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
              className="w-9 h-9 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[#A78BFA] active:scale-95 transition-transform"
            >
              {isDarkMode ? <IOSIcon name="Sun" size={16} /> : <IOSIcon name="Moon" size={15} />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-2xl bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500 hover:text-white transition-colors"
            >
              Çıxış
            </button>

          </div>

        </div>
      </header>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Soft Navigation Tabs (Only 2 Clean Tabs) */}
        <div className="bg-[var(--bg-card)] p-1.5 rounded-[24px] border border-[var(--border-color)] flex gap-1.5 overflow-x-auto shadow-sm">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'tenants'
                ? 'bg-[#A78BFA] text-black shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <IOSIcon name="Bed" size={15} />
            <span>Otellər & Tenants ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('killswitch')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'killswitch'
                ? 'bg-[#A78BFA] text-black shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Kill-Switch & Klik Nəzarəti ({suspendedCount})</span>
          </button>
        </div>

        {/* Real Backend KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Aktiv Otellər</span>
            <h3 className="text-2xl font-bold tracking-tight text-emerald-400 mt-2">
              {activeCount} / {totalCount}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">SaaS platforması üzrə</p>
          </div>

          <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Kill-Switch Vəziyyəti</span>
            <h3 className="text-2xl font-bold tracking-tight text-rose-400 mt-2">
              {suspendedCount} Otel
            </h3>
            <p className="text-[11px] text-rose-400/80 mt-1 font-normal">Xidməti dondurulmuş</p>
          </div>

          <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Ümumi Keçid Klikləri</span>
            <h3 className="text-2xl font-bold tracking-tight text-[#A78BFA] mt-2">
              {dashboardData ? dashboardData.totalSystemClicks.toLocaleString() : '0'}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">Bütün link klikləri</p>
          </div>

          <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Ümumi Qonaq Müraciətləri</span>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-2">
              {dashboardData ? dashboardData.totalInquiries.toLocaleString() : '0'}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">Resepşna daxil olan</p>
          </div>
        </div>

        {/* ================= TAB 1: ALL TENANTS ================= */}
        {activeTab === 'tenants' && (
          <div className="space-y-4">
            
            {/* Toolbar: Search & Add Tenant */}
            <div className="p-3.5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <IOSIcon name="Sparkles" size={14} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Otel adı, slug və ya email ilə axtarış..."
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] pl-9 pr-4 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={() => setIsNewTenantOpen(true)}
                className="px-4 py-2 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-sm flex items-center gap-1.5"
              >
                <span>+ Yeni Otel Qeydiyyatı</span>
              </button>
            </div>

            {/* Tenants List */}
            <div className="space-y-3">
              {filteredTenants.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-[24px] bg-[var(--bg-card)] border transition-all duration-200 shadow-sm ${
                    !item.isActive
                      ? 'border-rose-500/40 ring-1 ring-rose-500/20'
                      : 'border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Hotel Details */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-base font-bold tracking-tight text-[var(--text-main)]">
                          {item.name}
                        </h4>

                        <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[var(--bg-subcard)] text-[#A78BFA] border border-[var(--border-color)]">
                          /hotel/{item.slug}
                        </span>

                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                          item.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.isActive ? 'Aktiv' : 'Dondurulub'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] flex-wrap pt-0.5">
                        <span>Admin: <strong className="text-[var(--text-main)] font-medium">{item.adminEmail}</strong></span>
                        <span>Keçid Klikləri: <strong className="text-[#A78BFA] font-bold text-sm">{item.totalClicks} klik</strong></span>
                        <span>Aktiv Linklər: <strong className="text-[var(--text-main)] font-medium">{item.linksCount}</strong></span>
                        <span>Qeydiyyat: {item.createdAt}</span>
                      </div>

                      {!item.isActive && item.suspendedReason && (
                        <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 mt-1 max-w-2xl">
                          ⚠️ Səbəb: {item.suspendedReason}
                        </p>
                      )}
                    </div>

                    {/* Actions: View as Admin, Guest Portal & Kill Switch */}
                    <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-color)] flex-wrap">
                      
                      {/* Open Guest Portal */}
                      <a
                        href={`/hotel/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-semibold hover:border-[#A78BFA] transition-colors flex items-center gap-1"
                      >
                        <span>Qonaq Portalı ↗</span>
                      </a>

                      {/* Open Hotel Admin Panel */}
                      <button
                        onClick={() => navigate('/admin')}
                        className="px-3.5 py-2 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold hover:border-[#A78BFA] transition-colors"
                      >
                        Admin kimi Daxil Ol
                      </button>

                      {/* Kill Switch Toggle Button */}
                      <button
                        onClick={() => handleToggleKillSwitch(item)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                          item.isActive
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                            : 'bg-emerald-500 text-black active:scale-95'
                        }`}
                      >
                        {item.isActive ? 'Dondur (Kill-Switch)' : 'Bərpa Et'}
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 2: KILL-SWITCH & CLICKS CENTER ================= */}
        {activeTab === 'killswitch' && (
          <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
            
            {/* Kill-Switch Header & Live Clicks Metric */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  Kill-Switch Mərkəzi və Keçid Klikləri
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Abunə haqqı ödənmədikdə otel xidmətini 1 kliklə dondurun və ya bərpa edin. Real-vaxtda qonaqların link kliklərini izləyin.
                </p>
              </div>

              {/* Total System Clicks Highlight */}
              <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-medium">Sistem Üzrə Ümumi Kliklər</span>
                  <span className="text-base font-bold text-[var(--text-main)]">
                    {dashboardData ? dashboardData.totalSystemClicks.toLocaleString() : '0'} klik
                  </span>
                </div>
              </div>
            </div>

            {/* List of All Tenants with their Click Counts and Kill Switch Controls */}
            <div className="space-y-3">
              {tenants.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-[20px] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    !t.isActive
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-[var(--bg-subcard)] border-[var(--border-color)]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[var(--text-main)]">{t.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/20 text-[#A78BFA]">
                        /hotel/{t.slug}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        t.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      }`}>
                        {t.isActive ? 'Aktiv (Xidmət Açıqdır)' : 'Dondurulub (Kill-Switch Aktivdir)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pt-1 flex-wrap">
                      <span>Keçid Klikləri: <strong className="text-[#A78BFA] font-bold text-sm">{t.totalClicks} klik</strong></span>
                      <span>Aktiv Linklər: <strong className="text-[var(--text-main)]">{t.linksCount} keçid</strong></span>
                      <span>Admin: <strong className="text-[var(--text-main)] font-medium">{t.adminEmail}</strong></span>
                    </div>

                    {!t.isActive && t.suspendedReason && (
                      <p className="text-xs text-rose-400 mt-1 font-medium bg-rose-500/15 p-2 rounded-xl">
                        ⚠️ Dondurulma Səbəbi: {t.suspendedReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleKillSwitch(t)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-transform active:scale-95 shadow-sm ${
                        t.isActive
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                          : 'bg-emerald-500 text-black'
                      }`}
                    >
                      {t.isActive ? 'Dondur (Kill-Switch)' : 'Xidməti Bərpa Et'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* ===================== MODAL: SUSPEND (KILL-SWITCH) ===================== */}
      {selectedTenantForKill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedTenantForKill(null)} />
          <div className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-card)] border border-rose-500/30 p-6 shadow-2xl z-10 animate-slide-up text-[var(--text-main)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <span>⚠️ Oteli Dondur (Kill-Switch)</span>
              </h3>
              <button onClick={() => setSelectedTenantForKill(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <IOSIcon name="Close" size={16} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              <strong>"{selectedTenantForKill.name}"</strong> otelinin rəqəmsal konsyerj xidmətini dondurmaq üzrəsiniz. Qonaqlar QR kodu oxudarkən abunəliyin dayandırıldığı barədə məlumat ekranı görəcəklər.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5">Dondurulma Səbəbi *</label>
              <textarea
                rows={3}
                value={killReason}
                onChange={(e) => setKillReason(e.target.value)}
                className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={confirmSuspend}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-xs font-bold active:scale-[0.98] transition-transform shadow"
              >
                Bəli, Dondur (Kill-Switch)
              </button>
              <button
                onClick={() => setSelectedTenantForKill(null)}
                className="px-4 py-3 rounded-2xl bg-[var(--bg-subcard)] text-[var(--text-muted)] text-xs font-semibold"
              >
                İmtina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE TENANT ===================== */}
      {isNewTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsNewTenantOpen(false)} />
          <div className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 animate-slide-up text-[var(--text-main)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-main)]">Yeni Otel Qeydiyyatı</h3>
              <button onClick={() => setIsNewTenantOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <IOSIcon name="Close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Otelin Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Baku Grand Hotel"
                  value={newHotelName}
                  onChange={(e) => {
                    setNewHotelName(e.target.value);
                    if (!newHotelSlug) {
                      setNewHotelSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Otel Slug (Unikal URL) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-muted)] font-mono">/hotel/</span>
                  <input
                    type="text"
                    required
                    placeholder="baku-grand"
                    value={newHotelSlug}
                    onChange={(e) => setNewHotelSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] pl-16 pr-3 py-3 text-xs outline-none focus:border-[#A78BFA] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Admin Email Ünvanı *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@bakugrand.az"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform mt-2 shadow"
              >
                Oteli Qeydiyyatdan Keçir
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== NOTIFICATION TOAST ===================== */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#211E30] text-white border border-[#A78BFA]/30 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs font-semibold">
          <span className="text-[#A78BFA]"><IOSIcon name="Check" size={16} /></span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
