import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { BultenFormu, BultenKapali } from '@/components/form/BultenFormu';
import { briefArsivi } from '@/lib/icerik/gundem';
import { tarihUzun } from '@/lib/bicim';
import { bultenAktif } from '@/lib/site/ayarlar';
import { BULTEN_KAPALI_ILETISI, BULTEN_SECENEKLERI } from '@/lib/site/form-sozlesmesi';

export const metadata: Metadata = {
  title: 'Bültenler',
  description:
    'Sinaptik Daily, Weekly, Research ve Enterprise bültenleri. Hangi bülteni alacağınızı siz seçersiniz.',
  alternates: { canonical: '/bulten/' },
};

/**
 * Bültenlerin tanıtım metinleri.
 *
 * Liste değerleri (`daily`, `weekly`, `research`, `kurumsal`) ve görünen adlar
 * `lib/site/form-sozlesmesi.ts` içindedir — `aboneler.listeler` şema enum'uyla
 * eşleşen tek yer orasıdır. Burada yalnızca sunum alanları tutulur; `Record`
 * olduğu için yeni bir liste değeri eklenince tanıtım metni yazılmadan derleme
 * geçmez.
 */
const TANITIMLAR: Record<
  (typeof BULTEN_SECENEKLERI)[number]['deger'],
  { periyot: string; tarif: string; kime: string }
> = {
  daily: {
    periyot: 'Her iş günü',
    tarif: 'Bugün bilmeniz gereken beş gelişme, her biri "neden önemli" satırıyla.',
    kime: 'Gündemi kaçırmak istemeyen herkes',
  },
  weekly: {
    periyot: 'Haftalık',
    tarif: 'Haftanın özeti, derin analizler ve yeni yayımlanan kalıcı içerikler.',
    kime: 'Haftada bir okumak isteyenler',
  },
  research: {
    periyot: 'İki haftalık',
    tarif: 'Araştırma yayınları, benchmark notları ve yöntem tartışmaları.',
    kime: 'Araştırmacılar ve teknik ekipler',
  },
  kurumsal: {
    periyot: 'Aylık',
    tarif: 'Kurumsal benimseme, yönetişim, maliyet ve organizasyon tasarımı.',
    kime: 'Yöneticiler ve karar vericiler',
  },
};

export default async function BultenSayfasi() {
  // Ayar SUNUCUDA okunur ve istemci bileşenine prop olarak geçmez: kapalıyken
  // form hiç render edilmez, yani istemci paketine de girmez.
  const [BRIEF_ARSIVI, kayitAcik] = await Promise.all([briefArsivi(), bultenAktif()]);

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Bülten', yol: '/bulten/' }]}
        etiket="OWNED MEDIA"
        baslik="Yapay zekâ dünyasında önemli bir şeyi kaçırma."
        ozet="Tek bir bülten değil, dört ayrı akış. Hangisini alacağınızı siz seçersiniz; tek tıkla çıkabilirsiniz."
        olcumler={[
          { deger: `${BULTEN_SECENEKLERI.length}`, etiket: 'Bülten' },
          { deger: '5 dk', etiket: 'Okuma süresi' },
          /*
            "Tek tık · Çıkış" bir VAATTİ, ölçüm değil — ve vaadin arkasında
            çıkış rotası yoktu. Rota artık var (`/bulten/cikis/`), ama ölçüm
            şeridi yine de sayılabilen bir şeyi göstermeli.
          */
          { deger: 'Çift onay', etiket: 'Abonelik' },
          { deger: 'Paylaşılmaz', etiket: 'E-posta adresi' },
        ]}
        yan={
          kayitAcik ? (
            <BultenFormu kimlik="bulten-sayfasi" duzen="sutun" kaynakYol="/bulten/" />
          ) : (
            <BultenKapali duzen="sutun" ileti={BULTEN_KAPALI_ILETISI} />
          )
        }
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="BÜLTENLER" baslik="Dört ayrı akış" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {BULTEN_SECENEKLERI.map((bulten) => (
            <li key={bulten.deger} className="bg-zemin p-6">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[1.125rem] font-semibold tracking-tight text-metin">
                  {bulten.ad}
                </p>
                <span className="etiket-mono shrink-0 text-vurgu-parlak">
                  {TANITIMLAR[bulten.deger].periyot}
                </span>
              </div>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {TANITIMLAR[bulten.deger].tarif}
              </p>
              <p className="etiket-mono mt-4 text-metin-soluk">
                Kime: {TANITIMLAR[bulten.deger].kime}
              </p>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="ÖRNEK"
          baslik="Daily nasıl görünüyor?"
          baglantiYolu="/brief/"
          baglantiMetni="Bugünün Brief'i"
        />
        <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
          {BRIEF_ARSIVI.map((sayi) => (
            <li key={sayi.tarih}>
              <Link href="/brief/" className="group flex items-center gap-5 py-4">
                <span className="etiket-mono w-28 shrink-0 text-metin-soluk">
                  <time dateTime={sayi.tarih}>{tarihUzun(sayi.tarih)}</time>
                </span>
                <span className="flex-1 text-[0.9375rem] font-medium text-metin transition-colors group-hover:text-vurgu-parlak">
                  {sayi.baslik}
                </span>
                <span className="etiket-mono shrink-0 text-metin-soluk">
                  {sayi.maddeSayisi} madde
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum>
        <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
          <p className="etiket-mono mb-3 text-metin-soluk">Veri kullanımı</p>
          <p className="olcu text-[0.9375rem] leading-relaxed text-metin-ikincil">
            E-posta adresiniz yalnızca seçtiğiniz bültenleri göndermek için kullanılır; üçüncü
            taraflarla pazarlama amacıyla paylaşılmaz. Her e-postanın altında tek tıkla çıkış
            bağlantısı bulunur.
          </p>
        </div>
      </Bolum>
    </>
  );
}
