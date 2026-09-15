import {
  AI_POLITIKASI,
  CEREZ_POLITIKASI,
  DUZELTME_POLITIKASI,
  EDITORYAL_ILKELER,
  GIZLILIK,
  KULLANIM_SARTLARI,
  KVKK_AYDINLATMA,
} from '@/lib/veri/politikalar';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, tarihOlarak, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';
import type { MetinBolumu } from '@/components/kurumsal/MetinSayfasi';
import type { Blok } from '@/lib/tipler';

/**
 * Politika dönüştürücüsü — `lib/veri/politikalar.ts`.
 *
 * Fixture yalnızca BÖLÜM DİZİLERİ (`MetinBolumu[]`) taşır; künye verisi
 * (slug, başlık, özet, yürürlük tarihi) `app/(site)/<politika>/page.tsx`
 * içinde durur. Bu yüzden dönüştürücü künyeyi burada birleştirir — üretimde
 * Mongo tek doğruluk kaynağı olduğunda sayfa bu belgeden beslenecek.
 *
 * Giderilen uyumsuzluklar:
 *  1. `slug` fixture'da YOK; sayfanın kanonik yolundan alınır
 *     (`alternates.canonical: '/gizlilik/'` → `gizlilik`) ve SLUG desenine
 *     karşı doğrulanır.
 *  2. `baslik` ve `ozet` fixture'da YOK; sayfadaki `MetinSayfasi` propları
 *     (`baslik`, `ozet`) birebir taşınır — yeni metin uydurulmaz.
 *  3. `yururlukTarihi` şemada ZORUNLU ve ISO desenine tabi; fixture'da yok.
 *     Sayfaların `guncelleme` propu tüm politikalarda `2026-09-01` — bu değer
 *     kullanılır ve `tarihOlarak()` ile süzülür.
 *  4. `surum` şemada ZORUNLU; fixture'da sürüm kavramı hiç yok. Metinler
 *     ilk yayımda olduğundan `1.0` ÜRETİLİR ve `surumler` dizisine aynı
 *     tarihle tek bir "ilk yayım" kaydı yazılır (koleksiyon açıklaması sürüm
 *     geçmişi bekliyor).
 *  5. `durum` fixture'da yok; şemada zorunlu → `yayinda` (yedi metnin hepsi
 *     sitede prerender ediliyor).
 *  6. `hukukiOnay: false` — hiçbir metin hukuk incelemesinden geçmedi
 *     (`POLITIKA_TASLAK_UYARISI` bunu söylüyor). Editoryal metinlerde
 *     (ilkeler, AI, düzeltme) de hukuk onayı kaydı olmadığı için değer
 *     `false`; uyarıyı gösterip göstermemeye sayfa karar verir.
 *  7. `govde` şemada yapılandırılmış BLOK dizisi; fixture'ın bölüm nesnesi
 *     bloklara açılır: `baslik` → `altbaslik` (bölüm `kimlik`i korunur ki
 *     içindekiler tablosu ve `#çapa` bağlantıları bozulmasın), `paragraflar`
 *     → `paragraf`, `liste` → `liste`, `tablo` → `tablo`.
 *  8. Sayfaların `etiket` ("YASAL", "EDİTORYAL") ve `ilgili` propları şemada
 *     YOK; yazılmaz. Taslak uyarısı da gövdeye blok olarak eklenmez —
 *     `hukukiOnay` alanı bunu zaten taşıyor. `seo` alanının fixture karşılığı
 *     `ozet` ile aynı metin olduğundan boş bırakılır.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Tüm politika sayfalarında `guncelleme` propu bu tarihi taşıyor. */
const YURURLUK_TARIHI = '2026-09-01';

/** Fixture'da sürüm yok; metinler ilk yayımda. */
const ILK_SURUM = '1.0';

type PolitikaKaydi = {
  slug: string;
  baslik: string;
  ozet: string;
  bolumler: MetinBolumu[];
};

/** Künye, ilgili `page.tsx` dosyalarındaki `MetinSayfasi` proplarından alındı. */
const POLITIKALAR: PolitikaKaydi[] = [
  {
    slug: 'editoryal-ilkeler',
    baslik: 'Editoryal ilkeler',
    ozet: 'Yayımlanan her içeriğin uymak zorunda olduğu kurallar: kaynak politikası, yazarlık, yapay zekâ kullanımı, bağımsızlık, tazelik ve düzeltme.',
    bolumler: EDITORYAL_ILKELER,
  },
  {
    slug: 'ai-politikasi',
    baslik: 'AI kullanım politikası',
    ozet: 'Sinaptik Lab yapay zekâ araçlarını nerede kullanır, nerede kullanmaz? Editoryal sorumluluk her zaman insandadır.',
    bolumler: AI_POLITIKASI,
  },
  {
    slug: 'duzeltme-politikasi',
    baslik: 'Düzeltme politikası',
    ozet: 'Hata bulunduğunda ne yapılır? Düzeltme türleri, görünürlük kuralları ve hata bildirimi.',
    bolumler: DUZELTME_POLITIKASI,
  },
  {
    slug: 'kvkk-aydinlatma',
    baslik: 'KVKK aydınlatma metni',
    ozet: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenen kişisel verilere ilişkin aydınlatma metni.',
    bolumler: KVKK_AYDINLATMA,
  },
  {
    slug: 'gizlilik',
    baslik: 'Gizlilik politikası',
    ozet: 'Hangi veriler toplanıyor, ne için kullanılıyor, kimlerle paylaşılıyor ve ne kadar süre saklanıyor?',
    bolumler: GIZLILIK,
  },
  {
    slug: 'cerez-politikasi',
    baslik: 'Çerez politikası',
    ozet: 'Sinaptik Lab üzerinde kullanılan çerez türleri, amaçları ve nasıl yönetilecekleri.',
    bolumler: CEREZ_POLITIKASI,
  },
  {
    slug: 'kullanim-sartlari',
    baslik: 'Kullanım şartları',
    ozet: 'Platformun kullanımına, içeriklerin alıntılanmasına, üyeliğe ve sorumluluğun sınırlarına ilişkin şartlar.',
    bolumler: KULLANIM_SARTLARI,
  },
];

/** Bölüm nesnesini şemanın BLOK dizisine açar. */
function govdeye(bolumler: MetinBolumu[]): Blok[] {
  const bloklar: Blok[] = [];

  for (const bolum of bolumler) {
    bloklar.push({
      tip: 'altbaslik',
      metin: bolum.baslik,
      kimlik: bolum.kimlik || slugla(bolum.baslik),
    });

    for (const paragraf of bolum.paragraflar ?? []) {
      if (paragraf.trim().length === 0) continue;
      bloklar.push({ tip: 'paragraf', metin: paragraf });
    }

    const ogeler = (bolum.liste ?? []).filter((oge) => oge.trim().length > 0);
    if (ogeler.length > 0) {
      bloklar.push({ tip: 'liste', ogeler });
    }

    const tablo = bolum.tablo;
    if (tablo && tablo.basliklar.length > 0 && tablo.satirlar.length > 0) {
      bloklar.push({ tip: 'tablo', basliklar: tablo.basliklar, satirlar: tablo.satirlar });
    }
  }

  return bloklar;
}

export const POLITIKALAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.politikalar,
  anahtarAlan: 'slug',
  not: 'lib/veri/politikalar.ts — bölüm dizileri gövde bloklarına açılır; künye (slug/başlık/özet) politika sayfalarından, yururlukTarihi sayfaların guncelleme propundan, surum "1.0" olarak üretilir; hukukiOnay false.',
  uret: () =>
    POLITIKALAR.flatMap((politika) => {
      const slug = SLUG_DESENI.test(politika.slug) ? politika.slug : slugla(politika.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:politikalar] "${politika.slug}" atlandı — slug desenine çevrilemedi.`);
        return [];
      }

      const yururlukTarihi = tarihOlarak(YURURLUK_TARIHI);
      if (!yururlukTarihi) {
        console.warn(
          `[tohum:politikalar] "${slug}" atlandı — geçersiz yürürlük tarihi: "${YURURLUK_TARIHI}"`,
        );
        return [];
      }

      const govde = govdeye(politika.bolumler);
      if (govde.length === 0) {
        console.warn(`[tohum:politikalar] "${slug}" atlandı — gövdesi boş.`);
        return [];
      }

      return [
        temizle({
          slug,
          baslik: politika.baslik,
          ozet: politika.ozet,
          yururlukTarihi,
          surum: ILK_SURUM,
          hukukiOnay: false,
          govde,
          surumler: [
            {
              surum: ILK_SURUM,
              tarih: yururlukTarihi,
              degisiklik: 'İlk yayım; metin editoryal taslak olarak yayımlandı.',
            },
          ],
          durum: YAYINDA,
        }),
      ];
    }),
};
