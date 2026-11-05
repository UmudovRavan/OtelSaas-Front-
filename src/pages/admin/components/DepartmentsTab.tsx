import React, { useState, useEffect } from 'react';
import { adminOperationsService } from '../../../services/api/adminOperationsService';
import { DepartmentContactDto, CreateDepartmentContactDto } from '../../../types/api';

interface Props {
  tenantId?: string;
  showToast: (msg: string) => void;
}

export const DepartmentsTab: React.FC<Props> = ({ tenantId, showToast }) => {
  const [departments, setDepartments] = useState<DepartmentContactDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleAz, setTitleAz] = useState('');
  const [subtitleAz, setSubtitleAz] = useState('');
  const [phone, setPhone] = useState('');
  const [internalExt, setInternalExt] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [workingHours, setWorkingHours] = useState('24/7');
  const [iconKey, setIconKey] = useState('phone');

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await adminOperationsService.getDepartmentContacts(tenantId);
      if (res.data) {
        const mapped = res.data.map((d) => ({
          ...d,
          title: d.titleAz || d.title || '',
          subtitle: d.subtitleAz || d.subtitle || '',
        }));
        setDepartments(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch department contacts', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [tenantId]);

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAz.trim()) return;

    try {
      const payload: CreateDepartmentContactDto = {
        titleAz: titleAz.trim(),
        subtitleAz: subtitleAz.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
        internalExtension: internalExt.trim() || undefined,
        whatsAppNumber: whatsapp.trim() || undefined,
        workingHours: workingHours.trim() || undefined,
        iconKey: iconKey || 'phone',
      };

      if (editingId) {
        await adminOperationsService.updateDepartmentContact(editingId, payload, tenantId);
        showToast('Şöbə əlaqəsi yeniləndi.');
      } else {
        await adminOperationsService.createDepartmentContact(payload, tenantId);
        showToast('Şöbə əlaqəsi əlavə edildi.');
      }

      setIsModalOpen(false);
      setEditingId(null);
      await fetchDepartments();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Xəta baş verdi.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">Şöbə Əlaqələri və Daxili Nömrələr</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Qonaq portalında "Əlaqə" bölməsində görünən daxili ATS nömrələri və şöbələr
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setTitleAz('');
            setSubtitleAz('');
            setPhone('');
            setInternalExt('');
            setWhatsapp('');
            setWorkingHours('24/7');
            setIconKey('phone');
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform"
        >
          + Yeni Şöbə Əlaqəsi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-[var(--text-main)]">{dept.title}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{dept.subtitle || '24 saat'}</p>
              </div>
              {dept.internalExtension && (
                <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] font-mono font-bold text-xs text-[#A78BFA]">
                  Daxili: {dept.internalExtension}
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs text-[var(--text-muted)]">
              {dept.phoneNumber && (
                <div className="flex items-center gap-1.5 font-mono">
                  <span>📞</span>
                  <span>{dept.phoneNumber}</span>
                </div>
              )}
              {dept.whatsAppNumber && (
                <div className="flex items-center gap-1.5 font-mono">
                  <span>💬</span>
                  <span>{dept.whatsAppNumber}</span>
                </div>
              )}
              {dept.workingHours && (
                <div className="flex items-center gap-1.5">
                  <span>🕒</span>
                  <span>{dept.workingHours}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => {
                  setEditingId(dept.id);
                  setTitleAz(dept.title);
                  setSubtitleAz(dept.subtitle || '');
                  setPhone(dept.phoneNumber || '');
                  setInternalExt(dept.internalExtension || '');
                  setWhatsapp(dept.whatsAppNumber || '');
                  setWorkingHours(dept.workingHours || '24/7');
                  setIconKey(dept.iconKey || 'phone');
                  setIsModalOpen(true);
                }}
                className="flex-1 py-1.5 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] hover:border-[#A78BFA]"
              >
                Düzəliş et
              </button>
              <button
                onClick={async () => {
                  if (confirm(`"${dept.title}" əlaqəsini silmək istəyirsiniz?`)) {
                    await adminOperationsService.deleteDepartmentContact(dept.id, tenantId);
                    showToast('Şöbə silindi.');
                    await fetchDepartments();
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                {editingId ? 'Şöbə Əlaqəsini Redaktə Et' : 'Yeni Şöbə Əlaqəsi'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-sm text-[var(--text-muted)]">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveDepartment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Şöbə Adı *
                </label>
                <input
                  type="text"
                  required
                  value={titleAz}
                  onChange={(e) => setTitleAz(e.target.value)}
                  placeholder="Məs: Resepsiyon, Konsyerj, Room Service..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Daxili Nömrə (ATS)
                  </label>
                  <input
                    type="text"
                    value={internalExt}
                    onChange={(e) => setInternalExt(e.target.value)}
                    placeholder="Məs: 0, 1, 3"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">İş Saatları</label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="24/7, 08:00–22:00"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Alt Mətn</label>
                <input
                  type="text"
                  value={subtitleAz}
                  onChange={(e) => setSubtitleAz(e.target.value)}
                  placeholder="Məs: 24 saat · daxili 0"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+994 12 ..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+994 50 ..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
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

