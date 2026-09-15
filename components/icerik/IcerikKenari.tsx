import Link from 'next/link';
import type { Kaynak, SSS, SurumKaydi, Yazar } from '@/lib/tipler';
import { Onay, Saat } from '@/components/arayuz/Ikonlar';
import { tarihUzun } from '@/lib/bicim';

/* --- İÇİNDEKİLER ---------------------------------------------------------- */

export function IcindekilerTablosu({
  basliklar,
}: {
  basliklar: { kimlik: string; metin: string }[];
}) {
  if (basliklar.length === 0) return null;

  return (
    <nav aria-label="İçindekiler" className="rounded-xl border border-kenar bg-yuzey/40 p-5">
      <p className="etiket-mono mb-3.5 text-metin">İçindekiler</p>
      <ol className="space-y-2">
        {basliklar.map((baslik, sira) => (
          <li key={baslik.kimlik} className="flex gap-2.5">
            <span className="etiket-mono mt-0.5 shrink-0 text-metin-soluk">
              {String(sira + 1).padStart(2, '0')}
            </span>
            <a
              href={`#${baslik.kimlik}`}
              className="text-[0.8125rem] leading-snug text-metin-ikincil transition-colors hover:text-vurgu-parlak"
            >
              {baslik.metin}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* --- YAZAR ŞERİDİ --------------------------------------------------------- */

export function YazarSeridi({
  yazar,
  inceleyen,
  yayinTarihi,
  guncellemeTarihi,
  sonDogrulama,
  okumaDakika,
}: {
  yazar: Yazar;
  inceleyen?: Yazar;
  yayinTarihi?: string;
  guncellemeTarihi?: string;
  sonDogrulama?: string;
  okumaDakika?: number;
}) {
  return (
    <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
      <div className="flex items-start gap-3.5">
        <span className="etiket-mono grid size-10 shrink-0 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
          {yazar.basHarfler}
        </span>
        <div className="min-w-0">
          <p className="etiket-mono text-metin-soluk">Yazan</p>
          <Link
            href={`/yazar/${yazar.slug}/`}
            className="mt-1 block text-sm font-medium text-metin transition-colors hover:text-vurgu-parlak"
          >
            {yazar.ad}
          </Link>
          <p className="mt-0.5 text-xs text-metin-soluk">{yazar.unvan}</p>
        </div>
      </div>

      {inceleyen && (
        <div className="mt-4 border-t border-kenar-soluk pt-4">
          <p className="etiket-mono text-metin-soluk">Teknik inceleme</p>
          <Link
            href={`/yazar/${inceleyen.slug}/`}
            className="mt-1 block text-sm font-medium text-metin transition-colors hover:text-vurgu-parlak"
          >
            {inceleyen.ad}
          </Link>
        </div>
      )}

      <dl className="mt-4 space-y-2 border-t border-kenar-soluk pt-4 text-xs">
        {yayinTarihi && (
          <div className="flex justify-between gap-3">
            <dt className="text-metin-soluk">İlk yayın</dt>
            <dd className="text-metin-ikincil">
              <time dateTime={yayinTarihi}>{tarihUzun(yayinTarihi)}</time>
            </dd>
          </div>
        )}
        {guncellemeTarihi && (
          <div className="flex justify-between gap-3">
            <dt className="text-metin-soluk">Son güncelleme</dt>
            <dd className="text-metin-ikincil">
              <time dateTime={guncellemeTarihi}>{tarihUzun(guncellemeTarihi)}</time>
            </dd>
          </div>
        )}
        {sonDogrulama && (
          <div className="flex justify-between gap-3">
            <dt className="inline-flex items-center gap-1.5 text-metin-soluk">
              <Onay className="size-3.5 text-basari" />
              Son doğrulama
            </dt>
            <dd className="text-metin-ikincil">
              <time dateTime={sonDogrulama}>{tarihUzun(sonDogrulama)}</time>
            </dd>
          </div>
        )}
        {okumaDakika && (
          <div className="flex justify-between gap-3">
            <dt className="inline-flex items-center gap-1.5 text-metin-soluk">
              <Saat className="size-3.5" />
              Okuma
            </dt>
            <dd className="text-metin-ikincil">{okumaDakika} dakika</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/* --- KAYNAKLAR ------------------------------------------------------------ */

export function KaynakListesi({ kaynaklar }: { kaynaklar: Kaynak[] }) {
  if (kaynaklar.length === 0) return null;

  return (
    <section aria-labelledby="kaynaklar-basligi" className="border-t border-kenar pt-8">
      <h2 id="kaynaklar-basligi" className="etiket-mono mb-4 text-metin">
        Kaynaklar
      </h2>
      <ol className="space-y-3">
        {kaynaklar.map((kaynak, sira) => (
          <li key={sira} className="flex gap-3.5">
            <span className="etiket-mono mt-0.5 shrink-0 text-metin-soluk">
              {String(sira + 1).padStart(2, '0')}
            </span>
            <span className="text-[0.8125rem] leading-relaxed">
              {kaynak.adres ? (
                <a
                  href={kaynak.adres}
                  target="_blank"
                  rel="noreferrer"
                  className="text-metin underline decoration-kenar-guclu underline-offset-4 transition-colors hover:text-vurgu-parlak"
                >
                  {kaynak.ad}
                </a>
              ) : (
                <span className="text-metin">{kaynak.ad}</span>
              )}
              <span className="text-metin-soluk">
                {' '}
                — {kaynak.yayinci} · {kaynak.tur}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* --- SÜRÜM GEÇMİŞİ -------------------------------------------------------- */

export function SurumGecmisi({ surumler }: { surumler: SurumKaydi[] }) {
  if (surumler.length === 0) return null;

  return (
    <section aria-labelledby="surum-basligi" className="border-t border-kenar pt-8">
      <h2 id="surum-basligi" className="etiket-mono mb-4 text-metin">
        Güncelleme geçmişi
      </h2>
      <ol className="space-y-4">
        {surumler.map((kayit) => (
          <li key={kayit.surum} className="flex gap-4">
            <span className="etiket-mono w-12 shrink-0 text-vurgu-parlak">{kayit.surum}</span>
            <span className="min-w-0">
              <span className="etiket-mono block text-metin-soluk">
                <time dateTime={kayit.tarih}>{tarihUzun(kayit.tarih)}</time>
              </span>
              <span className="mt-1 block text-[0.8125rem] leading-relaxed text-metin-ikincil">
                {kayit.degisiklik}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* --- SSS ------------------------------------------------------------------ */

export function SSSBolumu({ sorular }: { sorular: SSS[] }) {
  if (sorular.length === 0) return null;

  return (
    <section aria-labelledby="sss-basligi" className="border-t border-kenar pt-8">
      <h2 id="sss-basligi" className="mb-5 text-xl font-semibold tracking-tight">
        Sık sorulan sorular
      </h2>
      <div className="divide-y divide-kenar-soluk overflow-hidden rounded-xl border border-kenar">
        {sorular.map((oge) => (
          <details key={oge.soru} className="group bg-yuzey/30 open:bg-yuzey/50">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-[0.9375rem] font-medium text-metin marker:content-none">
              {oge.soru}
              <span
                className="grid size-5 shrink-0 place-items-center rounded-full border border-kenar text-metin-soluk transition-transform duration-200 group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <div className="px-5 pb-5">
              <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">{oge.cevap}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* --- İLGİLİ İÇERİKLER ---------------------------------------------------- */

export function IlgiliBaglantilar({
  baslik = 'İlgili kavramlar',
  ogeler,
}: {
  baslik?: string;
  ogeler: { ad: string; yol: string; not?: string }[];
}) {
  if (ogeler.length === 0) return null;

  return (
    <nav aria-label={baslik} className="rounded-xl border border-kenar bg-yuzey/40 p-5">
      <p className="etiket-mono mb-3.5 text-metin">{baslik}</p>
      <ul className="space-y-1">
        {ogeler.map((oge) => (
          <li key={oge.yol}>
            <Link
              href={oge.yol}
              className="group -mx-2 block rounded-lg px-2 py-2 transition-colors hover:bg-yuzey-2"
            >
              <span className="block text-[0.8125rem] font-medium text-metin group-hover:text-vurgu-parlak">
                {oge.ad}
              </span>
              {oge.not && <span className="block text-xs text-metin-soluk">{oge.not}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
