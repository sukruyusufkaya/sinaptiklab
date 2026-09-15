import type { Metadata } from 'next';
import { Altlik } from '@/components/duzen/Altlik';
import { BakimEkrani } from '@/components/duzen/BakimEkrani';
import { DuyuruSeridi } from '@/components/duzen/DuyuruSeridi';
import { SiteKabugu } from '@/components/duzen/SiteKabugu';
import { bakimKipi, duyuruSeridi } from '@/lib/site/ayarlar';

/**
 * Site düzeni — panelden yazılan iki ayarı burada okur.
 *
 * STATİK ÜRETİM KORUNUR: `bakimKipi()` ve `duyuruSeridi()` sıradan veri
 * çekmedir, `cookies()`/`headers()` gibi dinamik API değil. Bu yüzden düzen
 * dinamiğe düşmez; ayar değeri derleme anında gömülür. Editör ayarı
 * değiştirdiğinde `ayarKaydet` zaten `revalidatePath('/', 'layout')` çağırıyor
 * ve tüm sayfalar yeniden üretiliyor.
 *
 * Bakım kipi YALNIZCA site tarafını kapatır: `/admin` ayrı bir rota grubudur,
 * bu düzenin altında değildir. Editör bakım kipini açtıktan sonra onu
 * kapatacağı ekrana erişmeye devam eder.
 */

/**
 * Bakım kipinde DİZİNLEME KAPATILIR.
 *
 * `BakimEkrani` başlığı "sayfa noindex alır" diyordu ama bunu uygulayan kod
 * yoktu: kök düzen (`app/layout.tsx`) `robots: { index: true, follow: true }`
 * veriyor ve bakım ekranı da bu değerle basılıyordu. Yani bakım açıkken
 * sitenin HER adresi "Kısa bir bakım molası veriyoruz." gövdesini
 * `index, follow` ile sunuyordu — arama motorunun gerçek içeriği bu metinle
 * değiştirmesi için yeterli.
 *
 * Üstveri çözümü segment derinliğine göre birleşir: burada verilen `robots`
 * kök düzeni ezer, kendi `robots` değerini AÇIKÇA yazan sayfalar (yalnızca
 * `seo.dizinlenmesin` işaretli kayıtlar ve önizleme/yakalayıcı rotalar) ise
 * bunu ezmeye devam eder — ikisi de `noindex` tarafında olduğu için çelişki
 * doğmaz.
 *
 * Bakım BİTTİĞİNDE `bakim-kipi` kapanır, `revalidatePath('/', 'layout')`
 * çalışır ve üstveri yeniden üretilir; `noindex` kalıcı bir iz bırakmaz.
 */
export async function generateMetadata(): Promise<Metadata> {
  if (!(await bakimKipi())) return {};
  return { robots: { index: false, follow: false } };
}

export default async function SiteDuzeni({ children }: { children: React.ReactNode }) {
  const [bakimda, duyuru] = await Promise.all([bakimKipi(), duyuruSeridi()]);

  if (bakimda) return <BakimEkrani />;

  return (
    <div className="flex min-h-dvh flex-col">
      {duyuru && <DuyuruSeridi metin={duyuru} />}
      <SiteKabugu />
      <main id="ana-icerik" className="flex-1">
        {children}
      </main>
      <Altlik />
    </div>
  );
}
