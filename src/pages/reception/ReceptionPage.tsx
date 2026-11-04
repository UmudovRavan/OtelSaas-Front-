import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IOSIcon } from '../../components/common/IOSIcon';
import { receptionService, InquiryItem } from '../../services/api/receptionService';
import { publicService } from '../../services/api/publicService';

export interface ReceptionInquiry {
  id: string;
  roomNumber: string;
  fullName: string;
  phoneNumber: string;
  categoryTag?: string;
  message: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export const ReceptionPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTenantId = searchParams.get('tenantId');
  const activeSlug = searchParams.get('slug') || user?.tenantSlug || 'hotel-resort';
  const activeHotelName = user?.tenantName || (searchParams.get('slug') ? searchParams.get('slug') : 'Hotel & Resort Baku');

  // Settings & Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'completed'>('all');

  // Manual New Inquiry Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [newRoom, setNewRoom] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const [inquiries, setInquiries] = useState<ReceptionInquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInquiries = useCallback(async () => {
    try {
      const data = await receptionService.getInquiries(queryTenantId);
      if (data && Array.isArray(data)) {
        const mapped: ReceptionInquiry[] = data.map((d: InquiryItem) => {
          let st: ReceptionInquiry['status'] = 'new';
          if (d.status === 2) st = 'completed';
          if (d.status === 3) st = 'cancelled';
          return {
            id: d.id,
            roomNumber: d.roomNumber || '—',
            fullName: d.fullName || 'Qonaq',
            phoneNumber: d.phoneNumber || '',
            categoryTag: 'Otaq Xidməti',
            message: d.message || '',
            status: st,
            createdAt: d.createdAtUtc
              ? new Date(d.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'İndi',
          };
        });
        setInquiries(mapped);
      }
    } catch (err) {
      console.warn('Real API get inquiries error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [queryTenantId]);

  useEffect(() => {
    fetchInquiries();
    const interval = setInterval(fetchInquiries, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [fetchInquiries]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter(i => i.status === 'new').length;
    const inProgressCount = inquiries.filter(i => i.status === 'in_progress').length;
    const completedCount = inquiries.filter(i => i.status === 'completed').length;
    return { total, newCount, inProgressCount, completedCount };
  }, [inquiries]);

  // Filtered inquiries
  const filteredList = useMemo(() => {
    return inquiries.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchRoom = item.roomNumber.toLowerCase().includes(query);
        const matchName = item.fullName.toLowerCase().includes(query);
        const matchPhone = item.phoneNumber.includes(query);
        const matchMsg = item.message.toLowerCase().includes(query);
        return matchRoom || matchName || matchPhone || matchMsg;
      }
      return true;
    });
  }, [inquiries, statusFilter, searchQuery]);

  // Status Change Handler
  const updateStatus = async (id: string, newStatus: ReceptionInquiry['status']) => {
    setInquiries(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    }));

    try {
      const backendStatus = newStatus === 'completed' ? 2 : (newStatus === 'cancelled' ? 3 : 1);
      await receptionService.updateInquiryStatus(id, backendStatus as any, queryTenantId);
    } catch (e) {
      console.warn('Failed to update status on backend', e);
    }

    if (newStatus === 'completed') {
      showToast('Müraciət tamamlandı kimi qeyd edildi.');
    } else if (newStatus === 'in_progress') {
      showToast('Müraciət icraya götürüldü.');
    } else if (newStatus === 'cancelled') {
      showToast('Müraciət ləğv edildi.');
    } else {
      showToast('Müraciət yenidən aktiv edildi.');
    }
  };

  // Add Manual Inquiry
  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim() || !newPhone.trim()) return;

    try {
      await publicService.submitInquiry(activeSlug, {
        fullName: newName.trim() || 'Otel Qonağı',
        phoneNumber: newPhone.trim(),
        roomNumber: newRoom.trim(),
        message: newMessage.trim() || 'Resepşna daxili müraciət qəbul edildi.',
      });
      await fetchInquiries();
      showToast('Yeni qonaq müraciəti qeydə alındı.');
    } catch (err) {
      console.warn('Failed to submit manual inquiry', err);
      // Local fallback
      const newItem: ReceptionInquiry = {
        id: `inq-${Date.now().toString().slice(-4)}`,
        roomNumber: newRoom.trim(),
        fullName: newName.trim() || 'Otel Qonağı',
        phoneNumber: newPhone.trim(),
        categoryTag: 'Daxili Zəng / Əl ilə',
        message: newMessage.trim() || 'Resepşna daxili zəng vasitəsilə müraciət qəbul edildi.',
        status: 'new',
        createdAt: 'İndi',
      };
      setInquiries(prev => [newItem, ...prev]);
      showToast('Yeni qonaq müraciəti əlavə edildi.');
    }

    setNewRoom('');
    setNewName('');
    setNewPhone('');
    setNewMessage('');
    setIsNewModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 selection:bg-[#A78BFA] selection:text-black">
      
      {/* ===================== TOP HEADER ===================== */}
      <header className="sticky top-0 z-30 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-color)] px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          
          {/* Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[20px] bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center shadow-sm flex-shrink-0">
              <IOSIcon name="Bell" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--text-main)] tracking-tight leading-tight">
                  Resepşn Masası
                </h1>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Real-Vaxt
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]/80 font-normal">
                {activeHotelName} (/hotel/{activeSlug}) • Canlı Qonaq Müraciətləri
              </p>
            </div>
          </div>

          {/* Controls & Navigation */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Səsli Siqnal Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Səsli siqnal aktivdir" : "Səsli siqnal deaktivdir"}
              className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                soundEnabled
                  ? 'bg-[var(--bg-card)] border-[#A78BFA]/40 text-[#A78BFA]'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              <span>{soundEnabled ? '🔔 Səs Aktiv' : '🔕 Səssiz'}</span>
            </button>

            {/* Back link for HotelAdmin */}
            {(user?.role === 'HotelAdmin' || queryTenantId) && (
              <button
                onClick={() => navigate(queryTenantId ? `/admin?tenantId=${queryTenantId}&slug=${activeSlug}` : '/admin')}
                className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold hover:border-[#A78BFA] transition-colors"
              >
                ← Admin Panelinə Qayıt
              </button>
            )}

            {/* Back link for SuperAdmin */}
            {user?.role === 'SuperAdmin' && (
              <button
                onClick={() => navigate('/super-admin')}
                className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold hover:border-[#A78BFA] transition-colors"
              >
                ← SuperAdmin-ə Qayıt
              </button>
            )}

            {/* New Inquiry Button */}
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-1.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-sm"
            >
              + Yeni Müraciət
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
              className="w-9 h-9 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[#A78BFA] active:scale-95 transition-transform"
            >
              {isDarkMode ? <IOSIcon name="Sun" size={16} /> : <IOSIcon name="Moon" size={15} />}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-2xl bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500 hover:text-white transition-colors"
            >
              Çıxış
            </button>

          </div>

        </div>
      </header>

      {/* ===================== MAIN DASHBOARD BODY ===================== */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* ================= 4 KPI STATS COUNTERS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Yeni / Cavab Gözləyən */}
          <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Yeni (Gözləyən)</span>
              {stats.newCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-rose-400 mt-2">
              {stats.newCount}
            </h3>
            <p className="text-[11px] text-rose-400/80 mt-1 font-normal">Təcili reaksiya tələb edir</p>
          </div>

          {/* İcrada olanlar */}
          <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">İcrada Olanlar</span>
              <span className="text-amber-400"><IOSIcon name="Clock" size={16} /></span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-amber-400 mt-2">
              {stats.inProgressCount}
            </h3>
            <p className="text-[11px] text-amber-400/80 mt-1 font-normal">Personal yönləndirilib</p>
          </div>

          {/* Tamamlananlar */}
          <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Həll Olundu</span>
              <span className="text-emerald-400"><IOSIcon name="Check" size={16} /></span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-emerald-400 mt-2">
              {stats.completedCount}
            </h3>
            <p className="text-[11px] text-emerald-400/80 mt-1 font-normal">Uğurla yekunlaşıb</p>
          </div>

          {/* Cəmi Müraciət */}
          <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Cəmi Müraciət</span>
              <span className="text-[#A78BFA]"><IOSIcon name="Bell" size={16} /></span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-2">
              {stats.total}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">Bugün qeydə alınanlar</p>
          </div>
        </div>

        {/* ================= SEARCH & STATUS FILTER TOOLBAR ================= */}
        <div className="p-3.5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[var(--bg-subcard)] p-1 rounded-2xl border border-[var(--border-color)] overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#A78BFA] text-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Bütün Müraciətlər ({stats.total})
            </button>

            <button
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'new'
                  ? 'bg-[#A78BFA] text-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Yalnız Yenilər ({stats.newCount})
            </button>

            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'in_progress'
                  ? 'bg-[#A78BFA] text-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              İcrada Olanlar ({stats.inProgressCount})
            </button>

            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'completed'
                  ? 'bg-[#A78BFA] text-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Həll Olunanlar ({stats.completedCount})
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <IOSIcon name="Sparkles" size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Otaq nömrəsi, qonaq adı və ya telefon ilə axtarış (Məs: 304)..."
              className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] pl-9 pr-4 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <IOSIcon name="Close" size={14} />
              </button>
            )}
          </div>

        </div>

        {/* ================= INQUIRIES LIST ================= */}
        <div className="space-y-3.5">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)]">
              <div className="w-12 h-12 rounded-[20px] bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center mx-auto mb-3">
                <IOSIcon name="Bell" size={24} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Heç bir müraciət tapılmadı</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Seçilmiş filtr və ya axtarış sorğusuna uyğun qonaq sorğusu mövcud deyil.
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className={`p-4 md:p-5 rounded-[24px] bg-[var(--bg-card)] border transition-all duration-200 shadow-sm ${
                  item.status === 'new'
                    ? 'border-rose-500/40 ring-1 ring-rose-500/20'
                    : 'border-[var(--border-color)]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left details */}
                  <div className="flex items-start gap-4">
                    {/* Soft iOS Room Badge */}
                    <div className="w-14 h-14 rounded-[20px] bg-[#A78BFA]/15 text-[#A78BFA] flex flex-col items-center justify-center border border-[#A78BFA]/25 flex-shrink-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Otaq</span>
                      <span className="text-lg font-bold text-[#A78BFA] leading-none mt-0.5">
                        {item.roomNumber}
                      </span>
                    </div>

                    {/* Guest Info & Message */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm font-bold tracking-tight text-[var(--text-main)]">
                          {item.fullName}
                        </h4>
                        
                        {item.categoryTag && (
                          <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/20">
                            {item.categoryTag}
                          </span>
                        )}

                        <span className="text-[11px] text-[var(--text-muted)]/70 flex items-center gap-1">
                          <IOSIcon name="Clock" size={11} />
                          {item.createdAt}
                        </span>
                      </div>

                      {/* Guest Message Box (Soft styling matching Guest Portal) */}
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-subcard)] p-3 rounded-2xl border border-[var(--border-color)] max-w-3xl font-normal">
                        "{item.message}"
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]/80 pt-0.5">
                        <span className="font-mono text-[11px] font-normal">{item.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: WhatsApp & Status Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-color)]">
                    
                    {/* WhatsApp Communication Button */}
                    <a
                      href={`https://wa.me/${item.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Salam ${item.fullName}, Hotel & Resort Baku Resepşn Masasından yazırıq. Otaq ${item.roomNumber} üzrə müraciətiniz qəbul edildi.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500 hover:text-black transition-colors"
                    >
                      <IOSIcon name="Whatsapp" size={15} />
                      <span>WhatsApp ilə Cavabla</span>
                    </a>

                    {/* Status Flow Buttons */}
                    <div className="flex items-center gap-2">
                      {item.status === 'new' && (
                        <button
                          onClick={() => updateStatus(item.id, 'in_progress')}
                          className="px-3.5 py-1.5 rounded-2xl bg-amber-500 text-black text-xs font-semibold active:scale-95 transition-transform shadow-sm"
                        >
                          İcraya Götür
                        </button>
                      )}

                      {item.status === 'in_progress' && (
                        <button
                          onClick={() => updateStatus(item.id, 'completed')}
                          className="px-3.5 py-1.5 rounded-2xl bg-emerald-500 text-black text-xs font-semibold active:scale-95 transition-transform shadow-sm"
                        >
                          ✓ Tamamlandı
                        </button>
                      )}

                      {item.status === 'completed' && (
                        <span className="px-3 py-1 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                          ✓ Həll Olundu
                        </span>
                      )}

                      {item.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(item.id, 'cancelled')}
                          className="px-2.5 py-1.5 rounded-2xl bg-[var(--bg-subcard)] text-[var(--text-muted)]/70 hover:text-rose-400 text-xs font-medium"
                        >
                          Ləğv et
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {/* ===================== MANUAL INQUIRY MODAL ===================== */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsNewModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 animate-slide-up text-[var(--text-main)]">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold tracking-tight text-[var(--text-main)]">
                Yeni Qonaq Müraciəti Əlavə Et
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-muted)]"
              >
                <IOSIcon name="Close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Otaq № *</label>
                  <input
                    type="text"
                    required
                    placeholder="304"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)]/40 focus:border-[#A78BFA] outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Qonağın Adı</label>
                  <input
                    type="text"
                    placeholder="Məs: Əli Məmmədov"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)]/40 focus:border-[#A78BFA] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Telefon / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+994 50 123 45 67"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)]/40 focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Müraciət Mətni / Tələb</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Qonağın istəyini qeyd edin..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)]/40 focus:border-[#A78BFA] outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform shadow-md mt-2"
              >
                Müraciəti Saxla və İcraya Yönləndir
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
