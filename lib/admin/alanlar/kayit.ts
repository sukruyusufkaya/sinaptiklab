import { ARACLAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/araclar';
import { ARASTIRMA_YAPILANDIRMASI } from '@/lib/admin/alanlar/arastirma';
import { ATLAS_YAPILANDIRMASI } from '@/lib/admin/alanlar/atlas';
import { BRIEFLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/briefler';
import { DERGI_SAYILARI_YAPILANDIRMASI } from '@/lib/admin/alanlar/dergi-sayilari';
import { DERSLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/dersler';
import { ETKINLIKLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/etkinlikler';
import { HIZMETLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/hizmetler';
import { ICERIKLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/icerikler';
import { KONULAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/konular';
import { LAB_PROJELERI_YAPILANDIRMASI } from '@/lib/admin/alanlar/lab-projeleri';
import { MEDYA_YAPILANDIRMASI } from '@/lib/admin/alanlar/medya';
import { MESLEKLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/meslekler';
import { MODELLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/modeller';
import { OGRENME_YOLLARI_YAPILANDIRMASI } from '@/lib/admin/alanlar/ogrenme-yollari';
import { PODCAST_YAPILANDIRMASI } from '@/lib/admin/alanlar/podcast';
import { POLITIKALAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/politikalar';
import { RADAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/radar';
import { SAYFALAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/sayfalar';
import { SEKTORLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/sektorler';
import { SIRKETLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/sirketler';
import { SORULAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/sorular';
import { TESTLER_YAPILANDIRMASI } from '@/lib/admin/alanlar/testler';
import { UZMANLAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/uzmanlar';
import { VAKALAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/vakalar';
import { YAZARLAR_YAPILANDIRMASI } from '@/lib/admin/alanlar/yazarlar';
import { YONLENDIRMELER_YAPILANDIRMASI } from '@/lib/admin/alanlar/yonlendirmeler';
import type { KoleksiyonYapilandirmasi } from '@/lib/admin/alanlar/tipler';

/**
 * Koleksiyon yapılandırma kayıt defteri.
 *
 * Panelin genel CRUD motoru yalnızca burada kayıtlı koleksiyonları yönetir.
 * Kayıtlı olmayan bir koleksiyona `/admin/koleksiyon/<ad>/` ile gidilse bile
 * 404 döner — güvenli varsayılan.
 *
 * Sıra `lib/admin/gezinme.ts` içindeki menü sırasını izler; bu defter ile
 * gezinme ve `KOLEKSIYON_IZNI` (lib/yetki/roller.ts) birlikte güncellenir.
 * Üçünden biri geride kalırsa menü ögesi 404'e düşer.
 *
 * Yeni koleksiyon eklemek için: `lib/admin/alanlar/<ad>.ts` yaz, buraya ekle,
 * `lib/admin/gezinme.ts` içine gezinme ögesi koy.
 */

const KAYIT: readonly KoleksiyonYapilandirmasi[] = [
  // İçerik akışı
  ICERIKLER_YAPILANDIRMASI,
  // Varlıklar
  ATLAS_YAPILANDIRMASI,
  MODELLER_YAPILANDIRMASI,
  SIRKETLER_YAPILANDIRMASI,
  ARACLAR_YAPILANDIRMASI,
  MESLEKLER_YAPILANDIRMASI,
  // Öğrenme
  OGRENME_YOLLARI_YAPILANDIRMASI,
  DERSLER_YAPILANDIRMASI,
  TESTLER_YAPILANDIRMASI,
  SORULAR_YAPILANDIRMASI,
  // Yayın
  ARASTIRMA_YAPILANDIRMASI,
  DERGI_SAYILARI_YAPILANDIRMASI,
  PODCAST_YAPILANDIRMASI,
  BRIEFLER_YAPILANDIRMASI,
  RADAR_YAPILANDIRMASI,
  // Kurumsal
  HIZMETLER_YAPILANDIRMASI,
  SEKTORLER_YAPILANDIRMASI,
  VAKALAR_YAPILANDIRMASI,
  LAB_PROJELERI_YAPILANDIRMASI,
  // Topluluk
  ETKINLIKLER_YAPILANDIRMASI,
  UZMANLAR_YAPILANDIRMASI,
  // Taksonomi, künye ve hukuki
  KONULAR_YAPILANDIRMASI,
  YAZARLAR_YAPILANDIRMASI,
  SAYFALAR_YAPILANDIRMASI,
  POLITIKALAR_YAPILANDIRMASI,
  // Operasyon
  MEDYA_YAPILANDIRMASI,
  YONLENDIRMELER_YAPILANDIRMASI,
];

const DIZIN = new Map(KAYIT.map((y) => [y.koleksiyon, y]));

export function yapilandirmaBul(koleksiyon: string): KoleksiyonYapilandirmasi | undefined {
  return DIZIN.get(koleksiyon);
}

export function yonetilenKoleksiyonlar(): readonly KoleksiyonYapilandirmasi[] {
  return KAYIT;
}

export { KAYIT as YAPILANDIRMALAR };
