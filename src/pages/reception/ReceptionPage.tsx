import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IOSIcon } from '../../components/common/IOSIcon';
import { receptionService } from '../../services/api/receptionService';
import { publicService } from '../../services/api/publicService';
import {
  InquiryDto,
  InquiryStatus,
  GuestOrderDto,
  OrderStatus,
  GuestReviewDto,
  OrderType,
} from '../../types/api';

type ReceptionTab = 'inquiries' | 'orders' | 'reviews';

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // audio policy
  }
}

export const ReceptionPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTenantId = searchParams.get('tenantId');
  const activeSlug = searchParams.get('slug') || user?.tenantSlug || 'skyhill';
  const activeHotelName = user?.tenantName || (searchParams.get('slug') ? searchParams.get('slug') : 'Sky Hill Pirqulu');

  // Active Tab
  const [activeTab, setActiveTab] = useState<ReceptionTab>('inquiries');

  // Settings & Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'completed'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'active' | 'completed'>('all');

  // Data State
  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [orders, setOrders] = useState<GuestOrderDto[]>([]);
  const [reviews, setReviews] = useState<GuestReviewDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Manual New Inquiry Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [newRoom, setNewRoom] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prevCountsRef = useRef<{ inq: number; ord: number }>({ inq: 0, ord: 0 });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ================= DATA FETCHING =================
  const fetchAllData = useCallback(async () => {
    try {
      const [inqData, ordData, revData] = await Promise.all([
        receptionService.getInquiries(undefined, queryTenantId).catch(() => []),
        receptionService.getOrders(undefined, queryTenantId).catch(() => []),
        receptionService.getReviews(undefined, queryTenantId).catch(() => []),
      ]);

      // Sound chime trigger on incoming new orders or inquiries
      const newInqCount = inqData.filter((i) => i.status === InquiryStatus.New).length;
      const newOrdCount = ordData.filter((o) => o.status === OrderStatus.New).length;

      if (
        (newInqCount > prevCountsRef.current.inq || newOrdCount > prevCountsRef.current.ord) &&
        prevCountsRef.current.inq !== 0 &&
        soundEnabled
      ) {
        playNotificationChime();
      }

      prevCountsRef.current = { inq: newInqCount, ord: newOrdCount };

      setInquiries(inqData);
      setOrders(ordData);
      setReviews(revData);
    } catch (err) {
      console.warn('Real API data fetch warning in Reception:', err);
    } finally {
      setIsLoading(false);
    }
  }, [queryTenantId, soundEnabled]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 7000); // 7s auto-refresh
    return () => clearInterval(interval);
  }, [fetchAllData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // ================= STATUS HANDLERS =================
  const handleUpdateInquiryStatus = async (id: string, newStatus: InquiryStatus) => {
    try {
      await receptionService.updateInquiryStatus(id, newStatus, queryTenantId);
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
      showToast('Müraciət statusu yeniləndi.');
    } catch (e) {
      console.warn('Failed to update inquiry status', e);
      showToast('Status dəyişdirilərkən xəta baş verdi.');
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      await receptionService.updateOrderStatus(id, newStatus, queryTenantId);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      showToast('Sifariş statusu yeniləndi.');
    } catch (e) {
      console.warn('Failed to update order status', e);
      showToast('Status dəyişdirilərkən xəta baş verdi.');
    }
  };

  const handleToggleReviewResolved = async (id: string) => {
    try {
      await receptionService.toggleReviewResolved(id, queryTenantId);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isResolved: !r.isResolved } : r))
      );
      showToast('Rəy statusu yeniləndi.');
    } catch (e) {
      console.warn('Failed to toggle review resolved', e);
      showToast('Xəta baş verdi.');
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
      await fetchAllData();
      showToast('Yeni qonaq müraciəti qeydə alındı.');
    } catch (err) {
      console.warn('Failed to submit manual inquiry', err);
      showToast('Xəta baş verdi.');
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

  // ================= BADGES & METRICS =================
  const newInquiriesCount = useMemo(
    () => inquiries.filter((i) => i.status === InquiryStatus.New).length,
    [inquiries]
  );
  const newOrdersCount = useMemo(
    () => orders.filter((o) => o.status === OrderStatus.New).length,
    [orders]
  );
  const pendingReviewsCount = useMemo(
    () => reviews.filter((r) => !r.isResolved).length,
    [reviews]
  );

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      if (inquiryStatusFilter === 'new' && i.status !== InquiryStatus.New) return false;
      if (inquiryStatusFilter === 'in_progress' && i.status !== InquiryStatus.InProgress) return false;
      if (inquiryStatusFilter === 'completed' && i.status !== InquiryStatus.Resolved && i.status !== InquiryStatus.Archived) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mRoom = (i.roomNumber || '').toLowerCase().includes(q);
        const mName = (i.fullName || '').toLowerCase().includes(q);
        const mPhone = (i.phoneNumber || '').includes(q);
        const mMsg = (i.message || '').toLowerCase().includes(q);
        return mRoom || mName || mPhone || mMsg;
      }
      return true;
    });
  }, [inquiries, inquiryStatusFilter, searchQuery]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter === 'new' && o.status !== OrderStatus.New) return false;
      if (orderStatusFilter === 'active' && o.status !== OrderStatus.Accepted && o.status !== OrderStatus.Preparing) return false;
      if (orderStatusFilter === 'completed' && o.status !== OrderStatus.Completed && o.status !== OrderStatus.Cancelled) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mOrder = (o.orderNumber || '').toLowerCase().includes(q);
        const mRoom = (o.roomOrTableNumber || '').toLowerCase().includes(q);
        const mName = (o.guestName || '').toLowerCase().includes(q);
        const mPhone = (o.phoneNumber || '').includes(q);
        return mOrder || mRoom || mName || mPhone;
      }
      return true;
    });
  }, [orders, orderStatusFilter, searchQuery]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mRoom = (r.roomNumber || '').toLowerCase().includes(q);
        const mName = (r.guestName || '').toLowerCase().includes(q);
        const mComment = (r.comment || '').toLowerCase().includes(q);
        return mRoom || mName || mComment;
      }
      return true;
    });
  }, [reviews, searchQuery]);

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
              <p className="text-xs text-[var(--text-muted)] font-normal">
                {activeHotelName} • Canlı Qonaq Xidməti
              </p>
            </div>
          </div>

          {/* Controls & Navigation */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Səsli Siqnal Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Səsli siqnal aktivdir' : 'Səsli siqnal deaktivdir'}
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

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
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
        
        {/* ================= 3 TABS SELECTOR ================= */}
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3 overflow-x-auto">
          {/* Tab 1: Müraciətlər */}
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'inquiries'
                ? 'bg-[#A78BFA] text-black shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <span>🛎️ Qonaq Müraciətləri</span>
            {newInquiriesCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'inquiries' ? 'bg-black text-[#A78BFA]' : 'bg-rose-500 text-white animate-pulse'
              }`}>
                {newInquiriesCount}
              </span>
            )}
          </button>

          {/* Tab 2: Səbət Sifarişləri */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-[#A78BFA] text-black shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <span>🛒 Səbət Sifarişləri</span>
            {newOrdersCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'orders' ? 'bg-black text-[#A78BFA]' : 'bg-rose-500 text-white animate-pulse'
              }`}>
                {newOrdersCount}
              </span>
            )}
          </button>

          {/* Tab 3: Qonaq Rəyləri */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'reviews'
                ? 'bg-[#A78BFA] text-black shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <span>⭐ Qonaq Rəyləri</span>
            {pendingReviewsCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'reviews' ? 'bg-black text-[#A78BFA]' : 'bg-amber-500 text-black'
              }`}>
                {pendingReviewsCount}
              </span>
            )}
          </button>
        </div>

        {/* ================= SEARCH & STATUS FILTERS ================= */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Otaq, ad, telefon və ya nömrə ilə axtarış..."
              className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#A78BFA]"
            />
            <span className="absolute left-3.5 top-3 text-[var(--text-muted)]">
              <IOSIcon name="Search" size={14} />
            </span>
          </div>

          {/* Tab-Specific Status Filter */}
          {activeTab === 'inquiries' && (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] self-start sm:self-auto">
              {(['all', 'new', 'in_progress', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setInquiryStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    inquiryStatusFilter === st
                      ? 'bg-[#A78BFA] text-black'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {st === 'all'
                    ? 'Hamısı'
                    : st === 'new'
                    ? 'Yeni'
                    : st === 'in_progress'
                    ? 'İcrada'
                    : 'Həll olunub'}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] self-start sm:self-auto">
              {(['all', 'new', 'active', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-[#A78BFA] text-black'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {st === 'all'
                    ? 'Hamısı'
                    : st === 'new'
                    ? 'Yeni'
                    : st === 'active'
                    ? 'Hazırlanır'
                    : 'Tamamlanan'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= TAB 1: INQUIRIES LIST ================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-3">
            {filteredInquiries.length === 0 ? (
              <div className="py-16 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]">
                Heç bir qonaq müraciəti tapılmadı.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredInquiries.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-3xl bg-[var(--bg-card)] border transition-all shadow-sm space-y-3 ${
                      item.status === InquiryStatus.New
                        ? 'border-rose-500/40 ring-1 ring-rose-500/20'
                        : item.status === InquiryStatus.InProgress
                        ? 'border-amber-500/40'
                        : 'border-[var(--border-color)] opacity-85'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] font-mono font-bold text-xs text-[var(--text-main)]">
                          Otaq {item.roomNumber || '—'}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--text-main)] truncate max-w-[120px]">
                          {item.fullName}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === InquiryStatus.New
                            ? 'bg-rose-500/15 text-rose-400'
                            : item.status === InquiryStatus.InProgress
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {item.status === InquiryStatus.New
                          ? 'Yeni'
                          : item.status === InquiryStatus.InProgress
                          ? 'İcrada'
                          : 'Həll olunub'}
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-[var(--text-main)] leading-relaxed bg-[var(--bg-subcard)]/60 p-3 rounded-2xl border border-[var(--border-color)]/60">
                      {item.message}
                    </p>

                    {/* Time & Phone */}
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>{new Date(item.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <a
                        href={`tel:${item.phoneNumber}`}
                        className="text-[#A78BFA] hover:underline font-mono"
                      >
                        {item.phoneNumber}
                      </a>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-1 flex items-center gap-1.5">
                      {item.status === InquiryStatus.New && (
                        <button
                          onClick={() => handleUpdateInquiryStatus(item.id, InquiryStatus.InProgress)}
                          className="flex-1 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/25 transition-colors"
                        >
                          İcraya Götür
                        </button>
                      )}
                      {item.status !== InquiryStatus.Resolved && (
                        <button
                          onClick={() => handleUpdateInquiryStatus(item.id, InquiryStatus.Resolved)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-500/25 transition-colors"
                        >
                          Tamamlandı
                        </button>
                      )}
                      {item.status === InquiryStatus.Resolved && (
                        <button
                          onClick={() => handleUpdateInquiryStatus(item.id, InquiryStatus.New)}
                          className="flex-1 py-1.5 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[var(--text-muted)] text-xs hover:text-[var(--text-main)]"
                        >
                          Yenidən Aç
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: ORDERS LIST ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]">
                Heç bir səbət sifarişi tapılmadı.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-3xl bg-[var(--bg-card)] border transition-all shadow-sm space-y-3 ${
                      order.status === OrderStatus.New
                        ? 'border-rose-500/40 ring-1 ring-rose-500/20'
                        : order.status === OrderStatus.Accepted || order.status === OrderStatus.Preparing
                        ? 'border-amber-500/40'
                        : 'border-[var(--border-color)] opacity-85'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#A78BFA]">
                          #{order.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-main)]">
                          {order.orderType === OrderType.RestaurantTable ? '🍽️ Masa' : '🛎️ Otaq'}{' '}
                          {order.roomOrTableNumber}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === OrderStatus.New
                            ? 'bg-rose-500/15 text-rose-400'
                            : order.status === OrderStatus.Accepted
                            ? 'bg-blue-500/15 text-blue-400'
                            : order.status === OrderStatus.Preparing
                            ? 'bg-amber-500/15 text-amber-400'
                            : order.status === OrderStatus.Completed
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-zinc-500/15 text-zinc-400'
                        }`}
                      >
                        {order.status === OrderStatus.New
                          ? 'Yeni Sifariş'
                          : order.status === OrderStatus.Accepted
                          ? 'Qəbul Edildi'
                          : order.status === OrderStatus.Preparing
                          ? 'Hazırlanır'
                          : order.status === OrderStatus.Completed
                          ? 'Tamamlandı'
                          : 'Ləğv Edildi'}
                      </span>
                    </div>

                    {/* Guest info */}
                    {(order.guestName || order.phoneNumber) && (
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                        <span>{order.guestName || 'Otel Qonağı'}</span>
                        {order.phoneNumber && (
                          <a
                            href={`tel:${order.phoneNumber}`}
                            className="text-[#A78BFA] hover:underline font-mono"
                          >
                            {order.phoneNumber}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Ordered Items List */}
                    <div className="space-y-1 bg-[var(--bg-subcard)]/70 p-3 rounded-2xl border border-[var(--border-color)]/70 text-xs">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-[var(--text-main)]">
                          <span className="truncate pr-2">
                            {item.quantity}x {item.itemTitle}
                          </span>
                          <span className="tabular-nums font-semibold flex-shrink-0 text-[var(--text-muted)]">
                            {item.lineTotal.toFixed(2)} ₼
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Notes if any */}
                    {order.notes && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                        💬 Qeyd: {order.notes}
                      </div>
                    )}

                    {/* Total Amount & Time */}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)] text-xs">
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {new Date(order.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase block">Cəmi</span>
                        <span className="font-bold text-sm text-[var(--text-main)] tabular-nums">
                          {order.totalAmount.toFixed(2)} ₼
                        </span>
                      </div>
                    </div>

                    {/* Order Status Action Buttons */}
                    <div className="pt-1 flex items-center gap-1.5">
                      {order.status === OrderStatus.New && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.Accepted)}
                            className="flex-1 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-xs hover:bg-blue-500/30 transition-colors"
                          >
                            Qəbul Et
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.Cancelled)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/25 transition-colors"
                          >
                            Ləğv
                          </button>
                        </>
                      )}

                      {order.status === OrderStatus.Accepted && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.Preparing)}
                          className="flex-1 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-colors"
                        >
                          Hazırlanır
                        </button>
                      )}

                      {order.status === OrderStatus.Preparing && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.Completed)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-500/30 transition-colors"
                        >
                          Çatdırıldı / Tamamla
                        </button>
                      )}

                      {order.status === OrderStatus.Completed && (
                        <span className="w-full text-center py-1 text-emerald-400 font-bold text-xs">
                          ✓ Sifariş təhvil verildi
                        </span>
                      )}

                      {order.status === OrderStatus.Cancelled && (
                        <span className="w-full text-center py-1 text-zinc-400 text-xs">
                          Ləğv edilib
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: REVIEWS LIST ================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="py-16 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]">
                Heç bir qonaq rəyi tapılmadı.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-4 rounded-3xl bg-[var(--bg-card)] border transition-all shadow-sm space-y-3 ${
                      !rev.isResolved ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-[var(--border-color)] opacity-85'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                        {'★'.repeat(rev.rating)}
                        <span className="text-[var(--text-muted)] text-xs font-mono ml-1">
                          ({rev.rating}/5)
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rev.isResolved ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {rev.isResolved ? 'Baxılıb' : 'Yeni Rəy'}
                      </span>
                    </div>

                    {/* Room & Guest */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-main)] font-semibold">
                      <span>{rev.guestName || 'Anonim Qonaq'}</span>
                      {rev.roomNumber && (
                        <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[10px] font-mono">
                          Otaq {rev.roomNumber}
                        </span>
                      )}
                    </div>

                    {/* Comment Body */}
                    <p className="text-xs text-[var(--text-main)] leading-relaxed bg-[var(--bg-subcard)]/60 p-3 rounded-2xl border border-[var(--border-color)]/60 italic">
                      "{rev.comment || 'Şərh yazılmayıb, yalnız ulduz qiymətləndirilməsi.'}"
                    </p>

                    {/* Footer & Toggle Action */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--text-muted)]">
                      <span>{new Date(rev.createdAtUtc).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleToggleReviewResolved(rev.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                          rev.isResolved
                            ? 'bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                      >
                        {rev.isResolved ? 'Yenidən Aç' : '✓ Baxıldı kimi İşarələ'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===================== MANUAL NEW INQUIRY MODAL ===================== */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--text-main)]">Yeni Müraciət Əlavə Et</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Otaq Nömrəsi *
                </label>
                <input
                  type="text"
                  required
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="Məs: 304"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Qonağın Adı
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Məs: Rəvan Əliyev"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Telefon Nömrəsi *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+994 50 ..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Müraciətin Mətni
                </label>
                <textarea
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Qonağın istəyini qeyd edin..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#A78BFA] resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)]"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-black/90 text-white text-xs font-semibold shadow-2xl border border-white/20 animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
