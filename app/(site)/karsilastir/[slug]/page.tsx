import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import {
  KARSILASTIRMALAR,
  KARSILASTIRMA_BOYUTLARI,
  karsilastirmaBul,
  modelBul,
  type ModelKaydi,
} from '@/lib/icerik/varliklar';

export function generateStaticParams() {
  return KARSILASTIRMALAR.map((kiyas) => ({ slug: kiyas.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kiyas = await karsilastirmaBul(slug);
  if (!kiyas) return {};

  return {
    title: kiyas.baslik,
    description: kiyas.ozet,
    alternates: { canonical: `/karsilastir/${kiyas.slug}/` },
  };
}

function deger(model: ModelKaydi, anahtar: string): string {
  switch (anahtar) {
    case 'tip':
      return model.tip;
    case 'baglamPenceresi':
      // Şemada opsiyonel: sağlayıcı belgelemediğinde araştırma alanı hiç
      // yazmaz. Kıyas tablosunda boş hücre yerine "bilinmiyor" işareti basılır.
      return model.baglamPenceresi ?? '—';
    case 'modaliteler':
      return (model.modaliteler ?? ['Metin']).join(' · ');
    case 'acikKaynak':
      // Üç durum: açık, kapalı, BİLİNMİYOR. `?:` ile ikiye indirmek,
      // doğrulanmamış bir kaydı "Yok" diye göstermek olurdu.
      return model.acikKaynak === undefined ? '—' : model.acikKaynak ? 'Var' : 'Yok';
    case 'api':
      return model.api === undefined ? '—' : model.api ? 'Var' : 'Yok';
    case 'kullanimAlanlari':
      return (model.kullanimAlanlari ?? []).slice(0, 3).join(' · ') || '—';
    default:
      return '—';
  }
}

export default async function KiyasSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kiyas = await karsilastirmaBul(slug);
  if (!kiyas) notFound();

  const sol = await modelBul(kiyas.sol);
  const sag = await modelBul(kiyas.sag);
  if (!sol || !sag) notFound();

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Karşılaştırmalar', yol: '/karsilastir/' },
          { ad: kiyas.baslik, yol: `/karsilastir/${kiyas.slug}/` },
        ]}
        etiket="KARŞILAŞTIRMA"
        baslik={kiyas.baslik}
        ozet={kiyas.ozet}
        eylemler={
          <>
            <Dugme href={`/modeller/${sol.slug}/`} gorunum="ikincil">
              {sol.ad}
            </Dugme>
            <Dugme href={`/modeller/${sag.slug}/`} gorunum="ikincil">
              {sag.ad}
            </Dugme>
          </>
        }
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="YAPISAL KARŞILAŞTIRMA"
          baslik="Boyut boyut karşılaştırma"
          aciklama="Tabloda yalnızca doğrulanabilir yapısal bilgiler yer alır; skor karşılaştırması metodolojisi yayımlanmış ölçümlerle verilir."
        />

        <div className="overflow-x-auto rounded-2xl border border-kenar">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{kiyas.baslik} — yapısal karşılaştırma</caption>
            <thead>
              <tr className="border-b border-kenar bg-yuzey/50">
                <th scope="col" className="etiket-mono px-5 py-4 text-left text-metin-soluk">
                  Boyut
                </th>
                <th scope="col" className="px-5 py-4 text-left">
                  <span className="block text-[0.9375rem] font-semibold text-metin">{sol.ad}</span>
                  <span className="etiket-mono mt-1 block text-metin-soluk">{sol.saglayici}</span>
                </th>
                <th scope="col" className="px-5 py-4 text-left">
                  <span className="block text-[0.9375rem] font-semibold text-metin">{sag.ad}</span>
                  <span className="etiket-mono mt-1 block text-metin-soluk">{sag.saglayici}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {KARSILASTIRMA_BOYUTLARI.map((boyut) => (
                <tr key={boyut.anahtar} className="border-b border-kenar-soluk last:border-b-0">
                  <th scope="row" className="px-5 py-4 text-left font-medium text-metin-ikincil">
                    {boyut.ad}
                  </th>
                  <td className="px-5 py-4 text-metin-ikincil">{deger(sol, boyut.anahtar)}</td>
                  <td className="px-5 py-4 text-metin-ikincil">{deger(sag, boyut.anahtar)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="KARAR" baslik="Hangisi hangi senaryoda?" />
        <div className="grid gap-4 md:grid-cols-2">
          {[sol, sag].map((model) => (
            <div key={model.slug} className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-2 text-vurgu-parlak">{model.saglayici}</p>
              <h3 className="text-lg font-semibold tracking-tight">{model.ad}</h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {model.ozet ?? model.vurgu}
              </p>

              {model.kullanimAlanlari && (
                <>
                  <p className="etiket-mono mt-5 mb-2.5 text-metin-soluk">Tercih edilir</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {model.kullanimAlanlari.map((alan) => (
                      <li
                        key={alan}
                        className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk"
                      >
                        {alan}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {model.siniriliklar && (
                <>
                  <p className="etiket-mono mt-5 mb-2.5 text-uyari">Dikkat</p>
                  <ul className="space-y-1.5">
                    {model.siniriliklar.map((sinir) => (
                      <li key={sinir} className="text-xs leading-relaxed text-metin-soluk">
                        {sinir}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <Link
                href={`/modeller/${model.slug}/`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-vurgu-parlak"
              >
                Model sayfası
                <Ok className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </Bolum>

      <KapanisCagrisi
        etiket="LEARN"
        baslik="Model seçimini tahmine bırakmayın"
        metin="Doğru karar, genel sıralamalardan değil kendi görev setinizde yaptığınız ölçümden çıkar."
        eylemler={
          <>
            <Dugme href="/rehber/model-secim-karari/">
              Model seçim rehberi
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/karsilastir/" gorunum="ikincil">
              Diğer kıyaslar
            </Dugme>
          </>
        }
      />
    </>
  );
}
