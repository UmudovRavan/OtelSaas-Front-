import React, { useState, useEffect } from 'react';
import { adminCatalogService } from '../../../services/api/adminCatalogService';
import { HotelStoryDto, CreateHotelStoryDto } from '../../../types/api';
import { resolveMediaUrl } from '../../../utils/media';

interface Props {
  tenantId?: string;
  showToast: (msg: string) => void;
}

export const StoriesManagementTab: React.FC<Props> = ({ tenantId, showToast }) => {
  const [stories, setStories] = useState<HotelStoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [titleAz, setTitleAz] = useState('');
  const [descAz, setDescAz] = useState('');
  const [btnTextAz, setBtnTextAz] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const res = await adminCatalogService.getStories(tenantId);
      if (res.data) {
        const mapped = res.data.map((s) => ({
          ...s,
          title: s.titleAz || s.title || '',
          description: s.descriptionAz || s.description || '',
          buttonText: s.buttonTextAz || s.buttonText || '',
        }));
        setStories(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch stories', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [tenantId]);

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAz.trim()) return;

    try {
      const payload: CreateHotelStoryDto = {
        titleAz: titleAz.trim(),
        descriptionAz: descAz.trim() || undefined,
        buttonTextAz: btnTextAz.trim() || undefined,
        badgeText: badgeText.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        displayOrder: parseInt(displayOrder, 10) || 1,
      };

      let storyId = editingStoryId;
      if (editingStoryId) {
        await adminCatalogService.updateStory(editingStoryId, payload, tenantId);
        showToast('Story yeniləndi.');
      } else {
        const created = await adminCatalogService.createStory(payload, tenantId);
        storyId = created.data?.id || null;
        showToast('Story yaradıldı.');
      }

      if (storyId && uploadFile) {
        await adminCatalogService.uploadStoryImage(storyId, uploadFile, tenantId);
        showToast('Story posteri yükləndi.');
      }

      setIsModalOpen(false);
      setEditingStoryId(null);
      setUploadFile(null);
      await fetchStories();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Xəta baş verdi.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">Dairəvi Story Xəbərləri (Stories Bar)</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Mobil portalın yuxarısındakı 6 dairəvi story kartı (Video playback və fərdiləşdirilmiş keçidlər)
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStoryId(null);
            setTitleAz('');
            setDescAz('');
            setBtnTextAz('');
            setBadgeText('');
            setActionUrl('');
            setVideoUrl('');
            setDisplayOrder((stories.length + 1).toString());
            setUploadFile(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform"
        >
          + Yeni Story
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3"
          >
            <div className="relative h-36 rounded-2xl overflow-hidden bg-[var(--bg-subcard)]">
              <img
                src={resolveMediaUrl(story.bannerImageUrl || story.imageUrl, '/media/guest/story-welcome-poster.webp')}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              {story.videoUrl && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                  <span>▶ Video Story</span>
                </div>
              )}
              {story.badgeText && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-[#A78BFA] text-black text-[10px] font-bold">
                  {story.badgeText}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-sm text-[var(--text-main)]">{story.titleAz || story.title}</h4>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">{story.descriptionAz || story.description}</p>
              {story.actionUrl && (
                <span className="text-[10px] font-mono text-[#A78BFA] block mt-1 truncate">
                  Keçid: {story.actionUrl}
                </span>
              )}
            </div>

            <div className="pt-2 flex gap-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => {
                  setEditingStoryId(story.id);
                  setTitleAz(story.titleAz || story.title);
                  setDescAz(story.descriptionAz || story.description || '');
                  setBtnTextAz(story.buttonTextAz || story.buttonText || '');
                  setBadgeText(story.badgeText || '');
                  setActionUrl(story.actionUrl || '');
                  setVideoUrl(story.videoUrl || '');
                  setDisplayOrder(story.displayOrder.toString());
                  setUploadFile(null);
                  setIsModalOpen(true);
                }}
                className="flex-1 py-1.5 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] hover:border-[#A78BFA]"
              >
                Düzəliş et
              </button>
              <button
                onClick={async () => {
                  if (confirm(`"${story.titleAz || story.title}" hekayəsini silmək istəyirsiniz?`)) {
                    await adminCatalogService.deleteStory(story.id, tenantId);
                    showToast('Story silindi.');
                    await fetchStories();
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

      {/* Story Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                {editingStoryId ? 'Story-ni Redaktə Et' : 'Yeni Story Əlavə Et'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-sm text-[var(--text-muted)]">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveStory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Story Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={titleAz}
                  onChange={(e) => setTitleAz(e.target.value)}
                  placeholder="Məs: Xoş gəlmisiniz"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Təsvir / Açıqlama
                </label>
                <textarea
                  rows={2}
                  value={descAz}
                  onChange={(e) => setDescAz(e.target.value)}
                  placeholder="Qonaq story-ni açanda görünən qısa mətn..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Düymə Mətni (CTA)
                  </label>
                  <input
                    type="text"
                    value={btnTextAz}
                    onChange={(e) => setBtnTextAz(e.target.value)}
                    placeholder="Məs: Menyuya bax"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Nişan / Badge
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Yalnız bu gün, −20%..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Yönləndirmə URL (Keçid)
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="/altensor/hotel/g/191 və ya /altensor/hotel/c/4578"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Video URL (.mp4 formatında video story üçün)
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../story-welcome.mp4"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Poster / Şəkil (Fayl yüklə)
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
                  onClick={() => setIsModalOpen(false)}
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

