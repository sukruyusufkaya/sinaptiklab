import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kitap, Ok } from '@/components/arayuz/Ikonlar';
import { dergiSayiListesi } from '@/lib/icerik/yayin';

export async function Dergi() {
  const sayi = (await dergiSayiListesi())[0];
  if (!sayi) return null;

  return (
    <Bolum kimlik="dergi" etiketlendiren="dergi-basligi">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
        {/* --- Kapak --- */}
        <Link
          href={`/dergi/${sayi.slug}/`}
          className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-kenar bg-zemin-derin"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="izgara-zemin absolute inset-0 opacity-50" />
            <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-vurgu/25 blur-[90px] transition-transform duration-700 ease-sinaptik group-hover:translate-x-6" />
            <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-ikincil/20 blur-[80px] transition-transform duration-700 ease-sinaptik group-hover:-translate-y-6" />
          </div>

          <div className="relative flex h-full flex-col justify-between p-7">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold tracking-tight">
                Sinaptik<span className="text-vurgu-parlak">Magazine</span>
              </span>
              <span className="etiket-mono text-metin-soluk">{sayi.sayi}</span>
            </div>

            <div>
              <p className="etiket-mono mb-3 text-ikincil">Kapak dosyası</p>
              <p className="text-[2rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
                {sayi.kapakKonusu}
              </p>
            </div>
          </div>
        </Link>

        {/* --- İçindekiler --- */}
        <div className="flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-3">
            <span className="etiket-mono text-metin-soluk">09</span>
            <span className="h-px w-6 bg-kenar-guclu" aria-hidden="true" />
            <span className="etiket-mono text-vurgu-parlak">MAGAZINE</span>
          </div>

          <h2
            id="dergi-basligi"
            className="text-2xl leading-[1.12] font-semibold tracking-tight sm:text-3xl md:text-[2.125rem]"
          >
            Dergi PDF&apos;e hapsedilmez
          </h2>
          <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-metin-ikincil">
            Her sayının kendi sayfası, her yazının kendi kalıcı adresi var. PDF ikincil dağıtım
            formatıdır — birincil yayın HTML&apos;dir.
          </p>

          <ol className="mt-7 divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {sayi.yazilar.map((yazi, sira) => (
              <li key={yazi.slug} className="group">
                <Link
                  href={`/dergi/${sayi.slug}/${yazi.slug}/`}
                  className="flex items-center gap-4 py-3.5"
                >
                  <span className="etiket-mono w-6 shrink-0 text-metin-soluk">
                    {String(sira + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-medium text-metin transition-colors group-hover:text-vurgu-parlak">
                      {yazi.baslik}
                    </span>
                    <span className="etiket-mono mt-1 block text-metin-soluk">
                      {yazi.bolum} · {yazi.okumaDakika} dk
                    </span>
                  </span>
                  <Ok className="size-4 shrink-0 text-metin-soluk opacity-0 transition-all duration-200 ease-sinaptik group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Dugme href={`/dergi/${sayi.slug}/`}>
              <Kitap className="size-4" />
              Sayıyı oku
            </Dugme>
            <Dugme href="/dergi/arsiv/" gorunum="ikincil">
              Tüm sayılar
            </Dugme>
          </div>
        </div>
      </div>
    </Bolum>
  );
}
