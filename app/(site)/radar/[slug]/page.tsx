import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { konuyaGoreGundem, radar, radarBul } from '@/lib/icerik/gundem';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { atlasBul } from '@/lib/icerik/atlas';
import { tarihKisa } from '@/lib/bicim';

export async function generateStaticParams() {
  return (await radar()).map((kayit) => ({ slug: kayit.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kayit = await radarBul(slug);
  if (!kayit) return {};

  // Editorun panelden yazdigi SEO alanlari varsayilanlarin uzerine uygulanir.
  return ustveriBirlestir(kayit.seo, {
    baslik: `${kayit.ad} momentumu`,
    aciklama: `${kayit.ad} başlığının Sinaptik AI Radar momentum skoru, sinyal kırılımı ve ilgili gündem akışı.`,
    kanonik: `/radar/${kayit.slug}/`,
  });
}

const SINYALLER = [
  { anahtar: 'yayin' as const, ad: 'Yayın hacmi', tarif: 'Akademik ve teknik yayın sayısı' },
  { anahtar: 'github' as const, ad: 'Depo aktivitesi', tarif: 'Açık kaynak katkı ve yeni depo' },
  { anahtar: 'modelCikisi' as const, ad: 'Model çıkışı', tarif: 'Yeni model ve sürüm duyuruları' },
  { anahtar: 'aramaIlgisi' as const, ad: 'Arama ilgisi', tarif: 'Arama eğilimi' },
];

export default async function RadarDetaySayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kayit = await radarBul(slug);
  if (!kayit) notFound();

  const atlas = await atlasBul(kayit.slug);
  const haberler = (await konuyaGoreGundem(kayit.slug)).slice(0, 5);
  const digerleri = (await radar()).filter((diger) => diger.slug !== kayit.slug);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'AI Radar', yol: '/radar/' },
          { ad: kayit.ad, yol: `/radar/${kayit.slug}/` },
        ]}
        etiket="RADAR BAŞLIĞI"
        baslik={kayit.ad}
        ozet={kayit.not ?? `${kayit.ad} başlığının son yedi günlük momentum okuması.`}
        olcumler={[
          { deger: `${kayit.momentum}`, etiket: 'Momentum' },
          { deger: `${kayit.degisim > 0 ? '+' : ''}${kayit.degisim}`, etiket: '7 günlük değişim' },
          {
            deger:
              kayit.yon === 'yukselen' ? 'Yükselen' : kayit.yon === 'dusen' ? 'Düşen' : 'Sabit',
            etiket: 'Yön',
          },
          { deger: `${haberler.length}`, etiket: 'İlgili gündem' },
        ]}
        eylemler={
          atlas ? (
            <Dugme href={`/atlas/${atlas.slug}/`}>
              {atlas.ad} nedir?
              <Ok className="size-4" />
            </Dugme>
          ) : undefined
        }
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="SİNYAL KIRILIMI"
          baslik="Momentumu ne sürüklüyor?"
          aciklama="Tek bir skor yanıltıcı olabilir. Kırılım, yükselişin araştırmadan mı uygulamadan mı geldiğini gösterir."
        />

        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {SINYALLER.map((sinyal) => {
            const deger = kayit.sinyaller[sinyal.anahtar];
            return (
              <li key={sinyal.anahtar} className="bg-zemin p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[0.9375rem] font-medium text-metin">{sinyal.ad}</span>
                  <span className="font-mono text-2xl font-medium tracking-tight tabular-nums">
                    {deger}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-yuzey-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-vurgu to-ikincil"
                    style={{ width: `${deger}%` }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-metin-soluk">{sinyal.tarif}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 rounded-lg border border-uyari/25 bg-uyari/8 px-4 py-2.5 text-xs text-uyari">
          Yer tutucu değerler. Endeks metodolojisi yayımlanana kadar bu sayılar kaynak gösterilemez.
        </p>
      </Bolum>

      {haberler.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara="02"
            etiket="GÜNDEM"
            baslik="Bu başlıktaki gelişmeler"
            baglantiYolu={`/konu/${kayit.slug}/`}
            baglantiMetni="Konu merkezi"
          />
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {haberler.map((haber) => (
              <li key={haber.slug} className="group">
                <Link href={haber.yol} className="flex items-start gap-5 py-4">
                  <span className="etiket-mono mt-1 w-14 shrink-0 text-metin-soluk">
                    {tarihKisa(haber.yayinTarihi)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                      {haber.baslik}
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-metin-soluk">
                      {haber.kisaCevap}
                    </span>
                  </span>
                  <span className="etiket-mono mt-1 hidden shrink-0 items-center gap-1.5 text-metin-soluk sm:inline-flex">
                    <Saat className="size-3.5" />
                    {haber.okumaDakika} dk
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {digerleri.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="03"
            etiket="KARŞILAŞTIR"
            baslik="Diğer başlıklar"
            baglantiYolu="/radar/"
          />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
            {digerleri.map((diger) => (
              <li key={diger.slug}>
                <Link
                  href={`/radar/${diger.slug}/`}
                  className="group flex items-center justify-between gap-4 bg-zemin px-5 py-4 transition-colors hover:bg-yuzey/60"
                >
                  <span className="text-[0.875rem] text-metin-ikincil group-hover:text-metin">
                    {diger.ad}
                  </span>
                  <span className="font-mono text-sm text-metin-soluk tabular-nums">
                    {diger.momentum}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}
    </>
  );
}
