import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dusen, Nabiz, Ok, Yukselen } from '@/components/arayuz/Ikonlar';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { radar } from '@/lib/icerik/gundem';
import type { RadarKaydi } from '@/lib/tipler';

export const metadata: Metadata = {
  title: 'Sinaptik AI Radar — Teknoloji Momentum Endeksi',
  description:
    'Yayın, depo aktivitesi, model çıkışları ve arama ilgisinden türetilen yapay zekâ teknoloji momentum endeksi. Metodoloji açıktır.',
  alternates: { canonical: '/radar/' },
};

const SINYAL_ADLARI: { anahtar: keyof RadarKaydi['sinyaller']; ad: string; tarif: string }[] = [
  { anahtar: 'yayin', ad: 'Yayın', tarif: 'Akademik ve teknik yayın hacmi' },
  { anahtar: 'github', ad: 'Depo', tarif: 'Açık kaynak depo aktivitesi' },
  { anahtar: 'modelCikisi', ad: 'Model', tarif: 'Yeni model ve sürüm duyuruları' },
  { anahtar: 'aramaIlgisi', ad: 'Arama', tarif: 'Arama ilgisi eğilimi' },
];

function YonIsareti({ yon }: { yon: RadarKaydi['yon'] }) {
  if (yon === 'yukselen')
    return (
      <span className="inline-flex items-center gap-1.5 text-sinyal">
        <Yukselen className="size-4" />
        Yükselen
      </span>
    );
  if (yon === 'dusen')
    return (
      <span className="inline-flex items-center gap-1.5 text-metin-soluk">
        <Dusen className="size-4" />
        Düşen
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-metin-soluk">
      <span className="block h-px w-4 bg-current" aria-hidden="true" />
      Sabit
    </span>
  );
}

export default async function RadarSayfasi() {
  const RADAR = await radar();
  const yukselen = RADAR.filter((k) => k.yon === 'yukselen').length;
  const dusen = RADAR.filter((k) => k.yon === 'dusen').length;

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'AI Radar', yol: '/radar/' }]}
        etiket="DISCOVER"
        baslik="Sinaptik AI Radar"
        ozet="Bir teknolojinin gündemdeki ağırlığı tek bir sinyalden okunmaz. Radar; yayın, depo aktivitesi, model çıkışları ve arama ilgisini birleştirerek momentum üretir."
        olcumler={[
          { deger: `${RADAR.length}`, etiket: 'İzlenen başlık' },
          { deger: `${yukselen}`, etiket: 'Yükselen' },
          { deger: `${dusen}`, etiket: 'Düşen' },
          { deger: '7 gün', etiket: 'Pencere' },
        ]}
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
            <div className="flex items-center gap-2">
              <Nabiz className="size-4 text-sinyal" />
              <p className="etiket-mono text-metin">Momentum nasıl hesaplanır?</p>
            </div>
            <ul className="mt-4 space-y-2.5">
              {SINYAL_ADLARI.map((sinyal) => (
                <li key={sinyal.anahtar} className="text-xs">
                  <span className="block font-medium text-metin-ikincil">{sinyal.ad}</span>
                  <span className="block text-metin-soluk">{sinyal.tarif}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-kenar-soluk pt-3.5 text-[0.6875rem] leading-relaxed text-uyari">
              Yer tutucu skorlar. Gerçek endeks yayımlanana kadar bu değerler kaynak gösterilemez.
            </p>
          </div>
        }
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="ENDEKS"
          baslik="Momentum tablosu"
          aciklama="Her başlık kendi sayfasına açılır; oradaki alt sinyal kırılımı hangi bileşenin yükselttiğini gösterir."
        />

        {RADAR.length === 0 ? (
          <BosDurum
            baslik="Momentum tablosu hazırlanıyor"
            metin="Sinyal kırılımı eksik olan ölçüm yayımlanmaz; tablo, tam kırılımı olan başlıklarla doldurulur."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-kenar">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Yapay zekâ teknoloji momentum tablosu</caption>
              <thead>
                <tr className="border-b border-kenar bg-yuzey/50">
                  <th scope="col" className="etiket-mono px-5 py-3.5 text-left text-metin-soluk">
                    Teknoloji
                  </th>
                  <th scope="col" className="etiket-mono px-4 py-3.5 text-left text-metin-soluk">
                    Momentum
                  </th>
                  <th scope="col" className="etiket-mono px-4 py-3.5 text-left text-metin-soluk">
                    Yön
                  </th>
                  {SINYAL_ADLARI.map((sinyal) => (
                    <th
                      key={sinyal.anahtar}
                      scope="col"
                      className="etiket-mono hidden px-4 py-3.5 text-right text-metin-soluk lg:table-cell"
                    >
                      {sinyal.ad}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RADAR.map((kayit) => (
                  <tr
                    key={kayit.slug}
                    className="group border-b border-kenar-soluk last:border-b-0 hover:bg-yuzey/40"
                  >
                    <th scope="row" className="px-5 py-4 text-left">
                      <Link
                        href={`/radar/${kayit.slug}/`}
                        className="text-[0.9375rem] font-medium text-metin transition-colors group-hover:text-vurgu-parlak"
                      >
                        {kayit.ad}
                      </Link>
                    </th>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-3">
                        <span className="h-1.5 w-24 overflow-hidden rounded-full bg-yuzey-3">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-vurgu to-ikincil"
                            style={{ width: `${kayit.momentum}%` }}
                          />
                        </span>
                        <span className="font-mono text-metin tabular-nums">{kayit.momentum}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <span className="flex items-center gap-2.5">
                        <YonIsareti yon={kayit.yon} />
                        <span
                          className={`etiket-mono tabular-nums ${kayit.degisim > 0 ? 'text-sinyal' : 'text-metin-soluk'}`}
                        >
                          {kayit.degisim > 0 ? '+' : ''}
                          {kayit.degisim}
                        </span>
                      </span>
                    </td>
                    {SINYAL_ADLARI.map((sinyal) => (
                      <td
                        key={sinyal.anahtar}
                        className="hidden px-4 py-4 text-right font-mono text-metin-ikincil tabular-nums lg:table-cell"
                      >
                        {kayit.sinyaller[sinyal.anahtar]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="OKUMA NOTU" baslik="Radar neyi söyler, neyi söylemez" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-3 text-basari">Söyler</p>
            <ul className="space-y-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
              <li>Bir başlığın ekosistemdeki ilgi ağırlığının yönünü.</li>
              <li>Hangi sinyalin yükselişi sürüklediğini.</li>
              <li>Heyecanın mı uygulamanın mı arttığını (depo vs. arama kırılımı).</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-3 text-uyari">Söylemez</p>
            <ul className="space-y-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
              <li>Bir teknolojinin teknik kalitesini veya olgunluğunu.</li>
              <li>Sizin kullanım senaryonuz için uygun olup olmadığını.</li>
              <li>Yatırım veya satın alma tavsiyesi.</li>
            </ul>
          </div>
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-metin-soluk">
          Ayrıntılı metodoloji için
          <Link href="/metodoloji/" className="inline-flex items-center gap-1.5 text-vurgu-parlak">
            metodoloji sayfası
            <Ok className="size-3.5" />
          </Link>
        </p>
      </Bolum>
    </>
  );
}
