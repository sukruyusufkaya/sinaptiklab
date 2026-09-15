import type { ReactNode } from 'react';
import { Rozet } from '@/components/arayuz/Rozet';

/**
 * "Yakında" bloğu — hazır olmayan bir bölümün yerini DÜRÜSTÇE tutar.
 *
 * `BosDurum`dan farkı niyet: `BosDurum` "şu an sonuç yok" der (filtre boş
 * döndü, arşiv henüz dolmadı). Bu blok ise "bu bölüm planlı ama henüz
 * yayımlanmadı" der ve okura ne zaman döneceğini söyleyen bir eylem verir.
 * İkisini ayırmak önemli: aynı görsel dili kullanmak, hazır olmayan bir
 * bölümü boş bir arama sonucuyla karıştırır.
 *
 * Değişmez kural 5'in gezinme tarafındaki karşılığı: hazır olmayan bölüm dolu
 * gösterilmez, ama gezinmeden de gizlenmez — okur neyin geleceğini bilir.
 */
export function YakindaBlogu({
  etiket = 'YAKINDA',
  baslik,
  metin,
  eylem,
  ikincilEylem,
}: {
  etiket?: string;
  baslik: string;
  metin: string;
  eylem?: ReactNode;
  ikincilEylem?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-kenar-guclu bg-zemin-derin/60 px-6 py-12 text-center sm:py-14">
      <div className="flex justify-center">
        <Rozet ton="uyari">{etiket}</Rozet>
      </div>
      <p className="mt-4 text-lg font-semibold tracking-tight text-metin">{baslik}</p>
      <p className="mx-auto mt-3 max-w-lg text-[0.875rem] leading-relaxed text-metin-ikincil">
        {metin}
      </p>
      {(eylem || ikincilEylem) && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {eylem}
          {ikincilEylem}
        </div>
      )}
    </div>
  );
}
