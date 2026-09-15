import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { Dugme } from '@/components/arayuz/Dugme';
import { Dugum, Hedef, Katman, Ok, Saat } from '@/components/arayuz/Ikonlar';
import { dersler, ogrenmeYollari, testler } from '@/lib/icerik/ogrenme';
import { HEDEFLER, ROLLER } from '@/lib/veri/ogrenme';
import { SEVIYE_ADI } from '@/lib/taksonomi';

export const metadata: Metadata = {
  title: 'Öğren — Yapay Zekâyı Öğrenmenin En Sistematik Yolu',
  description:
    'Rolünü, seviyeni ve hedefini seç; beceri grafiği eksik önkoşullarını bulsun. Öğrenme yolları, dersler, testler ve projeler.',
  alternates: { canonical: '/ogren/' },
};

export default async function OgrenSayfasi() {
  const [OGRENME_YOLLARI, DERSLER, TESTLER] = await Promise.all([
    ogrenmeYollari(),
    dersler(),
    testler(),
  ]);
  const toplamSaat = OGRENME_YOLLARI.reduce((t, yol) => t + yol.saat, 0);

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Öğren', yol: '/ogren/' }]}
        etiket="LEARN"
        baslik="Yapay zekâyı öğrenmenin en sistematik yolu"
        ozet="Rastgele video listesi değil bir grafik. Her bölüm aynı döngüyle ilerler: teori → örnek → lab → test → proje. Önkoşullar beceri grafiğinden gelir."
        olcumler={[
          { deger: `${OGRENME_YOLLARI.length}`, etiket: 'Öğrenme yolu' },
          { deger: `${DERSLER.length}`, etiket: 'Ders' },
          { deger: `${TESTLER.length}`, etiket: 'Test' },
          { deger: `${toplamSaat} sa`, etiket: 'Toplam içerik' },
        ]}
        eylemler={
          <>
            <Dugme href="/seviye-testi/">
              Seviyeni ölç
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/ogren/yollar/" gorunum="ikincil">
              Tüm rotalar
            </Dugme>
          </>
        }
      />

      {/* --- Kişiselleştirme --- */}
      <Bolum kimlik="rotani-kur">
        <BolumBasligi
          numara="01"
          etiket="KİŞİSELLEŞTİR"
          baslik="Rotanı kur"
          aciklama="Üç soru: kimsin, nerede duruyorsun, nereye gitmek istiyorsun? Sistem geri kalanını beceri grafiğinden çıkarır."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <span className="etiket-mono text-vurgu-parlak">01 · Rolüm</span>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ROLLER.map((rol) => (
                <li
                  key={rol}
                  className="rounded-full border border-kenar bg-zemin/60 px-3 py-1.5 text-xs text-metin-ikincil"
                >
                  {rol}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <span className="etiket-mono text-vurgu-parlak">02 · Seviyem</span>
            <ul className="mt-4 flex flex-wrap gap-2">
              {['Başlangıç', 'Orta', 'İleri'].map((seviye) => (
                <li
                  key={seviye}
                  className="rounded-full border border-kenar bg-zemin/60 px-3 py-1.5 text-xs text-metin-ikincil"
                >
                  {seviye}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-metin-soluk">
              Emin değilsen 15 soruluk seviye testi seni doğru basamağa yerleştirir.
            </p>
          </div>

          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <span className="etiket-mono text-vurgu-parlak">03 · Hedefim</span>
            <ul className="mt-4 space-y-1.5">
              {HEDEFLER.map((hedef) => (
                <li key={hedef} className="text-xs text-metin-ikincil">
                  {hedef}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-kenar-guclu bg-zemin-derin p-6">
          <Dugum className="size-5 text-ikincil" />
          <p className="flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
            Kişiselleştirilmiş rota üretimi üyelik gerektirir. Üye olmadan da tüm rotalar, dersler
            ve testler açık ve taranabilir durumda.
          </p>
          <Dugme href="/uye-ol/" boyut="sm">
            Üye ol
          </Dugme>
        </div>
      </Bolum>

      {/* --- Yollar --- */}
      <Bolum kimlik="yollar" zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="ROTALAR"
          baslik="Öğrenme yolları"
          baglantiYolu="/ogren/yollar/"
        />
        <KartIzgarasi kolon={3}>
          {OGRENME_YOLLARI.map((yol) => (
            <Kart
              key={yol.slug}
              yol={`/ogren/yollar/${yol.slug}/`}
              ustEtiket={yol.rol}
              baslik={yol.ad}
              aciklama={yol.aciklama}
              rozetler={yol.cikti.map((cikti) => (
                <KartEtiketi key={cikti}>{cikti}</KartEtiketi>
              ))}
              altBilgi={
                <span className="inline-flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Katman className="size-3.5" />
                    {yol.bolum} bölüm
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Saat className="size-3.5" />~{yol.saat} sa
                  </span>
                </span>
              }
            />
          ))}
        </KartIzgarasi>
      </Bolum>

      {/* --- Beceri grafiği --- */}
      <Bolum kimlik="beceri">
        <BolumBasligi
          numara="03"
          etiket="GRAFİK"
          baslik="Beceri grafiği"
          aciklama="Rotalar düz liste değil yönlü bir grafiktir. Bir kavramı öğrenmek için gereken önkoşullar buradan okunur."
          baglantiYolu="/ogren/beceri-grafigi/"
          baglantiMetni="Grafiği aç"
        />
        <div className="rounded-2xl border border-kenar bg-zemin-derin p-6">
          <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
            Örnek: <span className="text-metin">RAG</span> öğrenmek isteyen bir kullanıcıda{' '}
            <span className="text-metin">Embedding</span> eksikse, sistem önce onu önerir.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs">
            {['Machine Learning', 'Deep Learning', 'Transformer', 'Embedding', 'RAG'].map(
              (dugum, sira, dizi) => (
                <span key={dugum} className="flex items-center gap-2.5">
                  <span className="rounded-full border border-kenar bg-yuzey/50 px-3 py-1.5 text-metin-ikincil">
                    {dugum}
                  </span>
                  {sira < dizi.length - 1 && (
                    <span className="text-metin-soluk" aria-hidden="true">
                      →
                    </span>
                  )}
                </span>
              ),
            )}
          </div>
        </div>
      </Bolum>

      {/* --- Dersler & testler --- */}
      <Bolum kimlik="ders-test" zemin="derin">
        <BolumBasligi numara="04" etiket="ÖĞREN VE ÖLÇ" baslik="Dersler ve testler" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-kenar-soluk pb-3.5">
              <p className="etiket-mono text-metin">Öne çıkan dersler</p>
              <Link href="/ogren/dersler/" className="etiket-mono text-vurgu-parlak">
                Tümü →
              </Link>
            </div>
            <ul className="divide-y divide-kenar-soluk">
              {DERSLER.slice(0, 5).map((ders) => (
                <li key={ders.slug} className="group">
                  <Link href={`/ogren/dersler/${ders.slug}/`} className="block py-3">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                        {ders.ad}
                      </span>
                      <span className="etiket-mono shrink-0 text-metin-soluk">
                        {ders.dakika} dk
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-metin-soluk">
                      {SEVIYE_ADI[ders.seviye]} · {ders.ozet}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-kenar-soluk pb-3.5">
              <p className="etiket-mono text-metin">Konu testleri</p>
              <Link href="/testler/" className="etiket-mono text-vurgu-parlak">
                Tümü →
              </Link>
            </div>
            <ul className="divide-y divide-kenar-soluk">
              {TESTLER.slice(0, 5).map((test) => (
                <li key={test.slug} className="group">
                  <Link href={`/testler/${test.slug}/`} className="block py-3">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                        {test.ad}
                      </span>
                      <span className="etiket-mono shrink-0 text-metin-soluk">
                        {test.soruSayisi} soru
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-metin-soluk">{test.ozet}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Bolum>

      {/* --- Academy --- */}
      <Bolum kimlik="akademi">
        <div className="relative overflow-hidden rounded-3xl border border-kenar bg-zemin-derin p-6 sm:p-10">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="izgara-zemin absolute inset-0 opacity-40" />
            <div className="absolute -bottom-28 left-1/4 h-72 w-[30rem] rounded-full bg-vurgu/14 blur-[110px]" />
          </div>
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <div>
              <div className="flex items-center gap-2">
                <Hedef className="size-4 text-vurgu-parlak" />
                <span className="etiket-mono text-vurgu-parlak">SINAPTIK ACADEMY</span>
              </div>
              <h2 className="mt-4 max-w-xl text-2xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-3xl">
                Ücretsiz derslerden kapsamlı programlara
              </h2>
              <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-metin-ikincil">
                Academy üç katmandan oluşur: mikro dersler ücretsiz, yapılandırılmış rotalar açık,
                kapsamlı programlar premium.
              </p>
              <div className="mt-7">
                <Dugme href="/akademi/">
                  Academy&apos;i incele
                  <Ok className="size-4" />
                </Dugme>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                { ad: 'Learn', tarif: 'Ücretsiz mikro dersler', durum: 'Açık' },
                { ad: 'Path', tarif: 'Yapılandırılmış öğrenme yolları', durum: 'Açık' },
                { ad: 'Programs', tarif: 'Premium kapsamlı programlar', durum: 'Yakında' },
              ].map((katman) => (
                <li
                  key={katman.ad}
                  className="flex items-center justify-between gap-4 rounded-xl border border-kenar bg-yuzey/50 p-4"
                >
                  <span>
                    <span className="block text-sm font-medium text-metin">{katman.ad}</span>
                    <span className="block text-xs text-metin-soluk">{katman.tarif}</span>
                  </span>
                  <span className="etiket-mono shrink-0 text-metin-soluk">{katman.durum}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Bolum>
    </>
  );
}
