import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { KayitListesi } from '@/components/admin/KayitListesi';
import { Ok } from '@/components/arayuz/Ikonlar';
import { yapilandirmaBul } from '@/lib/admin/alanlar/kayit';
import { kayitlariListele } from '@/lib/mongo/sorgular/yonetim';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { izinVarMi, KOLEKSIYON_IZNI } from '@/lib/yetki/roller';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ koleksiyon: string }>;
}): Promise<Metadata> {
  const { koleksiyon } = await params;
  const yapilandirma = yapilandirmaBul(koleksiyon);
  return { title: yapilandirma?.cogul ?? 'Koleksiyon' };
}

export default async function KoleksiyonListesiSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ koleksiyon: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { koleksiyon } = await params;
  const sorguParametreleri = await searchParams;

  const yapilandirma = yapilandirmaBul(koleksiyon);
  if (!yapilandirma) notFound();

  const kullanici = await oturumGerekli();
  const izinler = KOLEKSIYON_IZNI[koleksiyon];

  // Kayıt defterinde olsa bile izni olmayan koleksiyon görünmez.
  if (!izinler || !izinVarMi(kullanici.roller, izinler.oku)) notFound();

  const tekDeger = (ad: string): string | undefined => {
    const deger = sorguParametreleri[ad];
    return Array.isArray(deger) ? deger[0] : deger;
  };

  const sorgu: Record<string, string | undefined> = { ara: tekDeger('ara') };
  for (const filtre of yapilandirma.filtreler ?? []) {
    sorgu[filtre.ad] = tekDeger(filtre.ad);
  }
  const sayfa = Number(tekDeger('sayfa') ?? '1');
  if (sayfa > 1) sorgu.sayfa = String(sayfa);

  const filtreler: Record<string, string | undefined> = {};
  for (const filtre of yapilandirma.filtreler ?? []) {
    filtreler[filtre.ad] = sorgu[filtre.ad];
  }

  const sonuc = await kayitlariListele(koleksiyon, {
    filtreler,
    arama: sorgu.ara,
    aramaAlanlari: yapilandirma.aramaAlanlari,
    siralama: yapilandirma.siralama,
    sayfa: Number.isFinite(sayfa) ? sayfa : 1,
  });

  const temelYol = `/admin/koleksiyon/${koleksiyon}/`;
  const yazabilir = izinVarMi(kullanici.roller, izinler.yaz);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="etiket-mono text-metin-soluk">KOLEKSİYON</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">
            {yapilandirma.cogul}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-ikincil">
            {yapilandirma.aciklama}
          </p>
        </div>

        {yazabilir && yapilandirma.olusturulabilir !== false && (
          <Link
            href={`${temelYol}yeni/`}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-vurgu px-4 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak"
          >
            Yeni {yapilandirma.ad.toLocaleLowerCase('tr-TR')}
            <Ok className="size-4" />
          </Link>
        )}
      </div>

      <KayitListesi yapilandirma={yapilandirma} sonuc={sonuc} sorgu={sorgu} temelYol={temelYol} />
    </div>
  );
}
