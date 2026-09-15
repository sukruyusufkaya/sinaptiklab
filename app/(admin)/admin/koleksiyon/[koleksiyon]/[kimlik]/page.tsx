import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { KayitFormu, type IliskiHaritasi } from '@/components/admin/KayitFormu';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { yapilandirmaBul } from '@/lib/admin/alanlar/kayit';
import { alanDegeri, istemciYapilandirmasi } from '@/lib/admin/alanlar/tipler';
import { iliskiSecenekleri, kayitGetir, surumGecmisi } from '@/lib/mongo/sorgular/yonetim';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { izinVarMi, KOLEKSIYON_IZNI } from '@/lib/yetki/roller';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ koleksiyon: string; kimlik: string }>;
}): Promise<Metadata> {
  const { koleksiyon, kimlik } = await params;
  const yapilandirma = yapilandirmaBul(koleksiyon);
  if (!yapilandirma) return { title: 'Kayıt' };
  if (kimlik === 'yeni') return { title: `Yeni ${yapilandirma.ad}` };

  const belge = await kayitGetir(koleksiyon, kimlik);
  const baslik = belge ? alanDegeri(belge, yapilandirma.baslikAlani) : undefined;
  return { title: typeof baslik === 'string' ? baslik : yapilandirma.ad };
}

export default async function KayitDuzenlemeSayfasi({
  params,
}: {
  params: Promise<{ koleksiyon: string; kimlik: string }>;
}) {
  const { koleksiyon, kimlik } = await params;

  const yapilandirma = yapilandirmaBul(koleksiyon);
  if (!yapilandirma) notFound();

  const kullanici = await oturumGerekli();
  const izinler = KOLEKSIYON_IZNI[koleksiyon];
  if (!izinler || !izinVarMi(kullanici.roller, izinler.oku)) notFound();

  const yeniMi = kimlik === 'yeni';
  if (
    yeniMi &&
    (!izinVarMi(kullanici.roller, izinler.yaz) || yapilandirma.olusturulabilir === false)
  ) {
    notFound();
  }

  const belge = yeniMi ? null : await kayitGetir(koleksiyon, kimlik);
  if (!yeniMi && !belge) notFound();

  /* İlişki alanları için hedef koleksiyonlardan seçenek listeleri. */
  const iliskiAlanlari = yapilandirma.alanlar.filter(
    (a) => (a.tip === 'iliski' || a.tip === 'cokluIliski') && a.hedefKoleksiyon,
  );

  const iliskiler: IliskiHaritasi = {};
  await Promise.all(
    iliskiAlanlari.map(async (alan) => {
      const hedef = alan.hedefKoleksiyon;
      if (!hedef) return;
      const hedefYapilandirma = yapilandirmaBul(hedef);
      iliskiler[alan.ad] = await iliskiSecenekleri(
        hedef,
        hedefYapilandirma?.anahtarAlan ?? 'slug',
        hedefYapilandirma?.baslikAlani ?? 'ad',
      );
    }),
  );

  const surumler = yeniMi ? [] : await surumGecmisi(koleksiyon, kimlik, 10);

  const baslikDegeri = belge ? alanDegeri(belge, yapilandirma.baslikAlani) : undefined;
  const baslik = yeniMi
    ? `Yeni ${yapilandirma.ad.toLocaleLowerCase('tr-TR')}`
    : typeof baslikDegeri === 'string' && baslikDegeri
      ? baslikDegeri
      : yapilandirma.ad;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Kirintilar
          ogeler={[
            { ad: yapilandirma.cogul, yol: `/admin/koleksiyon/${koleksiyon}/` },
            { ad: baslik, yol: `/admin/koleksiyon/${koleksiyon}/${kimlik}/` },
          ]}
        />
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-metin">{baslik}</h1>
        {!yeniMi && belge && (
          <p className="mt-1.5 font-mono text-xs text-metin-soluk">
            {String(alanDegeri(belge, yapilandirma.anahtarAlan) ?? kimlik)}
          </p>
        )}
      </div>

      {/*
        `siteYolu` SUNUCUDA çağrılır ve sonucu düz metin olarak geçer;
        yapılandırma da fonksiyonu ayıklanmış hâlde verilir. Ham yapılandırmayı
        geçirmek RSC sınırında "Functions cannot be passed directly to Client
        Components" hatası verir.
      */}
      <KayitFormu
        yapilandirma={istemciYapilandirmasi(yapilandirma)}
        belge={belge}
        iliskiler={iliskiler}
        izinler={kullanici.izinler}
        siteYolu={belge ? yapilandirma.siteYolu?.(belge) : undefined}
      />

      {/* Sürüm geçmişi */}
      {surumler.length > 0 && (
        <section className="border-t border-kenar pt-5">
          <h2 className="etiket-mono mb-3 text-metin">SÜRÜM GEÇMİŞİ</h2>
          <ul className="divide-y divide-kenar-soluk overflow-hidden rounded-xl border border-kenar">
            {surumler.map((surum) => (
              <li
                key={surum._id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-yuzey/30 px-4 py-2.5 text-xs"
              >
                <span className="etiket-mono w-10 shrink-0 text-vurgu-parlak tabular-nums">
                  v{surum.surumNo}
                </span>
                <span className="etiket-mono w-32 shrink-0 text-metin-soluk">
                  {surum.zaman ? surum.zaman.toISOString().slice(0, 16).replace('T', ' ') : ''}
                </span>
                <span className="text-metin-ikincil">
                  {surum.kullaniciEpostasi ?? 'bilinmiyor'}
                </span>
                {surum.degisenAlanlar && surum.degisenAlanlar.length > 0 && (
                  <span className="w-full font-mono text-[0.6875rem] text-metin-soluk">
                    {surum.degisenAlanlar.join(', ')}
                  </span>
                )}
                {surum.not && (
                  <span className="w-full text-[0.6875rem] text-uyari">{surum.not}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-metin-soluk">
            Her kaydetmede önceki hâl saklanır. Geri alma için sürüm kaydındaki anlık görüntü
            kullanılır.
          </p>
        </section>
      )}

      <p className="text-xs text-metin-soluk">
        Koleksiyon: <code className="font-mono">{koleksiyon}</code> ·{' '}
        <Link href="/admin/denetim/" className="text-vurgu-parlak underline underline-offset-2">
          denetim kaydına bak
        </Link>
      </p>
    </div>
  );
}
