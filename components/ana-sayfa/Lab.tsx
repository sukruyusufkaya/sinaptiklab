import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Kod, Ok } from '@/components/arayuz/Ikonlar';
import { labProjeleri } from '@/lib/icerik/lab';

export async function Lab() {
  const LAB_PROJELERI = await labProjeleri();
  if (LAB_PROJELERI.length === 0) return null;

  return (
    <Bolum kimlik="lab" etiketlendiren="lab-basligi">
      <BolumBasligi
        numara="10"
        etiket="BUILD"
        baslik={<span id="lab-basligi">Sinaptik Lab</span>}
        aciklama="Markadaki “Lab” gerçek olmalı: hesaplayıcılar, deneyler ve açık kaynak araçlar."
        baglantiYolu="/lab/"
        baglantiMetni="Lab'a git"
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LAB_PROJELERI.map((proje) => (
          <li key={proje.slug}>
            <Link
              href={`/lab/${proje.slug}/`}
              className="group relative flex h-full items-start gap-4 overflow-hidden rounded-xl border border-kenar bg-yuzey/40 p-5 transition-[border-color,transform] duration-300 ease-sinaptik hover:-translate-y-0.5 hover:border-sinyal/40"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-kenar bg-zemin text-metin-soluk transition-colors group-hover:border-sinyal/40 group-hover:text-sinyal">
                <Kod className="size-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[0.9375rem] font-medium text-metin">
                    {proje.ad}
                  </span>
                  <span className="etiket-mono shrink-0 text-metin-soluk">{proje.tur}</span>
                </span>
                <span className="mt-1.5 block text-xs leading-relaxed text-metin-soluk">
                  {proje.ozet}
                </span>
              </span>

              <Ok className="size-4 shrink-0 self-center text-metin-soluk opacity-0 transition-all duration-200 ease-sinaptik group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </Bolum>
  );
}
