import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Atlas as AtlasIkonu, Dugum, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { ATLAS_KATEGORILERI, atlasListesi } from '@/lib/icerik/atlas';
import { ATLAS_KATEGORI_SLUGU, SEVIYE_ADI } from '@/lib/taksonomi';

export async function AtlasBolumu() {
  const TUMU = await atlasListesi();
  const [vitrin, ...digerleri] = TUMU;

  /*
   * Kategori başına YAYINDAKİ girdi sayısı. Tek listeden sayılır; kategori
   * başına ayrı sorgu açılmaz.
   */
  const yayindakiAdet = new Map<string, number>();
  for (const girdi of TUMU) {
    const slug = ATLAS_KATEGORI_SLUGU.get(girdi.kategori);
    if (slug) yayindakiAdet.set(slug, (yayindakiAdet.get(slug) ?? 0) + 1);
  }

  // Yayında girdisi olmayan kategori çip listesinde görünmez: boş sayfaya
  // giden bir çip, sayı doğru olsa bile okuru boşa yönlendirir.
  const dolukategoriler = ATLAS_KATEGORILERI.filter((k) => (yayindakiAdet.get(k.slug) ?? 0) > 0);
  if (!vitrin) return null;

  return (
    <Bolum kimlik="atlas" etiketlendiren="atlas-basligi">
      <BolumBasligi
        numara="04"
        etiket="UNDERSTAND"
        baslik={<span id="atlas-basligi">Sinaptik AI Atlas</span>}
        aciklama="Her kavramın kalıcı bir adresi var. Tek URL, tek konu, alıntılanabilir bir tanım."
        baglantiYolu="/atlas/"
        baglantiMetni="Atlas'ı keşfet"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* --- Günün kavramı --- */}
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-kenar bg-gradient-to-br from-yuzey/80 to-zemin-derin p-6 sm:p-8">
          <div
            className="nokta-zemin pointer-events-none absolute inset-0 opacity-50"
            aria-hidden="true"
          />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-vurgu/16 blur-[90px]" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <AtlasIkonu className="size-4 text-vurgu-parlak" />
              <span className="etiket-mono text-vurgu-parlak">30 saniyede</span>
            </div>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              <Link href={`/atlas/${vitrin.slug}/`} className="before:absolute before:inset-0">
                {vitrin.ad}
              </Link>
            </h3>
            <p className="etiket-mono mt-2 text-metin-soluk">{vitrin.kategori}</p>

            <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil sm:text-lg">
              {vitrin.kisaTanim}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {vitrin.ilgili.map((kavram) => (
                <span
                  key={kavram}
                  className="rounded-full border border-kenar bg-zemin/60 px-3 py-1.5 text-xs text-metin-ikincil"
                >
                  {kavram}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-kenar-soluk pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-metin-soluk">
                <Onay className="size-3.5 text-basari" />
                Son doğrulama:{' '}
                {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(
                  new Date(vitrin.sonDogrulama),
                )}
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-vurgu-parlak">
                Tam girdiyi oku
                <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </article>

        {/* --- Son girdiler --- */}
        <div className="flex flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-kenar-soluk pb-3">
            <Dugum className="size-4 text-ikincil" />
            <span className="etiket-mono text-metin">Son güncellenen girdiler</span>
          </div>

          <ul className="flex-1 divide-y divide-kenar-soluk">
            {digerleri.slice(0, 5).map((girdi) => (
              <li key={girdi.slug} className="group">
                <Link href={`/atlas/${girdi.slug}/`} className="block py-3">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-metin transition-colors group-hover:text-vurgu-parlak">
                      {girdi.ad}
                    </span>
                    <span className="etiket-mono shrink-0 text-metin-soluk">
                      {SEVIYE_ADI[girdi.seviye]}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-1 block text-xs text-metin-soluk">
                    {girdi.kisaTanim}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- Kategori haritası --- */}
      <div className="mt-6 rounded-2xl border border-kenar bg-zemin-derin p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="etiket-mono text-metin">
            Kavram haritası · {dolukategoriler.length} kategori
          </span>
          <Link
            href="/konu/"
            className="etiket-mono text-vurgu-parlak transition-opacity hover:opacity-80"
          >
            Konu merkezleri →
          </Link>
        </div>

        <ul className="flex flex-wrap gap-2">
          {dolukategoriler.map((kategori) => (
            <li key={kategori.ad}>
              <Link
                href={`/atlas/kategori/${kategori.slug}/`}
                className="group flex items-center gap-2 rounded-full border border-kenar bg-yuzey/50 py-2 pr-2 pl-3.5 transition-colors duration-150 hover:border-vurgu/45 hover:bg-yuzey-2"
              >
                <span className="text-[0.8125rem] text-metin-ikincil group-hover:text-metin">
                  {kategori.ad}
                </span>
                {/*
                  YAYINDAKİ SAYI, HEDEF DEĞİL. Burada `kategori.adet`
                  basılıyordu; o alan taksonomide açıkça "kavram evreninin
                  tahmini genişliği — yayındaki girdi sayısı DEĞİL" diye
                  tanımlı. Toplamı 252 iken yayında 35 girdi vardı ve
                  "15" yazan bir çip boş bir kategori sayfasına gidiyordu.
                */}
                <span className="etiket-mono rounded-full bg-yuzey-3 px-1.5 py-0.5 text-metin-soluk tabular-nums">
                  {yayindakiAdet.get(kategori.slug) ?? 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Bolum>
  );
}
