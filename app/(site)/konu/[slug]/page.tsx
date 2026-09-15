import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { Dugme } from '@/components/arayuz/Dugme';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { altKonular, konuBul, konuListesi, ustKonu } from '@/lib/icerik/temel';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { atlasBul, atlasListesi } from '@/lib/icerik/atlas';
import { analizler as analizListesi, konuyaGoreGundem, radarBul } from '@/lib/icerik/gundem';
import { dersler as dersListesi, ogrenmeYollari, konuyaGoreTestler } from '@/lib/icerik/ogrenme';
import { arastirmaListesi } from '@/lib/icerik/arastirma';
import { modelListesi } from '@/lib/icerik/varliklar';
import { SEVIYE_ADI } from '@/lib/taksonomi';
import { tarihKisa } from '@/lib/bicim';

export async function generateStaticParams() {
  return (await konuListesi()).map((konu) => ({ slug: konu.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const konu = await konuBul(slug);
  if (!konu) return {};

  const atlas = await atlasBul(konu.slug);
  // Editorun panelden yazdigi SEO alanlari varsayilanlarin uzerine uygulanir.
  return ustveriBirlestir(konu.seo, {
    baslik: `${konu.ad} — Konu Merkezi`,
    aciklama:
      atlas?.kisaTanim ??
      `${konu.ad} hakkındaki kavramlar, haberler, rehberler, araştırmalar, dersler ve testler tek sayfada.`,
    kanonik: `/konu/${konu.slug}/`,
  });
}

export default async function KonuMerkezi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const konu = await konuBul(slug);
  if (!konu) notFound();

  const [atlas, haberler, radar, alt, ust] = await Promise.all([
    atlasBul(konu.slug),
    konuyaGoreGundem(konu.slug),
    radarBul(konu.slug),
    // Ana konuysa alt konuları, alt konuysa üstü. İkisi birbirini dışlar.
    altKonular(konu.slug),
    ustKonu(konu),
  ]);

  const [ATLAS, ANALIZLER, TESTLER, DERSLER, OGRENME_YOLLARI, ARASTIRMA] = await Promise.all([
    atlasListesi(),
    analizListesi(),
    // Bağ `konuSlug` üzerinden kurulur; ana konu alt konularının testlerini de
    // listeler (bkz. `konuyaGoreTestler` başlığı).
    konuyaGoreTestler(
      konu.slug,
      alt.map((altKonu) => altKonu.slug),
    ),
    dersListesi(),
    ogrenmeYollari(),
    arastirmaListesi(),
  ]);

  const analizler = ANALIZLER.filter(
    (analiz) => analiz.konu === konu.ad || analiz.konu === konu.kume,
  );
  const kavramlar = ATLAS.filter(
    (girdi) =>
      girdi.slug !== konu.slug &&
      (girdi.ilgili.some((ilgi) => konu.ad.includes(ilgi)) ||
        girdi.kategori.toLowerCase().includes(konu.kume.toLowerCase())),
  ).slice(0, 6);
  /*
   * Bu sayfa artık SORU BANKASINA HİÇ GİTMİYOR. Eskiden testleri ayırmak için
   * her testin soruları okunuyordu (`ilgiliAtlas` karşılaştırması); bağ
   * `konuSlug`a taşınınca o okumanın gerekçesi kalmadı. 50 konu sayfası ×
   * test başına bir sorgu, derleme anında en pahalı kalemlerden biriydi.
   */
  const testler = TESTLER;
  const dersler = DERSLER.filter((ders) =>
    OGRENME_YOLLARI.some(
      (yol) =>
        yol.slug === ders.yolSlug &&
        (yol.bolumler ?? []).some((bolum) =>
          bolum.kavramlar.some((kavram) => konu.ad.includes(kavram) || kavram === atlas?.ad),
        ),
    ),
  ).slice(0, 4);
  const yayinlar = ARASTIRMA.filter(
    (yayin) =>
      yayin.baslik.toLocaleLowerCase('tr').includes(konu.ad.toLocaleLowerCase('tr')) ||
      yayin.ozet.toLocaleLowerCase('tr').includes(konu.ad.toLocaleLowerCase('tr')),
  ).slice(0, 3);
  const modeller = konu.slug === 'llm' ? (await modelListesi()).slice(0, 3) : [];

  const bosMu =
    !atlas &&
    haberler.length === 0 &&
    analizler.length === 0 &&
    kavramlar.length === 0 &&
    testler.length === 0;

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Konu Merkezleri', yol: '/konu/' },
          // Alt konuysa ana konu kırıntı yoluna girer; hiyerarşi adres
          // çubuğunda görünmüyor (URL düz), tek görünür yer burası.
          ...(ust ? [{ ad: ust.ad, yol: `/konu/${ust.slug}/` }] : []),
          { ad: konu.ad, yol: `/konu/${konu.slug}/` },
        ]}
        etiket={konu.kume}
        baslik={konu.ad}
        ozet={
          // Editörün panelden yazdığı özet kazanır; yoksa Atlas tanımına,
          // o da yoksa üretilen cümleye düşülür.
          konu.ozet ??
          atlas?.kisaTanim ??
          `${konu.ad} başlığı altındaki tüm formatlar: kavramlar, haberler, analizler, araştırmalar, dersler ve testler.`
        }
        olcumler={[
          { deger: `${haberler.length}`, etiket: 'Gündem' },
          { deger: `${kavramlar.length + (atlas ? 1 : 0)}`, etiket: 'Kavram' },
          { deger: `${analizler.length}`, etiket: 'Analiz' },
          { deger: radar ? `${radar.momentum}` : '—', etiket: 'Radar momentum' },
        ]}
        eylemler={
          <>
            {atlas && (
              <Dugme href={`/atlas/${atlas.slug}/`}>
                Kavram girdisini oku
                <Ok className="size-4" />
              </Dugme>
            )}
            {ust && (
              <Dugme href={`/konu/${ust.slug}/`} gorunum="ikincil">
                {ust.ad}
              </Dugme>
            )}
          </>
        }
        yan={
          radar ? (
            <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
              <p className="etiket-mono mb-3 text-sinyal">AI Radar</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-medium tracking-tighter tabular-nums">
                  {radar.momentum}
                </span>
                <span className="font-mono text-sm text-metin-soluk">/100</span>
              </div>
              <p className="mt-1 text-xs text-metin-ikincil">
                {radar.degisim > 0 ? '+' : ''}
                {radar.degisim} son 7 gün
              </p>
              {radar.not && (
                <p className="mt-4 border-t border-kenar-soluk pt-3.5 text-xs leading-relaxed text-metin-soluk">
                  {radar.not}
                </p>
              )}
              <Link
                href="/radar/"
                className="etiket-mono mt-4 inline-flex text-vurgu-parlak hover:opacity-80"
              >
                Radar metodolojisi →
              </Link>
            </div>
          ) : undefined
        }
      />

      {/*
        ALT KONULAR — yalnızca ana konularda.
        Boş durumdan ÖNCE gelir: alt konusu olan bir ana konu, kendi formatı
        henüz üretilmemiş olsa bile boş değildir; okuyucuya gidecek bir yer
        gösterir. Sıra editörün `sira` alanından geliyor (bkz. `altKonular`).
      */}
      {alt.length > 0 && (
        <Bolum kimlik="alt-konular">
          <BolumBasligi
            etiket="ALT KONULAR"
            baslik={`${konu.ad} altındaki ${alt.length} başlık`}
            aciklama="Her alt konu kendi merkezine sahiptir; kavram, haber, ders ve test orada toplanır."
          />
          <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
            {alt.map((altKonu) => (
              <li key={altKonu.slug}>
                <Link
                  href={`/konu/${altKonu.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey-2"
                >
                  <span className="text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {altKonu.ad}
                  </span>
                  {altKonu.ozet && (
                    <span className="mt-2 text-xs leading-relaxed text-metin-soluk">
                      {altKonu.ozet.slice(0, 150)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {bosMu && alt.length === 0 && (
        <Bolum>
          <BosDurum
            baslik={`${konu.ad} merkezi hazırlanıyor`}
            metin="Bu konu için anlamlı minimum içerik kümesi henüz oluşmadı. Kategori, içerik hazır olmadan menüde öne çıkarılmaz."
            eylem={<Dugme href="/konu/">Diğer konu merkezleri</Dugme>}
          />
        </Bolum>
      )}

      {/* --- Kavram --- */}
      {atlas && (
        <Bolum kimlik="kavram">
          <BolumBasligi
            numara="01"
            etiket="KAVRAM"
            baslik={`${konu.ad} nedir?`}
            baglantiYolu={`/atlas/${atlas.slug}/`}
            baglantiMetni="Tam girdi"
          />
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6 sm:p-8">
            <p className="max-w-3xl border-l-2 border-vurgu pl-5 font-serif text-lg leading-relaxed text-metin">
              {atlas.kisaTanim}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {atlas.ilgili.map((ilgi) => (
                <span
                  key={ilgi}
                  className="rounded-full border border-kenar bg-zemin/60 px-3 py-1.5 text-xs text-metin-ikincil"
                >
                  {ilgi}
                </span>
              ))}
            </div>
          </div>
        </Bolum>
      )}

      {/* --- Gündem --- */}
      {haberler.length > 0 && (
        <Bolum kimlik="gundem" zemin="derin">
          <BolumBasligi
            numara="02"
            etiket="DISCOVER"
            baslik="Son gelişmeler"
            baglantiYolu="/gundem/"
            baglantiMetni="Tüm gündem"
          />
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {haberler.map((haber) => (
              <li key={haber.slug} className="group">
                <Link href={haber.yol} className="flex items-start gap-5 py-4">
                  <span className="etiket-mono mt-1 w-14 shrink-0 text-metin-soluk">
                    {tarihKisa(haber.yayinTarihi)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                      {haber.baslik}
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-metin-soluk">
                      {haber.kisaCevap}
                    </span>
                  </span>
                  <span className="etiket-mono mt-1 hidden shrink-0 items-center gap-1.5 text-metin-soluk sm:inline-flex">
                    <Saat className="size-3.5" />
                    {haber.okumaDakika} dk
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {/* --- Analizler --- */}
      {analizler.length > 0 && (
        <Bolum kimlik="analiz">
          <BolumBasligi
            numara="03"
            etiket="ANALİZ"
            baslik="Derinlemesine"
            baglantiYolu="/analiz/"
          />
          <KartIzgarasi kolon={3}>
            {analizler.map((analiz) => (
              <Kart
                key={analiz.slug}
                yol={`/analiz/${analiz.slug}/`}
                ustEtiket={analiz.konu}
                baslik={analiz.baslik}
                aciklama={analiz.girizgah}
                altBilgi={<span>{analiz.okumaDakika} dakikalık okuma</span>}
              />
            ))}
          </KartIzgarasi>
        </Bolum>
      )}

      {/* --- İlgili kavramlar --- */}
      {kavramlar.length > 0 && (
        <Bolum kimlik="kavramlar" zemin="derin">
          <BolumBasligi
            numara="04"
            etiket="ATLAS"
            baslik="İlgili kavramlar"
            aciklama="Semantik komşuluk: bu konuyu anlamak için gereken veya ondan türeyen kavramlar."
            baglantiYolu="/atlas/"
          />
          <KartIzgarasi kolon={3}>
            {kavramlar.map((girdi) => (
              <Kart
                key={girdi.slug}
                yol={`/atlas/${girdi.slug}/`}
                ustEtiket={girdi.kategori}
                baslik={girdi.ad}
                aciklama={girdi.kisaTanim}
                vurguTonu="ikincil"
                altBilgi={<span>{SEVIYE_ADI[girdi.seviye]}</span>}
              />
            ))}
          </KartIzgarasi>
        </Bolum>
      )}

      {/* --- Modeller --- */}
      {modeller.length > 0 && (
        <Bolum kimlik="modeller">
          <BolumBasligi
            numara="05"
            etiket="MODELLER"
            baslik="İlgili modeller"
            baglantiYolu="/modeller/"
          />
          <KartIzgarasi kolon={3}>
            {modeller.map((model) => (
              <Kart
                key={model.slug}
                yol={`/modeller/${model.slug}/`}
                ustEtiket={model.saglayici}
                baslik={model.ad}
                aciklama={model.vurgu}
                rozetler={<KartEtiketi>{model.tip}</KartEtiketi>}
                altBilgi={<span>{model.baglamPenceresi}</span>}
              />
            ))}
          </KartIzgarasi>
        </Bolum>
      )}

      {/* --- Araştırma --- */}
      {yayinlar.length > 0 && (
        <Bolum kimlik="arastirma" zemin="derin">
          <BolumBasligi
            numara="06"
            etiket="RESEARCH"
            baslik="Araştırma ve veri"
            baglantiYolu="/arastirma/"
          />
          <KartIzgarasi kolon={3}>
            {yayinlar.map((yayin) => (
              <Kart
                key={yayin.slug}
                yol={`/arastirma/${yayin.slug}/`}
                ustEtiket={yayin.tur}
                baslik={yayin.baslik}
                aciklama={yayin.ozet}
                vurguTonu="sinyal"
                altBilgi={yayin.veriEtiketi ? <span>{yayin.veriEtiketi}</span> : undefined}
              />
            ))}
          </KartIzgarasi>
        </Bolum>
      )}

      {/* --- Öğrenme --- */}
      {(dersler.length > 0 || testler.length > 0) && (
        <Bolum kimlik="ogren">
          <BolumBasligi
            numara="07"
            etiket="LEARN"
            baslik="Öğren ve ölç"
            aciklama="Aynı konunun öğretim ve ölçüm formatları."
            baglantiYolu="/ogren/"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {dersler.length > 0 && (
              <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
                <p className="etiket-mono mb-4 text-metin">Dersler</p>
                <ul className="divide-y divide-kenar-soluk">
                  {dersler.map((ders) => (
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
                        <span className="mt-1 block text-xs text-metin-soluk">{ders.ozet}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {testler.length > 0 && (
              <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
                <p className="etiket-mono mb-4 text-metin">Testler</p>
                <ul className="divide-y divide-kenar-soluk">
                  {testler.map((test) => (
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
            )}
          </div>
        </Bolum>
      )}
    </>
  );
}
