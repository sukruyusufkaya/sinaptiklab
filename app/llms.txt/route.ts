import { SITE, KATMANLAR } from '@/lib/site';
import { atlasListesi, sozluk } from '@/lib/icerik/atlas';
import { ATLAS_KATEGORILERI } from '@/lib/taksonomi';
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
    TERIMLER,
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
    sozluk(),
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
    `- Sözlük terimi: ${TERIMLER.length}`,
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
    /*
     * SÖZLÜK — 538 terimin tamamı BURAYA YAZILMAZ. llms.txt bir içerik dökümü
     * değil bir haritadır; terimlerin tam listesi zaten `/sozluk/` sayfasında
     * `DefinedTermSet` şemasıyla işaretli duruyor. Burada verilen şey yapı:
     * kanonik adres, terim çapasının biçimi ve kategori dilimlerinin adresleri.
     *
     * AŞAMA İŞARETLİ TERİMLER İSTİSNADIR ve tam listelenir: en hızlı eskiyen,
     * bir modelin eğitim verisinde büyük olasılıkla YANLIŞ hâliyle bulunan
     * dilim burasıdır. "MCP sampling hâlâ kullanılıyor mu?" sorusunun doğru
     * cevabı bu dosyada doğrudan bulunur.
     */
    ...bolum('Sözlük — terim referansı', [
      `Kanonik adres: ${SITE.url}/sozluk/ (${TERIMLER.length} terim, tek sayfa, DefinedTermSet şemalı)`,
      `Terim çapası: ${SITE.url}/sozluk/#terim-<slug>`,
      'Terimlerin ayrı sayfası yoktur; derinlik gerektiren terim /atlas/<slug>/ girdisine taşınır.',
      '',
      'Kategori dilimleri (her biri o alanın tüm terimlerini ve Atlas girdilerini taşır):',
      ...ATLAS_KATEGORILERI.map((k) => {
        const adet = TERIMLER.filter((t) => t.kategoriSlug === k.slug).length;
        return `- [${k.ad}](${SITE.url}/atlas/kategori/${k.slug}/): ${adet} terim`;
      }),
    ]),
    ...bolum(
      'Sözlük — yerleşmekte olan terimler',
      TERIMLER.filter((t) => t.asama === 'yeni').map(
        (t) =>
          `- **${t.terim}** (${t.ingilizce ?? t.terim}) — ${t.tanim}${t.asamaNotu ? ` DURUM: ${t.asamaNotu}` : ''}`,
      ),
    ),
    ...bolum(
      'Sözlük — kullanımdan kalkan terimler',
      TERIMLER.filter((t) => t.asama === 'kullanimdan-kalkti').map(
        (t) =>
          `- **${t.terim}** (${t.ingilizce ?? t.terim}) — ${t.tanim}${t.asamaNotu ? ` DURUM: ${t.asamaNotu}` : ''}`,
      ),
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
