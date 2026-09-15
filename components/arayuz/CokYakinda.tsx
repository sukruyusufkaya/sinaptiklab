import Link from 'next/link';
import type { ReactNode } from 'react';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Onay, Zarf } from '@/components/arayuz/Ikonlar';

/**
 * Hazırlanmakta olan bir BÖLÜMÜN tam sayfa karşılığı.
 *
 * ÜÇ FARKLI BOŞLUK, ÜÇ FARKLI BİLEŞEN:
 *
 *   - `BosDurum` — "şu an sonuç yok". Filtre boş döndü, arama eşleşmedi.
 *   - `YakindaBlogu` — "bu blok planlı, henüz dolmadı". Dolu bir sayfanın
 *     içindeki tek bir bölümün yerini tutar.
 *   - `CokYakinda` (bu) — "bu SAYFANIN tamamı hazırlanıyor". Sayfada başka
 *     içerik yoktur; okurun tek sorusu "ne gelecek ve ne zaman" olur.
 *
 * Üçünü ayırmak önemli, çünkü aynı görsel dili kullanmak hazırlanan bir
 * bölümü boş bir arama sonucuyla karıştırır ve okur yanlış sonuç çıkarır:
 * "burada bir şey yok" ile "burada bir şey olacak" aynı cümle değildir.
 *
 * SAYFA GEZİNMEDEN GİZLENMEZ. Değişmez kural 5'in gezinme tarafındaki
 * karşılığı budur: hazır olmayan bölüm DOLU gösterilmez ama menüden de
 * kaldırılmaz — okur neyin geleceğini bilir ve haber almak için bir yol
 * bulur. Menüdeki "Yakında" rozeti bu sayfanın söz verdiğini önceden söyler.
 */
export function CokYakinda({
  etiket = 'ÇOK YAKINDA',
  baslik,
  metin,
  kapsam,
  notlar,
  eylem,
}: {
  etiket?: string;
  baslik: string;
  metin: string;
  /** Yayına girdiğinde bu sayfada ne bulunacağı — somut, sayılabilir maddeler. */
  kapsam?: string[];
  /** Ek açıklama satırları (yayın sıklığı, metodoloji notu vb.). */
  notlar?: string[];
  eylem?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-kenar bg-zemin-derin">
      <div className="nokta-zemin border-b border-kenar-soluk px-6 py-12 text-center sm:px-10 sm:py-16">
        <div className="flex justify-center">
          <Rozet ton="uyari">{etiket}</Rozet>
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-balance text-metin sm:text-3xl">
          {baslik}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-metin-ikincil">
          {metin}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {eylem ?? (
            <>
              <Dugme href="/bulten/">
                <Zarf className="size-4" />
                Çıkınca haber ver
              </Dugme>
              <Dugme href="/atlas/" gorunum="ikincil">
                Yayında olan içerik
                <Ok className="size-4" />
              </Dugme>
            </>
          )}
        </div>
      </div>

      {kapsam && kapsam.length > 0 && (
        <div className="px-6 py-8 sm:px-10">
          <p className="etiket-mono mb-4 text-metin-soluk">Yayına girdiğinde burada ne olacak</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {kapsam.map((madde) => (
              <li
                key={madde}
                className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-metin-ikincil"
              >
                <Onay className="mt-0.5 size-4 shrink-0 text-vurgu-sonuk" />
                {madde}
              </li>
            ))}
          </ul>
        </div>
      )}

      {notlar && notlar.length > 0 && (
        <div className="space-y-2 border-t border-kenar-soluk bg-yuzey/25 px-6 py-5 sm:px-10">
          {notlar.map((not) => (
            <p key={not} className="text-xs leading-relaxed text-metin-soluk">
              {not}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Bölüm listesi — hazırlanan bir hub'ın alt sayfalarını gösterir.
 *
 * Sayfa boş olsa bile YAPI görünür kalır: okur derginin hangi bölümlerden
 * oluşacağını, araştırmanın hangi yayın türlerini kapsayacağını görür. Bu,
 * "hazırlanıyor" demenin bilgi taşıyan biçimidir; tek bir kutu koyup geçmek
 * ise okura hiçbir şey söylemez.
 */
export function YakindaBolumListesi({
  bolumler,
  temelYol,
}: {
  bolumler: readonly { slug: string; ad: string; ozet: string }[];
  temelYol: string;
}) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
      {bolumler.map((bolum) => (
        <li key={bolum.slug}>
          <Link
            href={`${temelYol}${bolum.slug}/`}
            className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
          >
            <span className="flex flex-wrap items-center gap-2.5">
              <span className="text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                {bolum.ad}
              </span>
              <Rozet ton="uyari">Yakında</Rozet>
            </span>
            <span className="mt-2.5 block text-[0.875rem] leading-relaxed text-metin-ikincil">
              {bolum.ozet}
            </span>
            <span className="etiket-mono mt-auto inline-flex items-center gap-1.5 pt-5 text-metin-soluk">
              Bölümü gör
              <Ok className="size-3 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
