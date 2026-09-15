import type { Metadata } from 'next';
import { GirisFormu } from '@/components/admin/GirisFormu';
import { guvenliIcYol } from '@/lib/guvenlik/adres';

export const metadata: Metadata = {
  title: 'Giriş',
  robots: { index: false, follow: false, nocache: true },
};

const HATA_ILETILERI: Record<string, string> = {
  yetki: 'Bu hesabın yönetim paneline erişim yetkisi yok.',
  sure: 'Oturum süresi doldu. Yeniden giriş yapın.',
};

export default async function PanelGirisSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ devam?: string; hata?: string }>;
}) {
  const { devam, hata } = await searchParams;
  const hedef = guvenliIcYol(devam, '/admin/');

  return (
    <div className="grid min-h-dvh place-items-center bg-zemin-derin px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Kimlik */}
        <div className="mb-8 text-center">
          <p className="etiket-mono mb-2 font-semibold tracking-[0.16em] text-vurgu">
            SİNAPTİK LAB
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-metin">Yönetim paneli</h1>
        </div>

        <div className="rounded-2xl border border-kenar bg-yuzey/50 p-6">
          <GirisFormu devam={hedef} baslangicHatasi={hata ? HATA_ILETILERI[hata] : undefined} />
        </div>
      </div>
    </div>
  );
}
