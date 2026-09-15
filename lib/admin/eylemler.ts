'use server';

import { revalidatePath } from 'next/cache';
import { yapilandirmaBul } from '@/lib/admin/alanlar/kayit';
import { alanDegeriYaz, type Alan } from '@/lib/admin/alanlar/tipler';
import { slugDegisiminiYonlendir } from '@/lib/admin/slug-yonlendirmesi';
import { guvenliAdres } from '@/lib/guvenlik/adres';
import {
  durumDegistir as durumDegistirSorgu,
  kayitGetir,
  kayitGuncelle,
  kayitOlustur,
  kayitSil as kayitSilSorgu,
} from '@/lib/mongo/sorgular/yonetim';
import { basarili, basarisiz, korumaliEylem, type EylemSonucu } from '@/lib/yetki/korumali-eylem';
import { KOLEKSIYON_IZNI } from '@/lib/yetki/roller';

/**
 * Genel CRUD eylemleri.
 *
 * Her eylem `korumaliEylem` sarmalayıcısından geçer: Next.js'te Server Action
 * layout render'ından ÖNCE çalıştığı için yetki kontrolü burada, eylemin ilk
 * satırında yapılmak zorundadır.
 *
 * Bu dosyadaki eylemler `redirect()` ÇAĞIRMAZ — hedef yolu döndürür,
 * gezinmeyi istemci yapar (sarmalayıcının catch bloğu redirect istisnasını
 * yutardı).
 */

/* --- FORM VERİSİNİ ÇÖZME -------------------------------------------------- */

/**
 * Form verisini alan tanımına göre tipli bir belgeye çevirir.
 *
 * Çözümleme konfigürasyona göre yapılır, gelen anahtarlara göre DEĞİL:
 * istemcinin gönderdiği fazladan alanlar bu aşamada düşer. Kütle atama
 * korumasının ilk katmanı budur (ikincisi `yazilabilirAlanlar`).
 */
function formuCoz(
  alanlar: readonly Alan[],
  veri: FormData,
): { belge: Record<string, unknown>; hatalar: Record<string, string> } {
  const belge: Record<string, unknown> = {};
  const hatalar: Record<string, string> = {};

  for (const alan of alanlar) {
    if (alan.saltOkunur) continue;

    const ham = veri.get(alan.ad);

    switch (alan.tip) {
      case 'mantik': {
        alanDegeriYaz(belge, alan.ad, ham === 'on' || ham === 'true');
        break;
      }

      case 'sayi': {
        const metin = String(ham ?? '').trim();
        if (!metin) {
          if (alan.zorunlu) hatalar[alan.ad] = 'Bu alan zorunlu.';
          break;
        }
        const sayi = Number(metin);
        if (Number.isNaN(sayi)) {
          hatalar[alan.ad] = 'Sayı olmalı.';
          break;
        }
        if (alan.enAz !== undefined && sayi < alan.enAz) {
          hatalar[alan.ad] = `En az ${alan.enAz} olmalı.`;
          break;
        }
        if (alan.enCok !== undefined && sayi > alan.enCok) {
          hatalar[alan.ad] = `En fazla ${alan.enCok} olabilir.`;
          break;
        }
        alanDegeriYaz(belge, alan.ad, sayi);
        break;
      }

      case 'metinDizisi':
      case 'cokluSecim':
      case 'cokluIliski': {
        // Çok satırlı metin alanından veya çoklu seçimden gelir.
        const degerler =
          alan.tip === 'metinDizisi'
            ? String(ham ?? '')
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            : veri.getAll(alan.ad).map(String).filter(Boolean);

        if (alan.zorunlu && degerler.length === 0) {
          hatalar[alan.ad] = 'En az bir değer gerekli.';
          break;
        }
        if (alan.enAz !== undefined && degerler.length < alan.enAz) {
          hatalar[alan.ad] = `En az ${alan.enAz} madde gerekli.`;
          break;
        }
        alanDegeriYaz(belge, alan.ad, degerler);
        break;
      }

      case 'nesneDizisi':
      case 'bloklar':
      case 'json': {
        // Bu alanlar istemcide JSON'a serialize edilip tek alanda gelir.
        const metin = String(ham ?? '').trim();
        if (!metin) {
          if (alan.zorunlu) hatalar[alan.ad] = 'Bu alan zorunlu.';
          break;
        }
        try {
          const cozulmus = JSON.parse(metin);
          if (alan.tip !== 'json' && !Array.isArray(cozulmus)) {
            hatalar[alan.ad] = 'Liste bekleniyordu.';
            break;
          }
          if (alan.enAz !== undefined && Array.isArray(cozulmus) && cozulmus.length < alan.enAz) {
            hatalar[alan.ad] = `En az ${alan.enAz} madde gerekli.`;
            break;
          }
          alanDegeriYaz(belge, alan.ad, cozulmus);
        } catch {
          hatalar[alan.ad] = 'Bozuk veri; bu alanı yeniden düzenleyin.';
        }
        break;
      }

      default: {
        // metin, uzunMetin, slug, tarih, zaman, secim, iliski
        let metin = String(ham ?? '').trim();

        if (!metin) {
          if (alan.zorunlu) hatalar[alan.ad] = 'Bu alan zorunlu.';
          break;
        }

        if (alan.tip === 'slug' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metin)) {
          hatalar[alan.ad] = 'Yalnızca küçük harf, rakam ve tire. Türkçe karakter kullanılamaz.';
          break;
        }

        if (alan.tip === 'tarih' && !/^\d{4}-\d{2}-\d{2}$/.test(metin)) {
          hatalar[alan.ad] = 'Tarih YYYY-AA-GG biçiminde olmalı.';
          break;
        }

        if (alan.enAz !== undefined && metin.length < alan.enAz) {
          hatalar[alan.ad] = `En az ${alan.enAz} karakter olmalı.`;
          break;
        }
        if (alan.enCok !== undefined && metin.length > alan.enCok) {
          hatalar[alan.ad] = `En fazla ${alan.enCok} karakter olabilir.`;
          break;
        }

        if (alan.secenekler?.length) {
          const gecerli = alan.secenekler.some((s) => s.deger === metin);
          if (!gecerli) {
            hatalar[alan.ad] = 'Listede olmayan bir değer seçildi.';
            break;
          }
        }

        // Adres alanları temizlenir: `javascript:` gibi şemalar href'e girmesin.
        if (/adres/i.test(alan.ad) && !alan.ad.includes('Yol')) {
          const guvenli = guvenliAdres(metin);
          if (!guvenli) {
            hatalar[alan.ad] = 'Yalnızca http, https, mailto ve tel adresleri kabul edilir.';
            break;
          }
          metin = guvenli;
        }

        // Şemada `bsonType: 'number'` olan enum alanları (ör. yönlendirme
        // kodu) sayı olarak yazılır; metin gönderilirse doğrulama reddeder.
        if (alan.sayisalDeger) {
          const sayi = Number(metin);
          if (Number.isNaN(sayi)) {
            hatalar[alan.ad] = 'Sayı olmalı.';
            break;
          }
          alanDegeriYaz(belge, alan.ad, sayi);
          break;
        }

        alanDegeriYaz(belge, alan.ad, metin);
      }
    }
  }

  return { belge, hatalar };
}

/** Alt alanların adres alanlarını da temizler (nesne dizileri için). */
function nesneDizisiTemizle(alan: Alan, deger: unknown): unknown {
  if (!Array.isArray(deger) || !alan.altAlanlar) return deger;

  return deger.map((oge) => {
    if (!oge || typeof oge !== 'object') return oge;
    const kopya = { ...(oge as Record<string, unknown>) };
    for (const alt of alan.altAlanlar ?? []) {
      if (/adres/i.test(alt.ad) && typeof kopya[alt.ad] === 'string') {
        kopya[alt.ad] = guvenliAdres(kopya[alt.ad] as string) ?? undefined;
      }
    }
    return kopya;
  });
}

/* --- EYLEMLER ------------------------------------------------------------- */

export type KaydetGirdisi = { koleksiyon: string; kimlik?: string; veri: FormData };
export type KaydetCiktisi = { kimlik: string; yol: string };

async function sitePathTazele(koleksiyon: string, belge: Record<string, unknown>) {
  const yapilandirma = yapilandirmaBul(koleksiyon);
  const yol = yapilandirma?.siteYolu?.(belge);
  if (yol) {
    try {
      revalidatePath(yol);
    } catch {
      /* statik üretimde yol yoksa sorun değil */
    }
  }
}

export const kayitKaydet = korumaliEylem<KaydetGirdisi, KaydetCiktisi>(
  // Koleksiyon düzeyi izin eylem içinde koleksiyona göre yeniden denetlenir;
  // sarmalayıcıdaki bu izin panele girişin asgari şartı.
  'icerik:oku',
  // Denetim kaydını `kayitOlustur`/`kayitGuncelle` yazar; burada `kaydet`
  // bağlamına ihtiyaç yok.
  async ({ koleksiyon, kimlik, veri }, { kullanici, adres }) => {
    const yapilandirma = yapilandirmaBul(koleksiyon);
    if (!yapilandirma) return basarisiz<KaydetCiktisi>('Tanınmayan koleksiyon.');

    const izinler = KOLEKSIYON_IZNI[koleksiyon];
    if (!izinler) return basarisiz<KaydetCiktisi>('Bu koleksiyon panelden yönetilemiyor.');

    const { belge, hatalar } = formuCoz(yapilandirma.alanlar, veri);

    if (Object.keys(hatalar).length) {
      return basarisiz<KaydetCiktisi>('Formda düzeltilmesi gereken alanlar var.', {
        alanHatalari: hatalar,
      });
    }

    // Nesne dizilerindeki adresleri de temizle.
    for (const alan of yapilandirma.alanlar) {
      if (alan.tip === 'nesneDizisi' && belge[alan.ad] !== undefined) {
        belge[alan.ad] = nesneDizisiTemizle(alan, belge[alan.ad]);
      }
    }

    /*
     * Slug değişimini yakalamak için güncellemeden ÖNCEKİ hâl okunur. Sonradan
     * okunamaz: güncelleme eski slug'ı geri dönüşsüz olarak ezer.
     */
    const oncekiBelge = kimlik ? await kayitGetir(koleksiyon, kimlik) : null;

    const sonuc = kimlik
      ? await kayitGuncelle({ koleksiyon, kimlik, veri: belge, kullanici, adres })
      : await kayitOlustur({ koleksiyon, veri: belge, kullanici, adres });

    if (!sonuc.tamam) {
      return basarisiz<KaydetCiktisi>(sonuc.hata, {
        alanHatalari: sonuc.alan ? { [sonuc.alan]: sonuc.hata } : undefined,
      });
    }

    await sitePathTazele(koleksiyon, belge);

    /*
     * URL kalıcılığı: slug değiştiyse eski adresten yenisine 301 üretilir
     * (MASTER-PLAN §46). Yönlendirme yazımı kaydetmeyi BAŞARISIZ KILMAZ —
     * içerik kaydedildi, yönlendirme ikincil bir yan etkidir; hata yalnızca
     * günlüğe düşer ve editöre bilgi olarak bildirilir.
     */
    let yonlendirmeIletisi = '';
    if (oncekiBelge) {
      try {
        const yonlendirme = await slugDegisiminiYonlendir({
          koleksiyon,
          eskiBelge: oncekiBelge,
          yeniBelge: { ...oncekiBelge, ...belge },
          kullanici,
          adres,
        });
        if (yonlendirme) {
          // Eski adres önbellekte 200 olarak durabilir; düşürülmeli ki
          // yakalayıcı rota devreye girip yönlendirmeyi uygulasın.
          try {
            revalidatePath(yonlendirme.kaynakYol);
          } catch {
            /* yol statik üretimde yoksa sorun değil */
          }
          yonlendirmeIletisi = ` Eski adres (${yonlendirme.kaynakYol}) kalıcı olarak yeni adrese yönlendirildi.`;
        }
      } catch (hata) {
        console.error('[eylemler] slug yönlendirmesi yazılamadı', hata);
        yonlendirmeIletisi =
          ' UYARI: Slug değişti ama yönlendirme yazılamadı — eski adres 404 verecek.';
      }
    }

    return basarili(
      { kimlik: sonuc.kimlik, yol: `/admin/koleksiyon/${koleksiyon}/${sonuc.kimlik}/` },
      (kimlik ? 'Kayıt güncellendi.' : 'Kayıt oluşturuldu.') + yonlendirmeIletisi,
    );
  },
);

export type DurumGirdisi = { koleksiyon: string; kimlik: string; durum: string };

export const kayitDurumDegistir = korumaliEylem<DurumGirdisi, { durum: string }>(
  'icerik:oku',
  async ({ koleksiyon, kimlik, durum }, { kullanici, adres }) => {
    const sonuc = await durumDegistirSorgu({
      koleksiyon,
      kimlik,
      yeniDurum: durum,
      kullanici,
      adres,
    });
    if (!sonuc.tamam) return basarisiz<{ durum: string }>(sonuc.hata);

    const belge = await kayitGetir(koleksiyon, kimlik);
    if (belge) await sitePathTazele(koleksiyon, belge);

    const ILETI: Record<string, string> = {
      taslak: 'Taslağa alındı.',
      incelemede: 'İncelemeye gönderildi.',
      yayinda: 'Yayımlandı.',
      arsiv: 'Arşivlendi.',
    };

    return basarili({ durum }, ILETI[durum] ?? 'Durum değişti.');
  },
);

export type SilGirdisi = { koleksiyon: string; kimlik: string };

export const kayitSil = korumaliEylem<SilGirdisi, { yol: string }>(
  'icerik:oku',
  async ({ koleksiyon, kimlik }, { kullanici, adres }) => {
    const belge = await kayitGetir(koleksiyon, kimlik);
    const sonuc = await kayitSilSorgu({ koleksiyon, kimlik, kullanici, adres });
    if (!sonuc.tamam) return basarisiz<{ yol: string }>(sonuc.hata);

    if (belge) await sitePathTazele(koleksiyon, belge);

    return basarili(
      { yol: `/admin/koleksiyon/${koleksiyon}/` },
      'Kayıt silindi. Son hâli sürüm geçmişinde duruyor.',
    );
  },
);

/** Tüm siteyi tazeler — toplu değişiklikten sonra. */
export const siteyiTazele = korumaliEylem<undefined, undefined>(
  'icerik:yayinla',
  async (_girdi, { kaydet }) => {
    revalidatePath('/', 'layout');
    await kaydet({ eylem: 'ayar-degistir', koleksiyon: '-', not: 'Tüm site tazelendi.' });
    return basarili<undefined>(undefined, 'Site tazelendi.');
  },
);

export type EylemCiktisi = EylemSonucu<KaydetCiktisi>;
