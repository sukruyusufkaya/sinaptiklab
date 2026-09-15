import type { Metadata } from 'next';
import { ParolaFormu } from '@/components/admin/ParolaFormu';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { IZIN_ADI, ROL_ADI, ROL_TARIFI, type Izin, type Rol } from '@/lib/yetki/roller';
import { ObjectId } from 'mongodb';

export const metadata: Metadata = { title: 'Hesabım' };
export const dynamic = 'force-dynamic';

function tarihBicimle(deger: Date | string | undefined) {
  if (!deger) return '—';
  return new Date(deger).toISOString().slice(0, 16).replace('T', ' ');
}

export default async function HesapSayfasi() {
  const kullanici = await oturumGerekli();
  const db = await veritabani();

  const [oturumlar, sonGirisler] = await Promise.all([
    db
      .collection(KOLEKSIYONLAR.oturumlar)
      .find({ kullaniciKimligi: new ObjectId(kullanici.kimlik), iptalEdildi: { $ne: true } })
      .sort({ sonErisim: -1 })
      .limit(10)
      .toArray(),
    db
      .collection(KOLEKSIYONLAR.denetimKaydi)
      .find({
        kullaniciKimligi: new ObjectId(kullanici.kimlik),
        eylem: { $in: ['giris', 'cikis'] },
      })
      .sort({ zaman: -1 })
      .limit(8)
      .toArray(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="etiket-mono text-metin-soluk">HESAP</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">
          {kullanici.adSoyad ?? kullanici.eposta}
        </h1>
        <p className="mt-2 text-sm text-metin-ikincil">{kullanici.eposta}</p>
      </div>

      {/* Roller ve izinler */}
      <section className="rounded-xl border border-kenar bg-yuzey/40 p-5">
        <h2 className="etiket-mono mb-3 text-metin">ROL VE YETKİ</h2>
        <ul className="space-y-3">
          {kullanici.roller.map((rol) => (
            <li key={rol}>
              <p className="text-sm font-medium text-metin">{ROL_ADI[rol as Rol] ?? rol}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-metin-soluk">
                {ROL_TARIFI[rol as Rol] ?? 'Panel dışı rol.'}
              </p>
            </li>
          ))}
        </ul>

        <details className="mt-4 border-t border-kenar-soluk pt-3">
          <summary className="etiket-mono cursor-pointer text-metin-soluk">
            {kullanici.izinler.length} izin
          </summary>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {kullanici.izinler.map((izin) => (
              <li key={izin} className="text-xs text-metin-ikincil">
                <code className="font-mono text-kenar-guclu">{izin}</code>
                <span className="ml-1.5">{IZIN_ADI[izin as Izin] ?? ''}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      {/* Parola */}
      <section className="rounded-xl border border-kenar bg-yuzey/40 p-5">
        <h2 className="etiket-mono mb-1 text-metin">PAROLA</h2>
        <p className="mb-4 text-xs text-metin-soluk">
          Son değişiklik: {tarihBicimle(kullanici.parolaGuncellendi)}
        </p>
        <ParolaFormu />
      </section>

      {/* Aktif oturumlar */}
      <section>
        <h2 className="etiket-mono mb-3 text-metin">AKTİF OTURUMLAR ({oturumlar.length})</h2>
        <ul className="divide-y divide-kenar-soluk overflow-hidden rounded-xl border border-kenar">
          {oturumlar.map((oturum, sira) => (
            <li
              key={String(oturum._id ?? sira)}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-yuzey/30 px-4 py-3 text-[0.8125rem]"
            >
              <span className="etiket-mono text-vurgu-parlak">{String(oturum.adres ?? '—')}</span>
              <span className="text-metin-ikincil">
                son erişim {tarihBicimle(oturum.sonErisim as Date)}
              </span>
              <span className="text-metin-soluk">
                bitiş {tarihBicimle(oturum.biterZaman as Date)}
              </span>
              <span className="w-full truncate text-xs text-metin-soluk">
                {String(oturum.tarayici ?? '')}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-metin-soluk">
          Parolanızı değiştirdiğinizde bu oturum dışındaki tümü kapatılır. Oturumlar en fazla 7 gün
          yaşar ve 8 saat hareketsizlikten sonra düşer.
        </p>
      </section>

      {/* Giriş geçmişi */}
      <section>
        <h2 className="etiket-mono mb-3 text-metin">GİRİŞ GEÇMİŞİ</h2>
        {sonGirisler.length === 0 ? (
          <p className="rounded-xl border border-dashed border-kenar-guclu p-5 text-sm text-metin-soluk">
            Kayıt yok.
          </p>
        ) : (
          <ul className="divide-y divide-kenar-soluk overflow-hidden rounded-xl border border-kenar">
            {sonGirisler.map((kayit, sira) => (
              <li
                key={String(kayit._id ?? sira)}
                className="flex items-baseline gap-3 bg-yuzey/30 px-4 py-2.5 text-[0.8125rem]"
              >
                <span className="etiket-mono w-32 shrink-0 text-metin-soluk">
                  {tarihBicimle(kayit.zaman as Date)}
                </span>
                <span
                  className={`etiket-mono ${kayit.eylem === 'giris' ? 'text-basari' : 'text-metin-soluk'}`}
                >
                  {String(kayit.eylem)}
                </span>
                <span className="text-metin-ikincil">{String(kayit.adres ?? '')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
