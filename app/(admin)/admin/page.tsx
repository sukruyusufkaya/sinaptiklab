import type { Metadata } from 'next';
import Link from 'next/link';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR, TANIMLAR } from '@/lib/mongo/koleksiyonlar';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { izinVarMi, ROL_ADI, type Rol } from '@/lib/yetki/roller';

export const metadata: Metadata = { title: 'Panel' };

/** Panel her zaman canlı veri gösterir; önbelleğe alınmaz. */
export const dynamic = 'force-dynamic';

type Sayim = { ad: string; aciklama: string; adet: number; yol?: string; kisiselVeri?: boolean };

const PAROLA_TAZELIK_SINIRI_MS = 180 * 24 * 60 * 60 * 1000;

async function sayimlariTopla(parolaGuncellendi?: Date) {
  const db = await veritabani();

  // `Date.now()` render gövdesinde çağrılamaz (react-hooks/purity); zaman
  // bağımlı hesap veri toplama adımında yapılır.
  const parolaEski = parolaGuncellendi
    ? Date.now() - new Date(parolaGuncellendi).getTime() > PAROLA_TAZELIK_SINIRI_MS
    : false;

  const listelenecek = [
    { koleksiyon: KOLEKSIYONLAR.icerikler, ad: 'İçerik', yol: '/admin/koleksiyon/icerikler/' },
    { koleksiyon: KOLEKSIYONLAR.atlas, ad: 'Atlas girdisi', yol: '/admin/koleksiyon/atlas/' },
    { koleksiyon: KOLEKSIYONLAR.modeller, ad: 'Model', yol: '/admin/koleksiyon/modeller/' },
    { koleksiyon: KOLEKSIYONLAR.dersler, ad: 'Ders', yol: '/admin/koleksiyon/dersler/' },
    { koleksiyon: KOLEKSIYONLAR.arastirma, ad: 'Araştırma', yol: '/admin/koleksiyon/arastirma/' },
    { koleksiyon: KOLEKSIYONLAR.konular, ad: 'Konu', yol: '/admin/koleksiyon/konular/' },
  ];

  const sayimlar = await Promise.all(
    listelenecek.map(async (oge) => ({
      ad: oge.ad,
      yol: oge.yol,
      aciklama: oge.koleksiyon,
      adet: await db.collection(oge.koleksiyon).countDocuments(),
    })),
  );

  const [taslak, incelemede, yayinda] = await Promise.all([
    db.collection(KOLEKSIYONLAR.icerikler).countDocuments({ durum: 'taslak' }),
    db.collection(KOLEKSIYONLAR.icerikler).countDocuments({ durum: 'incelemede' }),
    db.collection(KOLEKSIYONLAR.icerikler).countDocuments({ durum: 'yayinda' }),
  ]);

  const sonDenetim = await db
    .collection(KOLEKSIYONLAR.denetimKaydi)
    .find({})
    .sort({ zaman: -1 })
    .limit(8)
    .toArray();

  const bosSorgular = await db
    .collection(KOLEKSIYONLAR.aramaKayitlari)
    .countDocuments({ sonucBulundu: false });

  const toplamBelge = await Promise.all(
    TANIMLAR.map(async (t) => ({ ad: t.ad, adet: await db.collection(t.ad).countDocuments() })),
  );

  return {
    parolaEski,
    sayimlar,
    akis: { taslak, incelemede, yayinda },
    sonDenetim,
    bosSorgular,
    doluKoleksiyon: toplamBelge.filter((t) => t.adet > 0).length,
    toplamKoleksiyon: TANIMLAR.length,
    toplamBelgeSayisi: toplamBelge.reduce((t, k) => t + k.adet, 0),
  };
}

function Kutu({ ad, adet, aciklama, yol }: Sayim) {
  const icerik = (
    <>
      <span className="etiket-mono block text-metin-soluk">{ad}</span>
      <span className="mt-2 block font-mono text-2xl font-semibold tabular-nums text-metin">
        {adet}
      </span>
      <span className="etiket-mono mt-1 block text-kenar-guclu">{aciklama}</span>
    </>
  );

  return yol ? (
    <Link
      href={yol}
      className="rounded-xl border border-kenar bg-yuzey/40 p-4 transition-colors hover:border-vurgu/45 hover:bg-yuzey/70"
    >
      {icerik}
    </Link>
  ) : (
    <div className="rounded-xl border border-kenar bg-yuzey/40 p-4">{icerik}</div>
  );
}

export default async function PanelAnaSayfasi() {
  const kullanici = await oturumGerekli();
  const veri = await sayimlariTopla(kullanici.parolaGuncellendi);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Başlık */}
      <div>
        <p className="etiket-mono text-metin-soluk">PANEL</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">
          Merhaba{kullanici.adSoyad ? `, ${kullanici.adSoyad.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-2 text-sm text-metin-ikincil">
          Rol: {kullanici.roller.map((r) => ROL_ADI[r as Rol] ?? r).join(', ')} ·{' '}
          {kullanici.izinler.length} izin · {veri.doluKoleksiyon}/{veri.toplamKoleksiyon}{' '}
          koleksiyonda veri var
        </p>
      </div>

      {/* Güvenlik uyarısı — kurulum parolası hâlâ kullanımdaysa */}
      <section className="rounded-xl border border-uyari/35 bg-uyari/10 p-5">
        <p className="etiket-mono mb-2 text-uyari">GÜVENLİK</p>
        <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
          Hesap parolanız kurulum sırasında komut satırından verildiyse, bu parola kurulum
          kayıtlarında görünmüş olabilir. Panele ilk girişten sonra{' '}
          <Link href="/admin/hesap/" className="text-uyari underline underline-offset-2">
            parolanızı değiştirin
          </Link>
          {veri.parolaEski && ' (parolanız 6 aydan eski)'}. Panel parolası ile veritabanı parolası
          ASLA aynı olmamalı.
        </p>
      </section>

      {/* Yayın akışı */}
      {izinVarMi(kullanici.roller, 'icerik:oku') && (
        <section>
          <h2 className="etiket-mono mb-3 text-metin">YAYIN AKIŞI</h2>
          <div className="grid gap-px overflow-hidden rounded-xl border border-kenar bg-kenar sm:grid-cols-3">
            {[
              { ad: 'Taslak', adet: veri.akis.taslak, ton: 'text-metin-soluk' },
              { ad: 'İncelemede', adet: veri.akis.incelemede, ton: 'text-uyari' },
              { ad: 'Yayında', adet: veri.akis.yayinda, ton: 'text-basari' },
            ].map((durum) => (
              <Link
                key={durum.ad}
                href={`/admin/koleksiyon/icerikler/?durum=${durum.ad === 'Taslak' ? 'taslak' : durum.ad === 'İncelemede' ? 'incelemede' : 'yayinda'}`}
                className="bg-zemin p-4 transition-colors hover:bg-yuzey/60"
              >
                <span className={`etiket-mono block ${durum.ton}`}>{durum.ad}</span>
                <span className="mt-2 block font-mono text-2xl font-semibold tabular-nums text-metin">
                  {durum.adet}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Koleksiyon sayımları */}
      <section>
        <h2 className="etiket-mono mb-3 text-metin">VERİTABANI</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {veri.sayimlar.map((s) => (
            <Kutu key={s.aciklama} {...s} />
          ))}
        </div>
        <p className="mt-3 text-xs text-metin-soluk">
          Toplam {veri.toplamBelgeSayisi} belge, {veri.toplamKoleksiyon} koleksiyon.
          {veri.toplamBelgeSayisi < 50 && (
            <>
              {' '}
              Koleksiyonlar henüz büyük ölçüde boş — site şu an{' '}
              <code className="font-mono">lib/veri/*</code> fixture&apos;larından besleniyor.
            </>
          )}
        </p>
      </section>

      {/* Arama açığı */}
      {izinVarMi(kullanici.roller, 'arama:oku') && veri.bosSorgular > 0 && (
        <section className="rounded-xl border border-kenar bg-yuzey/40 p-5">
          <p className="etiket-mono mb-2 text-metin-soluk">İÇERİK AÇIĞI</p>
          <p className="text-sm text-metin-ikincil">
            {veri.bosSorgular} arama sorgusu sonuç üretmedi.{' '}
            <Link href="/admin/arama/" className="text-vurgu-parlak underline underline-offset-2">
              Listeyi aç
            </Link>
          </p>
        </section>
      )}

      {/* Son işlemler */}
      {izinVarMi(kullanici.roller, 'denetim:oku') && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="etiket-mono text-metin">SON İŞLEMLER</h2>
            <Link href="/admin/denetim/" className="etiket-mono text-vurgu-parlak">
              tümü →
            </Link>
          </div>
          {veri.sonDenetim.length === 0 ? (
            <p className="rounded-xl border border-dashed border-kenar-guclu p-5 text-sm text-metin-soluk">
              Henüz kayıt yok.
            </p>
          ) : (
            <ul className="divide-y divide-kenar-soluk overflow-hidden rounded-xl border border-kenar">
              {veri.sonDenetim.map((kayit, sira) => (
                <li
                  key={String(kayit._id ?? sira)}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-yuzey/30 px-4 py-2.5 text-[0.8125rem]"
                >
                  <span className="etiket-mono w-32 shrink-0 text-metin-soluk">
                    {kayit.zaman instanceof Date
                      ? kayit.zaman.toISOString().slice(0, 16).replace('T', ' ')
                      : ''}
                  </span>
                  <span
                    className={`etiket-mono ${kayit.basarili === false ? 'text-tehlike' : 'text-vurgu-parlak'}`}
                  >
                    {String(kayit.eylem ?? '')}
                  </span>
                  <span className="text-metin-ikincil">{String(kayit.koleksiyon ?? '')}</span>
                  {kayit.kullaniciEpostasi && (
                    <span className="text-metin-soluk">{String(kayit.kullaniciEpostasi)}</span>
                  )}
                  {kayit.not && (
                    <span className="w-full text-xs text-metin-soluk">{String(kayit.not)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
