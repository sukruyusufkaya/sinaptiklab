import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Zarf } from '@/components/arayuz/Ikonlar';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { brief, briefArsivi } from '@/lib/icerik/gundem';
import { tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Sinaptik Brief — Günlük 5 Dakikalık AI Özeti',
  description:
    'Bugün bilmeniz gereken beş yapay zekâ gelişmesi. Her madde "neden önemli" satırıyla ve kaynağıyla birlikte.',
  alternates: { canonical: '/brief/' },
};

export default async function BriefSayfasi() {
  const [BRIEF, BRIEF_ARSIVI] = await Promise.all([brief(), briefArsivi()]);
  const bugun = BRIEF_ARSIVI[0];

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Sinaptik Brief', yol: '/brief/' }]}
        etiket="GÜNLÜK"
        baslik="Sinaptik Brief"
        ozet="Beş madde, beş dakika. Her madde ne olduğunu değil neden önemli olduğunu söyler; kaynağı yanında durur."
        olcumler={[
          { deger: '5', etiket: 'Madde' },
          { deger: '~5 dk', etiket: 'Okuma' },
          /*
             SAYI, VAAT DEĞİL. Burada "Her gün" yazıyordu; arşivde tek sayı
             vardı, yani ziyaretçinin tek tıkla yanlışlayabileceği bir ölçüm
             iddiasıydı (değişmez kural 5). Yayın sıklığı editoryal bir
             taahhüttür ve sayfanın ölçüm şeridinde değil, ürün tanıtımında
             yerini bulur; şerit yalnızca sayılabilen şeyi gösterir.
          */
          { deger: `${BRIEF_ARSIVI.length}`, etiket: 'Yayımlanan sayı' },
          { deger: bugun ? tarihUzun(bugun.tarih) : '—', etiket: 'Bugünün sayısı' },
        ]}
        eylemler={
          <Dugme href="/bulten/">
            <Zarf className="size-4" />
            E-postayla al
          </Dugme>
        }
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="BUGÜN"
          baslik={bugun ? bugun.baslik : 'Bugünün maddeleri'}
          aciklama="Maddeler editoryal olarak seçilir; her biri ilgili konu merkezine bağlanır."
        />

        {BRIEF.length === 0 ? (
          <BosDurum
            baslik="Bugünün sayısı hazırlanıyor"
            metin="Maddeler editoryal olarak seçilir; kaynağı ve konu bağlantısı tamamlanmamış madde yayımlanmaz."
          />
        ) : (
          <ol className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {BRIEF.map((madde) => (
              <li key={madde.numara} className="group">
                <Link href={`/konu/${madde.konuSlug}/`} className="flex gap-5 py-6 sm:gap-8">
                  <span className="font-mono text-lg text-metin-soluk transition-colors group-hover:text-vurgu-parlak">
                    {madde.numara}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg leading-snug font-medium tracking-tight text-metin text-balance transition-colors group-hover:text-vurgu-parlak">
                      {madde.baslik}
                    </span>
                    <span className="mt-3 block rounded-lg border border-kenar-soluk bg-yuzey/40 p-3.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
                      <span className="etiket-mono mb-1.5 block text-metin-soluk">
                        Neden önemli
                      </span>
                      {madde.neden}
                    </span>
                    <span className="etiket-mono mt-3 block text-metin-soluk">
                      Kaynak · {madde.kaynak}
                    </span>
                  </span>
                  <Ok className="mt-1.5 size-4 shrink-0 text-metin-soluk opacity-0 transition-all duration-200 ease-sinaptik group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="ARŞİV" baslik="Önceki sayılar" />
        <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
          {BRIEF_ARSIVI.map((sayi) => (
            <li key={sayi.tarih} className="group">
              {/*
                Her satır artık kendi sayısına gider. Önceden hepsi `/brief/`'e
                bağlanıyordu: 45 sayının 44'ü veritabanında durup hiçbir
                adresten okunamıyordu.
              */}
              <Link href={`/brief/${sayi.tarih}/`} className="flex items-center gap-5 py-4">
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
        <p className="mt-6 text-xs text-metin-soluk">
          Arşiv sayfaları yayına alındığında her sayı kendi kalıcı adresine taşınacak.
        </p>
      </Bolum>
    </>
  );
}
