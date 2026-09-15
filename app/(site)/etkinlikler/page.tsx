import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Rozet } from '@/components/arayuz/Rozet';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { etkinlikListesi } from '@/lib/icerik/yayin';
import { tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Etkinlikler',
  description:
    'Sinaptik Lab atölyeleri, webinarları ve konferansları. Uygulamalı oturumlar ve kapalı brifingler.',
  alternates: { canonical: '/etkinlikler/' },
};

export default async function EtkinliklerSayfasi() {
  // Yaklasan/gecmis ayrimi okuma katmaninda degil burada yapilir: sorgular
  // sunucu zamanini okumaz, takvim asamasi `durum` alanindan gelir.
  const ETKINLIKLER = await etkinlikListesi();
  const yaklasan = ETKINLIKLER.filter((e) => e.durum !== 'gecti').sort((a, b) =>
    a.tarih.localeCompare(b.tarih),
  );
  const gecmis = ETKINLIKLER.filter((e) => e.durum === 'gecti').sort((a, b) =>
    b.tarih.localeCompare(a.tarih),
  );

  return (
    <>
      <ListeSemasi
        ad="Etkinlikler"
        ogeler={ETKINLIKLER.map((e) => ({ ad: e.ad, yol: `/etkinlikler/${e.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Topluluk', yol: '/topluluk/' },
          { ad: 'Etkinlikler', yol: '/etkinlikler/' },
        ]}
        etiket="TOPLULUK"
        baslik="Etkinlikler"
        ozet="Sunum değil atölye. Her oturum bir çıktıyla kapanır: kurulmuş bir hat, yazılmış bir görev seti veya önceliklendirilmiş bir senaryo listesi."
        olcumler={[
          { deger: `${yaklasan.length}`, etiket: 'Yaklaşan' },
          { deger: `${gecmis.length}`, etiket: 'Geçmiş' },
          {
            deger: `${ETKINLIKLER.filter((e) => e.durum === 'kayit-acik').length}`,
            etiket: 'Kayıt açık',
          },
        ]}
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="YAKLAŞAN" baslik="Yaklaşan etkinlikler" />
        {yaklasan.length > 0 ? (
          <ul className="space-y-4">
            {yaklasan.map((etkinlik) => (
              <li key={etkinlik.slug}>
                <Link
                  href={`/etkinlikler/${etkinlik.slug}/`}
                  className="group flex flex-col gap-5 rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-vurgu/45 hover:bg-yuzey/70 sm:flex-row sm:items-center"
                >
                  <span className="shrink-0 sm:w-32">
                    <span className="etiket-mono block text-vurgu-parlak">{etkinlik.tur}</span>
                    <span className="mt-1.5 block text-sm text-metin-ikincil">
                      <time dateTime={etkinlik.tarih}>{tarihUzun(etkinlik.tarih)}</time>
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.125rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                      {etkinlik.ad}
                    </span>
                    <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                      {etkinlik.ozet}
                    </span>
                    <span className="etiket-mono mt-2 inline-flex items-center gap-1.5 text-metin-soluk">
                      <Saat className="size-3.5" />
                      {etkinlik.bicim}
                    </span>
                  </span>

                  <span className="shrink-0">
                    {etkinlik.durum === 'kayit-acik' ? (
                      <Rozet ton="basari">Kayıt açık</Rozet>
                    ) : (
                      <Rozet>Planlandı</Rozet>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <BosDurum
            baslik="Takvimde açık oturum yok"
            metin="Yeni atölye ve webinar tarihleri belirlendiğinde burada kayıt bağlantısıyla birlikte duyurulur."
          />
        )}
      </Bolum>

      {gecmis.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi numara="02" etiket="ARŞİV" baslik="Geçmiş etkinlikler" />
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {gecmis.map((etkinlik) => (
              <li key={etkinlik.slug} className="group">
                <Link
                  href={`/etkinlikler/${etkinlik.slug}/`}
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-6"
                >
                  <span className="etiket-mono w-28 shrink-0 text-metin-soluk">
                    <time dateTime={etkinlik.tarih}>{tarihUzun(etkinlik.tarih)}</time>
                  </span>
                  <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-metin transition-colors group-hover:text-vurgu-parlak">
                    {etkinlik.ad}
                  </span>
                  <span className="etiket-mono shrink-0 text-metin-soluk">{etkinlik.tur}</span>
                  <Ok className="hidden size-4 shrink-0 text-metin-soluk opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}
    </>
  );
}
