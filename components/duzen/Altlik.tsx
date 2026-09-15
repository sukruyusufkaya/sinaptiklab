import Link from 'next/link';
import { ALTLIK_SUTUNLARI, ALTLIK_YASAL } from '@/lib/rotalar';
import { SITE, KATMANLAR } from '@/lib/site';
import { Simsek } from '@/components/arayuz/Ikonlar';
import { SinaptikIsareti } from './Logo';

export function Altlik() {
  const yil = new Date().getFullYear();

  return (
    <footer className="border-t border-kenar bg-zemin-derin">
      {/* Katman şeridi: Discover → Understand → Learn → Build */}
      <div className="border-b border-kenar-soluk">
        <div className="kap grid gap-px overflow-hidden py-0 sm:grid-cols-2 lg:grid-cols-4">
          {KATMANLAR.map((katman, sira) => (
            <div key={katman.anahtar} className="py-6 lg:px-6 lg:first:pl-0 lg:last:pr-0">
              <div className="flex items-baseline gap-2">
                <span className="etiket-mono text-metin-soluk">
                  {String(sira + 1).padStart(2, '0')}
                </span>
                <span className="etiket-mono text-vurgu-parlak">{katman.ad}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-metin">{katman.soru}</p>
              <p className="mt-1 text-xs text-metin-soluk">{katman.urun}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="kap py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <SinaptikIsareti className="size-9" />
              <span className="text-base font-semibold tracking-tight">
                Sinaptik<span className="text-vurgu-parlak">Lab</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-metin-ikincil">{SITE.vaat}</p>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-metin-soluk">
              Yapay zekâda yaşananları gündem ile yakalayan, atlas ile açıklayan, academy ile
              öğreten, research ile yeni bilgi üreten ve enterprise ile uygulayan bütünleşik bir
              platform.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { ad: 'X', yol: SITE.sosyal.x },
                { ad: 'LinkedIn', yol: SITE.sosyal.linkedin },
                { ad: 'GitHub', yol: SITE.sosyal.github },
                { ad: 'YouTube', yol: SITE.sosyal.youtube },
              ].map((sosyal) => (
                <a
                  key={sosyal.ad}
                  href={sosyal.yol}
                  target="_blank"
                  rel="noreferrer"
                  className="etiket-mono rounded-full border border-kenar px-3 py-1.5 text-metin-soluk transition-colors hover:border-kenar-guclu hover:text-metin"
                >
                  {sosyal.ad}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Alt menü" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {ALTLIK_SUTUNLARI.map((sutun) => (
              <div key={sutun.baslik}>
                <p className="etiket-mono mb-3.5 text-metin">{sutun.baslik}</p>
                <ul className="space-y-2.5">
                  {sutun.ogeler.map((oge) => (
                    <li key={oge.yol}>
                      <Link
                        href={oge.yol}
                        className="text-[0.8125rem] text-metin-soluk transition-colors hover:text-metin"
                      >
                        {oge.ad}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Editoryal şeffaflık notu (MASTER-PLAN §64–§65) */}
        <div className="mt-12 rounded-xl border border-kenar bg-yuzey/40 p-5">
          <p className="etiket-mono mb-2 text-metin-soluk">AI kullanım politikası</p>
          <p className="max-w-3xl text-[0.8125rem] leading-relaxed text-metin-ikincil">
            Yapay zekâ araçları araştırma, transkripsiyon ve editoryal destek amacıyla
            kullanılabilir. Yayımlanan içeriklerden editoryal ekip sorumludur ve tüm içerikler insan
            incelemesinden geçer.{' '}
            <Link href="/ai-politikasi/" className="text-vurgu-parlak underline underline-offset-4">
              Politikanın tamamı
            </Link>
            .
          </p>
        </div>

        {/* Künye şeridi — kardeş site citeance.com ile aynı biçim:
            telif + kurucu bağlantısı, yasal bağlantılar, "Crafted by" imzası. */}
        <div className="mt-8 border-t border-kenar pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs leading-relaxed text-metin-soluk">
              © {yil} {SITE.ad}.{' '}
              <a
                href={SITE.kurucu.url}
                target="_blank"
                rel="noreferrer"
                className="text-metin-ikincil underline decoration-kenar-guclu underline-offset-4 transition-colors hover:text-vurgu-parlak hover:decoration-vurgu"
              >
                {SITE.kurucu.ad} kuruluşudur
              </a>
              . Tüm hakları saklıdır.
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {ALTLIK_YASAL.map((oge) => (
                <li key={oge.yol}>
                  <Link
                    href={oge.yol}
                    className="text-xs text-metin-soluk transition-colors hover:text-metin"
                  >
                    {oge.ad}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İmza rozeti. Sabit/yüzen değil, altlığın içinde: yüzen bir rozet
              mobilde içeriğin üstünü kapatır ve yazdırmada da görünür kalır. */}
          <div className="mt-6 flex justify-center md:justify-end">
            <a
              href={SITE.kurucu.url}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-kenar bg-yuzey/40 py-1.5 pr-4 pl-2 transition-colors hover:border-kenar-guclu hover:bg-yuzey/70"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-vurgu-zemin text-vurgu-parlak">
                <Simsek className="size-3" />
              </span>
              <span className="text-[0.6875rem] text-metin-soluk">
                Crafted by{' '}
                <span className="font-medium text-metin transition-colors group-hover:text-vurgu-parlak">
                  {SITE.kurucu.ad}
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
