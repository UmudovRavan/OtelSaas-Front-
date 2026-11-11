import React, { useState, useEffect } from 'react';
import { adminCatalogService } from '../../../services/api/adminCatalogService';
import {
  HotelHubDto,
  CatalogCategoryDto,
  CatalogItemDto,
  CreateHotelHubDto,
  CreateCatalogCategoryDto,
  CreateCatalogItemDto,
  HubType,
  CatalogItemType,
} from '../../../types/api';
import { resolveMediaUrl } from '../../../utils/media';

interface Props {
  tenantId?: string;
  showToast: (msg: string) => void;
  activeSubTab?: 'hubs' | 'categories' | 'items';
  onSubTabChange?: (tab: 'hubs' | 'categories' | 'items') => void;
  onCountsLoaded?: (counts: { hubs: number; categories: number; items: number }) => void;
}

type SubTab = 'hubs' | 'categories' | 'items';

export const CatalogManagementTab: React.FC<Props> = ({
  tenantId,
  showToast,
  activeSubTab,
  onSubTabChange,
  onCountsLoaded,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<SubTab>(activeSubTab || 'hubs');
  const subTab = activeSubTab !== undefined ? activeSubTab : internalSubTab;

  const setSubTab = (tab: SubTab) => {
    setInternalSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [hubs, setHubs] = useState<HotelHubDto[]>([]);
  const [categories, setCategories] = useState<CatalogCategoryDto[]>([]);
  const [items, setItems] = useState<CatalogItemDto[]>([]);

  // Filters
  const [selectedHubId, setSelectedHubId] = useState<string>('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [searchItemQuery, setSearchItemQuery] = useState<string>('');

  // Hub Modal
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [editingHubId, setEditingHubId] = useState<string | null>(null);
  const [hubTitleAz, setHubTitleAz] = useState('');
  const [hubCode, setHubCode] = useState('');
  const [hubType, setHubType] = useState<HubType>(HubType.FoodAndBeverage);
  const [hubIconKey, setHubIconKey] = useState('hotel');

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catHubId, setCatHubId] = useState('');
  const [catTitleAz, setCatTitleAz] = useState('');
  const [catSubtitleAz, setCatSubtitleAz] = useState('');
  const [catHours, setCatHours] = useState('');

  // Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemHubId, setItemHubId] = useState('');
  const [itemCatId, setItemCatId] = useState('');
  const [itemTitleAz, setItemTitleAz] = useState('');
  const [itemPrice, setItemPrice] = useState('0');
  const [itemDescAz, setItemDescAz] = useState('');
  const [itemBadgeAz, setItemBadgeAz] = useState('');
  const [itemIsOrderable, setItemIsOrderable] = useState(true);

  // File Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Fetch Hubs
  const fetchHubs = async () => {
    try {
      const res = await adminCatalogService.getHubs(tenantId);
      if (res.data) {
        const mapped = res.data.map((h) => ({
          ...h,
          title: h.titleAz || h.title || h.code,
          subtitle: h.subtitleAz || h.subtitle || '',
        }));
        setHubs(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch hubs', e);
    }
  };

  // Fetch Categories
  const fetchCategories = async (hubId?: string) => {
    try {
      const res = await adminCatalogService.getCatalogCategories(hubId, tenantId);
      if (res.data) {
        const mapped = res.data.map((c) => ({
          ...c,
          title: c.titleAz || c.title || '',
          subtitle: c.subtitleAz || c.subtitle || '',
        }));
        setCategories(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch categories', e);
    }
  };

  // Fetch Items
  const fetchItems = async (hubId?: string, catId?: string) => {
    try {
      const res = await adminCatalogService.getCatalogItems(hubId, catId, tenantId);
      if (res.data) {
        const mapped = res.data.map((it) => ({
          ...it,
          title: it.titleAz || it.title || '',
          description: it.descriptionAz || it.description || '',
          badge: it.badgeAz || it.badge || '',
        }));
        setItems(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch items', e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchHubs(), fetchCategories(), fetchItems()]).finally(() => setIsLoading(false));
  }, [tenantId]);

  useEffect(() => {
    if (onCountsLoaded) {
      onCountsLoaded({
        hubs: hubs.length,
        categories: categories.length,
        items: items.length,
      });
    }
  }, [hubs.length, categories.length, items.length, onCountsLoaded]);

  // Handle Hub Save
  const handleSaveHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubTitleAz.trim()) return;

    try {
      const payload: CreateHotelHubDto = {
        titleAz: hubTitleAz.trim(),
        code: hubCode.trim() || undefined,
        hubType,
        iconKey: hubIconKey || 'hotel',
        displayMode: 'categories',
      };

      let hubId = editingHubId;
      if (editingHubId) {
        await adminCatalogService.updateHub(editingHubId, payload, tenantId);
        showToast('Əsas bölmə yeniləndi.');
      } else {
        const created = await adminCatalogService.createHub(payload, tenantId);
        hubId = created.data?.id || null;
        showToast('Əsas bölmə yaradıldı.');
      }

      if (hubId && uploadFile) {
        await adminCatalogService.uploadHubCover(hubId, uploadFile, tenantId);
        showToast('Hub şəkli yükləndi.');
      }

      setIsHubModalOpen(false);
      setUploadFile(null);
      setEditingHubId(null);
      await fetchHubs();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Xəta baş verdi.');
    }
  };

  // Handle Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitleAz.trim() || !catHubId) {
      showToast('Xahiş edirik bölmə və başlığı seçin.');
      return;
    }

    try {
      const payload: CreateCatalogCategoryDto = {
        hubId: catHubId,
        titleAz: catTitleAz.trim(),
        subtitleAz: catSubtitleAz.trim() || undefined,
        workingHours: catHours.trim() || undefined,
      };

      let catId = editingCatId;
      if (editingCatId) {
        await adminCatalogService.updateCatalogCategory(editingCatId, payload, tenantId);
        showToast('Məkan / Kateqoriya yeniləndi.');
      } else {
        const created = await adminCatalogService.createCatalogCategory(payload, tenantId);
        catId = created.data?.id || null;
        showToast('Məkan / Kateqoriya yaradıldı.');
      }

      if (catId && uploadFile) {
        await adminCatalogService.uploadCatalogCategoryImage(catId, uploadFile, tenantId);
        showToast('Kateqoriya şəkli yükləndi.');
      }

      setIsCatModalOpen(false);
      setUploadFile(null);
      setEditingCatId(null);
      await fetchCategories(selectedHubId || undefined);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Xəta baş verdi.');
    }
  };

  // Handle Item Save
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitleAz.trim() || !itemHubId || !itemCatId) {
      showToast('Zəhmət olmasa hub, kateqoriya və məhsul adını doldurun.');
      return;
    }

    try {
      const payload: CreateCatalogItemDto = {
        hubId: itemHubId,
        categoryId: itemCatId,
        titleAz: itemTitleAz.trim(),
        price: parseFloat(itemPrice) || 0,
        descriptionAz: itemDescAz.trim() || undefined,
        badgeAz: itemBadgeAz.trim() || undefined,
        isOrderable: itemIsOrderable,
        itemType: CatalogItemType.MenuProduct,
      };

      let itId = editingItemId;
      if (editingItemId) {
        await adminCatalogService.updateCatalogItem(editingItemId, payload, tenantId);
        showToast('Məhsul yeniləndi.');
      } else {
        const created = await adminCatalogService.createCatalogItem(payload, tenantId);
        itId = created.data?.id || null;
        showToast('Məhsul yaradıldı.');
      }

      if (itId && uploadFile) {
        await adminCatalogService.uploadCatalogItemImage(itId, uploadFile, tenantId);
        showToast('Məhsul şəkli yükləndi.');
      }

      setIsItemModalOpen(false);
      setUploadFile(null);
      setEditingItemId(null);
      await fetchItems(selectedHubId || undefined, selectedCatId || undefined);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Xəta baş verdi.');
    }
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (selectedHubId && item.hubId !== selectedHubId) return false;
    if (selectedCatId && item.categoryId !== selectedCatId) return false;
    if (searchItemQuery.trim()) {
      const q = searchItemQuery.toLowerCase().trim();
      const itemTitle = (item.titleAz || item.title || '').toLowerCase();
      const itemDesc = (item.descriptionAz || item.description || '').toLowerCase();
      return itemTitle.includes(q) || itemDesc.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
        <button
          onClick={() => setSubTab('hubs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'hubs'
              ? 'bg-[#A78BFA] text-black shadow-md'
              : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)]'
          }`}
        >
          🏨 Əsas Bölmələr (Hubs) ({hubs.length})
        </button>
        <button
          onClick={() => setSubTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'categories'
              ? 'bg-[#A78BFA] text-black shadow-md'
              : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)]'
          }`}
        >
          🍽️ Məkanlar & Kateqoriyalar ({categories.length})
        </button>
        <button
          onClick={() => setSubTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'items'
              ? 'bg-[#A78BFA] text-black shadow-md'
              : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)]'
          }`}
        >
          🏷️ Məhsullar & Qiymətlər ({items.length})
        </button>
      </div>

      {/* ===================== 1. HUBS SUBTAB ===================== */}
      {subTab === 'hubs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">6 Əsas Bölmə (Hubs)</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Mobil qonaq portalında görünən 6 əsas blok (Otel məlumatı, F&B, Spa, Əyləncə, Əlaqə, Təkliflər)
              </p>
            </div>
            <button
              onClick={() => {
                setEditingHubId(null);
                setHubTitleAz('');
                setHubCode('');
                setHubType(HubType.FoodAndBeverage);
                setHubIconKey('hotel');
                setUploadFile(null);
                setIsHubModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform"
            >
              + Yeni Hub
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3"
              >
                <div className="relative h-32 rounded-2xl overflow-hidden bg-[var(--bg-subcard)]">
                  <img
                    src={resolveMediaUrl(hub.coverImageUrl, '/media/guest/tile-hotel.webp')}
                    alt={hub.titleAz || hub.title}
                    onError={(e) => {
                      const fallback = resolveMediaUrl('/media/guest/tile-hotel.webp');
                      if (!e.currentTarget.dataset.fbApplied && e.currentTarget.src !== fallback) {
                        e.currentTarget.dataset.fbApplied = '1';
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-[10px]">
                    ID: {hub.externalId || hub.code}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[var(--text-main)]">{hub.titleAz || hub.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-1">{hub.subtitleAz || hub.subtitle || hub.code}</p>
                </div>

                <div className="pt-2 flex gap-2 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => {
                      setEditingHubId(hub.id);
                      setHubTitleAz(hub.titleAz || hub.title);
                      setHubCode(hub.code || '');
                      setHubType(hub.hubType);
                      setHubIconKey(hub.iconKey || 'hotel');
                      setUploadFile(null);
                      setIsHubModalOpen(true);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] hover:border-[#A78BFA]"
                  >
                    Düzəliş et
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`"${hub.titleAz || hub.title}" bölməsini silmək istəyirsiniz?`)) {
                        await adminCatalogService.deleteHub(hub.id, tenantId);
                        showToast('Hub silindi.');
                        await fetchHubs();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== 2. CATEGORIES SUBTAB ===================== */}
      {subTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">Məkanlar və Kataloq Kateqoriyaları</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Restoranlar (SHIRVAN, SAQI), Spa zonaları, Boulinq və otaq servisi məkanları
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedHubId}
                onChange={(e) => {
                  setSelectedHubId(e.target.value);
                  fetchCategories(e.target.value || undefined);
                }}
                className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
              >
                <option value="" className="bg-[#211E30] text-white">Bütün Hublar</option>
                {hubs.map((h) => (
                  <option key={h.id} value={h.id} className="bg-[#211E30] text-white">
                    {h.titleAz || h.title || h.code || 'Bölmə'}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setEditingCatId(null);
                  setCatHubId(selectedHubId || (hubs[0]?.id || ''));
                  setCatTitleAz('');
                  setCatSubtitleAz('');
                  setCatHours('');
                  setUploadFile(null);
                  setIsCatModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform flex-shrink-0"
              >
                + Yeni Məkan / Kateqoriya
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3"
              >
                <div className="relative h-28 rounded-2xl overflow-hidden bg-[var(--bg-subcard)]">
                  <img
                    src={resolveMediaUrl(cat.imageUrl, '/media/guest/restaurant-table.webp')}
                    alt={cat.titleAz || cat.title}
                    onError={(e) => {
                      const fallback = resolveMediaUrl('/media/guest/restaurant-table.webp');
                      if (!e.currentTarget.dataset.fbApplied && e.currentTarget.src !== fallback) {
                        e.currentTarget.dataset.fbApplied = '1';
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-[10px]">
                    ID: {cat.externalId || cat.code}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[var(--text-main)]">{cat.titleAz || cat.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-1">{cat.subtitleAz || cat.subtitle || 'Təsvir yoxdur'}</p>
                  {cat.workingHours && (
                    <span className="inline-block mt-1 text-[11px] text-[#A78BFA] font-mono">
                      🕒 {cat.workingHours}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex gap-2 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setCatHubId(cat.hubId);
                      setCatTitleAz(cat.titleAz || cat.title);
                      setCatSubtitleAz(cat.subtitleAz || cat.subtitle || '');
                      setCatHours(cat.workingHours || '');
                      setUploadFile(null);
                      setIsCatModalOpen(true);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] hover:border-[#A78BFA]"
                  >
                    Düzəliş et
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`"${cat.titleAz || cat.title}" kateqoriyasını silmək istəyirsiniz?`)) {
                        await adminCatalogService.deleteCatalogCategory(cat.id, tenantId);
                        showToast('Kateqoriya silindi.');
                        await fetchCategories(selectedHubId || undefined);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== 3. ITEMS SUBTAB ===================== */}
      {subTab === 'items' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">Məhsullar, Yeməklər və Xidmətlər</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Kataloqdakı bütün məhsullar (qiymət, təsvir, şəkli və səbət sifarişi)
              </p>
            </div>
            <button
              onClick={() => {
                const initialHub = selectedHubId || (hubs[0]?.id || '');
                setEditingItemId(null);
                setItemHubId(initialHub);
                fetchCategories(initialHub || undefined);
                setItemCatId(selectedCatId || '');
                setItemTitleAz('');
                setItemPrice('0');
                setItemDescAz('');
                setItemBadgeAz('');
                setItemIsOrderable(true);
                setUploadFile(null);
                setIsItemModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform flex-shrink-0"
            >
              + Yeni Məhsul / Xidmət
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              value={searchItemQuery}
              onChange={(e) => setSearchItemQuery(e.target.value)}
              placeholder="Məhsul adı ilə axtarış..."
              className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
            />
            <select
              value={selectedHubId}
              onChange={(e) => {
                setSelectedHubId(e.target.value);
                setSelectedCatId('');
                fetchCategories(e.target.value || undefined);
                fetchItems(e.target.value || undefined, undefined);
              }}
              className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
            >
              <option value="" className="bg-[#211E30] text-white">Bütün Hublar</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id} className="bg-[#211E30] text-white">
                  {h.titleAz || h.title || h.code || 'Bölmə'}
                </option>
              ))}
            </select>
            <select
              value={selectedCatId}
              onChange={(e) => {
                setSelectedCatId(e.target.value);
                fetchItems(selectedHubId || undefined, e.target.value || undefined);
              }}
              className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
            >
              <option value="" className="bg-[#211E30] text-white">Bütün Kateqoriyalar</option>
              {categories
                .filter((c) => !selectedHubId || c.hubId === selectedHubId)
                .map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#211E30] text-white">
                    {c.titleAz || c.title || 'Kateqoriya'}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--bg-subcard)] flex-shrink-0">
                    <img
                      src={resolveMediaUrl(item.imageUrl, '/media/guest/plate.webp')}
                      alt={item.titleAz || item.title}
                      onError={(e) => {
                        const fallback = resolveMediaUrl('/media/guest/plate.webp');
                        if (!e.currentTarget.dataset.fbApplied && e.currentTarget.src !== fallback) {
                          e.currentTarget.dataset.fbApplied = '1';
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-[var(--text-main)] truncate">{item.titleAz || item.title}</h4>
                      <span className="font-bold text-xs text-[#A78BFA] tabular-nums flex-shrink-0">
                        {item.price ? `${item.price.toFixed(2)} ₼` : 'Pulsuz'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5">
                      {item.descriptionAz || item.description || 'Təsvir yoxdur'}
                    </p>
                    <div className="flex gap-1 mt-1.5">
                      {(item.badgeAz || item.badge) && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[9px]">
                          {item.badgeAz || item.badge}
                        </span>
                      )}
                      {item.isOrderable ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-medium">
                          🛒 Səbət aktiv
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-400 text-[9px]">
                          Yalnız məlumat
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => {
                      setEditingItemId(item.id);
                      setItemHubId(item.hubId);
                      setItemCatId(item.categoryId);
                      setItemTitleAz(item.titleAz || item.title);
                      setItemPrice((item.price || 0).toString());
                      setItemDescAz(item.descriptionAz || item.description || '');
                      setItemBadgeAz(item.badgeAz || item.badge || '');
                      setItemIsOrderable(item.isOrderable);
                      setUploadFile(null);
                      setIsItemModalOpen(true);
                    }}
                    className="flex-1 py-1 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-main)] hover:border-[#A78BFA]"
                  >
                    Düzəliş et
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`"${item.titleAz || item.title}" məhsulunu silmək istəyirsiniz?`)) {
                        await adminCatalogService.deleteCatalogItem(item.id, tenantId);
                        showToast('Məhsul silindi.');
                        await fetchItems(selectedHubId || undefined, selectedCatId || undefined);
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold hover:bg-red-500/20"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== MODALS ===================== */}
      {/* 1. Hub Modal */}
      {isHubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                {editingHubId ? 'Hub-ı Redaktə Et' : 'Yeni Hub Əlavə Et'}
              </h3>
              <button onClick={() => setIsHubModalOpen(false)} className="text-sm text-[var(--text-muted)]">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveHub} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Bölmə Adı *
                </label>
                <input
                  type="text"
                  required
                  value={hubTitleAz}
                  onChange={(e) => setHubTitleAz(e.target.value)}
                  placeholder="Məs: Qida və içki"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Kod / Slug</label>
                  <input
                    type="text"
                    value={hubCode}
                    onChange={(e) => setHubCode(e.target.value)}
                    placeholder="food, spa, 192..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Növü</label>
                  <select
                    value={hubType}
                    onChange={(e) => setHubType(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  >
                    <option value={HubType.HotelInfo}>Otel Məlumatı</option>
                    <option value={HubType.FoodAndBeverage}>Qida və İçki</option>
                    <option value={HubType.SpaAndWellness}>Spa & Wellness</option>
                    <option value={HubType.Entertainment}>Əyləncə</option>
                    <option value={HubType.Contacts}>Əlaqə</option>
                    <option value={HubType.DailySpecials}>Günün Təklifləri</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Örtük Şəkli (Fayl yüklə)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[var(--text-muted)] file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#A78BFA] file:text-black file:font-bold"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsHubModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-muted)]"
                >
                  Ləğv
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                {editingCatId ? 'Məkan / Kateqoriyanı Redaktə Et' : 'Yeni Məkan / Kateqoriya'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-sm text-[var(--text-muted)]">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Aid olduğu Hub *
                </label>
                <select
                  required
                  value={catHubId}
                  onChange={(e) => setCatHubId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                >
                  <option value="" className="bg-[#211E30] text-white">Hub seçin</option>
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id} className="bg-[#211E30] text-white">
                      {h.titleAz || h.title || h.code || 'Bölmə'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Məkan / Başlıq *
                </label>
                <input
                  type="text"
                  required
                  value={catTitleAz}
                  onChange={(e) => setCatTitleAz(e.target.value)}
                  placeholder="Məs: SHIRVAN Restoranı"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Alt Başlıq</label>
                <input
                  type="text"
                  value={catSubtitleAz}
                  onChange={(e) => setCatSubtitleAz(e.target.value)}
                  placeholder="Məs: Restoran və teras · Bütün gün"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">İş Saatları</label>
                <input
                  type="text"
                  value={catHours}
                  onChange={(e) => setCatHours(e.target.value)}
                  placeholder="08:00 – 23:00"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Şəkil (Fayl yüklə)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[var(--text-muted)] file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#A78BFA] file:text-black file:font-bold"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-muted)]"
                >
                  Ləğv
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                {editingItemId ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul / Xidmət'}
              </h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-sm text-[var(--text-muted)]">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">Hub *</label>
                  <select
                    required
                    value={itemHubId}
                    onChange={(e) => {
                      setItemHubId(e.target.value);
                      fetchCategories(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  >
                    <option value="" className="bg-[#211E30] text-white">Hub seçin</option>
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id} className="bg-[#211E30] text-white">
                        {h.titleAz || h.title || h.code || 'Bölmə'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                    Kateqoriya *
                  </label>
                  <select
                    required
                    value={itemCatId}
                    onChange={(e) => setItemCatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  >
                    <option value="" className="bg-[#211E30] text-white">Kateqoriya seçin</option>
                    {categories
                      .filter((c) => !itemHubId || c.hubId === itemHubId)
                      .map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#211E30] text-white">
                          {c.titleAz || c.title || 'Kateqoriya'}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Məhsul Adı *
                </label>
                <input
                  type="text"
                  required
                  value={itemTitleAz}
                  onChange={(e) => setItemTitleAz(e.target.value)}
                  placeholder="Məs: Quzu qabırğası"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Qiymət (₼)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Nişan / Badge (İxtiyari)
                  </label>
                  <input
                    type="text"
                    value={itemBadgeAz}
                    onChange={(e) => setItemBadgeAz(e.target.value)}
                    placeholder="Aşpazın seçimi, −20%..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Təsvir</label>
                <textarea
                  rows={2}
                  value={itemDescAz}
                  onChange={(e) => setItemDescAz(e.target.value)}
                  placeholder="Tərkibi, porsiya və s."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] resize-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="orderableCheck"
                  checked={itemIsOrderable}
                  onChange={(e) => setItemIsOrderable(e.target.checked)}
                  className="rounded text-[#A78BFA]"
                />
                <label htmlFor="orderableCheck" className="text-xs text-[var(--text-main)] font-semibold">
                  Səbət vasitəsilə otağa/masaya sifariş edilə bilər
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Məhsul Şəkli (Fayl yüklə)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[var(--text-muted)] file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#A78BFA] file:text-black file:font-bold"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-muted)]"
                >
                  Ləğv
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

