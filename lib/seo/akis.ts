import { SITE } from '@/lib/site';
import { xmlKacir } from '@/lib/seo/site-haritasi';
import { analizler, tumGundem } from '@/lib/icerik/gundem';
import { rehberListesi } from '@/lib/icerik/yayin';
import { yazarHaritasi } from '@/lib/icerik/temel';

/**
 * RSS ve Atom akışları (MASTER-PLAN — makine yüzeyleri).
 *
 * NEDEN İKİSİ: RSS 2.0 okuyucu tarafında en yaygın; Atom ise tarih biçimi
 * (RFC 3339) ve kimlik alanı (`<id>`) konusunda kesin tanımlı olduğu için
 * toplayıcılar arasında daha az uyumsuzluk üretir. İkisi aynı veriden aynı
 * modülde türetilir ki içerikleri birbirinden ayrı düşmesin.
 *
 * GÖVDE YAYIMLANMAZ: akış yalnızca başlık, kısa cevap ve bağlantı taşır.
 * Gerekçe iki katlı — (1) tam metni akışta vermek kanonik adresin yerine
 * geçen kopyalar üretir, (2) blok tabanlı gövdeyi HTML'e çevirmek akışta
 * ikinci bir sunum katmanı demektir. Okuyucu özeti görür, tıklar, kanonik
 * sayfaya gelir.
 *
 * SIRALAMA: en yeni önce. Tarihi çözümlenemeyen kayıt akışa HİÇ girmez —
 * geçersiz tarih taşıyan bir öge toplayıcıların tamamını reddedebilir.
 */

const OGE_SINIRI = 50;

export type AkisOgesi = {
  baslik: string;
  yol: string;
  ozet: string;
  tarih: Date;
  yazar?: string;
  tur: string;
};

function gecerliTarih(deger?: string): Date | undefined {
  if (!deger) return undefined;
  const d = new Date(deger);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Akışa girecek ögeler: haber + analiz + rehber.
 *
 * Radar ve brief dışarıda: ikisi de anlık görüntü niteliğinde, her gün yeniden
 * yayımlanan kayıtlar — akışta her sabah aynı başlıkları tekrar göstermek
 * abonelik değerini düşürür.
 */
export async function akisOgeleri(): Promise<AkisOgesi[]> {
  const [GUNDEM, ANALIZLER, REHBERLER, yazarlar] = await Promise.all([
    tumGundem(),
    analizler(),
    rehberListesi(),
    yazarHaritasi(),
  ]);

  const ogeler: AkisOgesi[] = [];

  for (const icerik of GUNDEM) {
    const tarih = gecerliTarih(icerik.yayinTarihi);
    if (!tarih) continue;
    ogeler.push({
      baslik: icerik.baslik,
      yol: icerik.yol,
      ozet: icerik.kisaCevap,
      tarih,
      yazar: icerik.yazar?.ad,
      tur: icerik.tur,
    });
  }

  for (const analiz of ANALIZLER) {
    const tarih = gecerliTarih(analiz.tarih);
    if (!tarih) continue;
    ogeler.push({
      baslik: analiz.baslik,
      yol: `/analiz/${analiz.slug}/`,
      ozet: analiz.girizgah,
      tarih,
      yazar: yazarlar.get(analiz.yazarSlug)?.ad,
      tur: 'analiz',
    });
  }

  for (const rehber of REHBERLER) {
    const tarih = gecerliTarih(rehber.tarih);
    if (!tarih) continue;
    ogeler.push({
      baslik: rehber.baslik,
      yol: `/rehber/${rehber.slug}/`,
      ozet: rehber.kisaCevap,
      tarih,
      tur: 'rehber',
    });
  }

  return ogeler.sort((a, b) => b.tarih.getTime() - a.tarih.getTime()).slice(0, OGE_SINIRI);
}

/** RSS 2.0 tarih biçimi (RFC 822). */
function rfc822(tarih: Date): string {
  return tarih.toUTCString();
}

export function rssOlustur(ogeler: readonly AkisOgesi[], simdi: Date): string {
  const satirlar = ogeler.map((oge) => {
    const adres = `${SITE.url}${oge.yol}`;
    return [
      '    <item>',
      `      <title>${xmlKacir(oge.baslik)}</title>`,
      `      <link>${xmlKacir(adres)}</link>`,
      // `isPermaLink="false"` — kimlik olarak adresi kullanıyoruz ama
      // toplayıcı onu ayrıca çözmeye çalışmasın.
      `      <guid isPermaLink="false">${xmlKacir(adres)}</guid>`,
      `      <pubDate>${rfc822(oge.tarih)}</pubDate>`,
      `      <description>${xmlKacir(oge.ozet)}</description>`,
      `      <category>${xmlKacir(oge.tur)}</category>`,
      ...(oge.yazar ? [`      <dc:creator>${xmlKacir(oge.yazar)}</dc:creator>`] : []),
      '    </item>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"',
    '     xmlns:atom="http://www.w3.org/2005/Atom"',
    '     xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${xmlKacir(SITE.ad)}</title>`,
    `    <link>${SITE.url}/</link>`,
    `    <description>${xmlKacir(SITE.aciklama)}</description>`,
    '    <language>tr-tr</language>',
    `    <lastBuildDate>${rfc822(simdi)}</lastBuildDate>`,
    `    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />`,
    ...satirlar,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

export function atomOlustur(ogeler: readonly AkisOgesi[], simdi: Date): string {
  /*
   * `<updated>` akışın kendisinin son değişimidir: en yeni ögenin tarihi.
   * Öge yoksa çağrı anı kullanılır — toplayıcılar boş ama geçerli bir akış
   * görmeli, hatalı biçim görmemeli.
   */
  const guncellendi = ogeler[0]?.tarih ?? simdi;

  const satirlar = ogeler.map((oge) => {
    const adres = `${SITE.url}${oge.yol}`;
    return [
      '  <entry>',
      `    <title>${xmlKacir(oge.baslik)}</title>`,
      `    <link href="${xmlKacir(adres)}" />`,
      `    <id>${xmlKacir(adres)}</id>`,
      `    <updated>${oge.tarih.toISOString()}</updated>`,
      `    <summary>${xmlKacir(oge.ozet)}</summary>`,
      `    <category term="${xmlKacir(oge.tur)}" />`,
      ...(oge.yazar
        ? ['    <author>', `      <name>${xmlKacir(oge.yazar)}</name>`, '    </author>']
        : []),
      '  </entry>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="tr">',
    `  <title>${xmlKacir(SITE.ad)}</title>`,
    `  <subtitle>${xmlKacir(SITE.vaat)}</subtitle>`,
    `  <link href="${SITE.url}/atom.xml" rel="self" />`,
    `  <link href="${SITE.url}/" />`,
    `  <id>${SITE.url}/</id>`,
    `  <updated>${guncellendi.toISOString()}</updated>`,
    '  <author>',
    `    <name>${xmlKacir(SITE.ad)}</name>`,
    '  </author>',
    ...satirlar,
    '</feed>',
    '',
  ].join('\n');
}
