import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Kalkan, Kitap, Ok, Onay, Terazi } from '@/components/arayuz/Ikonlar';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { SSSSemasi } from '@/lib/seo/jsonld';
import { uzmanListesi } from '@/lib/icerik/yayin';
import { konuHaritasi, yazarListesi } from '@/lib/icerik/temel';
import type { Uzman } from '@/lib/tipler';

export const metadata: Metadata = {
  title: 'Uzman Koltukları',
  description:
    'Sinaptik Lab içeriklerini inceleyen uzman ağı. Her koltuğun alanı, sorumluluğu ve aranan nitelikleri yazılıdır; açık koltuklar gerçek bir çağrıdır, boş kart değil.',
  alternates: { canonical: '/uzmanlar/' },
};

/**
 * Uzman koltukları.
 *
 * SAYFANIN ESKİ HÂLİ İKİ ŞEYİ YANLIŞ YAPIYORDU:
 *
 *  1. Açık koltukları `ad === 'Katkı bekleniyor'` karşılaştırmasıyla ayırıyordu.
 *     Görünen ada göre eşleştirme, bu projede tekrar eden bir hata sınıfı:
 *     metin bir boşluk kadar değişse tüm açık koltuklar dolu sayılırdı. Durum
 *     artık `koltukDurumu` alanında, enum olarak duruyor.
 *  2. Açık koltuk BOŞ BİR KARTTI. "Katkı bekleniyor" yazan, alanı tek kelimeyle
 *     geçiştirilmiş beş kutu, okura başvurabileceği bir şey sunmuyordu —
 *     neyin beklendiği, kimden beklendiği ve karşılığında ne verildiği hiçbir
 *     yerde yazmıyordu.
 *
 * UYDURMA UZMAN EKLENMEDİ ve eklenmeyecek: var olmayan bir kişiyi uzman diye
 * yayımlamak, uydurma sayı yayımlamaktan (değişmez kural 5) daha ağır bir
 * ihlaldir — E-E-A-T'nin dayandığı şeyin ta kendisini sahteleştirir. Bunun
 * yerine KOLTUKLAR genişletildi: 22 alan, her biri sorumluluğu, aranan
 * nitelikleri ve karşılığı yazılı gerçek bir çağrı.
 */

const SORULAR = [
  {
    soru: 'Uzman koltuğu ne demek?',
    cevap:
      'Bir koltuk, belirli bir alandaki içeriklerin yayın öncesi teknik incelemesini üstlenen tanımlı bir roldür. Yazarlıktan farkı şudur: yazar içeriği üretir, koltuk sahibi ürettiğini doğrular. Her koltuğun kapsamı yazılıdır — hangi içerik türlerine bakacağı, neyi denetleyeceği ve hangi niteliklerin arandığı açıkça belirtilir.',
  },
  {
    soru: 'Neden açık koltuklar boş gösteriliyor?',
    cevap:
      'Çünkü dolu değiller. Var olmayan bir uzmanı sayfaya koymak, sitenin dayandığı ilkeyi — arkasında isim olmayan içerik yayımlanmaz — doğrudan çiğnerdi. Açık koltuk bir eksiklik değil, bir davettir: alanın ne olduğu, işin ne olduğu ve karşılığında ne verildiği yazılıdır.',
  },
  {
    soru: 'Koltuk sahibi ne kadar zaman ayırır?',
    cevap:
      'Koltuklar tam zamanlı bir görev değildir. Beklenen, alanınızdaki içeriklerin yayın öncesi incelemesi için ayda birkaç saat ayırmanızdır. Yoğunluk alana göre değişir: haftada haber çıkan alanlarda inceleme daha sık, yılda birkaç rehber yayımlanan alanlarda daha seyrektir. Başvuru sırasında ayırabileceğiniz zamanı belirtmeniz beklenir.',
  },
  {
    soru: 'İnceleyen olduğumda adım nerede görünür?',
    cevap:
      'İncelediğiniz her içeriğin künyesinde inceleyen olarak adınız ve profil bağlantınız görünür. Ayrıca kendi yazar profiliniz ve kalıcı adresiniz oluşturulur. İnceleme biçimsel bir etiket değil, gerçek bir editoryal adımdır; bu yüzden görünürlüğü de gerçektir.',
  },
];

export default async function UzmanlarSayfasi() {
  const [UZMANLAR, YAZAR_LISTESI, KONULAR] = await Promise.all([
    uzmanListesi(),
    yazarListesi(),
    konuHaritasi(),
  ]);

  // Ayrım artık ada değil, alana bakıyor (bkz. dosya başlığı).
  const dolu = UZMANLAR.filter((uzman) => uzman.koltukDurumu !== 'acik');
  const acik = UZMANLAR.filter((uzman) => uzman.koltukDurumu === 'acik');

  return (
    <>
      <SSSSemasi sorular={SORULAR} />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Topluluk', yol: '/topluluk/' },
          { ad: 'Uzmanlar', yol: '/uzmanlar/' },
        ]}
        etiket="TOPLULUK"
        baslik="Uzman koltukları"
        ozet="Arkasında isim olmayan içerik yayımlanmaz. Her koltuk bir alanın yayın öncesi teknik incelemesini üstlenir; açık koltuklar gerçek bir çağrıdır, yer tutucu değil."
        olcumler={[
          { deger: `${UZMANLAR.length}`, etiket: 'Koltuk' },
          { deger: `${dolu.length}`, etiket: 'Dolu' },
          { deger: `${acik.length}`, etiket: 'Açık' },
          { deger: `${YAZAR_LISTESI.length}`, etiket: 'Yazar profili' },
        ]}
        eylemler={
          <>
            <Dugme href="/topluluk/katki/">
              Koltuğa başvur
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/editoryal-ilkeler/" gorunum="ikincil">
              Editoryal ilkeler
            </Dugme>
          </>
        }
        desen="nokta"
      />

      {dolu.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="01"
            etiket="DOLU KOLTUKLAR"
            baslik="İnceleyenler"
            aciklama="Bu koltukların sahibi belli; incelediği içeriklerin künyesinde adı görünür."
            baglantiYolu="/yazar/"
            baglantiMetni="Yazar profilleri"
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dolu.map((uzman) => (
              <li key={uzman.slug}>
                <Link
                  href={`/yazar/${uzman.slug}/`}
                  className="group flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-vurgu/45 hover:bg-yuzey/70"
                >
                  <span className="grid size-14 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-base font-medium text-vurgu-parlak">
                    {uzman.basHarfler}
                  </span>
                  <span className="mt-5 block text-[1.0625rem] font-semibold tracking-tight text-metin">
                    {uzman.ad}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] text-metin-ikincil">
                    {uzman.unvan}
                  </span>
                  <span className="etiket-mono mt-3 block text-metin-soluk">{uzman.alan}</span>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-medium text-metin-soluk transition-colors group-hover:text-vurgu-parlak">
                    Profili gör
                    <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum zemin="derin">
        <BolumBasligi
          numara={dolu.length > 0 ? '02' : '01'}
          etiket="AÇIK KOLTUKLAR"
          baslik={`${acik.length} alanda inceleyen aranıyor`}
          aciklama="Her koltuk tanımlı bir iştir: ne inceleneceği, hangi niteliklerin arandığı ve karşılığında ne verildiği yazılıdır."
        />

        {acik.length > 0 ? (
          <ul className="space-y-4">
            {acik.map((koltuk) => (
              <KoltukKarti
                key={koltuk.slug}
                koltuk={koltuk}
                konuAdi={koltuk.alanSlug ? KONULAR.get(koltuk.alanSlug)?.ad : undefined}
              />
            ))}
          </ul>
        ) : (
          <BosDurum
            baslik="Açık koltuk yok"
            metin="Tanımlı tüm koltukların sahibi belli. Yeni bir alan önermek isterseniz katkı sayfasından yazabilirsiniz."
            eylem={<Dugme href="/topluluk/katki/">Alan öner</Dugme>}
          />
        )}
      </Bolum>

      <Bolum>
        <BolumBasligi
          numara={dolu.length > 0 ? '03' : '02'}
          etiket="E-E-A-T"
          baslik="Neden isim önemli?"
        />
        <div className="olcu">
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bir iddianın ağırlığı, onu kimin söylediğinden bağımsız değildir. Yazarın kim olduğu
            açık değilse okuyucu içeriği değerlendirmek için hiçbir dayanağa sahip olmaz.
          </p>
          <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bu yüzden her içerikte yazar görünür, profiline bağlanır ve teknik derinliği yüksek
            içeriklerde ayrı bir inceleyen görevlendirilir. İnceleme biçimsel bir etiket değil,
            gerçek bir editoryal adımdır: inceleyen, yayımlanan iddianın arkasında durur.
          </p>
          <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Aynı ilke bu sayfanın kendisi için de geçerli. Açık koltuklara uydurma isimler koymak
            sayfayı dolu gösterirdi ama tam da savunduğumuz şeyi ortadan kaldırırdı. Koltuk boşsa
            boş görünür.
          </p>
        </div>
      </Bolum>

      <Bolum zemin="derin">
        <div className="olcu">
          <SSSBolumu sorular={SORULAR} />
        </div>
      </Bolum>
    </>
  );
}

function KoltukKarti({ koltuk, konuAdi }: { koltuk: Uzman; konuAdi?: string }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-dashed border-kenar-guclu bg-zemin/40">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-kenar-soluk bg-yuzey/25 px-6 py-4">
        <span className="etiket-mono grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-kenar-guclu text-metin-soluk">
          {koltuk.basHarfler}
        </span>
        <span className="min-w-0">
          <span className="block text-[1.0625rem] font-semibold tracking-tight text-metin">
            {koltuk.alan}
          </span>
          <span className="etiket-mono mt-0.5 block text-metin-soluk">{koltuk.unvan}</span>
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {koltuk.alanSlug && konuAdi && (
            <Link
              href={`/konu/${koltuk.alanSlug}/`}
              className="etiket-mono rounded-full border border-kenar px-2.5 py-1 text-metin-soluk transition-colors hover:border-vurgu/45 hover:text-vurgu-parlak"
            >
              {konuAdi}
            </Link>
          )}
          <Rozet ton="uyari">Açık</Rozet>
        </span>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div>
          <p className="etiket-mono mb-3 flex items-center gap-1.5 text-metin-soluk">
            <Terazi className="size-3.5" />
            Bu koltuk ne yapar
          </p>
          <ul className="space-y-2">
            {(koltuk.sorumluluklar ?? []).map((madde) => (
              <li
                key={madde}
                className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil"
              >
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-vurgu" />
                {madde}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="etiket-mono mb-3 flex items-center gap-1.5 text-metin-soluk">
            <Kalkan className="size-3.5" />
            Aranan nitelikler
          </p>
          <ul className="space-y-2">
            {(koltuk.aranan ?? []).map((madde) => (
              <li
                key={madde}
                className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil"
              >
                <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                {madde}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col">
          {koltuk.kapsam?.length ? (
            <>
              <p className="etiket-mono mb-3 flex items-center gap-1.5 text-metin-soluk">
                <Kitap className="size-3.5" />
                İnceleyeceği içerik
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {koltuk.kapsam.map((tur) => (
                  <li
                    key={tur}
                    className="rounded-md border border-kenar-soluk bg-yuzey/40 px-2 py-0.5 text-[0.6875rem] text-metin-soluk"
                  >
                    {tur}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {koltuk.sunulan?.length ? (
            <div className="mt-5 rounded-xl border border-vurgu/20 bg-vurgu-zemin/30 p-4">
              <p className="etiket-mono mb-2 text-vurgu-parlak">Karşılığında</p>
              <ul className="space-y-1.5">
                {koltuk.sunulan.map((madde) => (
                  <li key={madde} className="text-[0.8125rem] leading-relaxed text-metin-ikincil">
                    {madde}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link
            href={`/topluluk/katki/?koltuk=${koltuk.slug}`}
            className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.8125rem] font-medium text-vurgu-parlak transition-colors hover:text-vurgu-sonuk"
          >
            Bu koltuğa başvur
            <Ok className="size-3.5" />
          </Link>
        </div>
      </div>
    </li>
  );
}
