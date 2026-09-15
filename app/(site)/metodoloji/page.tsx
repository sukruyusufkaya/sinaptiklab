import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kalkan, Ok } from '@/components/arayuz/Ikonlar';
import { METODOLOJI_ILKELERI } from '@/lib/icerik/arastirma';

export const metadata: Metadata = {
  title: 'Metodoloji',
  description:
    'Sinaptik Lab benchmark ve araştırma metodolojisi: ölçüm tarihi, görev seti açıklığı, örnekleme ayarları, puanlama yöntemi, sınırlılıklar ve ticari bağımsızlık.',
  alternates: { canonical: '/metodoloji/' },
};

const BENCHMARK_ALANLARI = [
  { ad: 'Test verisi', tarif: 'Görev setinin yapısı, alt kümeleri ve örnek sayısı.' },
  { ad: 'Ölçüm tarihi', tarif: 'Sonucun hangi tarihte alındığı.' },
  { ad: 'Model sürümü', tarif: 'Ölçülen tam sürüm tanımlayıcısı.' },
  { ad: 'Örnekleme', tarif: 'Sıcaklık, üst-p ve tekrar sayısı.' },
  { ad: 'İstem', tarif: 'Kullanılan istem şablonunun tamamı.' },
  { ad: 'Puanlama', tarif: 'Otomatik ve insan değerlendirmesinin payı.' },
  { ad: 'Örneklem', tarif: 'Kaç örnek üzerinden ölçüldüğü.' },
  { ad: 'Sınırlılıklar', tarif: 'Sonucun ne söylemediği.' },
];

export default function MetodolojiSayfasi() {
  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Metodoloji', yol: '/metodoloji/' }]}
        etiket="RESEARCH"
        baslik="Metodoloji"
        ozet="Bir sayı, nasıl ölçüldüğü bilinmiyorsa bilgi değildir. Bu sayfa, Sinaptik Lab'de yayımlanan her ölçümün uymak zorunda olduğu ilkeleri tanımlar."
        olcumler={[
          { deger: `${METODOLOJI_ILKELERI.length}`, etiket: 'İlke' },
          { deger: `${BENCHMARK_ALANLARI.length}`, etiket: 'Zorunlu alan' },
          { deger: 'Bağımsız', etiket: 'Yürütme' },
        ]}
        eylemler={
          <Dugme href="/arastirma/" gorunum="ikincil">
            Araştırma yayınları
            <Ok className="size-4" />
          </Dugme>
        }
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="İLKELER"
          baslik="Değişmez altı ilke"
          aciklama="Bu ilkelerden birini karşılamayan bir ölçüm yayımlanmaz — sonucun ne kadar ilgi çekici olduğuna bakılmaz."
        />

        <ol className="divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
          {METODOLOJI_ILKELERI.map((ilke, sira) => (
            <li key={ilke.ad} className="bg-yuzey/30 p-6">
              <div className="flex gap-5">
                <span className="etiket-mono grid size-8 shrink-0 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                  {String(sira + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[1.0625rem] font-semibold tracking-tight text-metin">
                    {ilke.ad}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-metin-ikincil">
                    {ilke.aciklama}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="BENCHMARK"
          baslik="Model benchmark'larında zorunlu alanlar"
          aciklama="Bir skor tablosu, aşağıdaki alanların tamamı yayımlanmadan paylaşılmaz."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {BENCHMARK_ALANLARI.map((alan) => (
            <li key={alan.ad} className="bg-zemin p-5">
              <p className="text-[0.9375rem] font-medium text-metin">{alan.ad}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-metin-soluk">{alan.tarif}</p>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum>
        <BolumBasligi numara="03" etiket="BAĞIMSIZLIK" baslik="Editoryal ve ticari ayrım" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <Kalkan className="size-5 text-basari" />
            <p className="mt-4 text-[1.0625rem] font-semibold tracking-tight text-metin">
              Araştırma bağımsızdır
            </p>
            <p className="mt-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
              Benchmark ve rapor sonuçları, danışmanlık müşterilerinden bağımsız yürütülür. Bir
              şirketin müşteri olması, değerlendirmede lehine sonuç üretmez.
            </p>
          </div>
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <Kalkan className="size-5 text-uyari" />
            <p className="mt-4 text-[1.0625rem] font-semibold tracking-tight text-metin">
              Sponsorluk işaretlenir
            </p>
            <p className="mt-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
              Sponsorlu içerikler açıkça &quot;Sponsorlu&quot; etiketi taşır ve benchmark
              sayfalarında sponsorluk kabul edilmez.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-kenar bg-zemin-derin p-6">
          <p className="etiket-mono mb-3 text-metin">Düzeltme politikası</p>
          <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
            Bir ölçümde hata bulunursa sayfa sessizce düzeltilmez: güncelleme geçmişine kayıt
            eklenir, neyin neden değiştiği yazılır.{' '}
            <Link
              href="/duzeltme-politikasi/"
              className="text-vurgu-parlak underline underline-offset-4"
            >
              Düzeltme politikasının tamamı
            </Link>
          </p>
        </div>
      </Bolum>
    </>
  );
}
