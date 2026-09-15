import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { izinVarMi } from '@/lib/yetki/roller';
import type { Filter } from 'mongodb';

export const metadata: Metadata = { title: 'Denetim kaydı' };
export const dynamic = 'force-dynamic';

/**
 * Denetim kaydı.
 *
 * "Kim ne zaman neyi değiştirdi" sorusunun tek cevabı. Yalnızca eklenir;
 * panelden silinemez, düzenlenemez.
 *
 * Bu ekran kullanıcı e-postası ve IP adresi gösterir, yani KİŞİSEL VERİ
 * yüzeyidir — bu yüzden `denetim:oku` izni yalnızca yönetici ve sahipte.
 */

const EYLEM_ETIKETI: Record<string, string> = {
  giris: 'giriş',
  cikis: 'çıkış',
  'giris-basarisiz': 'giriş başarısız',
  olustur: 'oluştur',
  guncelle: 'güncelle',
  'durum-degistir': 'durum değişti',
  sil: 'sil',
  yayinla: 'yayımla',
  'geri-al': 'geri al',
  'rol-degistir': 'rol değişti',
  'parola-degistir': 'parola değişti',
  'disa-aktar': 'dışa aktar',
  'kisisel-veri-sil': 'kişisel veri silindi',
  'yonlendirme-ekle': 'yönlendirme eklendi',
  'medya-yukle': 'medya yüklendi',
  'medya-sil': 'medya silindi',
  'ayar-degistir': 'ayar değişti',
};

const VURGULU_EYLEMLER = new Set([
  'sil',
  'rol-degistir',
  'kisisel-veri-sil',
  'disa-aktar',
  'giris-basarisiz',
]);

const SAYFA_BOYUTU = 60;

export default async function DenetimSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const kullanici = await oturumGerekli();
  if (!izinVarMi(kullanici.roller, 'denetim:oku')) notFound();

  const parametreler = await searchParams;
  const tek = (ad: string) => {
    const deger = parametreler[ad];
    return Array.isArray(deger) ? deger[0] : deger;
  };

  const eylem = tek('eylem');
  const koleksiyonFiltresi = tek('koleksiyon');
  const sayfa = Math.max(1, Number(tek('sayfa') ?? '1') || 1);

  const db = await veritabani();
  const filtre: Filter<Record<string, unknown>> = {};
  if (eylem && eylem !== 'tumu') filtre.eylem = eylem;
  if (koleksiyonFiltresi && koleksiyonFiltresi !== 'tumu') filtre.koleksiyon = koleksiyonFiltresi;

  const [kayitlar, toplam, eylemDagilimi] = await Promise.all([
    db
      .collection(KOLEKSIYONLAR.denetimKaydi)
      .find(filtre)
      .sort({ zaman: -1 })
      .skip((sayfa - 1) * SAYFA_BOYUTU)
      .limit(SAYFA_BOYUTU)
      .toArray(),
    db.collection(KOLEKSIYONLAR.denetimKaydi).countDocuments(filtre),
    db
      .collection(KOLEKSIYONLAR.denetimKaydi)
      .aggregate<{ _id: string; adet: number }>([
        { $group: { _id: '$eylem', adet: { $sum: 1 } } },
        { $sort: { adet: -1 } },
      ])
      .toArray(),
  ]);

  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYUTU));

  const sorguKur = (degisiklikler: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const birlesik = { eylem, koleksiyon: koleksiyonFiltresi, ...degisiklikler };
    for (const [ad, deger] of Object.entries(birlesik)) {
      if (deger && deger !== 'tumu') p.set(ad, deger);
    }
    const metin = p.toString();
    return `/admin/denetim/${metin ? `?${metin}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="etiket-mono text-metin-soluk">YÖNETİM</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">Denetim kaydı</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-ikincil">
          Panelde yapılan her yazma işlemi buraya düşer. Kayıt yalnızca eklenir; panelden silinemez
          veya düzenlenemez. Kullanıcı e-postası ve IP adresi içerdiği için bu ekran kişisel veri
          yüzeyidir.
        </p>
      </div>

      {/* Eylem filtresi */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="etiket-mono mr-1 text-metin-soluk">EYLEM</span>
        <Link
          href={sorguKur({ eylem: 'tumu', sayfa: undefined })}
          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
            !eylem
              ? 'border-vurgu/45 bg-vurgu-zemin text-vurgu-parlak'
              : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
          }`}
        >
          Tümü
        </Link>
        {eylemDagilimi.map((grup) => (
          <Link
            key={grup._id}
            href={sorguKur({ eylem: grup._id, sayfa: undefined })}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              eylem === grup._id
                ? 'border-vurgu/45 bg-vurgu-zemin text-vurgu-parlak'
                : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
            }`}
          >
            {EYLEM_ETIKETI[grup._id] ?? grup._id}
            <span className="ml-1.5 font-mono text-[0.625rem] text-metin-soluk tabular-nums">
              {grup.adet}
            </span>
          </Link>
        ))}
      </div>

      {kayitlar.length === 0 ? (
        <p className="rounded-xl border border-dashed border-kenar-guclu px-5 py-10 text-center text-sm text-metin-soluk">
          Bu ölçütlere uyan kayıt yok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-kenar">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <thead>
              <tr className="bg-zemin-derin">
                {['Zaman', 'Eylem', 'Koleksiyon', 'Kayıt', 'Kullanıcı', 'Adres', 'Not'].map(
                  (baslik) => (
                    <th
                      key={baslik}
                      scope="col"
                      className="etiket-mono border-b border-kenar px-3 py-2.5 text-left text-metin-soluk"
                    >
                      {baslik}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {kayitlar.map((kayit) => {
                const basarisiz = kayit.basarili === false;
                const eylemAdi = String(kayit.eylem ?? '');
                const vurgulu = VURGULU_EYLEMLER.has(eylemAdi);

                return (
                  <tr key={String(kayit._id)} className="border-b border-kenar-soluk last:border-0">
                    <td className="px-3 py-2 align-top font-mono text-xs whitespace-nowrap text-metin-soluk">
                      {kayit.zaman instanceof Date
                        ? kayit.zaman.toISOString().slice(0, 19).replace('T', ' ')
                        : '—'}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span
                        className={`etiket-mono ${
                          basarisiz ? 'text-tehlike' : vurgulu ? 'text-uyari' : 'text-vurgu-parlak'
                        }`}
                      >
                        {EYLEM_ETIKETI[eylemAdi] ?? eylemAdi}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs text-metin-ikincil">
                      {String(kayit.koleksiyon ?? '—')}
                    </td>
                    <td className="max-w-40 px-3 py-2 align-top text-xs text-metin-ikincil">
                      {kayit.belgeSlug ? (
                        <span className="font-mono">{String(kayit.belgeSlug)}</span>
                      ) : kayit.belgeKimligi ? (
                        <span className="font-mono text-metin-soluk">
                          {String(kayit.belgeKimligi).slice(-8)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-metin-ikincil">
                      {String(kayit.kullaniciEpostasi ?? '—')}
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs text-metin-soluk">
                      {String(kayit.adres ?? '—')}
                    </td>
                    <td className="max-w-72 px-3 py-2 align-top text-xs text-metin-soluk">
                      {kayit.not ? String(kayit.not) : ''}
                      {Array.isArray(kayit.degisenAlanlar) && kayit.degisenAlanlar.length > 0 && (
                        <span className="mt-0.5 block font-mono text-[0.625rem]">
                          {(kayit.degisenAlanlar as string[]).join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-metin-soluk">
          {toplam} kayıt · sayfa {sayfa}/{sayfaSayisi}
        </p>
        {sayfaSayisi > 1 && (
          <nav aria-label="Sayfalar" className="flex gap-1.5">
            {sayfa > 1 && (
              <Link
                href={sorguKur({ sayfa: String(sayfa - 1) })}
                className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
              >
                ← önceki
              </Link>
            )}
            {sayfa < sayfaSayisi && (
              <Link
                href={sorguKur({ sayfa: String(sayfa + 1) })}
                className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
              >
                sonraki →
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
