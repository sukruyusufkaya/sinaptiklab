import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Salt okunur panel listelerinin paylaşılan parçaları.
 *
 * `KayitListesi` genel CRUD motoruna (alan yapılandırması + düzenleme rotası)
 * bağlıdır; toplanan veri ekranlarının düzenleme formu YOKTUR, bu yüzden
 * kendi parçalarını kullanır. Süzgeçler ve sekmeler JS durumu değil BAĞLANTI
 * olarak çalışır: geri düğmesi çalışır, bağlantı paylaşılabilir.
 *
 * Hepsi sunucu bileşenidir; istemci paketi büyütmez.
 */

export function PanelBasligi({
  ustEtiket,
  baslik,
  aciklama,
  yan,
}: {
  ustEtiket: string;
  baslik: string;
  aciklama: string;
  yan?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="etiket-mono text-metin-soluk">{ustEtiket}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">{baslik}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-ikincil">{aciklama}</p>
      </div>
      {yan}
    </div>
  );
}

export type SeritOgesi = {
  ad: string;
  yol: string;
  adet?: number;
  etkin?: boolean;
};

/** Sekme veya süzgeç şeridi. Her öge bir URL'dir. */
export function BaglantiSeridi({
  etiket,
  ogeler,
  vurgulu,
}: {
  etiket: string;
  ogeler: SeritOgesi[];
  /** Sekme şeridi biraz daha belirgin durur; süzgeç şeridi sakin. */
  vurgulu?: boolean;
}) {
  return (
    <nav aria-label={etiket} className="flex flex-wrap items-center gap-1.5">
      <span className="etiket-mono mr-1 text-metin-soluk">{etiket}</span>
      {ogeler.map((oge) => (
        <Link
          key={oge.yol}
          href={oge.yol}
          aria-current={oge.etkin ? 'page' : undefined}
          className={`rounded-full border transition-colors ${
            vurgulu ? 'px-3.5 py-1.5 text-[0.8125rem]' : 'px-2.5 py-1 text-xs'
          } ${
            oge.etkin
              ? 'border-vurgu/45 bg-vurgu-zemin text-vurgu-parlak'
              : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
          }`}
        >
          {oge.ad}
          {typeof oge.adet === 'number' && (
            <span className="ml-1.5 font-mono text-[0.625rem] text-metin-soluk tabular-nums">
              {oge.adet}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export type Sayac = {
  etiket: string;
  deger: number | string;
  /** Dikkat çekmesi gereken sayaç (bekleyen iş, süresi geçmiş kayıt). */
  uyari?: boolean;
  ipucu?: string;
};

/** Sayaç şeridi. Değer 0 ise gizlenmez — sıfır da bir bilgidir. */
export function SayacSeridi({ ogeler }: { ogeler: Sayac[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {ogeler.map((oge) => (
        <div
          key={oge.etiket}
          title={oge.ipucu}
          className={`rounded-xl border px-4 py-3 ${
            oge.uyari ? 'border-uyari/35 bg-uyari/10' : 'border-kenar bg-yuzey/40'
          }`}
        >
          <dt className="etiket-mono text-metin-soluk">{oge.etiket}</dt>
          <dd
            className={`mt-1 font-mono text-lg tabular-nums ${
              oge.uyari ? 'text-uyari' : 'text-metin'
            }`}
          >
            {oge.deger}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Boş liste.
 *
 * Boş bir koleksiyon DOLU gösterilmez ve boşluğun nedeni UYDURULMAZ: ekran
 * yalnızca kayıt olmadığını ve kaydın nereden geldiğini söyler.
 */
export function BosKayit({ baslik, metin }: { baslik: string; metin: string }) {
  return (
    <div className="rounded-xl border border-dashed border-kenar-guclu bg-zemin-derin/60 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-metin">{baslik}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-metin-soluk">{metin}</p>
    </div>
  );
}

export function TabloKabugu({
  basliklar,
  genislikSinifi = 'min-w-[52rem]',
  children,
}: {
  basliklar: string[];
  /** Tablonun en az genişliği; dar ekranda kabuk yatay kaydırır. */
  genislikSinifi?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-kenar">
      <table className={`w-full border-collapse text-sm ${genislikSinifi}`}>
        <thead>
          <tr className="bg-zemin-derin">
            {basliklar.map((baslik) => (
              <th
                key={baslik}
                scope="col"
                className="etiket-mono border-b border-kenar px-3 py-2.5 text-left text-metin-soluk"
              >
                {baslik}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Sayfalama({
  sayfa,
  sayfaSayisi,
  toplam,
  yolKur,
}: {
  sayfa: number;
  sayfaSayisi: number;
  toplam: number;
  yolKur: (sayfa: number) => string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-metin-soluk">
        {toplam} kayıt · sayfa {sayfa}/{sayfaSayisi}
      </p>
      {sayfaSayisi > 1 && (
        <nav aria-label="Sayfalar" className="flex gap-1.5">
          {sayfa > 1 && (
            <Link
              href={yolKur(sayfa - 1)}
              className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
            >
              ← önceki
            </Link>
          )}
          {sayfa < sayfaSayisi && (
            <Link
              href={yolKur(sayfa + 1)}
              className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
            >
              sonraki →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

/** Saklama süresi hücresi — geçmiş kayıt işaretlenir, süresi olmayan uyarılır. */
export function SaklamaHucresi({
  metin,
  gecti,
  tanimli,
}: {
  metin: string;
  gecti: boolean;
  tanimli: boolean;
}) {
  if (!tanimli) {
    return (
      <span
        className="etiket-mono text-tehlike"
        title="saklamaBitis alanı yok; TTL bu kaydı silmez"
      >
        süre yok
      </span>
    );
  }
  return (
    <span className={`font-mono text-xs ${gecti ? 'text-uyari' : 'text-metin-soluk'}`}>
      {metin}
    </span>
  );
}
