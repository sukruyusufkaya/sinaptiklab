import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Ok } from '@/components/arayuz/Ikonlar';
import { uzmanListesi } from '@/lib/icerik/yayin';

export async function Uzmanlar() {
  const UZMANLAR = await uzmanListesi();
  if (UZMANLAR.length === 0) return null;

  return (
    <Bolum kimlik="uzmanlar" zemin="derin" etiketlendiren="uzman-basligi">
      <BolumBasligi
        numara="12"
        etiket="TOPLULUK"
        baslik={<span id="uzman-basligi">Arkasında isim olan içerik</span>}
        aciklama="Her makalenin yazarı görünür, teknik incelemeden geçer ve yazar profiline bağlanır."
        baglantiYolu="/uzmanlar/"
        baglantiMetni="Tüm uzmanlar"
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {UZMANLAR.map((uzman) => {
          const bos = uzman.ad === 'Katkı bekleniyor';
          return (
            <li key={uzman.slug}>
              <Link
                href={bos ? '/topluluk/katki/' : `/yazar/${uzman.slug}/`}
                className={`group flex h-full flex-col rounded-2xl border p-5 transition-[border-color,background-color] duration-300 ${
                  bos
                    ? 'border-dashed border-kenar-guclu bg-transparent hover:border-vurgu'
                    : 'border-kenar bg-yuzey/40 hover:border-vurgu/45 hover:bg-yuzey/70'
                }`}
              >
                <span
                  className={`grid size-12 place-items-center rounded-full border text-sm font-medium ${
                    bos
                      ? 'border-dashed border-kenar-guclu text-metin-soluk'
                      : 'border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak'
                  }`}
                >
                  {uzman.basHarfler}
                </span>

                <span className="mt-4 block text-[0.9375rem] font-semibold tracking-tight text-metin">
                  {uzman.ad}
                </span>
                <span className="mt-0.5 block text-xs text-metin-ikincil">{uzman.unvan}</span>
                <span className="etiket-mono mt-3 block text-metin-soluk">{uzman.alan}</span>

                <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-medium text-metin-soluk transition-colors group-hover:text-vurgu-parlak">
                  {bos ? 'Katkıda bulun' : 'Profili gör'}
                  <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Bolum>
  );
}
