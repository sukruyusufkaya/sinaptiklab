import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kilit, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import {
  aileUyeleri,
  KARSILASTIRMALAR,
  modelBul,
  modelListesi,
  sirketBul,
} from '@/lib/icerik/varliklar';
import { tarihUzun } from '@/lib/bicim';

/** Güncellik kodundan görünen ada — rozet metni. */
const GUNCELLIK_ADI: Record<string, string> = {
  guncel: 'Güncel',
  yeni: 'Yeni',
  'onceki-surum': 'Önceki sürüm',
  emekli: 'Emekli',
};

export async function generateStaticParams() {
  return (await modelListesi()).map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = await modelBul(slug);
  if (!model) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(model.seo, {
    baslik: model.ad,
    aciklama: model.ozet ?? model.vurgu,
    kanonik: `/modeller/${model.slug}/`,
  });
}

export default async function ModelSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await modelBul(slug);
  if (!model) notFound();

  const sirket = model.saglayiciSlug ? await sirketBul(model.saglayiciSlug) : undefined;

  /*
   * Aile ilişkisi iki yönde okunur:
   *  - Bu kayıt bir AİLE HUB'ı ise (`aileMi`) üyeleri listelenir.
   *  - Bir ÜYE ise (`aileSlug`) bağlı olduğu hub'a bağlantı verilir.
   * İkisi birbirini dışlar: hub'ın `aileSlug`'ı yoktur.
   */
  const [uyeler, aileKaydi] = await Promise.all([
    model.aileMi ? aileUyeleri(model.slug) : Promise.resolve([]),
    model.aileSlug ? modelBul(model.aileSlug) : Promise.resolve(undefined),
  ]);
  const kiyaslar = KARSILASTIRMALAR.filter(
    (kiyas) => kiyas.sol === model.slug || kiyas.sag === model.slug,
  );
  const digerleri = (await modelListesi()).filter((diger) => diger.slug !== model.slug).slice(0, 5);

  const kunye: { etiket: string; deger: string }[] = [
    { etiket: 'Geliştirici', deger: model.saglayici },
    { etiket: 'Model tipi', deger: model.tip },
    /*
     * Künyede DOĞRULANMIŞ alan gösterilir. Şemada bu alanlar opsiyonel ve
     * araştırma, sağlayıcı belgelemediğinde alanı hiç yazmıyor; "Yok" basmak
     * doğrulanmamış bir bilgiyi olumsuz bir iddiaya çevirirdi.
     */
    ...(model.baglamPenceresi ? [{ etiket: 'Bağlam', deger: model.baglamPenceresi }] : []),
    ...(model.modaliteler?.length
      ? [{ etiket: 'Modaliteler', deger: model.modaliteler.join(' · ') }]
      : []),
    ...(model.acikAgirlik === undefined && model.acikKaynak === undefined
      ? []
      : [
          {
            etiket: 'Açık ağırlık',
            deger: (model.acikAgirlik ?? model.acikKaynak) ? 'Var' : 'Yok',
          },
        ]),
    ...(model.lisans ? [{ etiket: 'Lisans', deger: model.lisans }] : []),
    ...(model.aileMi
      ? [{ etiket: 'Kayıt türü', deger: `Aile künyesi · ${uyeler.length} üye` }]
      : []),
    ...(model.api === undefined
      ? []
      : [{ etiket: 'Yönetilen API', deger: model.api ? 'Var' : 'Yok' }]),
    // `yayin` alanının MongoDB'de karşılığı yok (bkz. lib/icerik/varliklar.ts):
    // fixture'daki serbest metin şemadaki ISO tarih desenine uymadığı için
    // tohumlanmadı. Uydurma tarih basmak yerine satır hiç eklenmez.
    ...(model.yayin ? [{ etiket: 'Yayın', deger: model.yayin }] : []),
  ];

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'AI Modelleri', yol: '/modeller/' },
          { ad: model.ad, yol: `/modeller/${model.slug}/` },
        ]}
        etiket="MODEL VARLIĞI"
        baslik={model.ad}
        ozet={model.ozet ?? model.vurgu}
        eylemler={
          <>
            {aileKaydi && (
              <Dugme href={`/modeller/${aileKaydi.slug}/`} gorunum="ikincil">
                {aileKaydi.ad}
              </Dugme>
            )}
            {sirket && (
              <Dugme href={`/sirketler/${sirket.slug}/`} gorunum="ikincil">
                {sirket.ad} sayfası
              </Dugme>
            )}
            <Dugme href="/karsilastir/" gorunum="sessiz">
              Karşılaştır
              <Ok className="size-4" />
            </Dugme>
          </>
        }
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-kenar-soluk pb-3.5">
              <p className="etiket-mono text-metin">Künye</p>
              {model.acikKaynak ? (
                <Rozet ton="basari">Açık ağırlık</Rozet>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-metin-soluk">
                  <Kilit className="size-3.5" />
                  Kapalı
                </span>
              )}
            </div>
            <dl className="space-y-2.5 text-xs">
              {kunye.map((satir) => (
                <div key={satir.etiket} className="flex justify-between gap-4">
                  <dt className="text-metin-soluk">{satir.etiket}</dt>
                  <dd className="text-right text-metin-ikincil">{satir.deger}</dd>
                </div>
              ))}
            </dl>
            {model.sonDogrulama && (
              <p className="mt-4 inline-flex items-center gap-1.5 border-t border-kenar-soluk pt-3.5 text-xs text-metin-soluk">
                <Onay className="size-3.5 text-basari" />
                Son doğrulama: {tarihUzun(model.sonDogrulama)}
              </p>
            )}
          </div>
        }
      />

      {/*
        AİLE ÜYELERİ — yalnızca hub kayıtlarında.
        Hub'ın varlık sebebi bu liste: okuyucu "bu aile nedir" diye gelir,
        "hangi üyeyi seçmeliyim" diye ayrılır. Üyeler güncelden eskiye sıralı
        gelir (bkz. `aileUyeleri`), böylece emekli sürümler listenin sonunda
        kalır ve güncel olanla karıştırılmaz.
      */}
      {model.aileMi && uyeler.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="01"
            etiket="AİLE ÜYELERİ"
            baslik={`${uyeler.length} model bu aileye bağlı`}
            aciklama="Güncel sürümler başta; önceki ve emekli sürümler listenin sonunda."
          />
          <ul className="mt-6 divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
            {uyeler.map((uye) => (
              <li key={uye.slug}>
                <Link
                  href={`/modeller/${uye.slug}/`}
                  className="group flex flex-wrap items-baseline gap-x-4 gap-y-1.5 bg-yuzey/30 px-5 py-3.5 transition-colors hover:bg-yuzey-2"
                >
                  <span className="text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {uye.ad}
                  </span>
                  {uye.durum && (
                    <Rozet ton={uye.durum === 'guncel' || uye.durum === 'yeni' ? 'basari' : 'notr'}>
                      {GUNCELLIK_ADI[uye.durum]}
                    </Rozet>
                  )}
                  {uye.baglamPenceresi && (
                    <span className="font-mono text-xs text-metin-soluk">
                      {uye.baglamPenceresi}
                    </span>
                  )}
                  {uye.vurgu && (
                    <span className="w-full text-xs leading-relaxed text-metin-soluk">
                      {uye.vurgu}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum>
        <div className="grid gap-6 lg:grid-cols-2">
          {model.yetenekler && (
            <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-4 text-basari">Yetenekler</p>
              <ul className="space-y-2.5">
                {model.yetenekler.map((yetenek) => (
                  <li
                    key={yetenek}
                    className="flex items-start gap-2.5 text-[0.875rem] text-metin-ikincil"
                  >
                    <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                    {yetenek}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {model.siniriliklar && (
            <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-4 text-uyari">Sınırlılıklar</p>
              <ul className="space-y-2.5">
                {model.siniriliklar.map((sinir) => (
                  <li
                    key={sinir}
                    className="flex items-start gap-2.5 text-[0.875rem] text-metin-ikincil"
                  >
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-uyari"
                      aria-hidden="true"
                    />
                    {sinir}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {model.kullanimAlanlari && (
          <div className="mt-6 rounded-2xl border border-kenar bg-zemin-derin p-6">
            <p className="etiket-mono mb-4 text-metin">Tipik kullanım alanları</p>
            <ul className="flex flex-wrap gap-2">
              {model.kullanimAlanlari.map((alan) => (
                <li
                  key={alan}
                  className="rounded-full border border-kenar bg-yuzey/50 px-3.5 py-1.5 text-xs text-metin-ikincil"
                >
                  {alan}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-uyari/25 bg-uyari/8 p-5">
          <p className="etiket-mono mb-2 text-uyari">Benchmark politikası</p>
          <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
            Bu sayfada skor tablosu yer almaz. Sinaptik Lab, yalnızca test verisi, model sürümü,
            örnekleme ayarları ve örneklem sayısı yayımlanmış ölçümleri raporlar.{' '}
            <Link href="/metodoloji/" className="text-vurgu-parlak underline underline-offset-4">
              Metodoloji
            </Link>
          </p>
        </div>
      </Bolum>

      {kiyaslar.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi numara="01" etiket="KARŞILAŞTIRMA" baslik="Bu modeli içeren kıyaslar" />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar md:grid-cols-2">
            {kiyaslar.map((kiyas) => (
              <li key={kiyas.slug}>
                <Link
                  href={`/karsilastir/${kiyas.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
                >
                  <span className="text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {kiyas.baslik}
                  </span>
                  <span className="mt-2 text-xs leading-relaxed text-metin-soluk">
                    {kiyas.ozet}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum>
        <BolumBasligi
          numara="02"
          etiket="DİĞER MODELLER"
          baslik="Veritabanından"
          baglantiYolu="/modeller/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {digerleri.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/modeller/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">{diger.saglayici}</span>
                <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                  {diger.ad}
                </span>
                <span className="mt-1.5 text-xs text-metin-soluk">{diger.tip}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="BUILD"
        baslik="Hangi modeli seçeceğinize karar veremiyor musunuz?"
        metin="Kendi görev setiniz üzerinde kalite, gecikme, maliyet ve uyum kısıtlarını birlikte ölçüyoruz."
        eylemler={
          <>
            <Dugme href="/rehber/model-secim-karari/">
              Model seçim rehberi
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/kurumsal/" gorunum="ikincil">
              Kurumsal destek
            </Dugme>
          </>
        }
      />
    </>
  );
}
