import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { BilgiFormu, CikisDugmesi, DogrulamaDugmesi } from '@/components/uyelik/HesapFormlari';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { tarihUzun } from '@/lib/bicim';
import { girisYolu, gorunenAd, uyeOturumu } from '@/lib/site/uyelik';
import { panelErisimiVarMi } from '@/lib/yetki/oturum';

export const metadata: Metadata = {
  title: 'Hesabım',
  robots: { index: false, follow: false },
};

/**
 * Üye hesap sayfası.
 *
 * `force-dynamic` ZORUNLU: sayfa oturuma bağlı, kişiye özel içerik gösterir.
 * Statik üretilse bir kullanıcının bilgileri başkasına servis edilebilirdi.
 *
 * Sayfa üyelik vaadinin karşılığıdır: /uye-ol/ sayfası "test sonuçların
 * kaydedilir" diyor, burası o sonuçları gösterir. Henüz sonuç yoksa boş durum
 * dürüstçe söylenir — uydurma ilerleme gösterilmez.
 */
export const dynamic = 'force-dynamic';

type TestSonucu = {
  testSlug: string;
  puan: number;
  dogruSayisi?: number;
  soruSayisi?: number;
  seviye?: string;
  olusturuldu?: Date;
};

export default async function HesapSayfasi() {
  const kullanici = await uyeOturumu();
  if (!kullanici) redirect(girisYolu('/hesabim/'));

  const db = await veritabani();

  const [belge, sonuclar] = await Promise.all([
    db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .findOne(
        { _id: new ObjectId(kullanici.kimlik) },
        { projection: { epostaDogrulandi: 1, uyelikTarihi: 1, ogrenmeRolu: 1, adSoyad: 1 } },
      ),
    db
      .collection<TestSonucu>(KOLEKSIYONLAR.testSonuclari)
      .find({ kullaniciKimligi: new ObjectId(kullanici.kimlik) }, { projection: { _id: 0 } })
      .sort({ olusturuldu: -1 })
      .limit(10)
      .toArray(),
  ]);

  const dogrulandi = belge?.epostaDogrulandi === true;
  const paneleGirebilir = panelErisimiVarMi(kullanici);

  return (
    <div className="kap py-12 sm:py-16">
      <Kirintilar ogeler={[{ ad: 'Hesabım', yol: '/hesabim/' }]} />

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-metin sm:text-4xl">
            {gorunenAd(kullanici)}
          </h1>
          <p className="mt-2 font-mono text-sm text-metin-soluk">{kullanici.eposta}</p>
        </div>
        <CikisDugmesi />
      </div>

      {!dogrulandi && (
        <div className="mt-8 max-w-xl">
          <DogrulamaDugmesi />
        </div>
      )}

      {paneleGirebilir && (
        <p className="mt-8 rounded-xl border border-kenar bg-yuzey/40 px-4 py-3 text-sm text-metin-ikincil">
          Bu hesabın editör paneline erişimi var.{' '}
          <Link href="/admin/" className="text-vurgu-parlak underline underline-offset-2">
            Panele git
          </Link>
        </p>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="space-y-6">
          <BilgiFormu adSoyad={typeof belge?.adSoyad === 'string' ? belge.adSoyad : undefined} />

          <dl className="space-y-3 rounded-2xl border border-kenar bg-yuzey/30 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-metin-soluk">Üyelik</dt>
              <dd className="text-metin-ikincil">
                {belge?.uyelikTarihi instanceof Date
                  ? tarihUzun(belge.uyelikTarihi.toISOString().slice(0, 10))
                  : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-metin-soluk">E-posta</dt>
              <dd className={dogrulandi ? 'text-basari' : 'text-uyari'}>
                {dogrulandi ? 'Doğrulandı' : 'Doğrulanmadı'}
              </dd>
            </div>
            {typeof belge?.ogrenmeRolu === 'string' && belge.ogrenmeRolu && (
              <div className="flex justify-between gap-4">
                <dt className="text-metin-soluk">Rol</dt>
                <dd className="text-metin-ikincil">{belge.ogrenmeRolu}</dd>
              </div>
            )}
          </dl>

          <p className="text-xs leading-relaxed text-metin-soluk">
            Hesabını silmek veya verilerinin bir kopyasını istemek için{' '}
            <Link href="/iletisim/" className="underline underline-offset-2">
              bize yaz
            </Link>
            . KVKK kapsamındaki haklarınız{' '}
            <Link href="/kvkk-aydinlatma/" className="underline underline-offset-2">
              aydınlatma metninde
            </Link>{' '}
            açıklanmıştır.
          </p>
        </div>

        <section>
          <h2 className="etiket-mono text-metin">TEST GEÇMİŞİ</h2>

          {sonuclar.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-kenar border-dashed bg-yuzey/20 px-5 py-8 text-center">
              <p className="text-sm text-metin-ikincil">Henüz çözülmüş test yok.</p>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-metin-soluk">
                Bir test çözdüğünde skorun buraya işlenir ve zaman içindeki değişimini görebilirsin.
              </p>
              <Link
                href="/testler/"
                className="mt-4 inline-block text-sm text-vurgu-parlak underline underline-offset-4"
              >
                testlere göz at
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
              {sonuclar.map((sonuc, sira) => (
                <li
                  key={`${sonuc.testSlug}-${sira}`}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 bg-yuzey/30 px-5 py-3.5"
                >
                  <Link
                    href={`/testler/${sonuc.testSlug}/`}
                    className="text-sm font-medium text-metin hover:text-vurgu-parlak"
                  >
                    {sonuc.testSlug}
                  </Link>
                  <span className="etiket-mono ml-auto text-metin-ikincil tabular-nums">
                    {sonuc.puan}
                  </span>
                  {sonuc.dogruSayisi !== undefined && sonuc.soruSayisi !== undefined && (
                    <span className="text-xs text-metin-soluk tabular-nums">
                      {sonuc.dogruSayisi}/{sonuc.soruSayisi}
                    </span>
                  )}
                  {sonuc.olusturuldu instanceof Date && (
                    <span className="w-full font-mono text-[0.6875rem] text-metin-soluk">
                      {sonuc.olusturuldu.toISOString().slice(0, 10)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
