import Link from 'next/link';
import type { Metadata } from 'next';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';

export const metadata: Metadata = {
  title: 'Sayfa bulunamadı',
  robots: { index: false, follow: true },
};

const ONERILER = [
  { ad: 'AI Atlas', yol: '/atlas/', ozet: 'Kavramların kalıcı referansı' },
  { ad: 'Gündem', yol: '/gundem/', ozet: 'Bugünün yapay zekâ haberleri' },
  { ad: 'Öğrenme yolları', yol: '/ogren/yollar/', ozet: 'Rolüne göre rotalar' },
  { ad: 'Araştırma', yol: '/arastirma/', ozet: 'Raporlar ve benchmarklar' },
];

export default function BulunamadiSayfasi() {
  return (
    <div className="kap flex min-h-[70vh] flex-col justify-center py-20">
      <p className="etiket-mono text-metin-soluk">404</p>
      <h1 className="mt-4 max-w-2xl text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl">
        Bu adreste bir içerik yok.
      </h1>
      <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-metin-ikincil">
        Aradığınız sayfa taşınmış veya henüz yayımlanmamış olabilir. Aşağıdaki başlangıç noktalarını
        deneyebilir ya da{' '}
        <kbd className="etiket-mono rounded border border-kenar bg-yuzey-2 px-1.5 py-0.5">⌘K</kbd>{' '}
        ile arama yapabilirsiniz.
      </p>

      <div className="mt-8">
        <Dugme href="/">
          Ana sayfaya dön
          <Ok className="size-4" />
        </Dugme>
      </div>

      <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
        {ONERILER.map((oneri) => (
          <li key={oneri.yol}>
            <Link
              href={oneri.yol}
              className="group block bg-zemin p-5 transition-colors hover:bg-yuzey-2"
            >
              <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                {oneri.ad}
              </span>
              <span className="mt-1 block text-xs text-metin-soluk">{oneri.ozet}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
