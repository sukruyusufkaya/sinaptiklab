import type { Metadata } from 'next';
import Link from 'next/link';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { oturumGerekli } from '@/lib/yetki/oturum';

export const metadata: Metadata = { title: 'Tazelik denetimi' };
export const dynamic = 'force-dynamic';

/**
 * Tazelik denetimi.
 *
 * Varlık sayfaları (Atlas, model, araç, şirket) `sonDogrulama` tarihi taşır ve
 * bu tarih sayfada GÖRÜNÜR. Görünen bir tarih eskidiğinde sayfa bir güven
 * sorunu üretir: okur "doğrulanmış" yazısını görür, tarih iki yıl öncedir.
 *
 * Bu ekran o açığı görünür kılar. Eşikler koleksiyon bazında farklıdır:
 * model kartları hızlı eskir, kavram girdileri yavaş.
 */

const DENETLENEN = [
  { koleksiyon: KOLEKSIYONLAR.modeller, ad: 'Modeller', gun: 90, baslik: 'ad' },
  { koleksiyon: KOLEKSIYONLAR.araclar, ad: 'Araçlar', gun: 120, baslik: 'ad' },
  { koleksiyon: KOLEKSIYONLAR.sirketler, ad: 'Şirketler', gun: 180, baslik: 'ad' },
  { koleksiyon: KOLEKSIYONLAR.atlas, ad: 'Atlas girdileri', gun: 365, baslik: 'ad' },
] as const;

function gunFarki(tarih: string, simdi: number): number {
  const zaman = Date.parse(tarih);
  if (Number.isNaN(zaman)) return Number.POSITIVE_INFINITY;
  return Math.floor((simdi - zaman) / 86_400_000);
}

async function tazelikTopla() {
  const db = await veritabani();
  const simdi = Date.now();

  const gruplar = await Promise.all(
    DENETLENEN.map(async (hedef) => {
      const kayitlar = await db
        .collection(hedef.koleksiyon)
        .find({}, { projection: { slug: 1, ad: 1, baslik: 1, sonDogrulama: 1, durum: 1 } })
        .limit(500)
        .toArray();

      const isaretli = kayitlar
        .map((kayit) => {
          const tarih = typeof kayit.sonDogrulama === 'string' ? kayit.sonDogrulama : undefined;
          const yas = tarih ? gunFarki(tarih, simdi) : Number.POSITIVE_INFINITY;
          return {
            kimlik: String(kayit._id),
            slug: typeof kayit.slug === 'string' ? kayit.slug : '',
            baslik:
              (typeof kayit.ad === 'string' && kayit.ad) ||
              (typeof kayit.baslik === 'string' && kayit.baslik) ||
              '(adsız)',
            tarih,
            yas,
            durum: typeof kayit.durum === 'string' ? kayit.durum : undefined,
          };
        })
        .filter((k) => k.yas > hedef.gun)
        .sort((a, b) => b.yas - a.yas);

      return { ...hedef, toplam: kayitlar.length, isaretli };
    }),
  );

  return {
    gruplar,
    toplamIsaretli: gruplar.reduce((t, g) => t + g.isaretli.length, 0),
  };
}

export default async function TazelikSayfasi() {
  await oturumGerekli();
  const veri = await tazelikTopla();

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="etiket-mono text-metin-soluk">DENETİM</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">Tazelik denetimi</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-ikincil">
          Varlık sayfaları son doğrulama tarihini okura gösterir. Tarih eskidiğinde sayfa bir güven
          sorunu üretir. Eşikler koleksiyona göre değişir: model kartları hızlı, kavram girdileri
          yavaş eskir.
        </p>
      </div>

      {veri.toplamIsaretli === 0 ? (
        <p className="rounded-xl border border-basari/35 bg-basari/10 px-5 py-8 text-center text-sm text-basari">
          Eşiği aşan kayıt yok. Tüm varlık sayfalarının doğrulama tarihi güncel.
        </p>
      ) : (
        <p className="rounded-xl border border-uyari/35 bg-uyari/10 px-4 py-3 text-sm text-uyari">
          {veri.toplamIsaretli} kayıt doğrulama eşiğini aştı.
        </p>
      )}

      {veri.gruplar.map((grup) => (
        <section key={grup.koleksiyon}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="etiket-mono text-metin">
              {grup.ad} · eşik {grup.gun} gün
            </h2>
            <span className="etiket-mono text-metin-soluk">
              {grup.isaretli.length}/{grup.toplam} işaretli
            </span>
          </div>

          {grup.isaretli.length === 0 ? (
            <p className="rounded-xl border border-dashed border-kenar-guclu px-4 py-5 text-sm text-metin-soluk">
              {grup.toplam === 0 ? 'Bu koleksiyonda henüz kayıt yok.' : 'Tümü eşiğin içinde.'}
            </p>
          ) : (
            <ul className="divide-y divide-kenar-soluk overflow-hidden rounded-xl border border-kenar">
              {grup.isaretli.slice(0, 25).map((kayit) => (
                <li
                  key={kayit.kimlik}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-yuzey/30 px-4 py-2.5 text-sm"
                >
                  <Link
                    href={`/admin/koleksiyon/${grup.koleksiyon}/${kayit.kimlik}/`}
                    className="min-w-0 flex-1 truncate text-metin transition-colors hover:text-vurgu-parlak"
                  >
                    {kayit.baslik}
                  </Link>
                  <span className="etiket-mono shrink-0 text-metin-soluk">
                    {kayit.tarih ?? 'tarih yok'}
                  </span>
                  <span
                    className={`etiket-mono shrink-0 ${
                      kayit.yas === Number.POSITIVE_INFINITY ? 'text-tehlike' : 'text-uyari'
                    }`}
                  >
                    {kayit.yas === Number.POSITIVE_INFINITY
                      ? 'hiç doğrulanmadı'
                      : `${kayit.yas} gün`}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {grup.isaretli.length > 25 && (
            <p className="mt-2 text-xs text-metin-soluk">
              İlk 25 kayıt gösteriliyor ({grup.isaretli.length} toplam).
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
