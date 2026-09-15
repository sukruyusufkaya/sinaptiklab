import Link from 'next/link';
import { DurumRozeti } from '@/components/admin/KayitFormu';
import { Ok } from '@/components/arayuz/Ikonlar';
import { alanDegeri, type KoleksiyonYapilandirmasi } from '@/lib/admin/alanlar/tipler';
import type { ListeSonucu } from '@/lib/mongo/sorgular/yonetim';

/**
 * Kayıt listesi — sunucu bileşeni.
 *
 * Filtreler ve arama JS DURUMU DEĞİL bağlantı olarak çalışır: her filtre bir
 * URL'dir, geri düğmesi çalışır, bağlantı paylaşılabilir ve sayfa JS olmadan
 * da kullanılabilir (§51 ile aynı ilke).
 */

/** Enum değerini görünen ada çevirir; karşılığı yoksa ham değeri döndürür. */
function secenekEtiketi(deger: unknown, secenekler?: readonly { deger: string; etiket: string }[]) {
  if (!secenekler || typeof deger !== 'string') return deger;
  return secenekler.find((s) => s.deger === deger)?.etiket ?? deger;
}

function hucreMetni(deger: unknown, enCok?: number): string {
  if (deger === null || deger === undefined) return '—';
  if (typeof deger === 'boolean') return deger ? 'Evet' : 'Hayır';
  if (deger instanceof Date) return deger.toISOString().slice(0, 10);
  if (Array.isArray(deger)) return `${deger.length} öge`;
  if (typeof deger === 'object') return '{…}';
  const metin = String(deger);
  return enCok && metin.length > enCok ? `${metin.slice(0, enCok - 1)}…` : metin;
}

function sorguKur(
  mevcut: Record<string, string | undefined>,
  degisiklikler: Record<string, string | undefined>,
): string {
  const parametreler = new URLSearchParams();
  for (const [ad, deger] of Object.entries({ ...mevcut, ...degisiklikler })) {
    if (deger && deger !== 'tumu') parametreler.set(ad, deger);
  }
  const metin = parametreler.toString();
  return metin ? `?${metin}` : '';
}

export function KayitListesi({
  yapilandirma,
  sonuc,
  sorgu,
  temelYol,
}: {
  yapilandirma: KoleksiyonYapilandirmasi;
  sonuc: ListeSonucu;
  sorgu: Record<string, string | undefined>;
  temelYol: string;
}) {
  return (
    <div className="space-y-4">
      {/* Arama */}
      <form action={temelYol} method="get" className="flex flex-wrap gap-2">
        {Object.entries(sorgu)
          .filter(([ad]) => ad !== 'ara' && ad !== 'sayfa')
          .map(([ad, deger]) =>
            deger ? <input key={ad} type="hidden" name={ad} value={deger} /> : null,
          )}
        <input
          type="search"
          name="ara"
          defaultValue={sorgu.ara ?? ''}
          placeholder={`${yapilandirma.cogul} içinde ara…`}
          aria-label="Ara"
          className="h-9 min-w-52 flex-1 rounded-lg border border-kenar bg-zemin px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu"
        />
        <button
          type="submit"
          className="rounded-lg border border-kenar px-4 text-sm text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
        >
          Ara
        </button>
        {sorgu.ara && (
          <Link
            href={temelYol + sorguKur(sorgu, { ara: undefined, sayfa: undefined })}
            className="flex items-center px-2 text-sm text-metin-soluk hover:text-metin"
          >
            temizle
          </Link>
        )}
      </form>

      {/* Filtreler */}
      {yapilandirma.filtreler?.map((filtre) => (
        <div key={filtre.ad} className="flex flex-wrap items-center gap-1.5">
          <span className="etiket-mono mr-1 text-metin-soluk">{filtre.etiket}</span>
          {[{ deger: 'tumu', etiket: 'Tümü' }, ...filtre.secenekler].map((secenek) => {
            const etkin = (sorgu[filtre.ad] ?? 'tumu') === secenek.deger;
            return (
              <Link
                key={secenek.deger}
                href={temelYol + sorguKur(sorgu, { [filtre.ad]: secenek.deger, sayfa: undefined })}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  etkin
                    ? 'border-vurgu/45 bg-vurgu-zemin text-vurgu-parlak'
                    : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
                }`}
              >
                {secenek.etiket}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Tablo */}
      {sonuc.kayitlar.length === 0 ? (
        <p className="rounded-xl border border-dashed border-kenar-guclu px-5 py-10 text-center text-sm text-metin-soluk">
          {sorgu.ara || Object.keys(sorgu).length > 1
            ? 'Bu ölçütlere uyan kayıt yok.'
            : `Henüz ${yapilandirma.ad.toLocaleLowerCase('tr-TR')} kaydı yok.`}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-kenar">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="bg-zemin-derin">
                {yapilandirma.listeKolonlari.map((kolon) => (
                  <th
                    key={kolon.ad}
                    scope="col"
                    className="etiket-mono border-b border-kenar px-4 py-2.5 text-left text-metin-soluk"
                  >
                    {kolon.etiket}
                  </th>
                ))}
                <th scope="col" className="border-b border-kenar px-4 py-2.5">
                  <span className="yalniz-ekran-okuyucu">İşlem</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sonuc.kayitlar.map((kayit) => {
                const kimlik = String(kayit._id);
                return (
                  <tr key={kimlik} className="group border-b border-kenar-soluk last:border-0">
                    {yapilandirma.listeKolonlari.map((kolon) => {
                      const hamDeger = alanDegeri(kayit, kolon.ad);
                      const deger = secenekEtiketi(hamDeger, kolon.secenekler);
                      const durumMu = kolon.ad === 'durum';
                      return (
                        <td
                          key={kolon.ad}
                          className={`px-4 py-2.5 align-top ${
                            kolon.mono ? 'font-mono text-xs tabular-nums' : ''
                          } ${kolon.ad === yapilandirma.baslikAlani ? 'text-metin' : 'text-metin-ikincil'}`}
                        >
                          {durumMu && typeof deger === 'string' ? (
                            <DurumRozeti durum={deger} />
                          ) : (
                            hucreMetni(deger, kolon.enCok)
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-right align-top">
                      <Link
                        href={`${temelYol}${kimlik}/`}
                        className="inline-flex items-center gap-1 text-xs text-vurgu-parlak opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        düzenle
                        <Ok className="size-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sayfalama */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-metin-soluk">
          {sonuc.toplam} kayıt · sayfa {sonuc.sayfa}/{sonuc.sayfaSayisi}
        </p>
        {sonuc.sayfaSayisi > 1 && (
          <nav aria-label="Sayfalar" className="flex gap-1.5">
            {sonuc.sayfa > 1 && (
              <Link
                href={temelYol + sorguKur(sorgu, { sayfa: String(sonuc.sayfa - 1) })}
                className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
              >
                ← önceki
              </Link>
            )}
            {sonuc.sayfa < sonuc.sayfaSayisi && (
              <Link
                href={temelYol + sorguKur(sorgu, { sayfa: String(sonuc.sayfa + 1) })}
                className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
              >
                sonraki →
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
