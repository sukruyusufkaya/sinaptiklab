import { modelListesi } from '@/lib/icerik/varliklar';
import { ModelSeciciArayuzu } from './ModelSeciciArayuzu';

/**
 * Model seçicinin SUNUCU kabuğu.
 *
 * Etkileşimli gövde `ModelSeciciArayuzu` içindedir ve istemcide çalışır;
 * istemci bileşeni MongoDB'yi okuyamadığı için model kayıtları burada, sunucuda
 * okunup prop olarak geçirilir. Bileşenin dışa dönük imzası değişmedi
 * (`<ModelSecici />`): `components/lab/AracKayitDefteri.tsx` ve
 * `/lab/model-secici/` sayfası aynen çalışmaya devam eder.
 */
export async function ModelSecici() {
  return <ModelSeciciArayuzu modeller={await modelListesi()} />;
}
