import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Ok, Zarf } from '@/components/arayuz/Ikonlar';
import { brief, briefArsivi } from '@/lib/icerik/gundem';

export async function Brief() {
  const [BRIEF, ARSIV] = await Promise.all([brief(), briefArsivi()]);
  /*
   * ROZET KAYDIN KENDİ TARİHİNİ GÖSTERİR, DERLEME GÜNÜNÜ DEĞİL.
   *
   * Burada `new Date()` vardı: rozet her derlemede o günün tarihini basıyor,
   * yanında da "GÜNLÜK" etiketi ve "Bugün bilmeniz gereken beş gelişme"
   * cümlesi duruyordu. Yayındaki tek brief 11 Eylül tarihliyken ana sayfa onu
   * 14 Eylül diye etiketliyordu — okur eski bir derlemeyi bugünün haberi
   * sanıyordu. Tarih artık `brief()` kaydından gelir; kayıt yoksa rozet hiç
   * basılmaz (uydurma tarih üretilmez).
   */
  const guncelTarih = ARSIV[0]?.tarih;
  const yayinTarihi = guncelTarih
    ? new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${guncelTarih}T00:00:00Z`))
    : undefined;

  return (
    <Bolum kimlik="brief" zemin="derin" etiketlendiren="brief-basligi">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        {/* --- Tanıtım --- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-4 flex items-center gap-3">
            <span className="etiket-mono text-metin-soluk">02</span>
            <span className="h-px w-6 bg-kenar-guclu" aria-hidden="true" />
            <span className="etiket-mono text-sinyal">GÜNLÜK</span>
          </div>

          <h2
            id="brief-basligi"
            className="text-2xl leading-[1.12] font-semibold tracking-tight sm:text-3xl md:text-[2.125rem]"
          >
            Sinaptik Brief
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-metin-ikincil">
            Günün beş gelişmesi, ne olduğu değil neden önemli olduğu anlatılarak. Beş dakikada
            okunur; aynı içerik bültenle e-postanıza düşer.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {yayinTarihi && <Rozet ton="notr">{yayinTarihi}</Rozet>}
            <Rozet ton="vurgu">5 madde</Rozet>
          </div>

          <div className="mt-8 rounded-xl border border-kenar bg-yuzey/50 p-5">
            <Zarf className="size-5 text-vurgu-parlak" />
            <p className="mt-3 text-sm leading-relaxed text-metin-ikincil">
              Yapay zekâ dünyasında önemli bir şeyi kaçırmayın.
            </p>
            <Dugme href="/bulten/" boyut="sm" className="mt-4">
              Sinaptik Daily&apos;e katıl
              <Ok className="size-3.5" />
            </Dugme>
          </div>
        </div>

        {/* --- Maddeler --- */}
        {BRIEF.length > 0 && (
          <ol className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {BRIEF.map((madde) => (
              <li key={madde.numara} className="group relative">
                <Link href={`/konu/${madde.konuSlug}/`} className="flex gap-5 py-5">
                  <span className="font-mono text-sm text-metin-soluk transition-colors group-hover:text-vurgu-parlak">
                    {madde.numara}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.0625rem] leading-snug font-medium tracking-tight text-metin text-balance transition-colors group-hover:text-vurgu-parlak">
                      {madde.baslik}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-metin-ikincil">
                      <span className="etiket-mono mr-2 text-metin-soluk">Neden önemli</span>
                      {madde.neden}
                    </span>
                    <span className="etiket-mono mt-2.5 block text-metin-soluk">
                      Kaynak · {madde.kaynak}
                    </span>
                  </span>
                  <Ok className="mt-1 size-4 shrink-0 text-metin-soluk opacity-0 transition-all duration-200 ease-sinaptik group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Bolum>
  );
}
