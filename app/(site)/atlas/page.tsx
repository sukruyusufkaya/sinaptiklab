import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { atlasListesi, ATLAS_KATEGORILERI } from '@/lib/icerik/atlas';
import { SEVIYE_ADI, tarihUzun } from '@/lib/veri/temel';

export const metadata: Metadata = {
  title: 'AI Atlas — Yapay Zekâ Kavramları',
  description:
    'Yapay zekâ kavramlarının kalıcı referansı. Her kavram için tek URL, alıntılanabilir tanım, mimari, karşılaştırma ve doğrulama tarihi.',
  alternates: { canonical: '/atlas/' },
};

export default async function AtlasSayfasi() {
  const ATLAS = await atlasListesi();
  // Kategori kartlarindaki sayilar tek listeden turetilir; her kategori icin
  // ayri sorgu atilmaz.
  const kategoriAdetleri = new Map<string, number>();
  for (const girdi of ATLAS) {
    const dilim = ATLAS_KATEGORILERI.find((k) => k.ad === girdi.kategori);
    if (dilim) kategoriAdetleri.set(dilim.slug, (kategoriAdetleri.get(dilim.slug) ?? 0) + 1);
  }
  const kategoriAdedi = (slug: string) => kategoriAdetleri.get(slug) ?? 0;

  const toplam = ATLAS_KATEGORILERI.reduce((sayi, kategori) => sayi + kategori.adet, 0);

  return (
    <>
      <ListeSemasi
        ad="AI Atlas girdileri"
        ogeler={ATLAS.map((girdi) => ({ ad: girdi.ad, yol: `/atlas/${girdi.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'AI Atlas', yol: '/atlas/' }]}
        etiket="UNDERSTAND"
        baslik="Sinaptik AI Atlas"
        ozet="Yapay zekâ kavramlarının kalıcı referansı. Tek URL, tek konu, alıntılanabilir bir tanım — ve her girdinin son doğrulama tarihi."
        olcumler={[
          { deger: `${toplam}`, etiket: 'Hedef girdi' },
          { deger: `${ATLAS.length}`, etiket: 'Yayında' },
          { deger: `${ATLAS_KATEGORILERI.length}`, etiket: 'Kategori' },
          { deger: 'Sürümlü', etiket: 'Güncelleme' },
        ]}
        eylemler={
          <>
            <Dugme href="/sozluk/" gorunum="ikincil">
              Hızlı sözlük
            </Dugme>
            <Dugme href="/konu/" gorunum="sessiz">
              Konu merkezleri
              <Ok className="size-4" />
            </Dugme>
          </>
        }
      />

      {/* --- Kategoriler --- */}
      <Bolum kimlik="kategoriler">
        <BolumBasligi
          numara="01"
          etiket="TAKSONOMİ"
          baslik={`${ATLAS_KATEGORILERI.length} konu kümesi`}
          aciklama="Atlas, format değil konu eksenine göre örgütlenir. Aynı kavram hakkında haber, rehber, ders ve test ayrı sayfalarda yaşar. Sayılar yayında olan / hedeflenen girdi adedini gösterir."
        />

        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {ATLAS_KATEGORILERI.map((kategori, sira) => (
            <li key={kategori.slug}>
              <Link
                href={`/atlas/kategori/${kategori.slug}/`}
                className="group flex items-center justify-between gap-4 bg-zemin px-5 py-4 transition-colors hover:bg-yuzey/60"
              >
                <span className="flex items-baseline gap-3">
                  <span className="etiket-mono text-metin-soluk">
                    {String(sira + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[0.9375rem] text-metin-ikincil group-hover:text-metin">
                    {kategori.ad}
                  </span>
                </span>
                <span
                  className="etiket-mono shrink-0 text-metin-soluk tabular-nums"
                  title={`Yayında ${kategoriAdedi(kategori.slug)} · hedef ${kategori.adet}`}
                >
                  {kategoriAdedi(kategori.slug)}
                  <span className="text-kenar-guclu">/{kategori.adet}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Girdiler --- */}
      <Bolum kimlik="girdiler" zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="GİRDİLER"
          baslik="Yayındaki kavramlar"
          aciklama="Her girdi answer-first başlar: ilk paragraf tek cümlelik, kaynak gösterilebilir bir tanımdır."
        />

        <KartIzgarasi kolon={3}>
          {ATLAS.map((girdi) => (
            <Kart
              key={girdi.slug}
              yol={`/atlas/${girdi.slug}/`}
              ustEtiket={girdi.kategori}
              baslik={girdi.ad}
              aciklama={girdi.kisaTanim}
              rozetler={girdi.ilgili.slice(0, 3).map((ilgi) => (
                <KartEtiketi key={ilgi}>{ilgi}</KartEtiketi>
              ))}
              altBilgi={
                <span className="inline-flex items-center gap-3">
                  <span>{SEVIYE_ADI[girdi.seviye]}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Onay className="size-3.5 text-basari" />
                    {tarihUzun(girdi.sonDogrulama)}
                  </span>
                </span>
              }
            />
          ))}
        </KartIzgarasi>
      </Bolum>
    </>
  );
}
