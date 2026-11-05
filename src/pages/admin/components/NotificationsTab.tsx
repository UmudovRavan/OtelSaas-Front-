import React, { useState, useEffect } from 'react';
import { adminOperationsService } from '../../../services/api/adminOperationsService';
import { NotificationSettingsDto, NotificationChannel } from '../../../types/api';

interface Props {
  tenantId?: string;
  showToast: (msg: string) => void;
}

export const NotificationsTab: React.FC<Props> = ({ tenantId, showToast }) => {
  const [settings, setSettings] = useState<NotificationSettingsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [channel, setChannel] = useState<NotificationChannel>(NotificationChannel.Both);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isConnectingTelegram, setIsConnectingTelegram] = useState(false);
  const [isConnectingEmail, setIsConnectingEmail] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminOperationsService.getNotificationSettings(tenantId);
      if (res.data) {
        setSettings(res.data);
        setChannel(res.data.preferredChannel);
        setEmailAddress(res.data.notificationEmail || '');
      }
    } catch (e) {
      console.warn('Failed to fetch notification settings', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [tenantId]);

  const handleConnectTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramBotToken.trim()) return;

    setIsConnectingTelegram(true);
    try {
      const res = await adminOperationsService.connectTelegramBot({ botToken: telegramBotToken.trim() }, tenantId);
      showToast(res.message || 'Telegram bot uğurla qoşuldu.');
      setTelegramBotToken('');
      await fetchSettings();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Telegram bot qoşularkən xəta baş verdi.');
    } finally {
      setIsConnectingTelegram(false);
    }
  };

  const handleConnectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress.trim()) return;

    setIsConnectingEmail(true);
    try {
      const res = await adminOperationsService.connectEmail({ email: emailAddress.trim() }, tenantId);
      showToast(res.message || 'Bildiriş e-poçtu təyin edildi.');
      await fetchSettings();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'E-poçt təyin edilərkən xəta baş verdi.');
    } finally {
      setIsConnectingEmail(false);
    }
  };

  const handleSaveChannel = async () => {
    try {
      await adminOperationsService.updateNotificationSettings(
        {
          preferredChannel: channel,
          notificationEmail: settings?.notificationEmail || emailAddress || undefined,
          telegramChatId: settings?.telegramChatId || undefined,
        },
        tenantId
      );
      showToast('Bildiriş kanalı tənzimləmələri yadda saxlanıldı.');
      await fetchSettings();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Xəta baş verdi.');
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      const res = await adminOperationsService.sendTestNotification(tenantId);
      if (res.data) {
        showToast('Sınaq bildirişi göndərildi! Telegram və E-poçtunuzu yoxlayın.');
      } else {
        showToast('Bildiriş göndərilmədi. Bot və ya e-poçt ayarlarını yoxlayın.');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Xəta baş verdi.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-base font-bold text-[var(--text-main)]">Real-Vaxt Bildirişləri (Telegram & E-poçt)</h3>
        <p className="text-xs text-[var(--text-muted)]">
          Qonaqlardan yeni otaq servisi sifarişləri və müraciətlər gəldikdə dərhal Telegram və ya E-poçt bildirişləri alın.
        </p>
      </div>

      {/* Preferred Channel Radio Group */}
      <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
          Əsas Bildiriş Kanalı
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { val: NotificationChannel.Both, label: '🔔 Hər İkisi (Tövsiyə)', desc: 'Telegram + Email' },
            { val: NotificationChannel.Telegram, label: '📱 Yalnız Telegram', desc: 'Sürətli alertlər' },
            { val: NotificationChannel.Email, label: '✉️ Yalnız E-poçt', desc: 'Standart bildiriş' },
            { val: NotificationChannel.None, label: '🔕 Deaktiv', desc: 'Bildirişsiz' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setChannel(item.val)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                channel === item.val
                  ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[var(--text-main)] shadow-sm'
                  : 'bg-[var(--bg-subcard)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#A78BFA]/50'
              }`}
            >
              <span className="font-bold text-xs block">{item.label}</span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSaveChannel}
          className="px-4 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform"
        >
          Kanalı Yadda Saxla
        </button>
      </div>

      {/* Telegram Connection Card */}
      <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0088cc]/20 text-[#0088cc] flex items-center justify-center text-xl font-bold">
              ✈️
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-main)]">Telegram Bot İnteqrasiyası</h4>
              <p className="text-xs text-[var(--text-muted)]">
                Otelin xüsusi bot tokeni ilə avtomatik qrup/kanal bildirişləri
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              settings?.isTelegramConnected
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-zinc-500/15 text-zinc-400'
            }`}
          >
            {settings?.isTelegramConnected ? '✓ Bağlıdır' : 'Qoşulmayıb'}
          </span>
        </div>

        {settings?.telegramChatId && (
          <div className="p-3 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-muted)] flex justify-between">
            <span>Cari Chat ID:</span>
            <span className="text-[var(--text-main)] font-bold">{settings.telegramChatId}</span>
          </div>
        )}

        <form onSubmit={handleConnectTelegram} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
              Telegram Bot Token (BotFather-dan əldə edilən)
            </label>
            <input
              type="text"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-[#A78BFA]"
            />
          </div>
          <button
            type="submit"
            disabled={isConnectingTelegram}
            className="px-4 py-2 rounded-xl bg-[#0088cc] text-white text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
          >
            {isConnectingTelegram ? 'Qoşulur...' : 'Telegram Botu Qoş'}
          </button>
        </form>
      </div>

      {/* Email Connection Card */}
      <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              ✉️
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-main)]">E-poçt Bildirişləri</h4>
              <p className="text-xs text-[var(--text-muted)]">
                Sifariş və rəy bildirişlərinin göndəriləcəyi resepsiyon e-poçtu
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              settings?.isEmailConnected
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-zinc-500/15 text-zinc-400'
            }`}
          >
            {settings?.isEmailConnected ? '✓ Aktivdir' : 'Təyin edilməyib'}
          </span>
        </div>

        <form onSubmit={handleConnectEmail} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
              Bildiriş E-poçt Ünvanı
            </label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="reception@skyhill.az"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#A78BFA]"
            />
          </div>
          <button
            type="submit"
            disabled={isConnectingEmail}
            className="px-4 py-2 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
          >
            {isConnectingEmail ? 'Yadda saxlanılır...' : 'E-poçtu Təsdiqlə'}
          </button>
        </form>
      </div>

      {/* Test Notification Card */}
      <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-[var(--text-main)]">Sınaq Bildirişi Göndər</h4>
          <p className="text-xs text-[var(--text-muted)]">
            Aktiv kanallara (Telegram və E-poçt) test siqnalı göndərərək sistemin işləməsini yoxlayın
          </p>
        </div>
        <button
          onClick={handleSendTest}
          disabled={isSendingTest}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-black font-bold text-xs shadow-md active:scale-95 transition-all flex-shrink-0 disabled:opacity-50"
        >
          {isSendingTest ? 'Göndərilir...' : '🔔 Sınaq Mesajı Göndər'}
        </button>
      </div>
    </div>
  );
};

