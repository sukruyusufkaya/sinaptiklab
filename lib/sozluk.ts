import { slugla } from "@/lib/slug";

/**
 * Sözlük indeksinin saf sunum mantığı: Türkçe alfabeye göre harf grupları ve
 * çıpa id'leri. DB'ye ve React'e bağımlılığı yoktur — birim testli.
 *
 * Türkçe sıralamanın iki tuzağı burada bilinçli çözülür:
 *  1. Büyük harfe çevirme `tr-TR` ile yapılır ("i" → "İ", "ı" → "I").
 *  2. Sıralama `localeCompare(..., "tr")` ile yapılır (Ç, Ğ, İ, Ö, Ş, Ü kendi
 *     yerlerine oturur; ASCII sıralaması bunları sona atardı).
 * Türk alfabesi dışı başlangıçlar (rakam, Q/W/X) "#" grubunda toplanır ve
 * liste sonunda gösterilir.
 */

const TR_ALFABE = [..."ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"];
export const DIGER_HARF = "#";

/** Terimin ait olduğu harf başlığı (tek karakter) — alfabe dışıysa "#". */
export function harfAnahtari(metin: string): string {
  const ilk = metin.trim().charAt(0).toLocaleUpperCase("tr-TR");
  return TR_ALFABE.includes(ilk) ? ilk : DIGER_HARF;
}

/**
 * Harf → çapa id'si haritası. ASCII'ye normalize edilince Ç/C ve İ/I aynı
 * tabana düşer; aynı sayfada iki kez `id="harf-c"` basmamak için çakışanlara
 * `-2` eki verilir (MDX başlık id'lerindeki kuralın aynısı). Alfabe sabit
 * olduğundan harita bir kez, modül yüklenirken kurulur.
 */
const CIPA_HARITASI: ReadonlyMap<string, string> = (() => {
  const harita = new Map<string, string>();
  const sayaclar = new Map<string, number>();
  for (const harf of TR_ALFABE) {
    const taban = slugla(harf) || "diger";
    const sira = (sayaclar.get(taban) ?? 0) + 1;
    sayaclar.set(taban, sira);
    harita.set(harf, `harf-${sira === 1 ? taban : `${taban}-${sira}`}`);
  }
  return harita;
})();

/** Harf başlığından stabil, benzersiz çapa id'si ("Ç" → "harf-c-2"). */
export function harfCipasi(harf: string): string {
  return CIPA_HARITASI.get(harf) ?? "harf-diger";
}

export interface HarfGrubu<T> {
  harf: string;
  cipa: string;
  terimler: T[];
}

/**
 * Terimleri harf gruplarına ayırır. Girdi sırası korunmaz: hem gruplar hem
 * grup içi terimler Türkçe sıraya sokulur, böylece çağıran taraf sıralamayı
 * ayrıca düşünmek zorunda kalmaz.
 */
export function harfleGrupla<T extends { tr: string }>(terimler: T[]): HarfGrubu<T>[] {
  const gruplar = new Map<string, T[]>();
  for (const terim of terimler) {
    const harf = harfAnahtari(terim.tr);
    const kutu = gruplar.get(harf);
    if (kutu) kutu.push(terim);
    else gruplar.set(harf, [terim]);
  }

  return [...gruplar.entries()]
    .sort(([a], [b]) => {
      if (a === DIGER_HARF) return 1;
      if (b === DIGER_HARF) return -1;
      return a.localeCompare(b, "tr");
    })
    .map(([harf, liste]) => ({
      harf,
      cipa: harfCipasi(harf),
      terimler: [...liste].sort((x, y) => x.tr.localeCompare(y.tr, "tr")),
    }));
}
