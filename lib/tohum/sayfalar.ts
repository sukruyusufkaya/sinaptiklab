import type { MetinBolumu } from '@/components/kurumsal/MetinSayfasi';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { AI_POLITIKASI, DUZELTME_POLITIKASI, EDITORYAL_ILKELER } from '@/lib/veri/politikalar';
import { slugla, tarihOlarak, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';
import type { TohumBelgesi } from '@/lib/tohum/tipler';

/**
 * Statik editoryal sayfa dönüştürücüsü — `lib/veri/politikalar.ts`.
 *
 * KAPSAM. `politikalar.ts` yedi `MetinBolumu[]` dizisi taşır; bunlar iki
 * koleksiyona ayrılır:
 *
 *  - `sayfalar` (bu dosya): EDITORYAL_ILKELER, AI_POLITIKASI,
 *    DUZELTME_POLITIKASI — editoryal metinler, hukuki metin değil.
 *  - `politikalar` (bu dosyanın dışında): GIZLILIK, KVKK_AYDINLATMA,
 *    CEREZ_POLITIKASI, KULLANIM_SARTLARI. Şema orada `yururlukTarihi`,
 *    `surum` ve `surumler` zorunlu kılar; bu alanların hiçbiri fixture'da
 *    yoktur, ayrıca bu dört sayfa `POLITIKA_TASLAK_UYARISI` basar. Buraya
 *    yazmak koleksiyon ayrımını bozardı.
 *
 * FIXTURE'I OLMAYAN SAYFALAR. Şema açıklaması "hakkında, künye, iletişim,
 * metodoloji" sayfalarını da sayar; ancak bu dört sayfa (`app/(site)/hakkinda`,
 * `kunye`, `iletisim`, `metodoloji`) düzeni JSX içinde kurar, bir `MetinBolumu[]`
 * dizisi taşımaz. Gövdeleri mekanik olarak bloklara çevrilemez; yalnızca
 * başlık/özet taşıyan gövdesiz kabuk kayıtları üretmek de uydurma içerik
 * olurdu. Bu yüzden ATLANDILAR — gövdeleri fixture'a taşındığında buraya
 * eklenecekler.
 *
 * Giderilen uyumsuzluklar:
 *  1. `durum` fixture'da hiç yok; şemada zorunlu → üç sayfanın hiçbiri taslak
 *     uyarısı basmadığı için `yayinda` verilir.
 *  2. Fixture yalnızca bölüm dizisidir; `slug`, `yol`, `baslik`, `etiket`,
 *     `ozet`, `guncellemeTarihi` ve `seo` sayfa bileşenlerinde durur. Bu künye
 *     alanları aşağıdaki tabloda sayfa dosyalarından birebir alınmıştır.
 *  3. `MetinBolumu` → `govde` (GOVDE/BLOK şeması): her bölüm bir `altbaslik`
 *     bloğu, `paragraflar` birer `paragraf`, `liste` bir `liste`, `tablo` bir
 *     `tablo` bloğu olur. `altbaslik` için `kimlik` bölümün çapa kimliğidir;
 *     boşsa başlıktan `slugla()` ile üretilir.
 *  4. `seo.baslik` (≤70) ve `seo.aciklama` (≤200) maxLength kısıtlarına
 *     uyacak şekilde kırpılır.
 *  5. `guncellemeTarihi` TARIH_METNI desenine `tarihOlarak()` ile süzülür.
 *  6. `slug` SLUG desenine tabidir; uymayan slug `slugla()` ile düzeltilir,
 *     düzelmezse kayıt ATLANIR ve raporlanır.
 *
 * Şemada olmayan alan yazılmaz: sayfaların `ilgili` bağlantı dizisi ve
 * `POLITIKA_TASLAK_UYARISI` metni `sayfalar` şemasında karşılığı olmadığı için
 * hiç üretilmez.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type SayfaKaydi = {
  slug: string;
  yol: string;
  etiket: string;
  baslik: string;
  ozet: string;
  guncelleme: string;
  bolumler: MetinBolumu[];
};

/** Künye alanları `app/(site)/<slug>/page.tsx` dosyalarından alınmıştır. */
const SAYFA_KAYITLARI: SayfaKaydi[] = [
  {
    slug: 'editoryal-ilkeler',
    yol: '/editoryal-ilkeler/',
    etiket: 'EDİTORYAL',
    baslik: 'Editoryal ilkeler',
    ozet: 'Yayımlanan her içeriğin uymak zorunda olduğu kurallar: kaynak politikası, yazarlık, yapay zekâ kullanımı, bağımsızlık, tazelik ve düzeltme.',
    guncelleme: '2026-09-01',
    bolumler: EDITORYAL_ILKELER,
  },
  {
    slug: 'ai-politikasi',
    yol: '/ai-politikasi/',
    etiket: 'ŞEFFAFLIK',
    baslik: 'AI kullanım politikası',
    ozet: 'Sinaptik Lab yapay zekâ araçlarını nerede kullanır, nerede kullanmaz? Editoryal sorumluluk her zaman insandadır.',
    guncelleme: '2026-09-01',
    bolumler: AI_POLITIKASI,
  },
  {
    slug: 'duzeltme-politikasi',
    yol: '/duzeltme-politikasi/',
    etiket: 'EDİTORYAL',
    baslik: 'Düzeltme politikası',
    ozet: 'Hata bulunduğunda ne yapılır? Düzeltme türleri, görünürlük kuralları ve hata bildirimi.',
    guncelleme: '2026-09-01',
    bolumler: DUZELTME_POLITIKASI,
  },
];

/** maxLength kısıtı olan alanlar için kırpma. */
function kirp(metin: string, ust: number): string {
  if (metin.length <= ust) return metin;
  return `${metin.slice(0, ust - 1).trimEnd()}…`;
}

/** `MetinBolumu` dizisini BLOK şemasına uyan gövdeye çevirir. */
function govdeyeCevir(slug: string, bolumler: MetinBolumu[]): TohumBelgesi[] {
  const bloklar: TohumBelgesi[] = [];

  for (const bolum of bolumler) {
    const baslik = bolum.baslik?.trim();
    if (!baslik) {
      console.warn(`[tohum:sayfalar] "${slug}" — başlığı olmayan bölüm atıldı.`);
      continue;
    }

    const kimlik = bolum.kimlik?.trim() || slugla(baslik);
    bloklar.push({ tip: 'altbaslik', metin: baslik, kimlik });

    for (const paragraf of bolum.paragraflar ?? []) {
      const metin = paragraf.trim();
      if (metin) bloklar.push({ tip: 'paragraf', metin });
    }

    const ogeler = (bolum.liste ?? []).map((oge) => oge.trim()).filter(Boolean);
    if (ogeler.length > 0) bloklar.push({ tip: 'liste', ogeler });

    const tablo = bolum.tablo;
    if (tablo && tablo.basliklar.length > 0 && tablo.satirlar.length > 0) {
      bloklar.push({
        tip: 'tablo',
        basliklar: tablo.basliklar,
        satirlar: tablo.satirlar,
      });
    }
  }

  return bloklar;
}

export const SAYFALAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.sayfalar,
  anahtarAlan: 'slug',
  not: 'lib/veri/politikalar.ts (EDITORYAL_ILKELER, AI_POLITIKASI, DUZELTME_POLITIKASI) — bölümler gövde bloklarına çevrilir, künye alanları sayfa dosyalarından gelir, durum eklenir. Hukuki dört metin `politikalar` koleksiyonuna aittir; hakkında/künye/iletişim/metodoloji sayfalarının bölüm dizisi fixture olarak YOK, bu yüzden üretilmez.',
  uret: () =>
    SAYFA_KAYITLARI.flatMap((kayit) => {
      const slug = SLUG_DESENI.test(kayit.slug) ? kayit.slug : slugla(kayit.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:sayfalar] "${kayit.slug}" atlandı — slug desene uymuyor.`);
        return [];
      }

      const govde = govdeyeCevir(slug, kayit.bolumler);
      if (govde.length === 0) {
        console.warn(`[tohum:sayfalar] "${slug}" atlandı — gövde bloğu üretilemedi.`);
        return [];
      }

      return [
        temizle({
          slug,
          yol: kayit.yol,
          baslik: kayit.baslik,
          etiket: kayit.etiket,
          ozet: kayit.ozet,
          govde,
          durum: YAYINDA,
          guncellemeTarihi: tarihOlarak(kayit.guncelleme),
          seo: {
            baslik: kirp(kayit.baslik, 70),
            aciklama: kirp(kayit.ozet, 200),
            kanonik: kayit.yol,
          },
        }),
      ];
    }),
};
