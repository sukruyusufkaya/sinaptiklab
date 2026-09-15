import type { ComponentType } from 'react';
import { TokenHesaplayici } from './TokenHesaplayici';
import { MaliyetHesaplayici } from './MaliyetHesaplayici';
import { ChunkHesaplayici } from './ChunkHesaplayici';
import { GpuBellekHesaplayici } from './GpuBellekHesaplayici';
import { BaglamHesaplayici } from './BaglamHesaplayici';
import { RoiHesaplayici } from './RoiHesaplayici';
import { ModelSecici } from './ModelSecici';
import { GommeDepolamaHesaplayici } from './GommeDepolamaHesaplayici';
import { VeriSetiBolmeHesaplayici } from './VeriSetiBolmeHesaplayici';
import { OrneklemBuyukluguHesaplayici } from './OrneklemBuyukluguHesaplayici';
import { KarisiklikMatrisiHesaplayici } from './KarisiklikMatrisiHesaplayici';
import { NicemlemeBellekHesaplayici } from './NicemlemeBellekHesaplayici';
import { TopluIslemVerimiHesaplayici } from './TopluIslemVerimiHesaplayici';
import { IstemButcesiHesaplayici } from './IstemButcesiHesaplayici';
import { YenidenSiralamaEtkisi } from './YenidenSiralamaEtkisi';
import { AjanAdimMaliyeti } from './AjanAdimMaliyeti';
import { GecikmeButcesiHesaplayici } from './GecikmeButcesiHesaplayici';
import { InsanOnayKapasitesi } from './InsanOnayKapasitesi';
import { SaklamaTakvimiHesaplayici } from './SaklamaTakvimiHesaplayici';

/**
 * Lab projeleri ile etkileşimli bileşenleri eşleyen kayıt defteri.
 *
 * Burada karşılığı olmayan projeler `/lab/[slug]/` sayfasında "geliştiriliyor"
 * olarak gösterilir — yani bu tablo, bir aracın sitede çalışıp çalışmadığının
 * TEK belirleyicisidir.
 *
 * TEK KAYNAK. Önceki sürüm aynı eşlemeyi İKİ yerde tutuyordu: bir `Record`
 * (`aracVarMi` için) ve bir `switch` (render için). 7 araçta idare ediyordu;
 * 19 araçta bu iki listenin ayrışması an meselesi — `Record`'a eklenip
 * `switch`'e eklenmeyen bir araç `aracVarMi()` ile "hazır" görünür, sayfada
 * "Aracı kullan" düğmesi basılır ve bölüm BOŞ render edilir. Hata mesajı
 * çıkmadığı için de fark edilmez. Artık tek tablo var ve render doğrudan
 * ondan yapılıyor.
 */
const ARAC_BILESENLERI: Record<string, ComponentType> = {
  // Faz 1 araçları
  'token-hesaplayici': TokenHesaplayici,
  'llm-maliyet-hesaplayici': MaliyetHesaplayici,
  'rag-chunk-hesaplayici': ChunkHesaplayici,
  'gpu-bellek-hesaplayici': GpuBellekHesaplayici,
  'baglam-penceresi-hesaplayici': BaglamHesaplayici,
  'ai-roi-hesaplayici': RoiHesaplayici,
  'model-secici': ModelSecici,
  // Veri ve değerlendirme
  'gomme-depolama-hesaplayici': GommeDepolamaHesaplayici,
  'veri-seti-bolme-hesaplayici': VeriSetiBolmeHesaplayici,
  'orneklem-buyuklugu-hesaplayici': OrneklemBuyukluguHesaplayici,
  'karisiklik-matrisi-hesaplayici': KarisiklikMatrisiHesaplayici,
  // Altyapı ve maliyet
  'nicemleme-bellek-hesaplayici': NicemlemeBellekHesaplayici,
  'toplu-islem-verimi-hesaplayici': TopluIslemVerimiHesaplayici,
  'gecikme-butcesi-hesaplayici': GecikmeButcesiHesaplayici,
  // Bağlam ve geri getirme
  'istem-butcesi-hesaplayici': IstemButcesiHesaplayici,
  'yeniden-siralama-etkisi': YenidenSiralamaEtkisi,
  'ajan-adim-maliyeti': AjanAdimMaliyeti,
  // Sorumlu kullanım
  'insan-onay-kapasitesi': InsanOnayKapasitesi,
  'saklama-takvimi-hesaplayici': SaklamaTakvimiHesaplayici,
};

export const ETKILESIMLI_SLUGLAR = Object.keys(ARAC_BILESENLERI);

/** Bir Lab projesinin çalışan bir arayüzü var mı? */
export function aracVarMi(slug: string) {
  return slug in ARAC_BILESENLERI;
}

/**
 * Slug'a karşılık gelen aracı basar.
 *
 * Karşılığı olmayan slug'da `null` döner; çağıran sayfa bunu zaten
 * `aracVarMi()` ile önceden sorup "geliştiriliyor" bölümünü basıyor.
 */
export function EtkilesimliArac({ slug }: { slug: string }) {
  const Bilesen = ARAC_BILESENLERI[slug];
  return Bilesen ? <Bilesen /> : null;
}
