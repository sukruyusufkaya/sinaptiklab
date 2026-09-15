import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KullaniciYonetimi, type KullaniciGorunumu } from '@/components/admin/KullaniciYonetimi';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { enYuksekDuzey, izinVarMi, ROL_DUZEYI, ROLLER, type Rol } from '@/lib/yetki/roller';

export const metadata: Metadata = { title: 'Kullanıcılar' };
export const dynamic = 'force-dynamic';

export default async function KullanicilarSayfasi() {
  const kullanici = await oturumGerekli();
  if (!izinVarMi(kullanici.roller, 'kullanici:oku')) notFound();

  const db = await veritabani();
  const benimDuzeyim = enYuksekDuzey(kullanici.roller);

  const [kayitlar, oturumSayimlari] = await Promise.all([
    db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .find(
        {},
        {
          // Parola özeti ve sıfırlama alanları HİÇ çekilmez — panele bile gelmez.
          projection: {
            eposta: 1,
            adSoyad: 1,
            roller: 1,
            durum: 1,
            sonGiris: 1,
            olusturuldu: 1,
          },
        },
      )
      .sort({ olusturuldu: 1 })
      .limit(200)
      .toArray(),
    db
      .collection(KOLEKSIYONLAR.oturumlar)
      .aggregate<{ _id: unknown; adet: number }>([
        { $match: { iptalEdildi: { $ne: true } } },
        { $group: { _id: '$kullaniciKimligi', adet: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const oturumHaritasi = new Map(oturumSayimlari.map((o) => [String(o._id), o.adet]));

  const gorunumler: KullaniciGorunumu[] = kayitlar.map((kayit) => {
    const kimlik = String(kayit._id);
    const roller = Array.isArray(kayit.roller) ? (kayit.roller as string[]) : [];
    const hedefDuzeyi = enYuksekDuzey(roller);
    const kendisiMi = kimlik === kullanici.kimlik;

    return {
      kimlik,
      eposta: String(kayit.eposta ?? ''),
      adSoyad: typeof kayit.adSoyad === 'string' ? kayit.adSoyad : undefined,
      roller,
      durum: String(kayit.durum ?? 'aktif'),
      sonGiris:
        kayit.sonGiris instanceof Date
          ? kayit.sonGiris.toISOString().slice(0, 16).replace('T', ' ')
          : undefined,
      aktifOturum: oturumHaritasi.get(kimlik) ?? 0,
      kendisiMi,
      // Kendinden yetkili veya eşit bir hesap yönetilemez.
      yonetilebilir:
        izinVarMi(kullanici.roller, 'kullanici:yaz') && !kendisiMi && hedefDuzeyi < benimDuzeyim,
    };
  });

  // Kendi düzeyinin üstünde rol atanamaz.
  const atanabilirRoller = ROLLER.filter((rol) => ROL_DUZEYI[rol as Rol] <= benimDuzeyim);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="etiket-mono text-metin-soluk">YÖNETİM</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">Kullanıcılar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-ikincil">
          {gorunumler.length} hesap. Parola özetleri bu ekrana hiç çekilmez; rol veya durum
          değiştiğinde hedefin tüm oturumları kapatılır.
        </p>
      </div>

      <KullaniciYonetimi kullanicilar={gorunumler} atanabilirRoller={atanabilirRoller} />
    </div>
  );
}
