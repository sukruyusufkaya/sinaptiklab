import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { Ok } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { yazarListesi } from '@/lib/icerik/temel';
import { tumGundem } from '@/lib/icerik/gundem';
import { atlasListesi } from '@/lib/icerik/atlas';

export const metadata: Metadata = {
  title: 'Yazarlar',
  description:
    'Sinaptik Lab yazar profilleri: uzmanlık alanları, yayımlanan içerikler ve inceleme görevleri.',
  alternates: { canonical: '/yazar/' },
};

export default async function YazarlarSayfasi() {
  const [YAZAR_LISTESI, TUM_GUNDEM, ATLAS] = await Promise.all([
    yazarListesi(),
    tumGundem(),
    atlasListesi(),
  ]);

  return (
    <>
      <ListeSemasi
        ad="Yazarlar"
        ogeler={YAZAR_LISTESI.map((yazar) => ({ ad: yazar.ad, yol: `/yazar/${yazar.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Yazarlar', yol: '/yazar/' }]}
        etiket="EDİTORYAL"
        baslik="Yazarlar"
        ozet="Her makalenin yazarı görünürdür ve buradaki profiline bağlanır. Profil, uzmanlık alanını ve yayımlanan içerikleri gösterir."
        olcumler={[
          { deger: `${YAZAR_LISTESI.length}`, etiket: 'Yazar' },
          { deger: `${TUM_GUNDEM.length}`, etiket: 'Gündem içeriği' },
          { deger: `${ATLAS.length}`, etiket: 'Atlas girdisi' },
        ]}
        desen="nokta"
      />

      <Bolum>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {YAZAR_LISTESI.map((yazar) => {
            const icerikSayisi = TUM_GUNDEM.filter(
              (icerik) => icerik.yazar.slug === yazar.slug,
            ).length;
            const atlasSayisi = ATLAS.filter((girdi) => girdi.yazarSlug === yazar.slug).length;

            return (
              <li key={yazar.slug}>
                <Link
                  href={`/yazar/${yazar.slug}/`}
                  className="group flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-vurgu/45 hover:bg-yuzey/70"
                >
                  <span className="etiket-mono grid size-14 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-base text-vurgu-parlak">
                    {yazar.basHarfler}
                  </span>
                  <span className="mt-5 block text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {yazar.ad}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] text-metin-ikincil">
                    {yazar.unvan}
                  </span>
                  {yazar.ozgecmis && (
                    <span className="mt-3 flex-1 text-xs leading-relaxed text-metin-soluk">
                      {yazar.ozgecmis}
                    </span>
                  )}
                  <span className="etiket-mono mt-5 flex items-center gap-4 border-t border-kenar-soluk pt-4 text-metin-soluk">
                    <span>{icerikSayisi} gündem</span>
                    <span>{atlasSayisi} atlas</span>
                    <Ok className="ml-auto size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Bolum>
    </>
  );
}
