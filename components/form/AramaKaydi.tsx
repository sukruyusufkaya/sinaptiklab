'use client';

import { useEffect, useRef } from 'react';
import { aramaKaydet } from '@/lib/site/form-eylemleri';
import { SORGU_EN_AZ } from '@/lib/site/form-sozlesmesi';

/**
 * Arama sorgusunu `arama_kayitlari` koleksiyonuna yazan SESSİZ bileşen.
 * Hiçbir şey çizmez; kullanıcıya görünmez.
 *
 * NEDEN SAYFA RENDER'INDA DEĞİL BURADA
 *
 * `/ara/` sayfası statik üretilir ve aramayı `CanliArama` istemci bileşeni
 * tarayıcıdaki dizin üzerinde yapar — sonuç sayısını bilen tek yer orası.
 * Render sırasında veritabanına yazmak iki nedenle yanlış olurdu: Next render'ı
 * yan etkisiz kabul eder (aynı ağaç birden çok kez render edilebilir) ve yazan
 * bir sayfa statik üretimden düşerdi. Route handler da bir seçenekti ama yeni
 * bir genel URL yüzeyi (`lib/rotalar.ts`, `app/sitemap.ts` bakımı) açardı;
 * Server Action aynı işi yeni rota eklemeden yapıyor.
 *
 * GECİKMELİ (debounce): her tuş vuruşu ayrı bir sorgu değildir. "transformer"
 * yazan biri anında kaydedilse dizine "t", "tr", "tra"… diye on bir ayrı belge
 * girerdi. Kullanıcı yazmayı bıraktıktan {@link BEKLEME_MS} ms sonra tek kayıt
 * yazılır.
 *
 * KİŞİSEL VERİ GÖNDERİLMEZ: yalnızca sorgu metni, sonuç bulunup bulunmadığı ve
 * ilk sonucun yolu. Şema açıklaması da bunu söylüyor ("Kişisel veri
 * saklanmaz: yalnızca sorgu metni ve sayaç").
 *
 * EFFECT İÇİNDE setState YOK (CLAUDE.md kural 3): effect bir zamanlayıcı kurar
 * ve bir eylem çağırır; durum güncellemez.
 */

const BEKLEME_MS = 1200;

export function AramaKaydi({
  sorgu,
  sonucSayisi,
  ilkSonucYolu,
}: {
  sorgu: string;
  sonucSayisi: number;
  ilkSonucYolu?: string;
}) {
  /**
   * Bu oturumda kaydedilmiş sorgular.
   *
   * Kullanıcı sorguyu silip yeniden yazdığında sayaç ikinci kez artmasın diye
   * tutulur; farklı ziyaretlerde sayaç yine artar (asıl istenen de o).
   */
  const kaydedilenler = useRef<Set<string>>(new Set());

  useEffect(() => {
    const temiz = sorgu.replace(/\s+/g, ' ').trim();
    if (temiz.length < SORGU_EN_AZ) return;

    const anahtar = temiz.toLowerCase();
    if (kaydedilenler.current.has(anahtar)) return;

    const zamanlayici = setTimeout(() => {
      kaydedilenler.current.add(anahtar);
      // Eylem sessizdir: hatayı kendi içinde yutar, arama deneyimini bozmaz.
      void aramaKaydet(temiz, sonucSayisi > 0, ilkSonucYolu);
    }, BEKLEME_MS);

    return () => clearTimeout(zamanlayici);
  }, [sorgu, sonucSayisi, ilkSonucYolu]);

  return null;
}
