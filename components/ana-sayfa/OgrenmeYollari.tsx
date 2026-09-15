import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Katman, Ok, Saat } from '@/components/arayuz/Ikonlar';
import { ogrenmeYollari } from '@/lib/icerik/ogrenme';

export async function OgrenmeYollari() {
  const OGRENME_YOLLARI = await ogrenmeYollari();

  return (
    <Bolum kimlik="ogrenme-yollari" etiketlendiren="yollar-basligi">
      <BolumBasligi
        numara="06"
        etiket="LEARN"
        baslik={<span id="yollar-basligi">Kendine bir öğrenme yolu seç</span>}
        aciklama="Her bölüm aynı döngüyle ilerler: teori → örnek → lab → test → proje. Önkoşullar beceri grafiğinden gelir."
        baglantiYolu="/ogren/yollar/"
        baglantiMetni="Tüm rotalar"
      />

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {OGRENME_YOLLARI.map((yol, sira) => (
          <li key={yol.slug}>
            <Link
              href={`/ogren/yollar/${yol.slug}/`}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-kenar bg-yuzey/40 p-5 transition-[border-color,background-color,transform] duration-300 ease-sinaptik hover:-translate-y-0.5 hover:border-vurgu/45 hover:bg-yuzey/70"
            >
              <span
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-vurgu/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />

              <div className="flex items-center justify-between">
                <span className="etiket-mono text-metin-soluk">
                  {String(sira + 1).padStart(2, '0')}
                </span>
                <span className="etiket-mono rounded-full border border-kenar px-2 py-1 text-metin-soluk">
                  {yol.rol}
                </span>
              </div>

              <h3 className="mt-4 text-lg leading-snug font-semibold tracking-tight text-metin transition-colors group-hover:text-vurgu-parlak">
                {yol.ad}
              </h3>
              <p className="etiket-mono mt-1.5 text-vurgu-parlak">{yol.seviyeAraligi}</p>

              <p className="mt-3 flex-1 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                {yol.aciklama}
              </p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {yol.cikti.map((cikti) => (
                  <li
                    key={cikti}
                    className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk"
                  >
                    {cikti}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-kenar-soluk pt-3.5">
                <span className="flex items-center gap-4 text-xs text-metin-soluk">
                  <span className="inline-flex items-center gap-1.5">
                    <Katman className="size-3.5" />
                    {yol.bolum} bölüm
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Saat className="size-3.5" />~{yol.saat} sa
                  </span>
                </span>
                <Ok className="size-4 text-metin-soluk transition-transform duration-200 ease-sinaptik group-hover:translate-x-1 group-hover:text-vurgu-parlak" />
              </div>
            </Link>
          </li>
        ))}

        {/* Kişiselleştirme kartı */}
        <li>
          <Link
            href="/ogren/"
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-kenar-guclu bg-zemin-derin p-5 transition-colors duration-300 hover:border-vurgu"
          >
            <div
              className="izgara-zemin pointer-events-none absolute inset-0 opacity-40"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="etiket-mono text-ikincil">Kişiselleştir</span>
              <h3 className="mt-4 text-lg leading-snug font-semibold tracking-tight">
                Rolünü, seviyeni ve hedefini seç; sistem rotanı kursun
              </h3>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                Öğrenci, yazılımcı, veri bilimci, yönetici, girişimci veya pazarlamacı — beceri
                grafiği eksik önkoşulları tespit eder.
              </p>
            </div>
            <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-vurgu-parlak">
              Rotamı oluştur
              <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-1" />
            </span>
          </Link>
        </li>
      </ul>
    </Bolum>
  );
}
