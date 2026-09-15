import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { EtkinlikSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { etkinlikBul, etkinlikListesi } from '@/lib/icerik/yayin';
import { tarihUzun } from '@/lib/bicim';

export async function generateStaticParams() {
  return (await etkinlikListesi()).map((etkinlik) => ({ slug: etkinlik.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const etkinlik = await etkinlikBul(slug);
  if (!etkinlik) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(etkinlik.seo, {
    baslik: etkinlik.ad,
    aciklama: etkinlik.ozet,
    kanonik: `/etkinlikler/${etkinlik.slug}/`,
  });
}

export default async function EtkinlikSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const etkinlik = await etkinlikBul(slug);
  if (!etkinlik) notFound();

  const digerleri = (await etkinlikListesi())
    .filter((diger) => diger.slug !== etkinlik.slug)
    .slice(0, 4);
  const gecti = etkinlik.durum === 'gecti';

  return (
    <>
      <EtkinlikSemasi
        ad={etkinlik.ad}
        aciklama={etkinlik.ozet}
        tarih={etkinlik.tarih}
        yol={`/etkinlikler/${etkinlik.slug}/`}
        bicim={etkinlik.bicim}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Etkinlikler', yol: '/etkinlikler/' },
          { ad: etkinlik.ad, yol: `/etkinlikler/${etkinlik.slug}/` },
        ]}
        etiket={etkinlik.tur.toLocaleUpperCase('tr-TR')}
        baslik={etkinlik.ad}
        ozet={etkinlik.ozet}
        olcumler={[
          { deger: tarihUzun(etkinlik.tarih), etiket: 'Tarih' },
          { deger: etkinlik.bicim, etiket: 'Biçim' },
          {
            deger: gecti
              ? 'Tamamlandı'
              : etkinlik.durum === 'kayit-acik'
                ? 'Kayıt açık'
                : 'Planlandı',
            etiket: 'Durum',
          },
        ]}
        eylemler={
          gecti ? (
            <Dugme href="/etkinlikler/" gorunum="ikincil">
              Yaklaşan etkinlikler
              <Ok className="size-4" />
            </Dugme>
          ) : (
            <>
              <Dugme href="/bulten/">
                Kayıt duyurusu al
                <Ok className="size-4" />
              </Dugme>
              <Dugme href="/iletisim/" gorunum="ikincil">
                Kurum içi oturum talebi
              </Dugme>
            </>
          )
        }
      />

      <Bolum>
        <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6 sm:p-8">
          <p className="etiket-mono mb-3 text-metin-soluk">Oturum içeriği</p>
          <p className="olcu font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            {gecti
              ? 'Bu oturum tamamlandı. Kayıt, sunum notları ve varsa çıktı dosyaları yayına hazırlandığında bu sayfaya eklenecek.'
              : 'Oturum programı ve önkoşullar kayıt açıldığında bu sayfada yayımlanacak. Oturumlar sunum ağırlıklı değil uygulamalıdır: katılımcılar bir çıktıyla ayrılır.'}
          </p>
        </div>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="01"
          etiket="DİĞER ETKİNLİKLER"
          baslik="Takvimden"
          baglantiYolu="/etkinlikler/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {digerleri.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/etkinlikler/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">
                  {diger.tur} · {tarihUzun(diger.tarih)}
                </span>
                <span className="mt-2.5 block text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                  {diger.ad}
                </span>
                <span className="mt-2 text-xs leading-relaxed text-metin-soluk">{diger.ozet}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="KURUMSAL"
        baslik="Bu oturumu ekibinize özel isteyebilirsiniz"
        metin="Atölyeler kurum içi versiyonlarıyla, sizin verinizle ve senaryolarınızla yürütülebilir."
        eylemler={
          <>
            <Dugme href="/kurumsal/egitim/">
              Kurumsal eğitim
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/iletisim/" gorunum="ikincil">
              Talep gönder
            </Dugme>
          </>
        }
      />
    </>
  );
}
