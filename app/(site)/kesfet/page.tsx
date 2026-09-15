import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { Atlas, Dugum, Grafik, Hedef, Kitap, Kod, Terazi, Bina } from '@/components/arayuz/Ikonlar';
import { atlasListesi } from '@/lib/icerik/atlas';
import { konuListesi } from '@/lib/icerik/temel';
import { rehberListesi } from '@/lib/icerik/yayin';
import { aracListesi, KARSILASTIRMALAR, modelListesi, sirketListesi } from '@/lib/icerik/varliklar';
import { sektorler } from '@/lib/icerik/kurumsal';
import { meslekler } from '@/lib/icerik/lab';
import { ATLAS_KATEGORILERI } from '@/lib/taksonomi';

export const metadata: Metadata = {
  title: 'Keşfet — Kavramlar, Modeller, Araçlar',
  description:
    'Yapay zekâ bilgi grafiği: kavram atlası, rehberler, konu merkezleri, model veritabanı, araç seçkisi, şirketler, karşılaştırmalar, kariyer ve sektörler.',
  alternates: { canonical: '/kesfet/' },
};

export default async function KesfetSayfasi() {
  const [ATLAS, REHBERLER, KONU_LISTESI, MODELLER, ARACLAR, SIRKETLER, MESLEKLER, SEKTORLER] =
    await Promise.all([
      atlasListesi(),
      rehberListesi(),
      konuListesi(),
      modelListesi(),
      aracListesi(),
      sirketListesi(),
      meslekler(),
      sektorler(),
    ]);

  // Aile kartlarindaki sayaclar veriden gelir; sabit dizi modul duzeyinde
  // kurulamadigi icin bilesen govdesine tasindi.
  const AILELER = [
    {
      yol: '/atlas/',
      ad: 'AI Atlas',
      ozet: 'Kavramların kalıcı referansı. Tek URL, tek konu, alıntılanabilir tanım.',
      Ikon: Atlas,
      sayi: `${ATLAS.length} girdi yayında`,
    },
    {
      yol: '/rehber/',
      ad: 'Rehberler',
      ozet: 'Kavramdan uygulamaya: adım adım mimari ve karar rehberleri.',
      Ikon: Kitap,
      sayi: `${REHBERLER.length} rehber`,
    },
    {
      yol: '/konu/',
      ad: 'Konu Merkezleri',
      ozet: 'Bir konunun tüm formatları tek sayfada toplanır.',
      Ikon: Dugum,
      sayi: `${KONU_LISTESI.length} konu`,
    },
    {
      yol: '/modeller/',
      ad: 'AI Modelleri',
      ozet: 'Model veritabanı: yetenekler, bağlam, lisans ve doğrulama tarihi.',
      Ikon: Grafik,
      sayi: `${MODELLER.length} aile`,
    },
    {
      yol: '/karsilastir/',
      ad: 'Karşılaştırmalar',
      ozet: 'Model ve araç kıyasları; yalnızca editoryal değer taşıyanlar.',
      Ikon: Terazi,
      sayi: `${KARSILASTIRMALAR.length} kıyas`,
    },
    {
      yol: '/araclar/',
      ad: 'AI Araçları',
      ozet: 'Editoryal seçki — araç çöplüğü değil, kategori incelemesi.',
      Ikon: Kod,
      sayi: `${ARACLAR.length} inceleme`,
    },
    {
      yol: '/sirketler/',
      ad: 'AI Şirketleri',
      ozet: 'Varlık sayfaları: ürünler, modeller ve kilometre taşları.',
      Ikon: Bina,
      sayi: `${SIRKETLER.length} şirket`,
    },
    {
      yol: '/kariyer/',
      ad: 'Kariyerler',
      ozet: 'Meslekler, beceriler, rotalar ve ölçüm testleri.',
      Ikon: Hedef,
      sayi: `${MESLEKLER.length} meslek`,
    },
  ];

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Keşfet', yol: '/kesfet/' }]}
        etiket="UNDERSTAND"
        baslik="Keşfet"
        ozet="Gündem trafik getirir, Keşfet otorite kurar. Buradaki her sayfa bir varlığı tarif eder: kavram, model, araç, şirket, meslek veya sektör."
        olcumler={[
          { deger: `${ATLAS_KATEGORILERI.length}`, etiket: 'Konu kümesi' },
          { deger: `${MODELLER.length}`, etiket: 'Model ailesi' },
          { deger: `${SIRKETLER.length}`, etiket: 'Şirket' },
          { deger: `${SEKTORLER.length}`, etiket: 'Sektör' },
        ]}
      />

      <Bolum kimlik="aileler">
        <BolumBasligi
          numara="01"
          etiket="BİLGİ GRAFİĞİ"
          baslik="İçerik aileleri"
          aciklama="Site mimarisinin temel nesnesi makale değil varlıktır. Makale varlık hakkında bilgi verir, ders onu öğretir, test ölçer."
        />

        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {AILELER.map(({ yol, ad, ozet, Ikon, sayi }) => (
            <li key={yol}>
              <Link
                href={yol}
                className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
              >
                <Ikon className="size-5 text-metin-soluk transition-colors group-hover:text-vurgu-parlak" />
                <span className="mt-4 block text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                  {ad}
                </span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-metin-soluk">{ozet}</span>
                <span className="etiket-mono mt-4 block text-metin-soluk">{sayi}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum kimlik="konular" zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="KONULAR"
          baslik="Nereden başlamak istersin?"
          baglantiYolu="/konu/"
          baglantiMetni="Tüm konular"
        />
        <KartIzgarasi kolon={3}>
          {KONU_LISTESI.slice(0, 6).map((konu) => (
            <Kart
              key={konu.slug}
              yol={`/konu/${konu.slug}/`}
              ustEtiket={konu.kume}
              baslik={konu.ad}
              aciklama={`${konu.ad} hakkındaki kavramlar, haberler, analizler ve öğrenme kaynakları.`}
              rozetler={<KartEtiketi>Konu merkezi</KartEtiketi>}
              altBilgi={<span>Merkezi aç</span>}
            />
          ))}
        </KartIzgarasi>
      </Bolum>

      <Bolum kimlik="sektorler">
        <BolumBasligi
          numara="03"
          etiket="UYGULAMA"
          baslik="Sektörlerde yapay zekâ"
          baglantiYolu="/sektor/"
          baglantiMetni="Tüm sektörler"
        />
        <ul className="flex flex-wrap gap-2">
          {SEKTORLER.map((sektor) => (
            <li key={sektor.slug}>
              <Link
                href={`/sektor/${sektor.slug}/`}
                className="group flex items-center gap-2.5 rounded-full border border-kenar bg-yuzey/40 py-2 pr-2.5 pl-4 transition-colors hover:border-vurgu/45"
              >
                <span className="text-sm text-metin-ikincil group-hover:text-metin">
                  {sektor.ad}
                </span>
                <span className="etiket-mono rounded-full bg-yuzey-3 px-1.5 py-0.5 text-metin-soluk tabular-nums">
                  {sektor.kullanimSayisi}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}
