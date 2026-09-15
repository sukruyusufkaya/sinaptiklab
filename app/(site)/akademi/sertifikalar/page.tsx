import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { ogrenmeYollari } from '@/lib/icerik/ogrenme';

export const metadata: Metadata = {
  title: 'Sertifikalar',
  description:
    'Sinaptik Academy sertifika yaklaşımı: katılım belgesi değil, ölçülmüş beceri ve teslim edilmiş proje.',
  alternates: { canonical: '/akademi/sertifikalar/' },
};

const KOSULLAR = [
  { ad: 'Rota tamamlama', tarif: 'Rotadaki tüm bölümlerin bitirilmesi.' },
  { ad: 'Test eşiği', tarif: 'İlgili konu testlerinde tanımlı eşiğin geçilmesi.' },
  { ad: 'Proje teslimi', tarif: 'Rotanın kapanış projesinin teslim edilmesi.' },
  { ad: 'İnceleme', tarif: 'Projenin bir inceleyen tarafından değerlendirilmesi.' },
];

export default async function SertifikalarSayfasi() {
  const OGRENME_YOLLARI = await ogrenmeYollari();

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Academy', yol: '/akademi/' },
          { ad: 'Sertifikalar', yol: '/akademi/sertifikalar/' },
        ]}
        etiket="YAKINDA"
        baslik="Sertifikalar"
        ozet="Katılım belgesi dağıtmıyoruz. Sertifika, ölçülmüş bir beceri ve incelenmiş bir proje anlamına gelecek; aksi hâlde değeri olmaz."
        olcumler={[
          { deger: `${KOSULLAR.length}`, etiket: 'Koşul' },
          { deger: `${OGRENME_YOLLARI.length}`, etiket: 'Rota' },
          { deger: 'Doğrulanabilir', etiket: 'Yapı' },
        ]}
        eylemler={
          <Dugme href="/bulten/" gorunum="ikincil">
            Duyuru için bültene katıl
            <Ok className="size-4" />
          </Dugme>
        }
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="KOŞULLAR" baslik="Sertifika nasıl kazanılır?" />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {KOSULLAR.map((kosul, sira) => (
            <li key={kosul.ad} className="bg-zemin p-6">
              <span className="etiket-mono grid size-7 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                {sira + 1}
              </span>
              <p className="mt-3.5 text-[0.9375rem] font-medium text-metin">{kosul.ad}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-metin-soluk">{kosul.tarif}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl border border-kenar bg-yuzey/40 p-6">
          <p className="etiket-mono mb-3 text-metin-soluk">Doğrulanabilirlik</p>
          <ul className="space-y-2.5">
            {[
              'Her sertifikanın kalıcı ve herkese açık bir doğrulama adresi olacak.',
              'Sertifika sayfasında hangi rotanın, hangi testlerin ve hangi projenin tamamlandığı yazılacak.',
              'Geçerlilik süresi olan alanlarda yenileme tarihi gösterilecek.',
            ].map((madde) => (
              <li
                key={madde}
                className="flex items-start gap-2.5 text-[0.875rem] text-metin-ikincil"
              >
                <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                {madde}
              </li>
            ))}
          </ul>
        </div>
      </Bolum>

      <Bolum zemin="derin">
        <BosDurum
          baslik="Sertifika programı henüz açılmadı"
          metin="Sertifikalar, premium program katmanıyla birlikte devreye girecek. O zamana kadar rotalar, dersler ve testler ücretsiz ve açık."
          eylem={
            <div className="flex flex-wrap justify-center gap-3">
              <Dugme href="/ogren/yollar/">Rotalara başla</Dugme>
              <Dugme href="/akademi/" gorunum="ikincil">
                Academy
              </Dugme>
            </div>
          }
        />
      </Bolum>
    </>
  );
}
