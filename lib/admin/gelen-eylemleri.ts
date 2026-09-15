'use server';

import { ObjectId } from 'mongodb';
import { islemDurumuMu, type IslemDurumu } from '@/lib/admin/gelen-sabitleri';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { basarili, basarisiz, korumaliEylem } from '@/lib/yetki/korumali-eylem';

/**
 * Toplanan verinin EDİTORYAL iş akışı alanları.
 *
 * Bu koleksiyonlar kullanıcı girdisidir: editör içeriğini düzeltmez. Panelden
 * değişebilen tek şey kendi iş akışı damgasıdır —
 * `form_kayitlari.islemDurumu` ve `arama_kayitlari.inceledi`. Başka hiçbir
 * alan bu modülden yazılmaz.
 *
 * NEDEN `kayitGuncelle` KULLANILMIYOR: genel motor her güncellemede belgenin
 * önceki hâlini `icerik_surumleri` koleksiyonuna kopyalar. Kişisel veri
 * taşıyan bir kaydın anlık görüntüsü o koleksiyona düşerse TTL dizininin
 * kapsamı dışına çıkar ve saklama süresi fiilen sonsuz olur. Bu yüzden burada
 * tek alanlı doğrudan güncelleme yapılır; iz denetim kaydında tutulur.
 *
 * Yetki: her iki eylem de `korumaliEylem` sarmalayıcısından geçer. Sarmalayıcı
 * izin kapısını eylemin İLK satırında kapatır — Next.js'te Server Action
 * layout render'ından önce çalıştığı için panel düzenindeki `redirect` bu
 * yazmayı engellemez.
 */

/* --- FORM KAYDI: İŞLEM DURUMU -------------------------------------------- */

export type FormDurumGirdisi = { kimlik: string; islemDurumu: IslemDurumu };

/**
 * `kisiselveri:yaz` izni ister (rol matrisi: sahip ve yönetici). Kuyruk
 * damgası kişisel veri kaydının üzerinde durduğu için eşik burada.
 */
export const formDurumunuDegistir = korumaliEylem<FormDurumGirdisi, { islemDurumu: string }>(
  'kisiselveri:yaz',
  async ({ kimlik, islemDurumu }, { kaydet }) => {
    if (!ObjectId.isValid(kimlik)) {
      return basarisiz<{ islemDurumu: string }>('Geçersiz kayıt kimliği.');
    }
    if (!islemDurumuMu(islemDurumu)) {
      return basarisiz<{ islemDurumu: string }>('Geçersiz işlem durumu.');
    }

    const db = await veritabani();
    const koleksiyon = db.collection(KOLEKSIYONLAR.formKayitlari);
    const mevcut = await koleksiyon.findOne({ _id: new ObjectId(kimlik) });
    if (!mevcut) return basarisiz<{ islemDurumu: string }>('Kayıt bulunamadı.');

    const onceki = typeof mevcut.islemDurumu === 'string' ? mevcut.islemDurumu : 'yeni';
    if (onceki === islemDurumu) {
      return basarili({ islemDurumu }, 'Durum zaten buydu.');
    }

    await koleksiyon.updateOne(
      { _id: new ObjectId(kimlik) },
      { $set: { islemDurumu, guncellendi: new Date() } },
    );

    await kaydet({
      eylem: 'durum-degistir',
      koleksiyon: KOLEKSIYONLAR.formKayitlari,
      belgeKimligi: kimlik,
      degisenAlanlar: ['islemDurumu'],
      oncekiDurum: onceki,
      yeniDurum: islemDurumu,
    });

    return basarili({ islemDurumu }, 'İşlem durumu güncellendi.');
  },
);

/* --- ARAMA KAYDI: İNCELENDİ ---------------------------------------------- */

export type AramaIncelemeGirdisi = { kimlik: string; inceledi: boolean };

/**
 * `ayar:yaz` izni ister — rol matrisindeki `arama_kayitlari` yazma izni bu.
 * Okuma izni (`arama:oku`) yazma kapısı OLAMAZ: moderatör içerik açığını
 * görür ama "incelendi" damgasını vuramaz.
 */
export const aramaIncelemesiniIsaretle = korumaliEylem<AramaIncelemeGirdisi, { inceledi: boolean }>(
  'ayar:yaz',
  async ({ kimlik, inceledi }, { kaydet }) => {
    if (!ObjectId.isValid(kimlik)) {
      return basarisiz<{ inceledi: boolean }>('Geçersiz kayıt kimliği.');
    }

    const db = await veritabani();
    const koleksiyon = db.collection(KOLEKSIYONLAR.aramaKayitlari);
    const mevcut = await koleksiyon.findOne({ _id: new ObjectId(kimlik) });
    if (!mevcut) return basarisiz<{ inceledi: boolean }>('Kayıt bulunamadı.');

    await koleksiyon.updateOne(
      { _id: new ObjectId(kimlik) },
      { $set: { inceledi, guncellendi: new Date() } },
    );

    await kaydet({
      eylem: 'guncelle',
      koleksiyon: KOLEKSIYONLAR.aramaKayitlari,
      belgeKimligi: kimlik,
      belgeSlug: typeof mevcut.sorgu === 'string' ? mevcut.sorgu.slice(0, 60) : undefined,
      degisenAlanlar: ['inceledi'],
      not: inceledi ? 'Sorgu incelendi olarak işaretlendi.' : 'İnceleme işareti kaldırıldı.',
    });

    return basarili(
      { inceledi },
      inceledi ? 'Sorgu incelendi olarak işaretlendi.' : 'İşaret kaldırıldı.',
    );
  },
);
