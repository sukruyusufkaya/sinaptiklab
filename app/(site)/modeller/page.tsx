import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kilit, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { aileHublari, KARSILASTIRMALAR, modelListesi } from '@/lib/icerik/varliklar';
import { tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'AI Modelleri — Model Veritabanı',
  description:
    'Yapay zekâ modelleri: sağlayıcı, tip, bağlam penceresi, lisans, yetenekler, sınırlılıklar ve son doğrulama tarihi.',
  alternates: { canonical: '/modeller/' },
};

export default async function ModellerSayfasi() {
  const [TUMU, AILELER] = await Promise.all([modelListesi(), aileHublari()]);

  /*
   * Aile hub'ları normal modellerle AYNI koleksiyonda durur (canlı adresleri
   * korunsun diye), bu yüzden tablo onları dışarıda bırakır: "GPT Ailesi" ile
   * "GPT-6 Astra" aynı düzlemde listelenirse okuyucu hangisinin gerçek bir
   * model olduğunu bilemez. Aileler kendi bölümünde gösterilir.
   */
  const MODELLER = TUMU.filter((model) => !model.aileMi);

  /*
   * Üç durumlu sayım: açık ağırlık, kapalı, BİLİNMİYOR. Bu alanlar şemada
   * opsiyonel ve araştırma doğrulayamadığı kayıtlarda alanı hiç yazmıyor;
   * tanımsızı "kapalı" saymak doğrulanmamış bilgiyi olumsuz bir iddiaya
   * çevirmek olurdu.
   */
  const agirlik = (model: (typeof MODELLER)[number]) => model.acikAgirlik ?? model.acikKaynak;
  const acik = MODELLER.filter((model) => agirlik(model) === true).length;
  const kapali = MODELLER.filter((model) => agirlik(model) === false).length;

  return (
    <>
      <ListeSemasi
        ad="AI modelleri"
        ogeler={MODELLER.map((model) => ({ ad: model.ad, yol: `/modeller/${model.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'AI Modelleri', yol: '/modeller/' }]}
        etiket="UNDERSTAND"
        baslik="AI model veritabanı"
        ozet="Her model bir varlık sayfasıdır: ne yapabildiği, nerede sınırlı kaldığı, hangi lisansla geldiği ve bilginin ne zaman doğrulandığı."
        olcumler={[
          { deger: `${MODELLER.length}`, etiket: 'Model' },
          { deger: `${AILELER.length}`, etiket: 'Aile' },
          { deger: `${acik}`, etiket: 'Açık ağırlıklı' },
          { deger: `${kapali}`, etiket: 'Kapalı' },
          { deger: `${KARSILASTIRMALAR.length}`, etiket: 'Karşılaştırma' },
        ]}
        eylemler={
          <Dugme href="/karsilastir/">
            Karşılaştırma aracı
            <Ok className="size-4" />
          </Dugme>
        }
      />

      {AILELER.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="01"
            etiket="AİLELER"
            baslik="Model aileleri"
            aciklama="Bir aile künyesi tek bir modeli değil ürün hattının tamamını anlatır: üyeler hangi iş için birbirinden nasıl ayrılıyor, hangisi şu anki amiral gemisi."
          />
          <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
            {AILELER.map((aile) => (
              <li key={aile.slug}>
                <Link
                  href={`/modeller/${aile.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey-2"
                >
                  <span className="text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {aile.ad}
                  </span>
                  <span className="mt-1 text-xs text-metin-soluk">{aile.saglayici}</span>
                  {aile.vurgu && (
                    <span className="mt-3 text-xs leading-relaxed text-metin-ikincil">
                      {aile.vurgu}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum>
        <BolumBasligi
          numara={AILELER.length > 0 ? '02' : '01'}
          etiket="VERİTABANI"
          baslik={`${MODELLER.length} model`}
          aciklama="Her satır tek bir model sürümüdür. Aile künyeleri yukarıda ayrı listelenir, bu tabloda yer almaz."
        />

        <div className="overflow-x-auto rounded-2xl border border-kenar">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Yapay zekâ model aileleri tablosu</caption>
            <thead>
              <tr className="border-b border-kenar bg-yuzey/50">
                <th scope="col" className="etiket-mono px-5 py-3.5 text-left text-metin-soluk">
                  Model
                </th>
                <th scope="col" className="etiket-mono px-4 py-3.5 text-left text-metin-soluk">
                  Sağlayıcı
                </th>
                <th
                  scope="col"
                  className="etiket-mono hidden px-4 py-3.5 text-left text-metin-soluk md:table-cell"
                >
                  Tip
                </th>
                <th
                  scope="col"
                  className="etiket-mono hidden px-4 py-3.5 text-left text-metin-soluk lg:table-cell"
                >
                  Bağlam
                </th>
                <th scope="col" className="etiket-mono px-4 py-3.5 text-left text-metin-soluk">
                  Lisans
                </th>
                <th
                  scope="col"
                  className="etiket-mono hidden px-4 py-3.5 text-left text-metin-soluk lg:table-cell"
                >
                  Doğrulama
                </th>
              </tr>
            </thead>
            <tbody>
              {MODELLER.map((model) => (
                <tr
                  key={model.slug}
                  className="group border-b border-kenar-soluk last:border-b-0 hover:bg-yuzey/40"
                >
                  <th scope="row" className="px-5 py-4 text-left">
                    <Link
                      href={`/modeller/${model.slug}/`}
                      className="text-[0.9375rem] font-medium text-metin transition-colors group-hover:text-vurgu-parlak"
                    >
                      {model.ad}
                    </Link>
                    <span className="mt-1 block text-xs text-metin-soluk">{model.vurgu}</span>
                  </th>
                  <td className="px-4 py-4 text-metin-ikincil">
                    {model.saglayiciSlug ? (
                      <Link
                        href={`/sirketler/${model.saglayiciSlug}/`}
                        className="transition-colors hover:text-vurgu-parlak"
                      >
                        {model.saglayici}
                      </Link>
                    ) : (
                      model.saglayici
                    )}
                  </td>
                  <td className="hidden px-4 py-4 text-metin-ikincil md:table-cell">{model.tip}</td>
                  <td className="hidden px-4 py-4 text-metin-ikincil lg:table-cell">
                    {model.baglamPenceresi}
                  </td>
                  <td className="px-4 py-4">
                    {model.acikKaynak ? (
                      <Rozet ton="basari">Açık</Rozet>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-metin-soluk">
                        <Kilit className="size-3.5" />
                        Kapalı
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-4 text-xs text-metin-soluk lg:table-cell">
                    {model.sonDogrulama && (
                      <span className="inline-flex items-center gap-1.5">
                        <Onay className="size-3.5 text-basari" />
                        {tarihUzun(model.sonDogrulama)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-xs text-metin-soluk">
          Tabloda yapısal bilgiler yer alır. Benchmark skorları yalnızca metodolojisi yayımlanmış
          ölçümlerle birlikte verilir.
        </p>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="KARŞILAŞTIRMA"
          baslik="Hazır kıyaslar"
          aciklama="Programatik olarak binlerce sayfa üretilmez; yalnızca editoryal değer taşıyan kıyaslar yayımlanır."
          baglantiYolu="/karsilastir/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar md:grid-cols-3">
          {KARSILASTIRMALAR.map((kiyas) => (
            <li key={kiyas.slug}>
              <Link
                href={`/karsilastir/${kiyas.slug}/`}
                className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">Karşılaştırma</span>
                <span className="mt-3 block text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                  {kiyas.baslik}
                </span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-metin-soluk">
                  {kiyas.ozet}
                </span>
                <Ok className="mt-4 size-4 text-metin-soluk transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}
