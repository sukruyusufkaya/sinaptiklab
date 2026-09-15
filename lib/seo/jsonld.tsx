import { SITE } from '@/lib/site';
import type { SSS, Yazar } from '@/lib/tipler';

/**
 * Structured data, görünür içerikle birebir uyumlu olmalıdır (MASTER-PLAN §67).
 * Burada yalnızca sayfada gerçekten görünen bilgiler işaretlenir.
 */

function Betik({ veri }: { veri: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(veri).replace(/</g, '\\u003c') }}
    />
  );
}

function yazarNesnesi(yazar: Yazar) {
  return {
    '@type': 'Person',
    name: yazar.ad,
    jobTitle: yazar.unvan,
    url: `${SITE.url}/yazar/${yazar.slug}/`,
    ...(yazar.sosyal?.length ? { sameAs: yazar.sosyal.map((s) => s.adres) } : {}),
  };
}

export function OrganizasyonSemasi() {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE.url}/#organizasyon`,
        name: SITE.ad,
        url: SITE.url,
        description: SITE.aciklama,
        slogan: SITE.vaat,
        sameAs: [SITE.sosyal.x, SITE.sosyal.linkedin, SITE.sosyal.github, SITE.sosyal.youtube],
      }}
    />
  );
}

export function SiteSemasi() {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE.url}/#site`,
        name: SITE.ad,
        url: SITE.url,
        inLanguage: 'tr-TR',
        publisher: { '@id': `${SITE.url}/#organizasyon` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE.url}/ara/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function KirintiSemasi({ ogeler }: { ogeler: { ad: string; yol: string }[] }) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: ogeler.map((oge, sira) => ({
          '@type': 'ListItem',
          position: sira + 1,
          name: oge.ad,
          item: `${SITE.url}${oge.yol}`,
        })),
      }}
    />
  );
}

export function MakaleSemasi({
  tur = 'Article',
  baslik,
  aciklama,
  yol,
  yazar,
  inceleyen,
  yayinTarihi,
  guncellemeTarihi,
  bolum,
  anahtarlar,
}: {
  tur?: 'Article' | 'NewsArticle' | 'TechArticle';
  baslik: string;
  aciklama: string;
  yol: string;
  yazar: Yazar;
  inceleyen?: Yazar;
  yayinTarihi?: string;
  guncellemeTarihi?: string;
  bolum?: string;
  anahtarlar?: string[];
}) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': tur,
        headline: baslik,
        description: aciklama,
        mainEntityOfPage: `${SITE.url}${yol}`,
        inLanguage: 'tr-TR',
        author: yazarNesnesi(yazar),
        ...(inceleyen ? { reviewedBy: yazarNesnesi(inceleyen) } : {}),
        publisher: { '@id': `${SITE.url}/#organizasyon` },
        ...(yayinTarihi ? { datePublished: yayinTarihi } : {}),
        ...(guncellemeTarihi ? { dateModified: guncellemeTarihi } : {}),
        ...(bolum ? { articleSection: bolum } : {}),
        ...(anahtarlar?.length ? { keywords: anahtarlar.join(', ') } : {}),
      }}
    />
  );
}

export function SSSSemasi({ sorular }: { sorular: SSS[] }) {
  if (sorular.length === 0) return null;
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: sorular.map((oge) => ({
          '@type': 'Question',
          name: oge.soru,
          acceptedAnswer: { '@type': 'Answer', text: oge.cevap },
        })),
      }}
    />
  );
}

/**
 * `HowTo` şeması — adımlı rehberler için.
 *
 * NEDEN EKSİKTİ: rehber sayfaları `Article` ve `FAQPage` basıyordu ama
 * numaralı adım listesi taşıyan bir içerik için doğru tip `HowTo`dur. Bu,
 * arama sonuçlarında adımların ayrı ayrı gösterildiği zengin sonuç tipini
 * açar ve üretken arama yüzeylerine "bu iş şu adımlarla yapılır" biçiminde
 * yapılandırılmış bir cevap verir — rehberin tüm değeri tam olarak budur.
 *
 * ADIM AÇIKLAMASI ÖZETTEN GELİR, gövdeden değil: `ayrinti` blokları uzun
 * anlatımdır ve şemaya gömüldüğünde hem devasa bir JSON üretir hem de
 * Google'ın "adım açıklaması kısa olmalı" beklentisini bozar.
 *
 * `totalTime` YAZILMAZ: okuma dakikası, işin ne kadar süreceği DEĞİLDİR.
 * İkisini karıştırmak, aramada yanlış bir süre vaadi basmak olurdu.
 */
export function NasilYapilirSemasi({
  ad,
  aciklama,
  yol,
  adimlar,
  araclar,
  onKosullar,
}: {
  ad: string;
  aciklama: string;
  yol: string;
  adimlar: { ad: string; ozet: string }[];
  araclar?: string[];
  onKosullar?: string[];
}) {
  if (adimlar.length === 0) return null;
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: ad,
        description: aciklama,
        url: `${SITE.url}${yol}`,
        inLanguage: 'tr-TR',
        ...(araclar && araclar.length > 0
          ? { tool: araclar.map((arac) => ({ '@type': 'HowToTool', name: arac })) }
          : {}),
        ...(onKosullar && onKosullar.length > 0
          ? { supply: onKosullar.map((k) => ({ '@type': 'HowToSupply', name: k })) }
          : {}),
        step: adimlar.map((adim, sira) => ({
          '@type': 'HowToStep',
          position: sira + 1,
          name: adim.ad,
          text: adim.ozet,
          url: `${SITE.url}${yol}#adim-${sira + 1}`,
        })),
      }}
    />
  );
}

export function ListeSemasi({ ad, ogeler }: { ad: string; ogeler: { ad: string; yol: string }[] }) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: ad,
        numberOfItems: ogeler.length,
        itemListElement: ogeler.map((oge, sira) => ({
          '@type': 'ListItem',
          position: sira + 1,
          name: oge.ad,
          url: `${SITE.url}${oge.yol}`,
        })),
      }}
    />
  );
}

export function KursSemasi({
  ad,
  aciklama,
  yol,
  seviye,
}: {
  ad: string;
  aciklama: string;
  yol: string;
  seviye?: string;
}) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: ad,
        description: aciklama,
        url: `${SITE.url}${yol}`,
        inLanguage: 'tr-TR',
        provider: { '@id': `${SITE.url}/#organizasyon` },
        ...(seviye ? { educationalLevel: seviye } : {}),
      }}
    />
  );
}

export function TestSemasi({
  ad,
  aciklama,
  sorular,
}: {
  ad: string;
  aciklama: string;
  sorular: { soru: string; secenekler: string[]; dogruIndeks: number; aciklama: string }[];
}) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: ad,
        description: aciklama,
        inLanguage: 'tr-TR',
        provider: { '@id': `${SITE.url}/#organizasyon` },
        hasPart: sorular.map((soru) => ({
          '@type': 'Question',
          eduQuestionType: 'Multiple choice',
          name: soru.soru,
          acceptedAnswer: {
            '@type': 'Answer',
            text: soru.secenekler[soru.dogruIndeks] ?? '',
            comment: soru.aciklama,
          },
          suggestedAnswer: soru.secenekler
            .filter((_, sira) => sira !== soru.dogruIndeks)
            .map((secenek) => ({ '@type': 'Answer', text: secenek })),
        })),
      }}
    />
  );
}

export function VeriSetiSemasi({
  ad,
  aciklama,
  yol,
  lisans,
  tarih,
}: {
  ad: string;
  aciklama: string;
  yol: string;
  lisans?: string;
  tarih?: string;
}) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: ad,
        description: aciklama,
        url: `${SITE.url}${yol}`,
        inLanguage: 'tr-TR',
        creator: { '@id': `${SITE.url}/#organizasyon` },
        ...(lisans ? { license: lisans } : {}),
        ...(tarih ? { datePublished: tarih } : {}),
      }}
    />
  );
}

export function ProfilSemasi({ yazar }: { yazar: Yazar }) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          ...yazarNesnesi(yazar),
          ...(yazar.ozgecmis ? { description: yazar.ozgecmis } : {}),
          ...(yazar.uzmanlik?.length ? { knowsAbout: yazar.uzmanlik } : {}),
        },
      }}
    />
  );
}

export function HizmetSemasi({ ad, aciklama, yol }: { ad: string; aciklama: string; yol: string }) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: ad,
        description: aciklama,
        url: `${SITE.url}${yol}`,
        areaServed: 'TR',
        provider: { '@id': `${SITE.url}/#organizasyon` },
      }}
    />
  );
}

export function EtkinlikSemasi({
  ad,
  aciklama,
  tarih,
  yol,
  bicim,
}: {
  ad: string;
  aciklama: string;
  tarih: string;
  yol: string;
  bicim: string;
}) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: ad,
        description: aciklama,
        startDate: tarih,
        url: `${SITE.url}${yol}`,
        eventAttendanceMode: bicim.includes('Çevrim')
          ? 'https://schema.org/OnlineEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode',
        organizer: { '@id': `${SITE.url}/#organizasyon` },
      }}
    />
  );
}

/**
 * Meslek sayfası — schema.org `Occupation`.
 *
 * MAAŞ ALANI BİLİNÇLİ OLARAK YOK. `Occupation` tipi `estimatedSalary` alanını
 * destekler ve zengin sonuçta en görünür alandır; ama Sinaptik Lab'de
 * doğrulanmış bir maaş araştırması yayımlanmadı. Uydurma bir aralık yazmak
 * hem değişmez kural 5'i hem de yapılandırılmış verinin "görünür içerikle
 * birebir uyum" ilkesini (MASTER-PLAN §67) çiğnerdi: sayfada görünmeyen bir
 * sayıyı arama motoruna bildirmek olurdu.
 *
 * `skills` ve `responsibilities` sayfada gerçekten basılan listelerden gelir.
 */
export function MeslekSemasi({
  ad,
  aciklama,
  yol,
  beceriler,
  sorumluluklar,
  esAdlar,
  kategori,
}: {
  ad: string;
  aciklama: string;
  yol: string;
  beceriler: string[];
  sorumluluklar: string[];
  esAdlar?: string[];
  kategori?: string;
}) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'Occupation',
        name: ad,
        description: aciklama,
        url: `${SITE.url}${yol}`,
        inLanguage: SITE.dil,
        ...(esAdlar?.length ? { alternateName: esAdlar } : {}),
        ...(kategori ? { occupationalCategory: kategori } : {}),
        ...(beceriler.length ? { skills: beceriler.join(', ') } : {}),
        ...(sorumluluklar.length ? { responsibilities: sorumluluklar } : {}),
        occupationLocation: { '@type': 'Country', name: 'Türkiye' },
      }}
    />
  );
}

/**
 * Sözlük — schema.org `DefinedTermSet`.
 *
 * NEDEN ÖNEMLİ: sözlük, üretken aramanın en kolay alıntıladığı içerik
 * biçimidir — her giriş kendi başına tam, kısa ve tanım niteliğinde. Bu şema
 * terimleri tek tek işaretleyerek hangi metnin hangi terimin TANIMI olduğunu
 * makineye açıkça söyler; tanım paragrafını çevresindeki metinden ayırt etme
 * işini tahmine bırakmaz.
 *
 * `identifier` terimin sayfa içi çapasıdır (`#terim-<slug>`): terimlerin ayrı
 * sayfası olmadığı için `url` yerine bu kullanılır. Ayrı sayfa açmak, tek
 * satırlık tanımlar için yüzlerce ince adres üretmek olurdu (§51).
 */
export function TerimKumesiSemasi({
  ad,
  aciklama,
  yol,
  terimler,
}: {
  ad: string;
  aciklama: string;
  yol: string;
  terimler: { ad: string; tanim: string; kimlik: string; esAd?: string }[];
}) {
  return (
    <Betik
      veri={{
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': `${SITE.url}${yol}#sozluk`,
        name: ad,
        description: aciklama,
        url: `${SITE.url}${yol}`,
        inLanguage: SITE.dil,
        hasDefinedTerm: terimler.map((terim) => ({
          '@type': 'DefinedTerm',
          name: terim.ad,
          description: terim.tanim,
          identifier: `${SITE.url}${yol}#terim-${terim.kimlik}`,
          ...(terim.esAd ? { alternateName: terim.esAd } : {}),
          inDefinedTermSet: { '@id': `${SITE.url}${yol}#sozluk` },
        })),
      }}
    />
  );
}
