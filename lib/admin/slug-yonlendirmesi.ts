import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { yapilandirmaBul } from '@/lib/admin/alanlar/kayit';
import { yoluNormalize } from '@/lib/mongo/sorgular/yonlendirme';
import { denetimYaz } from '@/lib/yetki/denetim';
import type { OturumKullanicisi } from '@/lib/yetki/oturum';

/**
 * Slug değiştiğinde kalıcı yönlendirme üretir (MASTER-PLAN §46, §48).
 *
 * NEDEN ZORUNLU: URL'ler kalıcıdır. Yayındaki bir içeriğin slug'ı panelden
 * düzeltildiğinde eski adres, yönlendirme yazılmazsa kalıcı 404 olur; dış
 * bağlantılar ve arama sonuçları kopar. Editörün bunu elle hatırlaması
 * beklenemez, bu yüzden kayıt otomatik üretilir.
 *
 * ÜÇ KORUMA
 *
 * 1. **Taslak atlanır.** Hiç yayımlanmamış bir kaydın eski adresi dışarıda
 *    bilinmiyordu; ona yönlendirme yazmak koleksiyonu gereksiz kayıtla şişirir.
 * 2. **Yeni adresi kaynak alan kayıt devre dışı bırakılır.** Aksi hâlde
 *    şu senaryo siteyi bozar: `B` adresi bir zamanlar `C`'ye yönlendirilmişti;
 *    şimdi bir kayıt `A`'dan `B`'ye taşınıyor. Önlem alınmazsa yeni yayın
 *    adresi olan `B`, kendi sayfası yerine `C`'ye yönlenir.
 * 3. **Zincir düzleştirilir.** Eski adrese işaret eden kayıtlar doğrudan yeni
 *    adrese çevrilir (`X→A` iken `A→B` olursa `X→B`). Çözümleyicinin adım
 *    sınırına (5) takılan uzun zincirler böyle oluşmaz.
 */

export type SlugYonlendirmesi = { kaynakYol: string; hedefYol: string };

type YonlendirmeBelgesi = {
  kaynakYol: string;
  hedefYol: string;
  kod?: number;
  aktif?: boolean;
  gerekce?: string;
  guncellendi?: Date;
  olusturuldu?: Date;
};

export async function slugDegisiminiYonlendir({
  koleksiyon,
  eskiBelge,
  yeniBelge,
  kullanici,
  adres,
}: {
  koleksiyon: string;
  eskiBelge: Record<string, unknown>;
  yeniBelge: Record<string, unknown>;
  kullanici: OturumKullanicisi;
  adres?: string;
}): Promise<SlugYonlendirmesi | undefined> {
  const yapilandirma = yapilandirmaBul(koleksiyon);
  if (!yapilandirma?.siteYolu) return undefined;

  const eskiHam = yapilandirma.siteYolu(eskiBelge);
  const yeniHam = yapilandirma.siteYolu(yeniBelge);
  if (!eskiHam || !yeniHam) return undefined;

  const kaynakYol = yoluNormalize(eskiHam);
  const hedefYol = yoluNormalize(yeniHam);
  if (kaynakYol === hedefYol) return undefined;

  // Koruma 1 — hiç yayımlanmamış kaydın eski adresi dışarıda bilinmiyordu.
  if (eskiBelge.durum === 'taslak') return undefined;

  const db = await veritabani();
  const koleksiyonu = db.collection<YonlendirmeBelgesi>(KOLEKSIYONLAR.yonlendirmeler);
  const simdi = new Date();

  // Koruma 2 — yeni adresi kaynak alan kayıt varsa devre dışı bırakılır.
  await koleksiyonu.updateMany(
    { kaynakYol: hedefYol, aktif: { $ne: false } },
    {
      $set: {
        aktif: false,
        gerekce: `Bu adres ${koleksiyon} kaydının yeni yayın adresi oldu; yönlendirme durduruldu.`,
        guncellendi: simdi,
      },
    },
  );

  // Koruma 3 — eski adrese işaret eden kayıtlar doğrudan yeni adrese çevrilir.
  await koleksiyonu.updateMany({ hedefYol: kaynakYol }, { $set: { hedefYol, guncellendi: simdi } });

  await koleksiyonu.updateOne(
    { kaynakYol },
    {
      $set: {
        hedefYol,
        kod: 301,
        aktif: true,
        gerekce: `Slug değişti (${koleksiyon}). Otomatik oluşturuldu.`,
        guncellendi: simdi,
      },
      $setOnInsert: { kaynakYol, olusturuldu: simdi },
    },
    { upsert: true },
  );

  await denetimYaz({
    eylem: 'yonlendirme-ekle',
    koleksiyon: KOLEKSIYONLAR.yonlendirmeler,
    belgeSlug: kaynakYol,
    kullanici,
    adres,
    not: `${kaynakYol} → ${hedefYol} (slug değişimi, ${koleksiyon})`,
  });

  return { kaynakYol, hedefYol };
}
