import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Ara } from '@/components/arayuz/Ikonlar';
import { CanliArama } from '@/components/duzen/CanliArama';
import { siteAramaDizini } from '@/lib/arama-dizini';
import { atlasListesi } from '@/lib/icerik/atlas';
import { konuListesi } from '@/lib/icerik/temel';
import { modelListesi } from '@/lib/icerik/varliklar';
import { ogrenmeYollari, testler } from '@/lib/icerik/ogrenme';
import { arastirmaListesi } from '@/lib/icerik/arastirma';
import { hizmetler } from '@/lib/icerik/kurumsal';

export const metadata: Metadata = {
  title: 'Ara',
  description:
    'Kavram, model, ders, haber, araştırma ve kurumsal sayfaları birlikte tarayan arama. Hızlı erişim için ⌘K.',
  alternates: { canonical: '/ara/' },
  robots: { index: false, follow: true },
};

export default async function AraSayfasi() {
  // Arama sayfası aramanın kendisidir: dizini doğrudan prop olarak alır.
  const DIZIN = await siteAramaDizini();
  const [ATLAS, KONU_LISTESI, MODELLER, OGRENME_YOLLARI, TESTLER, ARASTIRMA, HIZMETLER] =
    await Promise.all([
      atlasListesi(),
      konuListesi(),
      modelListesi(),
      ogrenmeYollari(),
      testler(),
      arastirmaListesi(),
      hizmetler(),
    ]);

  // Goz at seridi veriden turetildigi icin sabit dizi bilesen govdesinde
  // kurulur; modul yuklenirken listeler henuz bilinmiyor.
  const GRUPLAR = [
    {
      ad: 'Kavramlar',
      yol: '/atlas/',
      ogeler: ATLAS.slice(0, 6).map((g) => ({ ad: g.ad, yol: `/atlas/${g.slug}/` })),
    },
    {
      ad: 'Konu merkezleri',
      yol: '/konu/',
      ogeler: KONU_LISTESI.slice(0, 6).map((k) => ({ ad: k.ad, yol: `/konu/${k.slug}/` })),
    },
    {
      ad: 'Modeller',
      yol: '/modeller/',
      ogeler: MODELLER.slice(0, 6).map((m) => ({ ad: m.ad, yol: `/modeller/${m.slug}/` })),
    },
    {
      ad: 'Öğrenme yolları',
      yol: '/ogren/yollar/',
      ogeler: OGRENME_YOLLARI.slice(0, 6).map((y) => ({
        ad: y.ad,
        yol: `/ogren/yollar/${y.slug}/`,
      })),
    },
    {
      ad: 'Testler',
      yol: '/testler/',
      ogeler: TESTLER.slice(0, 6).map((t) => ({ ad: t.ad, yol: `/testler/${t.slug}/` })),
    },
    {
      ad: 'Araştırma',
      yol: '/arastirma/',
      ogeler: ARASTIRMA.slice(0, 6).map((a) => ({ ad: a.baslik, yol: `/arastirma/${a.slug}/` })),
    },
    {
      ad: 'Kurumsal',
      yol: '/kurumsal/',
      ogeler: HIZMETLER.slice(0, 6).map((h) => ({ ad: h.ad, yol: `/kurumsal/${h.slug}/` })),
    },
  ];

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Ara', yol: '/ara/' }]}
        etiket="ARAMA"
        baslik="Sitede ara"
        ozet="Arama; kavram, model, ders, haber, araştırma ve kurumsal sayfaları birlikte tarar. Hızlı erişim için klavyeden ⌘K (veya Ctrl+K) kullanabilirsiniz."
        eylemler={
          <span className="inline-flex items-center gap-2.5 rounded-full border border-kenar bg-yuzey/60 px-4 py-2.5 text-sm text-metin-ikincil">
            <Ara className="size-4" />
            Komut paletini açmak için
            <kbd className="etiket-mono rounded border border-kenar bg-zemin px-1.5 py-1 text-[0.625rem]">
              ⌘K
            </kbd>
          </span>
        }
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="CANLI ARAMA"
          baslik="Yazmaya başla"
          aciklama="Dizin; kavram, konu merkezi, rehber, gündem, model, şirket, araç, rota, ders, test, araştırma, dergi, podcast, kurumsal hizmet, sektör, vaka, Lab projesi ve mesleği birlikte tarar."
        />
        <CanliArama dizin={DIZIN} />
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="GÖZ AT"
          baslik="Gruplara göre başla"
          aciklama="Aramanın sonuç üretmediği sorgular kaydedilir ve editoryal yol haritasına girer."
        />

        <div className="space-y-8">
          {GRUPLAR.map((grup) => (
            <section key={grup.ad}>
              <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-kenar pb-2.5">
                <h2 className="text-[1.0625rem] font-semibold tracking-tight">{grup.ad}</h2>
                <Link href={grup.yol} className="etiket-mono text-vurgu-parlak">
                  Tümü →
                </Link>
              </div>
              <ul className="flex flex-wrap gap-2">
                {grup.ogeler.map((oge) => (
                  <li key={oge.yol}>
                    <Link
                      href={oge.yol}
                      className="inline-flex items-center rounded-full border border-kenar bg-yuzey/40 px-3.5 py-1.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
                    >
                      {oge.ad}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Bolum>

      <Bolum>
        <BolumBasligi numara="03" etiket="YAKINDA" baslik="Hibrit arama" />
        <div className="olcu">
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Normal site araması yeterli değil. Hedeflenen yapı dört tür sorguyu birlikte karşılıyor:
            anahtar kelime (&quot;RAG&quot;), anlamsal (&quot;şirket belgelerini modele nasıl
            bağlarım?&quot;), varlık (&quot;Anthropic&quot;) ve içerik tipi (&quot;RAG
            dersleri&quot;).
          </p>
          <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Teknik olarak lexical arama, vektör arama, hibrit sıralama ve yeniden sıralama
            birleştirilecek. Şimdilik komut paleti, adlar ve kısaltmalar üzerinde puanlı arama
            yapıyor.
          </p>
        </div>
      </Bolum>
    </>
  );
}
