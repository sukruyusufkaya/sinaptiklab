import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Bina, Hedef, Ok } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { hizmetler, sektorler, SUREC_ADIMLARI, vakalar } from '@/lib/icerik/kurumsal';

export const metadata: Metadata = {
  title: 'Kurumsal — Yapay Zekâ Danışmanlığı ve Projeleri',
  description:
    'Stratejiden PoC’ye, kurumsal eğitimden üretim sistemlerine kadar uçtan uca yapay zekâ dönüşümü. AI stratejisi, RAG, ajan otomasyonu, computer vision, yönetişim ve MLOps.',
  alternates: { canonical: '/kurumsal/' },
};

export default async function KurumsalSayfasi() {
  const [HIZMETLER, SEKTORLER, VAKALAR] = await Promise.all([hizmetler(), sektorler(), vakalar()]);

  return (
    <>
      <ListeSemasi
        ad="Kurumsal hizmetler"
        ogeler={HIZMETLER.map((hizmet) => ({ ad: hizmet.ad, yol: `/kurumsal/${hizmet.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Kurumsal', yol: '/kurumsal/' }]}
        etiket="BUILD"
        baslik="Yapay zekâyı gerçek iş sonuçlarına dönüştürün"
        ozet="Pilot çokluğu dönüşüm değildir. Ölçülebilir başarı tanımı olmayan bir yapay zekâ girişimi, ne kadar iyi çalışsa da iş sonucuna bağlanamaz."
        olcumler={[
          { deger: `${HIZMETLER.length}`, etiket: 'Hizmet hattı' },
          { deger: `${SEKTORLER.length}`, etiket: 'Sektör' },
          { deger: `${VAKALAR.length}`, etiket: 'Vaka çalışması' },
          { deger: `${SUREC_ADIMLARI.length}`, etiket: 'Süreç adımı' },
        ]}
        eylemler={
          <>
            <Dugme href="/kurumsal/ai-readiness/" boyut="lg">
              <Hedef className="size-4" />
              AI Readiness değerlendirmesi
            </Dugme>
            <Dugme href="/iletisim/" gorunum="ikincil" boyut="lg">
              Projenizi konuşalım
            </Dugme>
          </>
        }
      />

      {/* --- Hizmetler --- */}
      <Bolum kimlik="hizmetler">
        <BolumBasligi
          numara="01"
          etiket="HİZMET HATLARI"
          baslik="Ne yapıyoruz?"
          aciklama="Her hizmet sayfası aynı yapıyı izler: problem → çözüm → kullanım alanları → mimari → güvenlik → yaklaşım → vaka → SSS."
        />

        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {HIZMETLER.map((hizmet, sira) => (
            <li key={hizmet.slug}>
              <Link
                href={`/kurumsal/${hizmet.slug}/`}
                className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">
                  {String(sira + 1).padStart(2, '0')}
                </span>
                <span className="mt-3 block text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                  {hizmet.ad}
                </span>
                <span className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                  {hizmet.ozet}
                </span>
                <span className="etiket-mono mt-4 flex items-center gap-2 text-metin-soluk">
                  {hizmet.kullanimAlanlari.length} kullanım alanı
                  <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Süreç --- */}
      <Bolum kimlik="surec" zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="YAKLAŞIM"
          baslik="Discovery'den üretime"
          aciklama="Her adımın çıktısı yazılıdır; bir sonraki adıma geçiş kararı ölçüme dayanır."
        />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {SUREC_ADIMLARI.map((adim, sira) => (
            <li key={adim.ad} className="bg-zemin p-6">
              <span className="etiket-mono grid size-7 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                {sira + 1}
              </span>
              <p className="mt-3.5 text-[1.0625rem] font-semibold tracking-tight text-metin">
                {adim.ad}
              </p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-metin-ikincil">{adim.ozet}</p>
            </li>
          ))}
        </ol>
      </Bolum>

      {/* --- Sektörler --- */}
      <Bolum kimlik="sektorler">
        <BolumBasligi
          numara="03"
          etiket="SEKTÖRLER"
          baslik="Sektörlerde yapay zekâ"
          baglantiYolu="/sektor/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {SEKTORLER.map((sektor) => (
            <li key={sektor.slug}>
              <Link
                href={`/sektor/${sektor.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {sektor.ad}
                  </span>
                  <span className="etiket-mono shrink-0 text-metin-soluk tabular-nums">
                    {sektor.kullanimSayisi}
                  </span>
                </span>
                <span className="mt-1.5 text-xs text-metin-soluk">{sektor.ozet}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Vakalar --- */}
      <Bolum kimlik="vakalar" zemin="derin">
        <BolumBasligi
          numara="04"
          etiket="KANIT"
          baslik="Vaka çalışmaları"
          aciklama="Her vaka problemi, yaklaşımı, kullanılan teknolojiyi ve öğrenilen dersleri açıkça yazar."
          baglantiYolu="/vaka-calismalari/"
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {VAKALAR.slice(0, 4).map((vaka) => (
            <li key={vaka.slug}>
              <Link
                href={`/vaka-calismalari/${vaka.slug}/`}
                className="group flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-vurgu/45 hover:bg-yuzey/70"
              >
                <span className="etiket-mono text-vurgu-parlak">{vaka.sektor}</span>
                <span className="mt-3 block text-[1.0625rem] leading-snug font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                  {vaka.baslik}
                </span>
                <span className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                  {vaka.problem}
                </span>
                <span className="mt-4 flex flex-wrap gap-1.5">
                  {vaka.teknolojiler.slice(0, 3).map((teknoloji) => (
                    <span
                      key={teknoloji}
                      className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk"
                    >
                      {teknoloji}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Editoryal bağımsızlık --- */}
      <Bolum>
        <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6 sm:p-8">
          <Bina className="size-5 text-vurgu-parlak" />
          <p className="mt-4 text-[1.125rem] font-semibold tracking-tight text-metin">
            Danışmanlık ile editoryal içerik arasındaki duvar
          </p>
          <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-metin-ikincil">
            Kurumsal hizmet ile medya içeriğinin aynı marka altında bulunması avantajdır ama risk
            taşır. Bu yüzden benchmark ve araştırma sonuçları danışmanlık müşterilerinden bağımsız
            yürütülür; bir şirketin müşteri olması değerlendirmede lehine sonuç üretmez.{' '}
            <Link
              href="/editoryal-ilkeler/"
              className="text-vurgu-parlak underline underline-offset-4"
            >
              Editoryal ilkeler
            </Link>
          </p>
        </div>
      </Bolum>

      <KapanisCagrisi
        etiket="BAŞLANGIÇ"
        baslik="Nereden başlayacağınızı bilmiyorsanız"
        metin="AI Readiness değerlendirmesi yedi boyutta olgunluk skoru üretir ve en yüksek getirili ilk adımı işaret eder."
        eylemler={
          <>
            <Dugme href="/kurumsal/ai-readiness/">
              Değerlendirmeyi başlat
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/kurumsal/egitim/" gorunum="ikincil">
              Kurumsal eğitim
            </Dugme>
          </>
        }
      />
    </>
  );
}
