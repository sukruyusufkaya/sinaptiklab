import { redirect } from 'next/navigation';

/**
 * İçerik ekranı, genel koleksiyon ekranının kendisidir.
 *
 * Ayrı bir liste yazmak iki ekranın zamanla ayrışması demek olurdu; tek
 * kanonik ekran tutup buraya gelen bağlantıyı oraya taşıyoruz. Sorgu
 * parametreleri (durum filtresi, arama) korunur.
 */
export default async function IcerikSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametreler = await searchParams;
  const sorgu = new URLSearchParams();

  for (const [ad, deger] of Object.entries(parametreler)) {
    const tek = Array.isArray(deger) ? deger[0] : deger;
    if (tek) sorgu.set(ad, tek);
  }

  const metin = sorgu.toString();
  redirect(`/admin/koleksiyon/icerikler/${metin ? `?${metin}` : ''}`);
}
