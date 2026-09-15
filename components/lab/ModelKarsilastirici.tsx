import { KARSILASTIRMA_BOYUTLARI, modelListesi } from '@/lib/icerik/varliklar';
import { ModelKarsilastirmaTablosu } from './ModelKarsilastirmaTablosu';

/**
 * Model karşılaştırıcının SUNUCU kabuğu.
 *
 * Tablo ve seçim durumu `ModelKarsilastirmaTablosu` içinde istemcide yaşar;
 * model kayıtları ile kod düzeyi boyut listesi burada okunup prop olarak
 * geçirilir (istemci bileşeni `lib/icerik/*` modüllerini çalışma anında
 * çağıramaz). `<ModelKarsilastirici />` imzası değişmedi.
 */
export async function ModelKarsilastirici() {
  return (
    <ModelKarsilastirmaTablosu
      tumModeller={await modelListesi()}
      boyutlar={KARSILASTIRMA_BOYUTLARI}
    />
  );
}
