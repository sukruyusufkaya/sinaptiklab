import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { SSSSemasi } from '@/lib/seo/jsonld';
import { SORU_CEVAP } from '@/lib/veri/yayin';
import { tarihKisa, tarihUzun } from '@/lib/bicim';
import { atlasBul } from '@/lib/icerik/atlas';

export const metadata: Metadata = {
  title: 'Soru & Cevap',
  description:
    'Uygulamaya dönük sorular ve editoryal olarak doğrulanmış kısa cevaplar. Her cevap ilgili Atlas girdisine bağlanır.',
  alternates: { canonical: '/soru-cevap/' },
};

export default async function SoruCevapSayfasi() {
  // En yeni kaydın tarihi; liste zaten tarihe göre sıralı değilse buradan gelir.
  const SON_TARIH = [...SORU_CEVAP].sort((a, b) => b.tarih.localeCompare(a.tarih))[0]?.tarih ?? '';
  const konular = [...new Set(SORU_CEVAP.map((kayit) => kayit.konu))];
  // Atlas baglantisi JSX icinde cozulemez (await gerekiyor): konu adindan
  // turetilen slug onceden aranir, sonuc soru slug'ina gore haritalanir.
  const atlasEslemesi = new Map(
    await Promise.all(
      SORU_CEVAP.map(async (kayit) => {
        const atlasAday = kayit.konu
          .toLocaleLowerCase('tr-TR')
          .replaceAll(' ', '-')
          .replaceAll('ı', 'i');
        return [kayit.slug, await atlasBul(atlasAday)] as const;
      }),
    ),
  );

  return (
    <>
      <SSSSemasi
        sorular={SORU_CEVAP.map((kayit) => ({ soru: kayit.soru, cevap: kayit.cevapOzeti }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Topluluk', yol: '/topluluk/' },
          { ad: 'Soru & Cevap', yol: '/soru-cevap/' },
        ]}
        etiket="TOPLULUK"
        baslik="Soru & Cevap"
        ozet="Sorular uygulamadan gelir, cevaplar editoryal olarak doğrulanır. Her cevap dayandığı kavramın Atlas girdisine bağlanır."
        olcumler={[
          { deger: `${SORU_CEVAP.length}`, etiket: 'Soru' },
          { deger: `${konular.length}`, etiket: 'Konu' },
          /*
            "Yanıt" ölçümü KALDIRILDI. Sayı `lib/veri/yayin.ts` içindeki dört
            kayıttan geliyordu (4+6+3+5=18) ve yayında bir yanıt koleksiyonu
            YOK — kimsenin vermediği yanıtların sayısı yayımlanıyordu
            (değişmez kural 5). Yerine sayılabilen gerçek bir büyüklük.
          */
          { deger: tarihKisa(SON_TARIH), etiket: 'Son güncelleme' },
        ]}
        eylemler={
          <Dugme href="/iletisim/">
            Soru gönder
            <Ok className="size-4" />
          </Dugme>
        }
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="SORULAR" baslik="Son sorular" />
        <ul className="space-y-4">
          {SORU_CEVAP.map((kayit) => {
            const atlas = atlasEslemesi.get(kayit.slug);

            return (
              <li
                key={kayit.slug}
                className="rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-colors hover:border-vurgu/40"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="etiket-mono text-vurgu-parlak">{kayit.konu}</span>
                  <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
                  <span className="etiket-mono text-metin-soluk">
                    <time dateTime={kayit.tarih}>{tarihUzun(kayit.tarih)}</time>
                  </span>
                  <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
                </div>

                <h3 className="mt-3 text-[1.125rem] leading-snug font-semibold tracking-tight text-metin">
                  {kayit.soru}
                </h3>

                <div className="mt-4 rounded-xl border border-vurgu/25 bg-vurgu-zemin/40 p-4">
                  <p className="etiket-mono mb-2 text-vurgu-parlak">Kısa cevap</p>
                  <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
                    {kayit.cevapOzeti}
                  </p>
                </div>

                {atlas && (
                  <Link
                    href={`/atlas/${atlas.slug}/`}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak"
                  >
                    {atlas.ad} girdisini oku
                    <Ok className="size-3.5" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-8 rounded-lg border border-kenar bg-yuzey/40 px-4 py-3 text-xs text-metin-soluk">
          Tartışma ve kullanıcı yanıtı özelliği açıldığında sorular topluluk katkısına açılacak;
          şimdilik cevaplar editoryal olarak yazılıyor.
        </p>
      </Bolum>
    </>
  );
}
