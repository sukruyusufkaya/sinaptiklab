import { SITE, KATMANLAR } from '@/lib/site';
import { atlasListesi } from '@/lib/icerik/atlas';
import { analizler, tumGundem } from '@/lib/icerik/gundem';
import { arastirmaListesi } from '@/lib/icerik/arastirma';
import { dersler, ogrenmeYollari, testler } from '@/lib/icerik/ogrenme';
import { modelListesi, sirketListesi, aracListesi } from '@/lib/icerik/varliklar';
import { rehberListesi } from '@/lib/icerik/yayin';
import { konuListesi } from '@/lib/icerik/temel';

/**
 * `llms.txt` — dil modelleri için makine yüzeyi.
 *
 * Amaç: bir modelin siteyi tarayarak çıkarmak zorunda kalacağı yapıyı doğrudan
 * vermek — hangi bölümler var, kanonik adresler ne, hangi içerik nerede.
 *
 * İKİ İLKE
 *
 * 1. **Sayılar CANLI sorgudan gelir.** Elle yazılmış bir "480+ kavram" satırı
 *    gerçek 35 kayıtla çelişir ve makine yüzeyini güvenilmez kılar. Buradaki
 *    her sayı o anda yayında olan belge sayısıdır (MASTER-PLAN §59, CLAUDE.md
 *    değişmez kural 5).
 * 2. **Yalnızca yayındaki içerik listelenir.** Okuma katmanı taslakları
 *    döndürmüyor; bu yüzden dosya yayımlanmamış bir adresi hiç göstermez.
 */

export const dynamic = 'force-dynamic';

/** Listelerde en fazla bu kadar örnek adres verilir; dosya okunabilir kalmalı. */
const ORNEK_SINIRI = 15;

export async function GET() {
  const [
    ATLAS,
    KONULAR,
    GUNDEM,
    ANALIZLER,
    REHBERLER,
    ARASTIRMA,
    YOLLAR,
    DERSLER,
    TESTLER,
    MODELLER,
    SIRKETLER,
    ARACLAR,
  ] = await Promise.all([
    atlasListesi(),
    konuListesi(),
    tumGundem(),
    analizler(),
    rehberListesi(),
    arastirmaListesi(),
    ogrenmeYollari(),
    dersler(),
    testler(),
    modelListesi(),
    sirketListesi(),
    aracListesi(),
  ]);

  const bolum = (baslik: string, satirlar: readonly string[]) =>
    satirlar.length ? [`## ${baslik}`, '', ...satirlar, ''] : [];

  const liste = <T>(ogeler: readonly T[], bicim: (oge: T) => string) =>
    ogeler.slice(0, ORNEK_SINIRI).map(bicim);

  const govde = [
    `# ${SITE.ad}`,
    '',
    `> ${SITE.vaat}`,
    '',
    SITE.aciklama,
    '',
    `Kanonik kök: ${SITE.url}`,
    'Dil: Türkçe (tr-TR). Tüm adresler sondaki eğik çizgiyle biter ve tarih içermez.',
    '',
    '## Yapı',
    '',
    ...KATMANLAR.map((k) => `- **${k.ad}** — ${k.soru} → ${k.urun}`),
    '',
    '## Yayında olan içerik (canlı sayım)',
    '',
    `- Atlas kavramı: ${ATLAS.length}`,
    `- Konu: ${KONULAR.length}`,
    `- Haber ve analiz: ${GUNDEM.length} + ${ANALIZLER.length}`,
    `- Rehber: ${REHBERLER.length}`,
    `- Araştırma yayını: ${ARASTIRMA.length}`,
    `- Öğrenme yolu / ders / test: ${YOLLAR.length} / ${DERSLER.length} / ${TESTLER.length}`,
    `- Model / şirket / araç: ${MODELLER.length} / ${SIRKETLER.length} / ${ARACLAR.length}`,
    '',
    '## Makine yüzeyleri',
    '',
    `- Site haritası indeksi: ${SITE.url}/sitemap.xml`,
    `- RSS: ${SITE.url}/rss.xml`,
    `- Atom: ${SITE.url}/atom.xml`,
    `- robots.txt: ${SITE.url}/robots.txt`,
    '- Sayfalar JSON-LD taşır: Article, FAQPage, BreadcrumbList, Organization, WebSite.',
    '',
    ...bolum(
      'Atlas — kavram referansı',
      liste(ATLAS, (g) => `- [${g.ad}](${SITE.url}/atlas/${g.slug}/): ${g.kisaTanim}`),
    ),
    ...bolum(
      'Konular',
      liste(KONULAR, (k) => `- [${k.ad}](${SITE.url}/konu/${k.slug}/)`),
    ),
    ...bolum(
      'Rehberler',
      liste(REHBERLER, (r) => `- [${r.baslik}](${SITE.url}/rehber/${r.slug}/)`),
    ),
    ...bolum(
      'Araştırma',
      liste(ARASTIRMA, (a) => `- [${a.baslik}](${SITE.url}/arastirma/${a.slug}/)`),
    ),
    ...bolum(
      'Öğrenme yolları',
      liste(YOLLAR, (y) => `- [${y.ad}](${SITE.url}/ogren/yollar/${y.slug}/): ${y.rol}`),
    ),
    ...bolum(
      'Modeller',
      liste(MODELLER, (m) => `- [${m.ad}](${SITE.url}/modeller/${m.slug}/): ${m.saglayici}`),
    ),
    '## Atıf',
    '',
    `İçerik alıntılanırken kanonik adres ve "${SITE.ad}" adı belirtilmelidir.`,
    'Araştırma yayınlarının kendi atıf biçimi ilgili sayfada verilir.',
    '',
    '## Kapsam dışı',
    '',
    '- /admin/ — editör paneli, dizinlenmez.',
    '- /onizleme/ — yayımlanmamış taslak önizlemeleri.',
    '- /ara/ — arama sonuçları (sonsuz sorgu uzayı).',
    '',
  ].join('\n');

  return new Response(govde, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
