import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IOSIcon } from '../../components/common/IOSIcon';
import {
  hotelAdminService,
  AdminCategory,
  AdminLink,
  AdminActivity,
  AnalyticsSummary,
  resolveBackendMediaUrl,
} from '../../services/api/hotelAdminService';
import { publicService } from '../../services/api/publicService';
import { fetchHotelQrSvg, downloadHotelQr, printQrTableStand } from '../../utils/qrIntegration';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_LOGO =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryTenantId = searchParams.get('tenantId');
  const querySlug = searchParams.get('slug');

  // Settings & Theme
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'menu' | 'activities' | 'qr'>('overview');

  // Hotel Profile State (Matched with HotelProfileDto & UpdateHotelProfileDto)
  const [hotelSlug, setHotelSlug] = useState(querySlug || user?.tenantSlug || 'hotel-resort');
  const [hotelName, setHotelName] = useState(user?.tenantName || 'Hotel & Resort Baku');
  const [bioAz, setBioAz] = useState('Lüks istirahət və 5 ulduzlu otel xidmətləri.');
  const [bioEn, setBioEn] = useState('Luxury stay and 5-star hotel services.');
  const [bioRu, setBioRu] = useState('Роскошный отдых и 5-звездочный гостиничный сервис.');
  const [defaultLanguage, setDefaultLanguage] = useState<'az' | 'en' | 'ru'>('az');
  const [primaryColor, setPrimaryColor] = useState('#A78BFA');
  const [themeMode, setThemeMode] = useState<number>(2);
  const [hotelPhone, setHotelPhone] = useState('+994 12 599 00 00');
  const [hotelEmail, setHotelEmail] = useState('info@hotelresort.az');
  const [hotelWhatsapp, setHotelWhatsapp] = useState('994501234567');
  const [hotelTelegram, setHotelTelegram] = useState('@hotelresort');
  const [hotelAddress, setHotelAddress] = useState('Bakı şəhəri, Neftçilər prospekti');
  const [hotelMapUrl, setHotelMapUrl] = useState('https://maps.google.com/?q=Baku');
  const [coverImage, setCoverImage] = useState(DEFAULT_COVER);
  const [logoImage, setLogoImage] = useState(DEFAULT_LOGO);
  const [isHotelActive, setIsHotelActive] = useState(true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);

  // Upload loading states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Dynamic QR SVG State (from /api/hotel-admin/qr/svg or /api/public/{slug}/qr/svg)
  const [qrSvgMarkup, setQrSvgMarkup] = useState<string>('');
  const [isQrLoading, setIsQrLoading] = useState<boolean>(false);

  // Categories, Links & Activities from Backend
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);

  // New Category Modal
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [newCatTitleAz, setNewCatTitleAz] = useState('');
  const [newCatTitleEn, setNewCatTitleEn] = useState('');
  const [newCatTitleRu, setNewCatTitleRu] = useState('');
  const [newCatLayout, setNewCatLayout] = useState<'list' | 'icons'>('list');

  // New Link Modal
  const [isNewLinkOpen, setIsNewLinkOpen] = useState(false);
  const [newLinkCatId, setNewLinkCatId] = useState('');
  const [newLinkTitleAz, setNewLinkTitleAz] = useState('');
  const [newLinkTitleEn, setNewLinkTitleEn] = useState('');
  const [newLinkTitleRu, setNewLinkTitleRu] = useState('');
  const [newLinkType, setNewLinkType] = useState<number>(1);
  const [newLinkIcon, setNewLinkIcon] = useState('Restaurant');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkFile, setNewLinkFile] = useState<File | null>(null);
  const [isSavingLink, setIsSavingLink] = useState(false);

  // New Activity Modal
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [newActTitleAz, setNewActTitleAz] = useState('');
  const [newActTitleEn, setNewActTitleEn] = useState('');
  const [newActDesc, setNewActDesc] = useState('');
  const [newActLoc, setNewActLoc] = useState('');
  const [newActStart, setNewActStart] = useState('16:00');
  const [newActEnd, setNewActEnd] = useState('18:30');
  const [newActCategory, setNewActCategory] = useState('Əyləncə');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Fetch Profile, Categories/Links, Activities & Analytics
  const fetchAllAdminData = useCallback(async () => {
    try {
      const prof = await hotelAdminService.getProfile(queryTenantId);
      if (prof) {
        if (prof.slug) setHotelSlug(prof.slug);
        if (prof.name) setHotelName(prof.name);
        setBioAz(prof.bioAz ?? '');
        setBioEn(prof.bioEn ?? '');
        setBioRu(prof.bioRu ?? '');
        if (prof.defaultLanguage === 'az' || prof.defaultLanguage === 'en' || prof.defaultLanguage === 'ru') {
          setDefaultLanguage(prof.defaultLanguage);
        }
        if (prof.primaryColor) setPrimaryColor(prof.primaryColor);
        if (prof.themeMode) setThemeMode(prof.themeMode);
        setHotelPhone(prof.phone ?? '');
        setHotelEmail(prof.email ?? '');
        setHotelWhatsapp(prof.whatsApp ?? '');
        setHotelTelegram(prof.telegram ?? '');
        setHotelAddress(prof.address ?? '');
        setHotelMapUrl(prof.mapUrl ?? '');
        setIsHotelActive(prof.isActive ?? true);
        setSubscriptionEndDate(prof.subscriptionEndDate ?? null);
        if (prof.logoUrl) setLogoImage(resolveBackendMediaUrl(prof.logoUrl));
        if (prof.coverImageUrl) setCoverImage(resolveBackendMediaUrl(prof.coverImageUrl));
      }
    } catch (e) {
      console.warn('Could not fetch hotel admin profile:', e);
    }

    try {
      const cats = await hotelAdminService.getCategories(queryTenantId);
      if (cats && Array.isArray(cats)) {
        setCategories(cats);
        const flatLinks: AdminLink[] = [];
        cats.forEach((c) => {
          if (c.links && Array.isArray(c.links)) {
            flatLinks.push(...c.links);
          }
        });
        setLinks(flatLinks);
        if (cats.length > 0 && !newLinkCatId) {
          setNewLinkCatId(cats[0].id);
        }
      }
    } catch (e) {
      console.warn('Could not fetch categories:', e);
    }

    try {
      const acts = await hotelAdminService.getActivities(queryTenantId);
      if (acts && Array.isArray(acts)) {
        setActivities(acts);
      }
    } catch (e) {
      console.warn('Could not fetch activities:', e);
    }

    try {
      const sum = await hotelAdminService.getAnalyticsSummary(queryTenantId);
      if (sum) {
        setAnalytics(sum);
      }
    } catch (e) {
      console.warn('Could not fetch analytics summary:', e);
    }
  }, [queryTenantId]);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  useEffect(() => {
    let active = true;
    setIsQrLoading(true);
    fetchHotelQrSvg(hotelSlug, queryTenantId)
      .then((svg) => {
        if (active && svg) setQrSvgMarkup(svg);
      })
      .catch((err) => console.warn('Could not load QR SVG markup:', err))
      .finally(() => {
        if (active) setIsQrLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hotelSlug, queryTenantId]);

  // Handle Logo File Upload
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const uploadedUrl = await hotelAdminService.uploadLogo(file, queryTenantId);
      if (uploadedUrl) {
        setLogoImage(resolveBackendMediaUrl(uploadedUrl));
        showToast('Otelin loqosu uğurla yeniləndi!');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Loqo yüklənərkən xəta baş verdi.';
      showToast(msg, 'error');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Handle Cover File Upload
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const uploadedUrl = await hotelAdminService.uploadCover(file, queryTenantId);
      if (uploadedUrl) {
        setCoverImage(resolveBackendMediaUrl(uploadedUrl));
        showToast('Qapaq şəkli (Cover) uğurla yeniləndi!');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Qapaq şəkli yüklənərkən xəta baş verdi.';
      showToast(msg, 'error');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    if (!hotelName.trim()) {
      showToast('Otelin adı boş ola bilməz.', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      const updated = await hotelAdminService.updateProfile(
        {
          name: hotelName.trim(),
          bioAz: bioAz.trim() || null,
          bioEn: bioEn.trim() || null,
          bioRu: bioRu.trim() || null,
          defaultLanguage: defaultLanguage || 'az',
          primaryColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(primaryColor) ? primaryColor : '#A78BFA',
          themeMode: themeMode || 2,
          phone: hotelPhone.trim() || null,
          email: hotelEmail.trim() || null,
          whatsApp: hotelWhatsapp.trim() || null,
          telegram: hotelTelegram.trim() || null,
          address: hotelAddress.trim() || null,
          mapUrl: hotelMapUrl.trim() || null,
        },
        queryTenantId
      );
      if (updated) {
        setHotelName(updated.name);
        if (updated.logoUrl) setLogoImage(resolveBackendMediaUrl(updated.logoUrl));
        if (updated.coverImageUrl) setCoverImage(resolveBackendMediaUrl(updated.coverImageUrl));
      }
      showToast('Brendinq və profil məlumatları serverdə saxlanıldı!');
    } catch (err: any) {
      const apiData = err?.response?.data;
      let msg = apiData?.message || err?.message || 'Profil yenilənərkən xəta baş verdi.';
      if (apiData?.errors) {
        const list = Object.values(apiData.errors).flat().join(' ');
        if (list) msg = list;
      }
      showToast(msg, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitleAz.trim()) return;
    try {
      const created = await hotelAdminService.createCategory(
        {
          titleAz: newCatTitleAz.trim(),
          titleEn: newCatTitleEn.trim() || newCatTitleAz.trim(),
          titleRu: newCatTitleRu.trim() || newCatTitleAz.trim(),
          layoutType: newCatLayout,
          displayOrder: categories.length + 1,
          isActive: true,
        },
        queryTenantId
      );
      await fetchAllAdminData();
      if (created?.id) setNewLinkCatId(created.id);
      setNewCatTitleAz('');
      setNewCatTitleEn('');
      setNewCatTitleRu('');
      setIsNewCategoryOpen(false);
      showToast('Yeni bölmə (kateqoriya) yaradıldı.');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Kateqoriya yaradılarkən xəta baş verdi.', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await hotelAdminService.deleteCategory(id, queryTenantId);
      await fetchAllAdminData();
      showToast('Kateqoriya silindi.');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Kateqoriya silinərkən xəta baş verdi.', 'error');
    }
  };

  // Handle Create Link (+ optional PDF/file upload)
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitleAz.trim()) return;

    let targetCategoryId = newLinkCatId;
    setIsSavingLink(true);
    try {
      // If hotel has no categories yet, create a default one automatically
      if (!targetCategoryId) {
        const defaultCat = await hotelAdminService.createCategory(
          {
            titleAz: 'Otel Xidmətləri & Menyular',
            titleEn: 'Hotel Services & Menus',
            titleRu: 'Услуги отеля и меню',
            layoutType: 'list',
            displayOrder: 1,
            isActive: true,
          },
          queryTenantId
        );
        targetCategoryId = defaultCat.id;
      }

      const createdLink = await hotelAdminService.createLink(
        {
          categoryId: targetCategoryId,
          titleAz: newLinkTitleAz.trim(),
          titleEn: newLinkTitleEn.trim() || newLinkTitleAz.trim(),
          titleRu: newLinkTitleRu.trim() || newLinkTitleAz.trim(),
          linkType: newLinkFile ? 6 : newLinkType,
          targetUrl: newLinkUrl.trim() || 'https://hotelresort.az',
          iconKey: newLinkIcon,
          isCustomIcon: false,
          openInNewTab: true,
          displayOrder: links.length + 1,
          isActive: true,
        },
        queryTenantId
      );

      if (newLinkFile && createdLink?.id) {
        await hotelAdminService.uploadLinkFile(createdLink.id, newLinkFile, queryTenantId);
      }

      await fetchAllAdminData();
      setNewLinkTitleAz('');
      setNewLinkTitleEn('');
      setNewLinkTitleRu('');
      setNewLinkUrl('');
      setNewLinkFile(null);
      setIsNewLinkOpen(false);
      showToast('Yeni menyu keçidi əlavə edildi!');
    } catch (err: any) {
      const apiData = err?.response?.data;
      let msg = apiData?.message || 'Keçid əlavə edilərkən xəta baş verdi.';
      if (apiData?.errors) {
        const list = Object.values(apiData.errors).flat().join(' ');
        if (list) msg = list;
      }
      showToast(msg, 'error');
    } finally {
      setIsSavingLink(false);
    }
  };

  const toggleLinkActive = async (link: AdminLink) => {
    try {
      await hotelAdminService.updateLink(
        link.id,
        {
          titleAz: link.titleAz,
          titleEn: link.titleEn || link.titleAz,
          titleRu: link.titleRu || link.titleAz,
          linkType: link.linkType || 1,
          targetUrl: link.targetUrl || 'https://hotelresort.az',
          iconKey: link.iconKey || 'Globe',
          isCustomIcon: link.isCustomIcon || false,
          openInNewTab: link.openInNewTab ?? true,
          displayOrder: link.displayOrder || 1,
          isActive: !link.isActive,
        },
        queryTenantId
      );
      await fetchAllAdminData();
      showToast('Keçid statusu yeniləndi.');
    } catch (err: any) {
      showToast('Status yenilənərkən xəta baş verdi.', 'error');
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await hotelAdminService.deleteLink(id, queryTenantId);
      await fetchAllAdminData();
      showToast('Keçid silindi.');
    } catch (err: any) {
      showToast('Keçid silinərkən xəta baş verdi.', 'error');
    }
  };

  // Handle Create Activity
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitleAz.trim()) return;
    setIsSavingActivity(true);
    try {
      await hotelAdminService.createActivity(
        {
          titleAz: newActTitleAz.trim(),
          titleEn: newActTitleEn.trim() || newActTitleAz.trim(),
          titleRu: newActTitleAz.trim(),
          description: newActDesc.trim() || null,
          location: newActLoc.trim() || 'Əsas Otel Ərazisi',
          startTime: newActStart,
          endTime: newActEnd || null,
          date: new Date().toISOString(),
          category: newActCategory,
          imageUrl: null,
          displayOrder: activities.length + 1,
        },
        queryTenantId
      );
      await fetchAllAdminData();
      setNewActTitleAz('');
      setNewActTitleEn('');
      setNewActDesc('');
      setNewActLoc('');
      setIsNewActivityOpen(false);
      showToast('Yeni fəaliyyət proqrama əlavə edildi!');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Fəaliyyət yaradılarkən xəta baş verdi.', 'error');
    } finally {
      setIsSavingActivity(false);
    }
  };

  const toggleActivityActive = async (id: string) => {
    try {
      await hotelAdminService.toggleActivity(id, queryTenantId);
      await fetchAllAdminData();
      showToast('Fəaliyyət statusu yeniləndi.');
    } catch (err) {
      showToast('Status dəyişdirilə bilmədi.', 'error');
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await hotelAdminService.deleteActivity(id, queryTenantId);
      await fetchAllAdminData();
      showToast('Fəaliyyət silindi.');
    } catch (err) {
      showToast('Fəaliyyət silinərkən xəta baş verdi.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const receptionUrl = queryTenantId
    ? `/reception?tenantId=${queryTenantId}&slug=${hotelSlug}`
    : '/reception';

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 selection:bg-[#A78BFA] selection:text-black">
      {/* ===================== TOP HEADER ===================== */}
      <header className="sticky top-0 z-30 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-color)] px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[20px] bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
              {logoImage ? (
                <img src={logoImage} alt={hotelName} className="w-full h-full object-cover" />
              ) : (
                <IOSIcon name="Sparkles" size={20} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--text-main)] tracking-tight leading-tight">
                  Otel Admin Paneli
                </h1>
                <span className="text-[10px] bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/20 px-2.5 py-0.5 rounded-full font-semibold">
                  {user?.role === 'SuperAdmin' ? 'SuperAdmin Rejimi' : 'HotelAdmin'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]/80 font-normal">
                {hotelName} <span className="font-mono text-[#A78BFA]">(/hotel/{hotelSlug})</span>
              </p>
            </div>
          </div>

          {/* Action Controls & Navigation */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {user?.role === 'SuperAdmin' && (
              <button
                onClick={() => navigate('/super-admin')}
                className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold hover:border-[#A78BFA] transition-colors"
              >
                ← SuperAdmin-ə Qayıt
              </button>
            )}

            <button
              onClick={() => navigate(receptionUrl)}
              className="px-3.5 py-1.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <IOSIcon name="Bell" size={14} />
              <span>🛎️ Resepşn Masasına Bax</span>
            </button>

            <a
              href={`/hotel/${hotelSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span>Qonaq Portalı ↗</span>
            </a>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              className="w-9 h-9 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[#A78BFA] active:scale-95 transition-transform"
            >
              {isDarkMode ? <IOSIcon name="Sun" size={16} /> : <IOSIcon name="Moon" size={15} />}
            </button>

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
            <span>Brendinq & Şəkillər</span>
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
            <span>Menyu & Linklər ({links.length})</span>
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
            <span>Gündəlik Tədbirlər ({activities.length})</span>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <span className="text-xs font-semibold text-[var(--text-muted)]">QR Skan & Baxış (30 gün)</span>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-2">
                  {Number(analytics?.totalViewsLast30Days ?? analytics?.totalViews ?? 0).toLocaleString()}
                </h3>
                <p className="text-[11px] text-emerald-400 mt-1 font-normal">Canlı backend statistikası</p>
              </div>

              <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Keçid Klikləri (30 gün)</span>
                <h3 className="text-2xl font-bold tracking-tight text-[#A78BFA] mt-2">
                  {Number(
                    analytics?.totalClicksLast30Days ??
                      analytics?.totalLinkClicks ??
                      links.reduce((s, l) => s + (l.clickCount || 0), 0)
                  ).toLocaleString()}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">
                  {links.filter((l) => l.isActive).length} aktiv keçid üzrə
                </p>
              </div>

              <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Otaq Müraciətləri (30 gün)</span>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-2">
                  {Number(analytics?.totalInquiriesLast30Days ?? analytics?.totalInquiries ?? 0).toLocaleString()}
                </h3>
                <p className="text-[11px] text-emerald-400 mt-1 font-normal">Resepşn masasına daxil olan</p>
              </div>

              <div className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Abunəlik Statusu</span>
                <h3 className={`text-sm font-bold mt-3 ${isHotelActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isHotelActive ? '● Aktiv (Xidmət Açıqdır)' : '● Dondurulub'}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">
                  {subscriptionEndDate ? `Bitmə: ${subscriptionEndDate.split('T')[0]}` : 'Tam səlahiyyətli hesab'}
                </p>
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
                onClick={() => navigate(receptionUrl)}
                className="px-4 py-2 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-sm"
              >
                Resepşn Masasını Aç →
              </button>
            </div>

            {/* Top Clicked Links from Backend */}
            {analytics?.topLinks && analytics.topLinks.length > 0 && (
              <div className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-[var(--text-main)]">Ən Çox Kliklənən Xidmətlər</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {analytics.topLinks.map((tl) => (
                    <div
                      key={tl.linkId}
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-[var(--text-main)] truncate">{tl.title}</span>
                      <span className="text-xs font-bold text-[#A78BFA] ml-2 shrink-0">{tl.clicks} klik</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: BRANDING & IMAGES ================= */}
        {activeTab === 'branding' && (
          <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                  Brendinq, Loqo & Qapaq Şəkli (Cover)
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Qonağın QR kodu oxudarkən telefonunda görəcəyi loqo, örtük şəkli və əlaqə məlumatları.
                </p>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="hidden"
              />
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] hover:border-[#A78BFA] text-xs font-semibold text-[var(--text-main)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IOSIcon name="Sparkle" size={14} />
                  <span>{isUploadingLogo ? 'Loqo Yüklənir...' : '📷 Loqo Yüklə'}</span>
                </button>

                <button
                  type="button"
                  disabled={isUploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-2xl bg-[#A78BFA]/15 border border-[#A78BFA]/30 hover:bg-[#A78BFA] hover:text-black text-xs font-bold text-[#A78BFA] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IOSIcon name="Sparkles" size={14} />
                  <span>{isUploadingCover ? 'Qapaq Yüklənir...' : '🖼️ Qapaq Şəklini (Cover) Dəyiş'}</span>
                </button>
              </div>
            </div>

            {/* Live Cover Banner & Logo Preview with Click-to-Upload Overlays */}
            <div className="relative rounded-[24px] overflow-hidden border border-[var(--border-color)]">
              <div className="relative h-52 w-full overflow-hidden bg-slate-900 group">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20 hover:bg-black/80 transition-colors"
                >
                  {isUploadingCover ? 'Yüklənir...' : '🖼️ Qapaq Şəklini Dəyiş'}
                </button>
              </div>

              <div className="p-5 -mt-14 relative z-10 flex items-end justify-between flex-wrap gap-4">
                <div className="flex items-end gap-3.5">
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    title="Loqonu dəyişmək üçün klikləyin"
                    className="relative w-20 h-20 rounded-[20px] overflow-hidden border-2 border-white/20 shadow-xl bg-[var(--bg-card)] cursor-pointer group"
                  >
                    <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white text-center p-1">
                      {isUploadingLogo ? '...' : 'Loqonu Dəyiş'}
                    </div>
                  </div>
                  <div className="pb-1">
                    <h3 className="text-lg font-bold text-[var(--text-main)]">{hotelName}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{bioAz}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields for Hotel Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Otelin Rəsmi Adı *
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
                  Qısa Sloqan / Bio (Azərbaycan dilində)
                </label>
                <input
                  type="text"
                  value={bioAz}
                  onChange={(e) => setBioAz(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Qısa Sloqan / Bio (İngilis dilində - EN)
                </label>
                <input
                  type="text"
                  value={bioEn}
                  onChange={(e) => setBioEn(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Qısa Sloqan / Bio (Rus dilində - RU)
                </label>
                <input
                  type="text"
                  value={bioRu}
                  onChange={(e) => setBioRu(e.target.value)}
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
                  WhatsApp Nömrəsi (Beynəlxalq formatda)
                </label>
                <input
                  type="text"
                  value={hotelWhatsapp}
                  onChange={(e) => setHotelWhatsapp(e.target.value)}
                  placeholder="994501234567"
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Rəsmi E-poçt Ünvanı
                </label>
                <input
                  type="email"
                  value={hotelEmail}
                  onChange={(e) => setHotelEmail(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Telegram Hesabı / Bot
                </label>
                <input
                  type="text"
                  value={hotelTelegram}
                  onChange={(e) => setHotelTelegram(e.target.value)}
                  placeholder="@hotelresort"
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Otelin Ünvanı
                </label>
                <input
                  type="text"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Google Maps Xəritə Keçidi (Map URL)
                </label>
                <input
                  type="text"
                  value={hotelMapUrl}
                  onChange={(e) => setHotelMapUrl(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-main)] focus:border-[#A78BFA] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="px-6 py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform shadow-sm disabled:opacity-50"
            >
              {isSavingProfile ? 'Yadda saxlanılır...' : 'Məlumatları Serverdə Yadda Saxla'}
            </button>
          </div>
        )}

        {/* ================= TAB 3: MENU, CATEGORIES & LINKS ================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Categories Section */}
            <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                    Menyu Kateqoriyaları ({categories.length})
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Xidmət və menyu keçidlərinin qruplaşdırıldığı bölmələr.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewCategoryOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] hover:border-[#A78BFA] text-[var(--text-main)] text-xs font-bold transition-colors"
                >
                  + Yeni Kateqoriya
                </button>
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="px-3.5 py-2 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center gap-2.5 text-xs"
                    >
                      <span className="font-bold text-[var(--text-main)]">{cat.titleAz}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A78BFA]/15 text-[#A78BFA]">
                        {cat.links?.length || 0} link
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-[var(--text-muted)] hover:text-rose-400 ml-1"
                        title="Kateqoriyanı sil"
                      >
                        <IOSIcon name="Close" size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links Section */}
            <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                    Menyu və Xidmət Keçidləri ({links.length})
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Qonaqların ana səhifədə gördüyü xidmət kartlarını, PDF menyuları və sosial şəbəkə linklərini tənzimləyin.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewLinkOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-sm"
                >
                  + Yeni Keçid Əlavə Et
                </button>
              </div>

              {links.length === 0 ? (
                <div className="p-8 rounded-[20px] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                  Hələ heç bir menyu keçidi əlavə edilməyib. "+ Yeni Keçid Əlavə Et" düyməsini sıxın.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)] rounded-[20px] border border-[var(--border-color)] overflow-hidden">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="p-4 flex items-center justify-between flex-wrap gap-3 bg-[var(--bg-subcard)]/40 hover:bg-[var(--bg-subcard)] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center flex-shrink-0">
                          <IOSIcon name={link.iconKey || 'Globe'} size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-[var(--text-main)]">{link.titleAz}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#A78BFA]/15 text-[#A78BFA]">
                              {link.clickCount || 0} klik
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] truncate max-w-md mt-0.5 font-mono">
                            {link.filePath ? resolveBackendMediaUrl(link.filePath) : link.targetUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLinkActive(link)}
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
              )}
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
                    Gündəlik Fəaliyyət & Əyləncə Cədvəli ({activities.length})
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

              {activities.length === 0 ? (
                <div className="p-8 rounded-[20px] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                  Hələ heç bir gündəlik fəaliyyət əlavə edilməyib.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)] rounded-[20px] border border-[var(--border-color)] overflow-hidden">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 flex items-center justify-between flex-wrap gap-3 bg-[var(--bg-subcard)]/40 hover:bg-[var(--bg-subcard)] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A78BFA]/20 text-[#A78BFA] uppercase">
                            {act.category || 'Tədbir'}
                          </span>
                          <h4 className="text-xs font-bold text-[var(--text-main)]">{act.titleAz}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                          <span>
                            ⏰ {act.startTime}
                            {act.endTime ? ` - ${act.endTime}` : ''}
                          </span>
                          {act.location && <span>📍 {act.location}</span>}
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
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: DYNAMIC QR CODE ================= */}
        {activeTab === 'qr' &&
          (() => {
            const qrSvgUrl = publicService.getQrSvgUrl(hotelSlug);
            const dynamicScanUrl = `http://31.57.77.199:5055/q/${hotelSlug}`;
            const directPortalUrl = `${window.location.origin}/hotel/${hotelSlug}`;

            const handleDownloadQr = async (format: 'png' | 'svg') => {
              try {
                showToast(`${format.toUpperCase()} faylı hazırlanır...`);
                await downloadHotelQr(format, hotelSlug, queryTenantId);
                showToast(`QR kod (${format.toUpperCase()}) uğurla endirildi.`);
              } catch (err) {
                showToast('Fayl yüklənərkən xəta baş verdi.', 'error');
              }
            };

            const handlePrintStand = async () => {
              showToast('A5 Masaüstü Çap Şablonu hazırlanır...');
              await printQrTableStand(hotelName, qrSvgMarkup, hotelSlug, queryTenantId);
            };

            return (
              <div className="p-6 rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm max-w-xl mx-auto text-center space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Dinamik QR (ECC Level H • 30% Korreksiya) Aktivdir</span>
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                    {hotelName} — Rəsmi Dinamik QR Kodu
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                    Qonaqlar bu kodu skan etdikdə backend analitikası (+1 skan) qeyd olunur və dərhal otelin rəqəmsal konsyerj menyusuna yönləndirilir.
                  </p>
                </div>

                {/* Ssenari 1: SVG-ni kəskin şəkildə DOM-da render edirik */}
                <div className="relative bg-white p-6 rounded-[32px] inline-block shadow-2xl border-4 border-[var(--border-color)] group">
                  {isQrLoading && !qrSvgMarkup ? (
                    <div className="w-64 h-64 md:w-72 md:h-72 flex items-center justify-center text-xs font-semibold text-slate-500">
                      QR kod hazırlanır...
                    </div>
                  ) : qrSvgMarkup ? (
                    <div
                      className="w-64 h-64 md:w-72 md:h-72 flex items-center justify-center mx-auto transition-transform group-hover:scale-[1.02] [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
                    />
                  ) : (
                    <img
                      src={qrSvgUrl}
                      alt="Otelin Dinamik QR Kodu"
                      className="w-64 h-64 md:w-72 md:h-72 object-contain mx-auto transition-transform group-hover:scale-[1.02]"
                    />
                  )}
                </div>

                {/* Dynamic Tracking URL & Direct Link Cards */}
                <div className="space-y-3 text-left">
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] block">
                        Dinamik Analitika & Skan Yönləndiricisi (/q/{hotelSlug}):
                      </span>
                      <a
                        href={dynamicScanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[var(--text-main)] hover:text-[#A78BFA] hover:underline truncate block mt-0.5"
                      >
                        {dynamicScanUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={dynamicScanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-[#A78BFA]/15 text-[#A78BFA] hover:bg-[#A78BFA] hover:text-black text-[11px] font-bold transition-colors"
                        title="Skanı Test Et (+1 Skan)"
                      >
                        Test ↗
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(dynamicScanUrl);
                          showToast('Dinamik skan linki kopyalandı.');
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        title="Kopyala"
                      >
                        <IOSIcon name="Copy" size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                        Qonaq Portalı Birbaşa Keçidi:
                      </span>
                      <a
                        href={directPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#A78BFA] hover:underline truncate block mt-0.5"
                      >
                        {directPortalUrl}
                      </a>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(directPortalUrl);
                        showToast('Portal linki kopyalandı.');
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex-shrink-0"
                      title="Kopyala"
                    >
                      <IOSIcon name="Copy" size={15} />
                    </button>
                  </div>
                </div>

                {/* Ssenari 2 & 3: PNG Endir, SVG Endir və Masaüstü A5 Stend Çap Et */}
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDownloadQr('png')}
                      className="py-3 px-4 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-md shadow-[#A78BFA]/25 flex items-center justify-center gap-2"
                    >
                      <IOSIcon name="Share" size={15} />
                      <span>📥 PNG Endir (Ekran üçün)</span>
                    </button>
                    <button
                      onClick={() => handleDownloadQr('svg')}
                      className="py-3 px-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <IOSIcon name="Sparkles" size={15} />
                      <span>🖨️ SVG Endir (Mətbəə Çapı üçün)</span>
                    </button>
                  </div>

                  <button
                    onClick={handlePrintStand}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[var(--bg-subcard)] border border-[#A78BFA]/40 text-[var(--text-main)] hover:border-[#A78BFA] hover:bg-[#A78BFA]/10 text-xs font-bold active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>🪧 Masaüstü QR Stendi Çap Et (Hazır A5 Şablon)</span>
                  </button>
                </div>
              </div>
            );
          })()}
      </main>

      {/* ===================== MODAL: CREATE CATEGORY ===================== */}
      {isNewCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsNewCategoryOpen(false)} />
          <div className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 animate-slide-up text-[var(--text-main)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-main)]">Yeni Menyu Kateqoriyası</h3>
              <button
                onClick={() => setIsNewCategoryOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <IOSIcon name="Close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Kateqoriya Adı (AZ) *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Restoran & Otaq Sifarişi"
                  value={newCatTitleAz}
                  onChange={(e) => setNewCatTitleAz(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Kateqoriya Adı (EN)</label>
                <input
                  type="text"
                  placeholder="Dining & Room Service"
                  value={newCatTitleEn}
                  onChange={(e) => setNewCatTitleEn(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Görünüş Növü</label>
                <select
                  value={newCatLayout}
                  onChange={(e) => setNewCatLayout(e.target.value as 'list' | 'icons')}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                >
                  <option value="list">Siyahı (List kartlar)</option>
                  <option value="icons">İkon Şəbəkəsi (Icons)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform mt-2"
              >
                Kateqoriyanı Yarat
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE ACTIVITY ===================== */}
      {isNewActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsNewActivityOpen(false)} />
          <div className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 animate-slide-up text-[var(--text-main)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-main)]">Yeni Fəaliyyət Əlavə Et</h3>
              <button
                onClick={() => setIsNewActivityOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <IOSIcon name="Close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Tədbirin Adı (AZ) *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Canlı Saxofon Gecəsi"
                  value={newActTitleAz}
                  onChange={(e) => setNewActTitleAz(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tədbirin Adı (EN)</label>
                <input
                  type="text"
                  placeholder="Live Saxophone Night"
                  value={newActTitleEn}
                  onChange={(e) => setNewActTitleEn(e.target.value)}
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
                disabled={isSavingActivity}
                className="w-full py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform mt-2 disabled:opacity-50"
              >
                {isSavingActivity ? 'Əlavə edilir...' : 'Fəaliyyəti Qeyd Et'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE LINK ===================== */}
      {isNewLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setIsNewLinkOpen(false)} />
          <div className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 animate-slide-up text-[var(--text-main)] my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-main)]">Yeni Keçid / Menyu Əlavə Et</h3>
              <button
                onClick={() => setIsNewLinkOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <IOSIcon name="Close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-3">
              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Aid Olduğu Bölmə *</label>
                  <select
                    value={newLinkCatId}
                    onChange={(e) => setNewLinkCatId(e.target.value)}
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.titleAz}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">Keçidin Başlığı (AZ) *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Şam Yeməyi Xüsusi Menyusu"
                  value={newLinkTitleAz}
                  onChange={(e) => setNewLinkTitleAz(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Keçidin Başlığı (EN)</label>
                <input
                  type="text"
                  placeholder="Dinner Special Menu"
                  value={newLinkTitleEn}
                  onChange={(e) => setNewLinkTitleEn(e.target.value)}
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
                <label className="block text-xs font-semibold mb-1">Hədəf Keçid (URL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Və ya PDF Menyu / Fayl Yüklə</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setNewLinkFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-2.5 text-xs outline-none focus:border-[#A78BFA]"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingLink}
                className="w-full py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold active:scale-[0.98] transition-transform mt-2 disabled:opacity-50"
              >
                {isSavingLink ? 'Saxlanılır...' : 'Keçidi Serverdə Saxla'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== NOTIFICATION TOAST ===================== */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 bg-[#211E30] text-white border px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs font-semibold ${
            toastType === 'error' ? 'border-rose-500/40' : 'border-[#A78BFA]/30'
          }`}
        >
          <span className={toastType === 'error' ? 'text-rose-400' : 'text-[#A78BFA]'}>
            <IOSIcon name={toastType === 'error' ? 'Close' : 'Check'} size={16} />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
