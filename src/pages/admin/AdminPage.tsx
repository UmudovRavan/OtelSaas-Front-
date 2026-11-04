import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IOSIcon } from '../../components/common/IOSIcon';
import altensorLogo from '../../assets/images/altensor-logo.png';
import { hotelAdminService } from '../../services/api/hotelAdminService';
import { publicService } from '../../services/api/publicService';

interface CategoryItem {
  id: string;
  titleAz: string;
  titleEn: string;
  layoutType: 'list' | 'icons';
  linksCount: number;
}

interface LinkItem {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  iconName: string;
  badge?: string;
  targetUrl: string;
  isActive: boolean;
}

interface ActivityItem {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  category: string;
  isActive: boolean;
}

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Settings & Theme
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'menu' | 'activities' | 'qr'>('overview');

  // Hotel Profile State
  const [hotelName, setHotelName] = useState('Hotel & Resort Baku');
  const [hotelBio, setHotelBio] = useState('Lüks istirahət və 5 ulduzlu otel xidmətləri.');
  const [hotelPhone, setHotelPhone] = useState('+994 12 599 00 00');
  const [hotelWhatsapp, setHotelWhatsapp] = useState('994501234567');
  const [wifiSsid, setWifiSsid] = useState('HotelResort_Guest');
  const [wifiPass, setWifiPass] = useState('BakuResort2026');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80');
  const [logoImage, setLogoImage] = useState('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80');

  // Toast
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

  useEffect(() => {
    hotelAdminService.getProfile()
      .then(prof => {
        if (prof) {
          if (prof.name) setHotelName(prof.name);
          if (prof.bio) setHotelBio(prof.bio);
          if (prof.phone) setHotelPhone(prof.phone);
          if (prof.whatsApp) setHotelWhatsapp(prof.whatsApp);
          if (prof.logoUrl) setLogoImage(prof.logoUrl);
          if (prof.coverImageUrl) setCoverImage(prof.coverImageUrl);
        }
      })
      .catch(e => console.warn('Could not fetch hotel admin profile', e));

    hotelAdminService.getCategories()
      .then(cats => {
        if (cats && cats.length > 0) {
          setCategories(cats.map(c => ({
            id: c.id,
            titleAz: c.title,
            titleEn: c.title,
            layoutType: c.layoutType || 'list',
            linksCount: c.linksCount || 0,
          })));
        }
      })
      .catch(e => console.warn('Could not fetch categories', e));
  }, []);

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 'cat-1', titleAz: 'Restoran & Otaq Sifarişi', titleEn: 'Dining & Room Service', layoutType: 'list', linksCount: 3 },
    { id: 'cat-2', titleAz: 'Sağlamlıq & İstirahət', titleEn: 'Wellness & Spa', layoutType: 'list', linksCount: 3 },
    { id: 'cat-3', titleAz: 'Otel Xidmətləri & Məlumat', titleEn: 'Hotel Services', layoutType: 'list', linksCount: 3 },
  ]);

  // Links
  const [links, setLinks] = useState<LinkItem[]>([
    { id: 'l-1', categoryId: 'cat-1', title: 'Əsas Restoran Menyusu', subtitle: 'Səhər, nahar və şam yeməyi', iconName: 'Utensils', badge: 'Açıqdır', targetUrl: '#menu', isActive: true },
    { id: 'l-2', categoryId: 'cat-1', title: 'Otağa Yemək Sifarişi (Room Service)', subtitle: '24 saat otağınıza çatdırılma', iconName: 'Bell', badge: '24/7', targetUrl: '#room-service', isActive: true },
    { id: 'l-3', categoryId: 'cat-1', title: 'Lounge & Kokteyl Bar', subtitle: 'Xüsusi içkilər və qəlyanaltılar', iconName: 'Wine', targetUrl: '#bar', isActive: true },
    { id: 'l-4', categoryId: 'cat-2', title: 'Spa & Masaj Rezervasiyası', subtitle: 'Hamam, sauna və aromaterapiya', iconName: 'Sparkles', targetUrl: '#spa', isActive: true },
    { id: 'l-5', categoryId: 'cat-2', title: 'Açıq Hovuz & Çimərlik Klubu', subtitle: 'Dəsmal xidməti və xilasedici', iconName: 'Water', targetUrl: '#pool', isActive: true },
    { id: 'l-6', categoryId: 'cat-3', title: 'Otaq Təmizliyi İstəyi', subtitle: 'Əlavə dəsmal, yastıq və ləvazimat', iconName: 'Bed', targetUrl: '#housekeeping', isActive: true },
  ]);

  // Activities
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 'act-1', title: 'Hovuz Kənarı Canlı DJ Set', location: 'Əsas Açıq Hovuz', startTime: '16:00', endTime: '18:30', category: 'Əyləncə', isActive: true },
    { id: 'act-2', title: 'Uşaqlar üçün Əyləncəli Oyunlar', location: 'Kids Club Arena', startTime: '17:00', endTime: '19:00', category: 'Ailə', isActive: true },
    { id: 'act-3', title: 'Caz Gecəsi & Canlı Vokal', location: 'Panorama Lounge Bar', startTime: '20:30', endTime: '23:00', category: 'Musiqi', isActive: true },
  ]);

  // New Item Modals State
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActLoc, setNewActLoc] = useState('');
  const [newActStart, setNewActStart] = useState('15:00');
  const [newActEnd, setNewActEnd] = useState('18:00');
  const [newActCategory, setNewActCategory] = useState('Əyləncə');

  const [isNewLinkOpen, setIsNewLinkOpen] = useState(false);
  const [newLinkCat, setNewLinkCat] = useState('cat-1');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkSub, setNewLinkSub] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('Restaurant');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Handlers
  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitle.trim()) return;
    const item: ActivityItem = {
      id: `act-${Date.now()}`,
      title: newActTitle.trim(),
      location: newActLoc.trim() || 'Əsas Otel Ərazisi',
      startTime: newActStart,
      endTime: newActEnd,
      category: newActCategory,
      isActive: true,
    };
    setActivities([item, ...activities]);
    setNewActTitle('');
    setNewActLoc('');
    setIsNewActivityOpen(false);
    showToast('Yeni fəaliyyət əlavə edildi.');
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim()) return;
    const item: LinkItem = {
      id: `link-${Date.now()}`,
      categoryId: newLinkCat,
      title: newLinkTitle.trim(),
      subtitle: newLinkSub.trim(),
      iconName: newLinkIcon,
      targetUrl: newLinkUrl.trim() || '#',
      isActive: true,
    };
    setLinks([...links, item]);
    setNewLinkTitle('');
    setNewLinkSub('');
    setNewLinkUrl('');
    setIsNewLinkOpen(false);
    showToast('Yeni menyu linki əlavə edildi.');
  };

  const toggleLinkActive = (id: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
    showToast('Link statusu yeniləndi.');
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
    showToast('Link silindi.');
  };

  const toggleActivityActive = (id: string) => {
    setActivities(activities.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    showToast('Fəaliyyət statusu yeniləndi.');
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
    showToast('Fəaliyyət silindi.');
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
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[20px] bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center shadow-sm flex-shrink-0">
              <IOSIcon name="Sparkles" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--text-main)] tracking-tight leading-tight">
                  Otel Admin Paneli
                </h1>
                <span className="text-[10px] bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/20 px-2.5 py-0.5 rounded-full font-semibold">
                  HotelAdmin
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]/80 font-normal">
                {hotelName} • Brendinq, Menyu və Parametrlər
              </p>
            </div>
          </div>

          {/* Action Controls & Navigation */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* If SuperAdmin is inspecting hotel, provide return link */}
            {user?.role === 'SuperAdmin' && (
              <button
                onClick={() => navigate('/super-admin')}
                className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold hover:border-[#A78BFA] transition-colors"
              >
                ← SuperAdmin-ə Qayıt
              </button>
            )}

            {/* Crucial Jump: Reception Desk Button */}
            <button
              onClick={() => navigate('/reception')}
              className="px-3.5 py-1.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <IOSIcon name="Bell" size={14} />
              <span>🛎️ Resepşn Masasına Bax</span>
            </button>

            {/* Public Guest Page Preview link */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span>Qonaq Portalı ↗</span>
            </a>

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
        
        {/* Soft Navigation Tabs (iOS Segmented Pills) */}
        <div className="bg-[var(--bg-card)] p-1.5 rounded-[24px] border border-[var(--border-color)] flex gap-1.5 overflow-x-auto shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#A78BFA] text-black shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <IOSIcon name="Sparkles" size={15} />
            <span>İcmal & Analitika</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'branding'
                ? 'bg-[#A78BFA] text-black shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <IOSIcon name="Sparkle" size={15} />
            <span>Brendinq & Profil</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'menu'
                ? 'bg-[#A78BFA] text-black shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <IOSIcon name="Restaurant" size={15} />
            <span>Menyu & Linklər</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'activities'
                ? 'bg-[#A78BFA] text-black shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <IOSIcon name="Calendar" size={15} />
            <span>Gündəlik Tədbirlər</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'qr'
                ? 'bg-[#A78BFA] text-black shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <IOSIcon name="Share" size={15} />
            <span>Dinamik QR Kod</span>
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 4 Soft KPI Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Ümumi QR Skan</span>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-2">1,428</h3>
                <p className="text-[11px] text-emerald-400 mt-1 font-normal">+18% bu həftə</p>
              </div>

              <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Aktiv Menyu Linkləri</span>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-2">
                  {links.filter(l => l.isActive).length}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">3 kateqoriya üzrə</p>
              </div>

              <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Otaq Müraciətləri</span>
                <h3 className="text-2xl font-bold tracking-tight text-[#A78BFA] mt-2">34</h3>
                <p className="text-[11px] text-emerald-400 mt-1 font-normal">98% cavablanıb</p>
              </div>

              <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Abunəlik Statusu</span>
                <h3 className="text-sm font-bold text-emerald-400 mt-3">● Aktiv (Pro Plan)</h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">Qalan müddət: 284 gün</p>
              </div>
            </div>

            {/* Reception Fast Banner */}
            <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[#A78BFA]/30 flex items-center justify-between flex-wrap gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-[20px] bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center flex-shrink-0">
                  <IOSIcon name="Bell" size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-[var(--text-main)]">
                    Resepşn Canlı Xidmət Masası
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Qonaqlardan daxil olan otaq xidməti sifarişlərini real-vaxtda yoxlayın və cavablayın.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/reception')}
                className="px-4 py-2 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-sm"
              >
                Resepşn Masasını Aç →
              </button>
            </div>

            {/* Fast Info */}
            <div className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-[var(--text-main)]">Sürətli Məlumat</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                Hotel QR Concierge SaaS sistemi oteliniz üçün həm qonaqların mobil menyusunu, həm də resepşn masasını tam sinxron idarə etməyə imkan verir.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-xl">
                  Kill-Switch: Aktiv Deyil (Tam Səlahiyyət)
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: BRANDING & PROFILE ================= */}
        {activeTab === 'branding' && (
          <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                Brendinq & Qonaq Səhifəsi Görünüşü
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Qonağın QR kodu oxudarkən telefonunda görəcəyi loqo, örtük şəkli və məlumatlar.
              </p>
            </div>

            {/* Live Cover Banner & Logo Preview */}
            <div className="relative rounded-[24px] overflow-hidden border border-[var(--border-color)]">
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
              </div>

              <div className="p-5 -mt-12 relative z-10 flex items-end justify-between flex-wrap gap-4">
                <div className="flex items-end gap-3.5">
                  <div className="w-20 h-20 rounded-[20px] overflow-hidden border-2 border-white/20 shadow-xl bg-[var(--bg-card)]">
                    <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="pb-1">
                    <h3 className="text-lg font-bold text-[var(--text-main)]">{hotelName}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{hotelBio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields for Hotel Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Otelin Rəsmi Adı
                </label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Qısa Sloqan / Bio Mətni
                </label>
                <input
                  type="text"
                  value={hotelBio}
                  onChange={(e) => setHotelBio(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Əlaqə Telefonu
                </label>
                <input
                  type="text"
                  value={hotelPhone}
                  onChange={(e) => setHotelPhone(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  WhatsApp Nömrəsi (Beynəlxalq)
                </label>
                <input
                  type="text"
                  value={hotelWhatsapp}
                  onChange={(e) => setHotelWhatsapp(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Qonaq Wi-Fi Şəbəkə Adı (SSID)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Qonaq Wi-Fi Şifrəsi
                </label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none font-mono"
                />
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  await hotelAdminService.updateProfile({
                    name: hotelName,
                    bio: hotelBio,
                    phone: hotelPhone,
                    whatsApp: hotelWhatsapp,
                  });
                  showToast('Brendinq məlumatları serverdə saxlanıldı.');
                } catch (e) {
                  showToast('Brendinq məlumatları saxlanıldı.');
                }
              }}
              className="px-6 py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform shadow-sm"
            >
              Məlumatları Yadda Saxla
            </button>
          </div>
        )}

        {/* ================= TAB 3: MENU & LINKS ================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                    Menyu və Xidmət Keçidləri
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Qonaqların ana səhifədə gördüyü xidmət kartlarını, PDF menyuları və linkləri tənzimləyin.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewLinkOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-sm"
                >
                  + Yeni Keçid Əlavə Et
                </button>
              </div>

              {/* Links Table */}
              <div className="divide-y divide-[var(--border-color)] rounded-[20px] border border-[var(--border-color)] overflow-hidden">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 flex items-center justify-between flex-wrap gap-3 bg-[var(--bg-subcard)]/40 hover:bg-[var(--bg-subcard)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center flex-shrink-0">
                        <IOSIcon name={link.iconName} size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[var(--text-main)]">{link.title}</h4>
                          {link.badge && (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#A78BFA]/20 text-[#A78BFA]">
                              {link.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{link.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLinkActive(link.id)}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-xl border transition-all ${
                          link.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                        }`}
                      >
                        {link.isActive ? 'Aktiv' : 'Deaktiv'}
                      </button>

                      <button
                        onClick={() => deleteLink(link.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-rose-400"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ACTIVITIES ================= */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                    Gündəlik Fəaliyyət & Əyləncə Cədvəli
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Hovuz partisi, canlı caz, yoqa və uşaq oyunları proqramını idarə edin.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewActivityOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-sm"
                >
                  + Yeni Fəaliyyət Əlavə Et
                </button>
              </div>

              {/* Activities List */}
              <div className="divide-y divide-[var(--border-color)] rounded-[20px] border border-[var(--border-color)] overflow-hidden">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 flex items-center justify-between flex-wrap gap-3 bg-[var(--bg-subcard)]/40 hover:bg-[var(--bg-subcard)] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A78BFA]/20 text-[#A78BFA] uppercase">
                          {act.category}
                        </span>
                        <h4 className="text-xs font-bold text-[var(--text-main)]">{act.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                        <span>⏰ {act.startTime} - {act.endTime}</span>
                        <span>📍 {act.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActivityActive(act.id)}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-xl border transition-all ${
                          act.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                        }`}
                      >
                        {act.isActive ? 'Aktiv' : 'Deaktiv'}
                      </button>

                      <button
                        onClick={() => deleteActivity(act.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-rose-400"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: DYNAMIC QR CODE ================= */}
        {activeTab === 'qr' && (() => {
          const hotelSlug = user?.tenantSlug || 'hotel-resort';
          const qrPngUrl = publicService.getQrPngUrl(hotelSlug);
          const qrSvgUrl = publicService.getQrSvgUrl(hotelSlug);

          const downloadQrWithLogo = async () => {
            try {
              showToast('QR Kod hazırlanır...');
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                window.open(qrPngUrl, '_blank');
                return;
              }

              const qrImg = new Image();
              qrImg.crossOrigin = 'anonymous';
              qrImg.src = qrPngUrl;

              await new Promise((resolve, reject) => {
                qrImg.onload = resolve;
                qrImg.onerror = reject;
              });

              canvas.width = qrImg.naturalWidth || 800;
              canvas.height = qrImg.naturalHeight || 800;

              // Draw QR Code
              ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);

              // Load Altensor Logo Badge
              const logoImg = new Image();
              logoImg.crossOrigin = 'anonymous';
              logoImg.src = altensorLogo;

              await new Promise((resolve) => {
                logoImg.onload = resolve;
                logoImg.onerror = resolve;
              });

              if (logoImg.width) {
                const logoSize = canvas.width * 0.22;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;

                // White rounded badge background
                const radius = logoSize * 0.22;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                  ctx.roundRect(x - 6, y - 6, logoSize + 12, logoSize + 12, radius);
                } else {
                  ctx.rect(x - 6, y - 6, logoSize + 12, logoSize + 12);
                }
                ctx.fill();

                // Draw logo
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);
              }

              const url = canvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = url;
              a.download = `${hotelSlug}-qr.png`;
              a.click();
              showToast('PNG QR kodu loqo ilə endirildi.');
            } catch (e) {
              const a = document.createElement('a');
              a.href = qrPngUrl;
              a.download = `${hotelSlug}-qr.png`;
              a.target = '_blank';
              a.click();
            }
          };

          return (
            <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm max-w-xl mx-auto text-center space-y-5">
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                  Otelin Dinamik QR Kodu
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Otaqlara, masalara və stendlərə yerləşdirmək üçün rəsmi çap faylları.
                </p>
              </div>

              {/* Official Backend Dynamic QR Code with Centered Altensor Logo */}
              <div className="relative bg-white p-5 rounded-[32px] inline-block shadow-2xl border-4 border-[var(--border-color)]">
                <img
                  src={qrPngUrl}
                  alt="Otelin Dinamik QR Kodu"
                  className="w-64 h-64 object-contain mx-auto"
                />

                {/* Centered Altensor Logo Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-xl border-2 border-white flex items-center justify-center p-1.5">
                    <img
                      src={altensorLogo}
                      alt="Altensor Tech Solutions"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <span className="font-semibold block text-[var(--text-main)]">Qonaq Portalı Birbaşa Keçidi:</span>
                <a
                  href={`/hotel/${hotelSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#A78BFA] hover:underline text-[11px]"
                >
                  {`${window.location.origin}/hotel/${hotelSlug}`}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={downloadQrWithLogo}
                  className="py-2.5 px-4 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>PNG Yüklə (HD)</span>
                </button>
                <a
                  href={qrSvgUrl}
                  download={`${hotelSlug}-qr.svg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold hover:border-[#A78BFA] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>SVG (Vektor)</span>
                </a>
              </div>
            </div>
          );
        })()}

      </main>

      {/* ===================== MODAL: CREATE ACTIVITY ===================== */}
      {isNewActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsNewActivityOpen(false)} />
          <div className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 animate-slide-up text-[var(--text-main)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-main)]">Yeni Fəaliyyət Əlavə Et</h3>
              <button onClick={() => setIsNewActivityOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <IOSIcon name="Close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Tədbirin Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Canlı Saxofon Gecəsi"
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Məkan</label>
                <input
                  type="text"
                  placeholder="Məs: Panorama Lounge Bar"
                  value={newActLoc}
                  onChange={(e) => setNewActLoc(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Başlama Saatı</label>
                  <input
                    type="text"
                    value={newActStart}
                    onChange={(e) => setNewActStart(e.target.value)}
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Bitmə Saatı</label>
                  <input
                    type="text"
                    value={newActEnd}
                    onChange={(e) => setNewActEnd(e.target.value)}
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Kateqoriya</label>
                <select
                  value={newActCategory}
                  onChange={(e) => setNewActCategory(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                >
                  <option value="Əyləncə">🏊 Əyləncə & Hovuz</option>
                  <option value="Musiqi">🎷 Canlı Musiqi</option>
                  <option value="Ailə">👨‍👩‍👧 Uşaq & Ailə</option>
                  <option value="İdman">🧘 Yoqa & İdman</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform mt-2"
              >
                Fəaliyyəti Qeyd Et
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE LINK ===================== */}
      {isNewLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsNewLinkOpen(false)} />
          <div className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 animate-slide-up text-[var(--text-main)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-main)]">Yeni Keçid / Menyu Əlavə Et</h3>
              <button onClick={() => setIsNewLinkOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <IOSIcon name="Close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Aid Olduğu Bölmə *</label>
                <select
                  value={newLinkCat}
                  onChange={(e) => setNewLinkCat(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.titleAz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Keçidin Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Şam Yeməyi Xüsusi Menyusu"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Alt İzah / Təsvir</label>
                <input
                  type="text"
                  placeholder="Məs: Milli və Avropa mətbəxi ləzzətləri"
                  value={newLinkSub}
                  onChange={(e) => setNewLinkSub(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">İkon Növü</label>
                <select
                  value={newLinkIcon}
                  onChange={(e) => setNewLinkIcon(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                >
                  <option value="Restaurant">🍽️ Restoran / Çəngəl Bıçaq</option>
                  <option value="Wine">🍷 Bar & Şərab</option>
                  <option value="Sparkles">✨ Spa & Masaj</option>
                  <option value="Water">🏊 Hovuz & Dəniz</option>
                  <option value="Bed">🛏️ Otaq & Xidmət</option>
                  <option value="Car">🚗 Nəqliyyat & Tur</option>
                  <option value="Wifi">📶 Wi-Fi</option>
                  <option value="Globe">🌐 Rəsmi Vebsayt</option>
                  <option value="Booking">🏨 Booking.com</option>
                  <option value="TripAdvisor">🦉 TripAdvisor</option>
                  <option value="GoogleMaps">📍 Google Maps & Rəylər</option>
                  <option value="Airbnb">🏡 Airbnb</option>
                  <option value="Instagram">📸 Instagram</option>
                  <option value="TikTok">🎵 TikTok</option>
                  <option value="Facebook">👥 Facebook</option>
                  <option value="YouTube">▶️ YouTube</option>
                  <option value="Telegram">✈️ Telegram</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Hədəf Keçid (URL və ya PDF linki)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform mt-2"
              >
                Keçidi Saxla
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
