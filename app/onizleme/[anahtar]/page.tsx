import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetinGovdesi } from '@/components/icerik/MetinGovdesi';
import { yapilandirmaBul } from '@/lib/admin/alanlar/kayit';
import { alanDegeri } from '@/lib/admin/alanlar/tipler';
import { onizlemeAnahtariniCoz, onizlemeBelgesiGetir } from '@/lib/admin/onizleme';
import type { Blok } from '@/lib/tipler';

/**
 * Taslak önizleme rotası.
 *
 * NEDEN SİTE ROTA GRUBUNUN DIŞINDA:
 * Site sayfaları statik üretiliyor. Önizlemeyi oraya taşımak `draftMode()`
 * gerektirir, `draftMode()` ise dinamik bir API'dir: render sırasında okunan
 * her rota dinamiğe döner ve prerender'ı kaybederiz. Bu yüzden önizleme
 * kendi dinamik rotasında yaşar; site tarafında hiçbir şey değişmez.
 *
 * Bu sayfa YAYIMLANMAMIŞ içerik gösterir, dolayısıyla:
 *  - `force-dynamic` — hiçbir katmanda önbelleğe alınmaz.
 *  - `robots: noindex, nofollow` + `next.config.ts` içindeki `X-Robots-Tag`
 *    başlığı (meta etiketi okumayan tarayıcılar için ikinci kat).
 *  - Kaldırılamayan bir önizleme şeridi: sayfayı gören, yayında olmayan bir
 *    metne baktığını bilmek zorunda.
 *
 * Her koleksiyonun kendi site şablonu taklit EDİLMEZ. Burada gösterilen şey
 * onay için gereken asgari çerçevedir: başlık, answer-first cevap, durum ve
 * gövde blokları. Blokları basan bileşen site tarafındaki `MetinGovdesi`'dir —
 * yani editör, yayımlandığında göreceği tipografinin aynısını görür.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Önizleme',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

/** Answer-first metnin koleksiyonlara göre değişen alan adları. */
const OZET_ALANLARI = ['kisaCevap', 'kisaTanim', 'ozet', 'aciklama'] as const;

const DURUM_ADI: Record<string, string> = {
  taslak: 'Taslak',
  incelemede: 'İncelemede',
  yayinda: 'Yayında',
  arsiv: 'Arşiv',
};

export default async function OnizlemeSayfasi({
  params,
}: {
  params: Promise<{ anahtar: string }>;
}) {
  const { anahtar } = await params;

  /**
   * Geçersiz, süresi geçmiş ve iptal edilmiş anahtar AYNI yanıtı alır: 404.
   * "Anahtar var ama süresi geçmiş" bilgisini sızdırmak, geçerli anahtar
   * arayan birine geri bildirim vermek olurdu.
   */
  const kayit = await onizlemeAnahtariniCoz(anahtar);
  if (!kayit) notFound();

  const belge = await onizlemeBelgesiGetir(kayit);
  if (!belge) notFound();

  const yapilandirma = yapilandirmaBul(kayit.koleksiyon);
  if (!yapilandirma) notFound();

  const baslikDegeri = alanDegeri(belge, yapilandirma.baslikAlani);
  const baslik =
    typeof baslikDegeri === 'string' && baslikDegeri.trim() ? baslikDegeri : yapilandirma.ad;

  const ozet = OZET_ALANLARI.map((ad) => belge[ad]).find(
    (deger): deger is string => typeof deger === 'string' && deger.trim().length > 0,
  );

  const durum = typeof belge.durum === 'string' ? belge.durum : undefined;
  const anahtarAlanDegeri = alanDegeri(belge, yapilandirma.anahtarAlan);

  /** Yapılandırmada `bloklar` tipindeki her alan gövde sayılır. */
  const govdeAlanlari = yapilandirma.alanlar
    .filter((alan) => alan.tip === 'bloklar')
    .map((alan) => ({ etiket: alan.etiket, bloklar: bloklariSuz(alanDegeri(belge, alan.ad)) }))
    .filter((bolum) => bolum.bloklar.length > 0);

  return (
    <div className="min-h-dvh bg-zemin">
      <OnizlemeSeridi biterZaman={kayit.biterZaman} durum={durum} />

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <p className="etiket-mono text-metin-soluk">
          {yapilandirma.ad}
          {typeof anahtarAlanDegeri === 'string' && anahtarAlanDegeri ? (
            <span className="ml-2 font-mono text-metin-soluk">{anahtarAlanDegeri}</span>
          ) : null}
        </p>

        <h1 className="mt-2.5 text-3xl leading-tight font-semibold tracking-tight text-metin sm:text-4xl">
          {baslik}
        </h1>

        {ozet && (
          <p className="mt-4 font-serif text-lg leading-relaxed text-metin-ikincil">{ozet}</p>
        )}

        <div className="mt-8 border-t border-kenar pt-8">
          {govdeAlanlari.length === 0 ? (
            <p className="rounded-xl border border-dashed border-kenar-guclu px-5 py-10 text-center text-sm text-metin-soluk">
              Bu kaydın gövdesi henüz boş. Önizleme, kaydın o anki hâlini gösterir.
            </p>
          ) : (
            <div className="space-y-10">
              {govdeAlanlari.map((bolum) => (
                <section key={bolum.etiket}>
                  {govdeAlanlari.length > 1 && (
                    <h2 className="etiket-mono mb-5 text-metin-soluk">{bolum.etiket}</h2>
                  )}
                  <MetinGovdesi bloklar={bolum.bloklar} />
                </section>
              ))}
            </div>
          )}
        </div>

        <p className="mt-10 border-t border-kenar pt-5 text-xs leading-relaxed text-metin-soluk">
          Bu adres yalnızca önizleme içindir: yayımlanmış sayfa değildir, arama motorlarına
          kapalıdır ve bağlantının süresi dolduğunda çalışmayı bırakır. Yayındaki hâli için kaydın
          yayımlanmasını bekleyin.
        </p>
      </main>
    </div>
  );
}

/* --- ÖNİZLEME ŞERİDİ ------------------------------------------------------ */

/**
 * Kaldırılamaz uyarı şeridi. Sayfanın en üstünde, yapışkan ve tek renkte:
 * önizleme bağlantısı paylaşıldığında karşı taraf yayında olmayan bir metne
 * baktığını kaçırmasın.
 *
 * Metin kaynakta büyük harfle yazılır; `text-transform` KULLANILMAZ (belge
 * dili `tr`, tarayıcı "i" harfini "İ"ye çevirir).
 */
function OnizlemeSeridi({ biterZaman, durum }: { biterZaman: Date; durum?: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-uyari/40 bg-uyari/12 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-2.5 sm:px-6">
        <span className="etiket-mono text-uyari">ÖNİZLEME</span>
        <span className="text-xs text-metin-ikincil">
          Bu içerik YAYINDA DEĞİL.
          {durum ? ` Kaydın durumu: ${DURUM_ADI[durum] ?? durum}.` : ''}
        </span>
        <span className="ml-auto font-mono text-[0.6875rem] text-metin-soluk">
          bağlantı {biterZaman.toISOString().slice(0, 16).replace('T', ' ')} tarihinde biter
        </span>
      </div>
    </div>
  );
}

/* --- BLOK DOĞRULAMA ------------------------------------------------------- */

function metinMi(deger: unknown): deger is string {
  return typeof deger === 'string';
}

function metinDizisiMi(deger: unknown): deger is string[] {
  return Array.isArray(deger) && deger.every(metinMi);
}

/**
 * Veritabanından gelen gövdeyi `Blok[]` tipine indirger.
 *
 * Bu sayfa dinamiktir ve DOĞRUDAN veritabanı içeriğini basar: eksik alanlı bir
 * blok (`liste` içinde `ogeler` yoksa gibi) render sırasında 500 üretirdi.
 * Tanınmayan veya bozuk bloklar sessizce atılır; kalan gövde görünür.
 */
function bloklariSuz(deger: unknown): Blok[] {
  if (!Array.isArray(deger)) return [];

  return deger.filter((oge): oge is Blok => {
    if (!oge || typeof oge !== 'object') return false;
    const blok = oge as Record<string, unknown>;

    switch (blok.tip) {
      case 'paragraf':
      case 'kisa-cevap':
      case 'alinti':
        return metinMi(blok.metin);
      case 'altbaslik':
        return metinMi(blok.metin) && metinMi(blok.kimlik);
      case 'liste':
        return metinDizisiMi(blok.ogeler);
      case 'kod':
        return metinMi(blok.dil) && metinMi(blok.metin);
      case 'tablo':
        return (
          metinDizisiMi(blok.basliklar) &&
          Array.isArray(blok.satirlar) &&
          blok.satirlar.every(metinDizisiMi)
        );
      case 'akis':
        return (
          Array.isArray(blok.adimlar) &&
          blok.adimlar.every((adim) => {
            if (!adim || typeof adim !== 'object') return false;
            const kayit = adim as Record<string, unknown>;
            return metinMi(kayit.ad) && metinMi(kayit.aciklama);
          })
        );
      case 'uyari':
        return (blok.ton === 'bilgi' || blok.ton === 'dikkat') && metinMi(blok.metin);
      default:
        return false;
    }
  });
}
