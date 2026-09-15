import Link from 'next/link';
import { sayi } from '@/lib/metin';
import { IS_YUKLERI, aylikMaliyet, type IsYuku, type KiyasKaydi } from '@/lib/modeller/kiyas';

/**
 * İş yükü maliyet paneli.
 *
 * NEDEN VAR: `fiyatlandirma` alanı 135 model kaydında doluydu ve sitenin
 * hiçbir yerinde basılmıyordu. Tabloya iki satır eklemek ("girdi 1M token",
 * "çıktı 1M token") bilgiyi görünür kılar ama KARARI kolaylaştırmaz: 3 USD
 * girdi + 15 USD çıktı ile 10 USD girdi + 5 USD çıktı arasında hangisinin
 * ucuz olduğu, iş yükünün girdi/çıktı oranına bağlıdır. Panel o oranı
 * açık bir varsayıma çevirip çarpımı yapar.
 *
 * SAYILARIN STATÜSÜ: birim fiyatlar sağlayıcının yayımladığı liste
 * fiyatlarıdır ve her hücre kaynağına bağlıdır. Token HACİMLERİ ise
 * varsayımdır ve öyle etiketlenir (CLAUDE.md §5) — ölçüm gibi sunulmaz.
 * Formül ekranda yazılıdır ki okur kendi rakamıyla yeniden hesaplayabilsin.
 *
 * KAPSAM DIŞI: indirimli toplu iş tarifeleri, istem önbelleği indirimi,
 * bağlam eşiği üstü çarpanlar ve taahhütlü kurumsal anlaşmalar. Bunlar
 * kayıtta yapılandırılmış biçimde yok; varmış gibi hesaplamak yanıltırdı.
 */

type Props = {
  kayitlar: KiyasKaydi[];
  isYuku: IsYuku;
  /** Senaryo bağlantılarında korunacak diğer parametreler. */
  sorgu: { m: string; fark: boolean };
};

export function MaliyetPaneli({ kayitlar, isYuku, sorgu }: Props) {
  const satirlar = kayitlar.map((kayit) => ({
    kayit,
    tutar: aylikMaliyet(kayit.token, isYuku),
    paraBirimi: kayit.token?.paraBirimi ?? 'USD',
  }));

  const hesaplanan = satirlar.filter((s) => s.tutar != null);
  const paraBirimleri = new Set(hesaplanan.map((s) => s.paraBirimi));
  const karisikPara = paraBirimleri.size > 1;
  const enYuksek = Math.max(...hesaplanan.map((s) => s.tutar ?? 0), 0);
  const enDusuk =
    hesaplanan.length > 1 && !karisikPara ? Math.min(...hesaplanan.map((s) => s.tutar!)) : null;

  function bag(anahtar: string) {
    const p = new URLSearchParams({ m: sorgu.m, is: anahtar });
    if (sorgu.fark) p.set('fark', '1');
    return `/karsilastir/?${p.toString()}#maliyet`;
  }

  return (
    <div className="rounded-2xl border border-kenar bg-yuzey/40">
      {/* Senaryo seçimi — bağlantı, JS durumu değil: paylaşılabilir kalır. */}
      <div className="flex flex-wrap gap-2 border-b border-kenar-soluk p-5">
        {IS_YUKLERI.map((yuk) => {
          const etkin = yuk.anahtar === isYuku.anahtar;
          return (
            <Link
              key={yuk.anahtar}
              href={bag(yuk.anahtar)}
              scroll={false}
              aria-current={etkin ? 'true' : undefined}
              className={`rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-[border-color,background-color,color] duration-200 ${
                etkin
                  ? 'border-vurgu/50 bg-vurgu-zemin text-vurgu-parlak'
                  : 'border-kenar bg-zemin/50 text-metin-soluk hover:border-kenar-guclu hover:text-metin'
              }`}
            >
              {yuk.ad}
            </Link>
          );
        })}
      </div>

      <div className="p-5">
        <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">{isYuku.aciklama}</p>
        <p className="etiket-mono mt-2 text-metin-soluk">
          varsayım: ayda {sayi(isYuku.milyonGirdi)}M girdi + {sayi(isYuku.milyonCikti)}M çıktı
          tokenı
        </p>

        {hesaplanan.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-kenar-guclu px-5 py-8 text-center text-[0.875rem] text-metin-ikincil">
            Seçilen modellerin hiçbirinde 1M token birimli, hem girdi hem çıktı fiyatı yayımlanmış
            bir tarife yok. Token tarifesi olan modelleri süzmek için seçicideki{' '}
            <span className="text-metin">Token tarifesi yayımlı</span> düğmesini kullanın.
          </p>
        ) : (
          <ul className="mt-5 space-y-3.5">
            {satirlar.map(({ kayit, tutar, paraBirimi }) => (
              <li key={kayit.slug}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-[0.9375rem] font-medium text-metin">{kayit.ad}</span>
                  {tutar == null ? (
                    <span className="text-[0.8125rem] text-metin-soluk">
                      tarife eksik — hesaplanmadı
                    </span>
                  ) : (
                    <span
                      className={`font-mono text-[0.9375rem] tabular-nums ${tutar === enDusuk ? 'font-semibold text-basari' : 'text-metin'}`}
                    >
                      {sayi(tutar)} {paraBirimi}
                      <span className="etiket-mono ml-1.5 text-metin-soluk">/ay</span>
                    </span>
                  )}
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-kenar-soluk"
                  role="presentation"
                >
                  <div
                    className={`h-full rounded-full ${tutar === enDusuk ? 'bg-basari' : 'bg-vurgu'}`}
                    style={{
                      width: `${tutar == null || enYuksek === 0 ? 0 : (tutar / enYuksek) * 100}%`,
                    }}
                  />
                </div>
                {tutar != null && (
                  <p className="etiket-mono mt-1 text-metin-soluk">
                    {sayi(kayit.token!.girdi!)} × {sayi(isYuku.milyonGirdi)} +{' '}
                    {sayi(kayit.token!.cikti!)} × {sayi(isYuku.milyonCikti)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {karisikPara && (
          <p className="mt-5 rounded-xl border border-uyari/25 bg-uyari/8 px-4 py-3 text-xs leading-relaxed text-uyari">
            Seçimde birden çok para birimi var ({[...paraBirimleri].join(', ')}). Tutarlar
            sıralanmadı: kur varsaymak, doğrulanmamış bir sayı üretmek olurdu.
          </p>
        )}

        <p className="mt-5 border-t border-kenar-soluk pt-4 text-xs leading-relaxed text-metin-soluk">
          Hesap düz çarpımdır:{' '}
          <span className="text-metin-ikincil">
            girdi fiyatı × girdi milyonu + çıktı fiyatı × çıktı milyonu
          </span>
          . Toplu iş indirimi, istem önbelleği indirimi, bağlam eşiği üstü çarpanlar ve taahhütlü
          anlaşmalar hesaba KATILMAZ; bunlar kayıtta yapılandırılmış biçimde bulunmuyor. Gerçek
          faturanız, tarifenizin bu kalemlerine göre bu rakamın altında veya üstünde çıkabilir.
        </p>
      </div>
    </div>
  );
}
