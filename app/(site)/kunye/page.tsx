import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Ok } from '@/components/arayuz/Ikonlar';
import { SITE } from '@/lib/site';
import { yazarListesi } from '@/lib/icerik/temel';

export const metadata: Metadata = {
  title: 'Künye',
  description:
    'Sinaptik Lab künyesi: yayın sahibi, editoryal ekip, roller, iletişim ve yayın ilkelerine bağlantılar.',
  alternates: { canonical: '/kunye/' },
};

const ROLLER = [
  { rol: 'Genel Yayın Yönetmeni', kisi: 'Şükrü Yusuf Kaya', slug: 'sukru-yusuf-kaya' },
  { rol: 'Haber Masası', kisi: 'Sinaptik Redaksiyon', slug: 'sinaptik-redaksiyon' },
  { rol: 'Araştırma Birimi', kisi: 'Sinaptik Research', slug: 'sinaptik-research' },
  { rol: 'Teknik Editör', kisi: 'Açık pozisyon', slug: null },
  { rol: 'Learning Designer', kisi: 'Açık pozisyon', slug: null },
  { rol: 'SEO / GEO Lead', kisi: 'Açık pozisyon', slug: null },
];

export default async function KunyeSayfasi() {
  const YAZAR_LISTESI = await yazarListesi();

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Künye', yol: '/kunye/' }]}
        etiket="KURUMSAL"
        baslik="Künye"
        ozet="Bu platformu kim yayımlıyor, kim yazıyor, kim inceliyor? Şeffaflık bir politika metni değil, isimlerin görünür olmasıdır."
        olcumler={[
          { deger: `${YAZAR_LISTESI.length}`, etiket: 'Editoryal birim' },
          { deger: `${ROLLER.filter((r) => r.slug).length}`, etiket: 'Dolu rol' },
          { deger: `${ROLLER.filter((r) => !r.slug).length}`, etiket: 'Açık pozisyon' },
        ]}
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="YAYIN" baslik="Yayın bilgileri" />
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {[
            { etiket: 'Yayın adı', deger: SITE.ad },
            { etiket: 'Alan adı', deger: SITE.alanAdi },
            { etiket: 'Yayın dili', deger: 'Türkçe (İngilizce hazırlanıyor)' },
            { etiket: 'Yayın türü', deger: 'Dijital yayın · bilgi platformu' },
            { etiket: 'Yayın sahibi', deger: 'Şükrü Yusuf Kaya' },
            { etiket: 'İletişim', deger: 'İletişim formu üzerinden' },
          ].map((satir) => (
            <div key={satir.etiket} className="bg-zemin px-6 py-5">
              <dt className="etiket-mono text-metin-soluk">{satir.etiket}</dt>
              <dd className="mt-2 text-[0.9375rem] text-metin">{satir.deger}</dd>
            </div>
          ))}
        </dl>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="EKİP"
          baslik="Roller"
          aciklama="Roller büyüdükçe ayrışır. Açık pozisyonlar dolmadan o rol varmış gibi gösterilmez."
        />
        <ul className="divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
          {ROLLER.map((kayit) => (
            <li
              key={kayit.rol}
              className="flex flex-col gap-2 bg-yuzey/30 p-5 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="etiket-mono sm:w-56 shrink-0 text-metin-soluk">{kayit.rol}</span>
              <span className="flex-1">
                {kayit.slug ? (
                  <Link
                    href={`/yazar/${kayit.slug}/`}
                    className="text-[0.9375rem] font-medium text-metin transition-colors hover:text-vurgu-parlak"
                  >
                    {kayit.kisi}
                  </Link>
                ) : (
                  <span className="text-[0.9375rem] text-metin-soluk">{kayit.kisi}</span>
                )}
              </span>
              {!kayit.slug && (
                <Link
                  href="/topluluk/katki/"
                  className="etiket-mono shrink-0 text-vurgu-parlak transition-opacity hover:opacity-80"
                >
                  Başvur →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum>
        <BolumBasligi numara="03" etiket="İLKELER" baslik="Yayın ilkeleri" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {[
            { ad: 'Editoryal ilkeler', yol: '/editoryal-ilkeler/' },
            { ad: 'AI kullanım politikası', yol: '/ai-politikasi/' },
            { ad: 'Düzeltme politikası', yol: '/duzeltme-politikasi/' },
            { ad: 'Metodoloji', yol: '/metodoloji/' },
          ].map((sayfa) => (
            <li key={sayfa.yol}>
              <Link
                href={sayfa.yol}
                className="group flex h-full items-center justify-between gap-3 bg-zemin px-5 py-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="text-[0.9375rem] text-metin-ikincil group-hover:text-metin">
                  {sayfa.ad}
                </span>
                <Ok className="size-4 shrink-0 text-metin-soluk opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-lg border border-kenar bg-yuzey/40 px-4 py-3 text-xs text-metin-soluk">
          Ticari unvan, vergi bilgileri ve yasal tebligat adresi, tüzel kişilik kurulumu
          tamamlandığında bu sayfaya eklenecek.
        </p>
      </Bolum>
    </>
  );
}
