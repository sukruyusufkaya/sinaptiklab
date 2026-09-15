import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Hedef, Ok } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { TestMotoru } from '@/components/test/TestMotoru';
import { ogrenmeYollari, seviyeTestiSorulari, testler } from '@/lib/icerik/ogrenme';
// SEVIYE_BASAMAKLARI (skor basamakları) ve SEVIYE_TESTI_ALANLARI (ölçüm
// boyutları) yapılandırmadır; koleksiyona tohumlanmadı, fixture'da kalıyor.
import { SEVIYE_BASAMAKLARI, SEVIYE_TESTI_ALANLARI } from '@/lib/veri/ogrenme';

export const metadata: Metadata = {
  title: 'Seviyeni Ölç — AI Knowledge Test',
  description:
    '15 soruluk Sinaptik AI Knowledge Test. Bildiklerini değil nerede eksiğin olduğunu gösterir; sonuç doğrudan bir öğrenme yoluna bağlanır.',
  alternates: { canonical: '/seviye-testi/' },
};

export default async function SeviyeTestiSayfasi() {
  const SEVIYE_TESTI_SORULARI = await seviyeTestiSorulari();
  const OGRENME_YOLLARI = await ogrenmeYollari();
  const TESTLER = await testler();
  const onerilenYol = OGRENME_YOLLARI.find((yol) => yol.slug === 'generative-ai-engineer');

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Seviyeni Ölç', yol: '/seviye-testi/' }]}
        etiket="ÖLÇÜM"
        baslik="Yapay zekâ seviyen kaç?"
        ozet={`${SEVIYE_TESTI_SORULARI.length} soruluk AI Knowledge Test, dört boyutta bilgi haritanı çıkarır. Sonuç bir puan değil bir yol haritasıdır.`}
        olcumler={[
          { deger: `${SEVIYE_TESTI_SORULARI.length}`, etiket: 'Soru' },
          { deger: '~8 dk', etiket: 'Süre' },
          { deger: '4', etiket: 'Ölçüm alanı' },
          { deger: '4', etiket: 'Seviye basamağı' },
        ]}
        eylemler={
          <>
            <Dugme href="/seviye-testi/#coz" boyut="lg">
              <Hedef className="size-4" />
              Teste başla
            </Dugme>
            <Dugme href="/testler/" gorunum="ikincil" boyut="lg">
              Konu testleri
            </Dugme>
          </>
        }
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-6">
            <p className="etiket-mono mb-4 text-metin">Örnek sonuç</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-medium tracking-tighter tabular-nums">
                58
              </span>
              <span className="font-mono text-lg text-metin-soluk">/100</span>
            </div>
            <p className="mt-1 text-sm font-medium text-ikincil">AI Explorer</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-yuzey-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ikincil to-vurgu"
                style={{ width: '58%' }}
              />
            </div>
            <div className="mt-6 rounded-xl border border-vurgu/30 bg-vurgu-zemin/60 p-4">
              <p className="etiket-mono mb-1.5 text-vurgu-parlak">Önerilen rota</p>
              <p className="text-sm font-medium text-metin">Generative AI Engineer</p>
              <p className="mt-1 text-xs text-metin-ikincil">
                Eksik önkoşul: Embeddings · Vector Search
              </p>
            </div>
          </div>
        }
      />

      <Bolum kimlik="coz">
        <BolumBasligi
          numara="01"
          etiket="ÇÖZ"
          baslik="AI Knowledge Test"
          aciklama="Dört boyutta karışık sorular. Her cevaptan sonra açıklama gösterilir; sonuçta beceri kırılımı ve rota önerisi alırsın."
        />
        <TestMotoru
          testSlug="seviye-testi"
          sorular={SEVIYE_TESTI_SORULARI}
          basamaklar={SEVIYE_BASAMAKLARI}
          alanBasligi="Beceri kırılımı"
          oneri={
            onerilenYol
              ? {
                  ad: onerilenYol.ad,
                  yol: `/ogren/yollar/${onerilenYol.slug}/`,
                  not: `${onerilenYol.bolum} bölüm · ${onerilenYol.seviyeAraligi}`,
                }
              : undefined
          }
        />
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="ÖLÇÜM ALANLARI"
          baslik="Dört boyut"
          aciklama="Sorular tek konuya yığılmaz; her boyut kendi alt skorunu üretir."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {SEVIYE_TESTI_ALANLARI.map((alan, sira) => (
            <li key={alan} className="bg-zemin p-6">
              <span className="etiket-mono text-vurgu-parlak">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-[0.9375rem] leading-snug font-medium text-metin">{alan}</p>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum>
        <BolumBasligi numara="03" etiket="BASAMAKLAR" baslik="Skor ne anlama geliyor?" />
        <ul className="space-y-3">
          {SEVIYE_BASAMAKLARI.map((basamak) => (
            <li
              key={basamak.ad}
              className="flex flex-col gap-3 rounded-2xl border border-kenar bg-yuzey/40 p-5 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="flex items-center gap-3 sm:w-52">
                <span
                  className={`size-3 shrink-0 rounded-full ${basamak.renk}`}
                  aria-hidden="true"
                />
                <span className="text-[0.9375rem] font-semibold tracking-tight text-metin">
                  {basamak.ad}
                </span>
              </span>
              <span className="etiket-mono w-16 shrink-0 text-metin-soluk tabular-nums">
                {basamak.aralik}
              </span>
              <span className="flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {basamak.tarif}
              </span>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="04"
          etiket="SONRASI"
          baslik="Test bittiğinde ne oluyor?"
          aciklama="Skor bir son değil başlangıç noktasıdır."
        />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {[
            { ad: 'Alt skorlar', tarif: 'Dört boyutta ayrı ayrı puan.' },
            { ad: 'Eksik düğümler', tarif: 'Beceri grafiğinde işaretlenen boşluklar.' },
            { ad: 'Önerilen rota', tarif: 'Eksikleri kapatan en kısa öğrenme yolu.' },
            { ad: 'Takip', tarif: 'Rotayı tamamladıkça skorun yeniden ölçülmesi.' },
          ].map((adim, sira) => (
            <li key={adim.ad} className="bg-zemin p-6">
              <span className="etiket-mono grid size-7 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                {sira + 1}
              </span>
              <p className="mt-3.5 text-[0.9375rem] font-medium text-metin">{adim.ad}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-metin-soluk">{adim.tarif}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-kenar bg-zemin-derin p-6">
          <p className="etiket-mono mb-4 text-metin">Sonuca göre önerilen rotalar</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {OGRENME_YOLLARI.slice(0, 4).map((yol) => (
              <li key={yol.slug}>
                <Link
                  href={`/ogren/yollar/${yol.slug}/`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-kenar bg-yuzey/40 px-4 py-3 transition-colors hover:border-vurgu/45"
                >
                  <span>
                    <span className="block text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                      {yol.ad}
                    </span>
                    <span className="etiket-mono mt-0.5 block text-metin-soluk">
                      {yol.seviyeAraligi}
                    </span>
                  </span>
                  <Ok className="size-4 shrink-0 text-metin-soluk" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Bolum>

      <Bolum>
        <BolumBasligi
          numara="05"
          etiket="KONU TESTLERİ"
          baslik="Daha derin ölçüm"
          baglantiYolu="/testler/"
        />
        <ul className="flex flex-wrap gap-2">
          {TESTLER.map((test) => (
            <li key={test.slug}>
              <Link
                href={`/testler/${test.slug}/`}
                className="inline-flex items-center gap-2 rounded-full border border-kenar bg-yuzey/40 px-4 py-2 text-sm text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
              >
                {test.ad}
                <span className="etiket-mono text-metin-soluk">{test.soruSayisi}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="ÜYELİK"
        baslik="Sonucunu kaydetmek için üye ol"
        metin="Üyelik, skorunu beceri grafiğine işler ve rotadaki ilerlemeni takip eder. Tüm testler ve rotalar üyelik olmadan da açık."
        eylemler={
          <>
            <Dugme href="/uye-ol/">
              Üye ol
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/giris/" gorunum="ikincil">
              Giriş yap
            </Dugme>
          </>
        }
      />
    </>
  );
}
