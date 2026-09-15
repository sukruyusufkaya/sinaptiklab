import { SITE } from '@/lib/site';
import { ANA_MENU, ALTLIK_SUTUNLARI, ALTLIK_YASAL } from '@/lib/rotalar';
import { arastirmaListesi, ARASTIRMA_TURLERI } from '@/lib/icerik/arastirma';
import { atlasListesi, ATLAS_KATEGORILERI } from '@/lib/icerik/atlas';
import { analizler, briefArsivi, GUNDEM_KATEGORILERI, radar, tumGundem } from '@/lib/icerik/gundem';
import { dersler, ogrenmeYollari, testler } from '@/lib/icerik/ogrenme';
import { aracListesi, KARSILASTIRMALAR, modelListesi, sirketListesi } from '@/lib/icerik/varliklar';
import { hizmetler, sektorler, vakalar } from '@/lib/icerik/kurumsal';
import {
  DERGI_BOLUMLERI,
  dergiSayiListesi,
  etkinlikListesi,
  podcastListesi,
  rehberListesi,
} from '@/lib/icerik/yayin';
import { labProjeleri, meslekler } from '@/lib/icerik/lab';
import { konuListesi, yazarListesi } from '@/lib/icerik/temel';

/**
 * Site haritası parçaları (MASTER-PLAN §50).
 *
 * NEDEN BÖLÜNDÜ: tek `sitemap.xml` içerik hacmi büyüdükçe hem 50.000 URL /
 * 50 MB sınırına yaklaşır hem de tarama teşhisini imkânsız kılar — Search
 * Console tek bir dosya için tek bir hata sayısı gösterir. Adlandırılmış
 * parçalar ("atlas", "gundem", "akademi"…) her bölümün tarama durumunu ayrı
 * ayrı okunabilir yapar.
 *
 * NEDEN `app/sitemap.ts` DEĞİL: Next'in yerleşik `MetadataRoute.Sitemap` tipi
 * `<sitemapindex>` üretemez ve Google News'in gerektirdiği `news:` ad alanını
 * taşıyamaz. Bu yüzden XML elle üretilir; karşılığında indeksin ve haber
 * haritasının tam denetimi elde edilir.
 *
 * VERİ KAYNAĞI: `lib/icerik/*` — sayfaların okuduğu aynı MongoDB katmanı.
 * Okuma katmanı yalnızca `durum: 'yayinda'` döndürdüğü için TASLAK bir kayıt
 * haritaya giremez (daha önce fixture okunduğu için `/lab/playground/` gibi
 * yayımlanmamış adresler haritaya sızıyordu).
 */

export type HaritaGirdisi = {
  yol: string;
  sonDegisim?: Date;
  siklik?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  oncelik?: number;
  /** Google News haritası için — yalnızca `gundem` parçasında kullanılır. */
  haber?: { baslik: string; yayinTarihi: Date };
};

export type HaritaParcasi = {
  ad: string;
  aciklama: string;
  uret: () => Promise<HaritaGirdisi[]>;
};

/* --- XML ----------------------------------------------------------------- */

/**
 * XML metin kaçışı.
 *
 * Başlıklar editör girdisidir: `&`, `<` veya `"` taşıyan tek bir başlık
 * kaçırılmazsa haritanın TAMAMI ayrıştırılamaz hâle gelir ve arama motoru hiç
 * URL göremez. Beş karakterin hepsi kaçırılır.
 */
export function xmlKacir(metin: string): string {
  return metin
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function tarih(deger?: Date): string | undefined {
  if (!deger || Number.isNaN(deger.getTime())) return undefined;
  return deger.toISOString();
}

/** Bir parçayı `<urlset>` belgesine çevirir. */
export function urlSetiOlustur(girdiler: readonly HaritaGirdisi[]): string {
  const satirlar = girdiler.map((g) => {
    const parcalar = [`    <loc>${xmlKacir(`${SITE.url}${g.yol}`)}</loc>`];
    const zaman = tarih(g.sonDegisim);
    if (zaman) parcalar.push(`    <lastmod>${zaman}</lastmod>`);
    if (g.siklik) parcalar.push(`    <changefreq>${g.siklik}</changefreq>`);
    if (g.oncelik !== undefined) parcalar.push(`    <priority>${g.oncelik.toFixed(1)}</priority>`);
    return `  <url>\n${parcalar.join('\n')}\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...satirlar,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * Google News haritası.
 *
 * Google News yalnızca SON İKİ GÜNÜN içeriğini bekler; daha eskisi buraya
 * konulmaz (normal `gundem` parçası onları zaten taşıyor). Yayın dili `tr`
 * sabittir — site tek dilli yayın yapıyor.
 */
export function haberHaritasiOlustur(girdiler: readonly HaritaGirdisi[]): string {
  const satirlar = girdiler
    .filter((g) => g.haber)
    .map((g) => {
      const haber = g.haber!;
      return [
        '  <url>',
        `    <loc>${xmlKacir(`${SITE.url}${g.yol}`)}</loc>`,
        '    <news:news>',
        '      <news:publication>',
        `        <news:name>${xmlKacir(SITE.ad)}</news:name>`,
        '        <news:language>tr</news:language>',
        '      </news:publication>',
        `      <news:publication_date>${haber.yayinTarihi.toISOString()}</news:publication_date>`,
        `      <news:title>${xmlKacir(haber.baslik)}</news:title>`,
        '    </news:news>',
        '  </url>',
      ].join('\n');
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
    ...satirlar,
    '</urlset>',
    '',
  ].join('\n');
}

/** İndeks belgesi: parçaların listesi. */
export function indeksOlustur(parcalar: readonly { ad: string }[], simdi: Date): string {
  const satirlar = parcalar.map((p) =>
    [
      '  <sitemap>',
      `    <loc>${xmlKacir(`${SITE.url}/sitemap/${p.ad}.xml`)}</loc>`,
      `    <lastmod>${simdi.toISOString()}</lastmod>`,
      '  </sitemap>',
    ].join('\n'),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...satirlar,
    '</sitemapindex>',
    '',
  ].join('\n');
}

/* --- PARÇALAR ------------------------------------------------------------- */

function gecerliTarih(deger?: string): Date | undefined {
  if (!deger) return undefined;
  const d = new Date(deger);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Gezinme ve yasal sayfalar. */
async function sayfalar(): Promise<HaritaGirdisi[]> {
  const yollar = new Set<string>(['/']);
  for (const ana of ANA_MENU) {
    yollar.add(ana.yol);
    for (const sutun of ana.sutunlar) for (const oge of sutun.ogeler) yollar.add(oge.yol);
  }
  for (const sutun of ALTLIK_SUTUNLARI) for (const oge of sutun.ogeler) yollar.add(oge.yol);
  for (const ek of [
    '/kesfet/',
    '/sozluk/',
    '/analiz/',
    '/gundem/haftanin-ozeti/',
    '/araclar/hesaplayicilar/',
    '/kurumsal/projeler/',
    '/dergi/arsiv/',
    '/topluluk/katki/',
    '/en/',
  ]) {
    yollar.add(ek);
  }

  /*
   * Dizinlenmemesi gerekenler haritadan çıkarılır. `/ara/` sonsuz sorgu
   * uzayı üretir; `/giris/`, `/uye-ol/` ve `/hesabim/` kimlik sayfalarıdır.
   * robots.txt bunları ayrıca engelliyor — harita ile robots çelişmemeli.
   */
  for (const yol of ['/ara/', '/giris/', '/uye-ol/', '/hesabim/']) yollar.delete(yol);

  return [
    ...[...yollar].map((yol) => ({
      yol,
      siklik: yol === '/' ? ('hourly' as const) : ('daily' as const),
      oncelik: yol === '/' ? 1 : 0.8,
    })),
    ...ALTLIK_YASAL.map((oge) => ({ yol: oge.yol, siklik: 'yearly' as const, oncelik: 0.3 })),
  ];
}

async function gundemParcasi(): Promise<HaritaGirdisi[]> {
  const [TUM_GUNDEM, ANALIZLER, RADAR, BRIEFLER] = await Promise.all([
    tumGundem(),
    analizler(),
    radar(),
    briefArsivi(),
  ]);

  return [
    ...TUM_GUNDEM.map((icerik) => ({
      yol: icerik.yol,
      sonDegisim: gecerliTarih(icerik.guncellemeTarihi ?? icerik.yayinTarihi),
      siklik: 'weekly' as const,
      oncelik: 0.7,
      haber: (() => {
        const yayin = gecerliTarih(icerik.yayinTarihi);
        return yayin ? { baslik: icerik.baslik, yayinTarihi: yayin } : undefined;
      })(),
    })),
    ...GUNDEM_KATEGORILERI.map((k) => ({ yol: k.yol, siklik: 'daily' as const, oncelik: 0.7 })),
    ...ANALIZLER.map((analiz) => ({
      yol: `/analiz/${analiz.slug}/`,
      sonDegisim: gecerliTarih(analiz.guncellemeTarihi ?? analiz.tarih),
      siklik: 'monthly' as const,
      oncelik: 0.75,
    })),
    ...RADAR.map((kayit) => ({
      yol: `/radar/${kayit.slug}/`,
      siklik: 'daily' as const,
      oncelik: 0.6,
    })),
    /*
     * Brief sayıları — değişmez kural 6: gezinmeye eklenen rota site
     * haritasına da eklenir. Sayılar bir günün kaydı olduğu için bir daha
     * değişmez; `yearly` ve `sonDegisim` = sayının kendi tarihi.
     */
    ...BRIEFLER.map((sayi) => ({
      yol: `/brief/${sayi.tarih}/`,
      sonDegisim: gecerliTarih(sayi.tarih),
      siklik: 'yearly' as const,
      oncelik: 0.5,
    })),
  ];
}

async function atlasParcasi(): Promise<HaritaGirdisi[]> {
  const [ATLAS, KONULAR] = await Promise.all([atlasListesi(), konuListesi()]);
  return [
    ...ATLAS.map((girdi) => ({
      yol: `/atlas/${girdi.slug}/`,
      sonDegisim: gecerliTarih(girdi.guncellemeTarihi ?? girdi.sonDogrulama),
      siklik: 'monthly' as const,
      oncelik: 0.9,
    })),
    ...ATLAS_KATEGORILERI.map((k) => ({
      yol: `/atlas/kategori/${k.slug}/`,
      siklik: 'weekly' as const,
      oncelik: 0.6,
    })),
    ...KONULAR.map((konu) => ({
      yol: `/konu/${konu.slug}/`,
      siklik: 'daily' as const,
      oncelik: 0.85,
    })),
  ];
}

async function rehberParcasi(): Promise<HaritaGirdisi[]> {
  const REHBERLER = await rehberListesi();
  return REHBERLER.map((rehber) => ({
    yol: `/rehber/${rehber.slug}/`,
    sonDegisim: gecerliTarih(rehber.tarih),
    siklik: 'monthly' as const,
    oncelik: 0.85,
  }));
}

async function arastirmaParcasi(): Promise<HaritaGirdisi[]> {
  const ARASTIRMA = await arastirmaListesi();
  return [
    ...ARASTIRMA.map((yayin) => ({
      yol: `/arastirma/${yayin.slug}/`,
      sonDegisim: gecerliTarih(yayin.tarih),
      siklik: 'monthly' as const,
      oncelik: 0.85,
    })),
    ...ARASTIRMA_TURLERI.map((tur) => ({
      yol: `/arastirma/${tur.slug}/`,
      siklik: 'weekly' as const,
      oncelik: 0.6,
    })),
  ];
}

async function akademiParcasi(): Promise<HaritaGirdisi[]> {
  const [YOLLAR, DERSLER, TESTLER, MESLEKLER] = await Promise.all([
    ogrenmeYollari(),
    dersler(),
    testler(),
    meslekler(),
  ]);
  return [
    ...YOLLAR.map((y) => ({
      yol: `/ogren/yollar/${y.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.8,
    })),
    ...DERSLER.map((d) => ({
      yol: `/ogren/dersler/${d.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.6,
    })),
    ...TESTLER.map((t) => ({
      yol: `/testler/${t.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.75,
    })),
    ...MESLEKLER.map((m) => ({
      yol: `/kariyer/${m.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.75,
    })),
  ];
}

async function dergiParcasi(): Promise<HaritaGirdisi[]> {
  const [SAYILAR, PODCAST, ETKINLIKLER] = await Promise.all([
    dergiSayiListesi(),
    podcastListesi(),
    etkinlikListesi(),
  ]);
  return [
    /*
     * Bölüm arşivleri (`/dergi/dosya/` vb.) — değişmez kural 6: gezinmeye
     * eklenen rota site haritasına da eklenir. İki yeni bölüm menüye
     * girerken burada da yerini alıyor.
     */
    ...DERGI_BOLUMLERI.map((b) => ({
      yol: `/dergi/${b.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.6,
    })),
    ...SAYILAR.map((s) => ({
      yol: `/dergi/${s.slug}/`,
      sonDegisim: gecerliTarih(s.tarih),
      siklik: 'monthly' as const,
      oncelik: 0.8,
    })),
    ...SAYILAR.flatMap((s) =>
      s.yazilar.map((yazi) => ({
        yol: `/dergi/${s.slug}/${yazi.slug}/`,
        sonDegisim: gecerliTarih(s.tarih),
        siklik: 'yearly' as const,
        oncelik: 0.7,
      })),
    ),
    ...DERGI_BOLUMLERI.map((b) => ({
      yol: `/dergi/${b.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.6,
    })),
    ...PODCAST.map((b) => ({
      yol: `/podcast/${b.slug}/`,
      sonDegisim: gecerliTarih(b.tarih),
      siklik: 'monthly' as const,
      oncelik: 0.7,
    })),
    ...ETKINLIKLER.map((e) => ({
      yol: `/etkinlikler/${e.slug}/`,
      siklik: 'weekly' as const,
      oncelik: 0.6,
    })),
  ];
}

async function modelParcasi(): Promise<HaritaGirdisi[]> {
  const [MODELLER, SIRKETLER] = await Promise.all([modelListesi(), sirketListesi()]);
  return [
    ...MODELLER.map((m) => ({
      yol: `/modeller/${m.slug}/`,
      siklik: 'weekly' as const,
      oncelik: 0.8,
    })),
    ...KARSILASTIRMALAR.map((k) => ({
      yol: `/karsilastir/${k.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.7,
    })),
    ...SIRKETLER.map((s) => ({
      yol: `/sirketler/${s.slug}/`,
      siklik: 'weekly' as const,
      oncelik: 0.7,
    })),
  ];
}

async function aracParcasi(): Promise<HaritaGirdisi[]> {
  const [ARACLAR, LAB] = await Promise.all([aracListesi(), labProjeleri()]);
  return [
    ...ARACLAR.map((a) => ({
      yol: `/araclar/${a.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.6,
    })),
    ...LAB.map((p) => ({ yol: `/lab/${p.slug}/`, siklik: 'monthly' as const, oncelik: 0.6 })),
  ];
}

async function kurumsalParcasi(): Promise<HaritaGirdisi[]> {
  const [HIZMETLER, SEKTORLER, VAKALAR] = await Promise.all([hizmetler(), sektorler(), vakalar()]);
  return [
    ...HIZMETLER.map((h) => ({
      yol: `/kurumsal/${h.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.85,
    })),
    ...SEKTORLER.map((s) => ({
      yol: `/sektor/${s.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.7,
    })),
    ...VAKALAR.map((v) => ({
      yol: `/vaka-calismalari/${v.slug}/`,
      siklik: 'monthly' as const,
      oncelik: 0.75,
    })),
  ];
}

async function yazarParcasi(): Promise<HaritaGirdisi[]> {
  const YAZARLAR = await yazarListesi();
  return YAZARLAR.map((y) => ({
    yol: `/yazar/${y.slug}/`,
    siklik: 'weekly' as const,
    oncelik: 0.6,
  }));
}

/**
 * Parça kayıt defteri — indeks ve parça rotasının TEK KAYNAĞI.
 *
 * Yeni bir parça eklemek için yalnızca bu diziye satır yazılır; indeks
 * kendiliğinden günceller (CLAUDE.md kural 6'nın harita tarafındaki karşılığı).
 */
export const HARITA_PARCALARI: readonly HaritaParcasi[] = [
  { ad: 'sayfalar', aciklama: 'Gezinme, hub ve yasal sayfalar', uret: sayfalar },
  { ad: 'gundem', aciklama: 'Haber, analiz ve radar', uret: gundemParcasi },
  { ad: 'atlas', aciklama: 'Kavram girdileri ve konular', uret: atlasParcasi },
  { ad: 'rehberler', aciklama: 'Uygulama rehberleri', uret: rehberParcasi },
  { ad: 'arastirma', aciklama: 'Rapor, benchmark ve veri setleri', uret: arastirmaParcasi },
  { ad: 'akademi', aciklama: 'Öğrenme yolları, dersler, testler, meslekler', uret: akademiParcasi },
  { ad: 'dergi', aciklama: 'Dergi sayıları, podcast, etkinlikler', uret: dergiParcasi },
  { ad: 'modeller', aciklama: 'Modeller, karşılaştırmalar, şirketler', uret: modelParcasi },
  { ad: 'araclar', aciklama: 'Araçlar ve laboratuvar projeleri', uret: aracParcasi },
  { ad: 'kurumsal', aciklama: 'Hizmetler, sektörler, vaka çalışmaları', uret: kurumsalParcasi },
  { ad: 'yazarlar', aciklama: 'Yazar künyeleri', uret: yazarParcasi },
];

/** `haber` parçası indekste ayrı durur: içeriği son iki günle sınırlı. */
export const HABER_PARCASI_ADI = 'haber';

export function parcaBul(ad: string): HaritaParcasi | undefined {
  return HARITA_PARCALARI.find((p) => p.ad === ad);
}

/** Aynı adres iki kez bildirilmez — tarama bütçesi boşa gitmesin. */
export function tekilles(girdiler: readonly HaritaGirdisi[]): HaritaGirdisi[] {
  const gorulen = new Set<string>();
  return girdiler.filter((g) => {
    if (gorulen.has(g.yol)) return false;
    gorulen.add(g.yol);
    return true;
  });
}
