import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { PanelKabugu } from '@/components/admin/PanelKabugu';
import { guvenliIcYol } from '@/lib/guvenlik/adres';
import { gezinmeyiSuz } from '@/lib/admin/gezinme';
import { oturumKullanicisi, panelErisimiVarMi } from '@/lib/yetki/oturum';

/**
 * Panel kabuğu ve ASIL oturum kapısı.
 *
 * `proxy.ts` yalnızca çerez varlığına bakar (Edge'de veritabanı yok);
 * tokenin geçerliliği burada, sunucuda doğrulanır.
 *
 * UYARI: Bu kapı SAYFA GÖRÜNTÜLEMEYİ korur, yazma eylemlerini KORUMAZ.
 * Next.js'te Server Action layout render'ından önce çalıştığı için her eylem
 * kendi yetki kontrolünü `korumaliEylem` ile yapmak zorundadır.
 */

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Sinaptik Panel' },
  robots: { index: false, follow: false, nocache: true },
};

export default async function PanelDuzeni({ children }: { children: ReactNode }) {
  const basliklar = await headers();
  const suAnkiYol = guvenliIcYol(basliklar.get('x-yol'), '/admin/');

  // Giriş ekranı kabuğun dışındadır; kendi düzenini kullanır.
  const girisSayfasindaMiyiz = suAnkiYol.startsWith('/admin/giris');

  const kullanici = await oturumKullanicisi();

  if (girisSayfasindaMiyiz) {
    // Oturumu olan biri giriş ekranına gelirse panele al.
    if (kullanici && panelErisimiVarMi(kullanici)) redirect('/admin/');
    return <>{children}</>;
  }

  if (!kullanici) {
    redirect(`/admin/giris/?devam=${encodeURIComponent(suAnkiYol)}`);
  }

  if (!panelErisimiVarMi(kullanici)) {
    redirect('/admin/giris/?hata=yetki');
  }

  return (
    <PanelKabugu kullanici={kullanici} bolumler={gezinmeyiSuz(kullanici.izinler)} yol={suAnkiYol}>
      {children}
    </PanelKabugu>
  );
}
