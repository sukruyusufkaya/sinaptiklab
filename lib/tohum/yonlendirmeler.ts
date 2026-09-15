import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { temizle, type Donusturucu, type TohumBelgesi } from '@/lib/tohum/tipler';

/**
 * Yönlendirme dönüştürücüsü.
 *
 * Bu koleksiyonun `lib/veri/*` karşılığı YOK: kaynak, eski projenin Atlas'taki
 * `redirects` koleksiyonudur (2 kayıt: `from`, `to`, `code`, `createdAt`).
 * `uret()` saf kalmak zorunda olduğu için o iki kayıt aşağıda SABİT dizi olarak
 * duruyor; değerler Atlas'tan birebir okundu, elle uydurulmadı.
 *
 * Alan eşlemesi:  from → kaynakYol,  to → hedefYol,  code → kod (JS number).
 * `createdAt` düşürüldü — şemada karşılığı yok; oluşturma damgasını
 * `scripts/tohumla.mjs` `olusturuldu`/`guncellendi` olarak kendisi yazıyor.
 *
 * YOL BİÇİMİ: değerler sondaki eğik çizgi OLMADAN saklanıyor. `next.config`
 * `trailingSlash: true` olsa da eski yönlendirme yöneticisi kaynak ve hedef
 * yolları kaydetmeden önce sondaki eğik çizgiyi atıyordu (`yoluNormalize`);
 * arama tarafı da aynı normalizasyonu uyguluyordu. Şema yalnızca `^/` deseni
 * istiyor, dolayısıyla kayıtlar olduğu gibi taşınıyor — yeni sorgu katmanı da
 * yolu aramadan önce normalize etmelidir.
 *
 * Bu koleksiyonda `durum` alanı yok (bkz. lib/admin/alanlar/yonlendirmeler.ts);
 * bu yüzden YAYINDA/TASLAK yazılmıyor, yayın akışını `aktif` mantık alanı
 * temsil ediyor.
 */

/** Eski `redirects` koleksiyonundan birebir okunan kayıtlar. */
const ESKI_KAYITLAR: ReadonlyArray<{ from: string; to: string; code: number }> = [
  {
    from: '/makale/rag-mi-fine-tuning-mi',
    to: '/makale/rag-fine-tuning-karsilastirmasi',
    code: 301,
  },
  {
    from: '/makale/kvkk-ve-yapay-zeka-uyum-rehberi',
    to: '/makale/kvkk-yapay-zeka-uyum-rehberi',
    code: 301,
  },
];

/** Şemadaki `kod` enum'u. Dışındaki değer yazılmaz, kayıt atlanır. */
const GECERLI_KODLAR = new Set([301, 302, 308]);

export const YONLENDIRMELER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.yonlendirmeler,
  anahtarAlan: 'kaynakYol',
  not: 'Eski Atlas koleksiyonu "redirects" (from/to/code) — alan adları şemaya eşlenir, aktif ve gerekçe eklenir.',
  uret: () =>
    ESKI_KAYITLAR.flatMap<TohumBelgesi>((kayit) => {
      if (!kayit.from.startsWith('/') || !kayit.to.startsWith('/')) {
        console.warn(
          `[tohum:yonlendirmeler] "${kayit.from}" atlandı — yol "/" ile başlamıyor (şema deseni: ^/).`,
        );
        return [];
      }

      if (!GECERLI_KODLAR.has(kayit.code)) {
        console.warn(
          `[tohum:yonlendirmeler] "${kayit.from}" atlandı — tanınmayan kod: ${kayit.code} (izinli: 301, 302, 308).`,
        );
        return [];
      }

      return [
        temizle({
          kaynakYol: kayit.from,
          hedefYol: kayit.to,
          kod: kayit.code,
          aktif: true,
          gerekce: 'Eski projeden taşındı.',
        }),
      ];
    }),
};
