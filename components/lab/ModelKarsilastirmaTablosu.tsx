'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Kapat, Kilit, Ok, Onay } from '@/components/arayuz/Ikonlar';
import type { ModelKaydi } from '@/lib/icerik/varliklar';

const EN_COK = 3;

function deger(model: ModelKaydi, anahtar: string): string | boolean | string[] {
  switch (anahtar) {
    case 'tip':
      return model.tip;
    case 'baglamPenceresi':
      return model.baglamPenceresi ?? '—';
    case 'modaliteler':
      return model.modaliteler ?? ['Metin'];
    case 'acikKaynak':
      // Bilinmiyorsa boolean DÖNDÜRÜLMEZ: hücre "Yok" rozeti yerine '—' basar.
      return model.acikAgirlik ?? model.acikKaynak ?? '—';
    case 'api':
      return Boolean(model.api);
    case 'kullanimAlanlari':
      return (model.kullanimAlanlari ?? []).slice(0, 3);
    default:
      return '—';
  }
}

function HucreDegeri({ icerik }: { icerik: string | boolean | string[] }) {
  if (typeof icerik === 'boolean') {
    return icerik ? (
      <span className="inline-flex items-center gap-1.5 text-basari">
        <Onay className="size-4" />
        Var
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-metin-soluk">
        <Kapat className="size-3.5" />
        Yok
      </span>
    );
  }

  if (Array.isArray(icerik)) {
    return (
      <span className="flex flex-wrap gap-1.5">
        {icerik.map((oge) => (
          <span
            key={oge}
            className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-0.5 text-[0.6875rem] text-metin-soluk"
          >
            {oge}
          </span>
        ))}
      </span>
    );
  }

  return <span>{icerik}</span>;
}

/**
 * Etkileşimli model karşılaştırma.
 *
 * Tabloda yalnızca doğrulanabilir yapısal alanlar yer alır. Skor sütunu
 * bilinçli olarak yoktur: metodolojisi yayımlanmamış bir ölçüm gösterilmez
 * (MASTER-PLAN §35, §59).
 */
export function ModelKarsilastirmaTablosu({
  tumModeller,
  boyutlar,
}: {
  tumModeller: ModelKaydi[];
  boyutlar: readonly { anahtar: string; ad: string }[];
}) {
  const [secili, setSecili] = useState<string[]>(['gpt-ailesi', 'claude-ailesi']);

  const modeller = useMemo(
    () =>
      secili
        .map((slug) => tumModeller.find((model) => model.slug === slug))
        .filter((model): model is ModelKaydi => Boolean(model)),
    [secili, tumModeller],
  );

  function degistir(slug: string) {
    setSecili((onceki) => {
      if (onceki.includes(slug)) return onceki.filter((kayit) => kayit !== slug);
      if (onceki.length >= EN_COK) return [...onceki.slice(1), slug];
      return [...onceki, slug];
    });
  }

  return (
    <div className="space-y-6">
      {/* Seçim */}
      <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <p className="etiket-mono text-metin">Karşılaştırılacak modeller</p>
          <p className="etiket-mono text-metin-soluk">
            {secili.length} / {EN_COK} seçili
          </p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {tumModeller.map((model) => {
            const isaretli = secili.includes(model.slug);
            return (
              <li key={model.slug}>
                <button
                  type="button"
                  aria-pressed={isaretli}
                  onClick={() => degistir(model.slug)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-[border-color,background-color,color] duration-200 ${
                    isaretli
                      ? 'border-vurgu/50 bg-vurgu-zemin text-vurgu-parlak'
                      : 'border-kenar bg-zemin/50 text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
                  }`}
                >
                  {isaretli && <Onay className="size-3.5" />}
                  {model.ad}
                  <span className="etiket-mono text-metin-soluk">{model.saglayici}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-metin-soluk">
          En fazla {EN_COK} model karşılaştırılabilir. Dördüncüyü seçtiğinizde en eski seçim
          listeden düşer.
        </p>
      </div>

      {/* Tablo */}
      {modeller.length >= 2 ? (
        <div className="overflow-x-auto rounded-2xl border border-kenar">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Seçilen modellerin yapısal karşılaştırması</caption>
            <thead>
              <tr className="border-b border-kenar bg-yuzey/50">
                <th scope="col" className="etiket-mono px-5 py-4 text-left text-metin-soluk">
                  Boyut
                </th>
                {modeller.map((model) => (
                  <th key={model.slug} scope="col" className="px-5 py-4 text-left">
                    <Link
                      href={`/modeller/${model.slug}/`}
                      className="block text-[0.9375rem] font-semibold text-metin transition-colors hover:text-vurgu-parlak"
                    >
                      {model.ad}
                    </Link>
                    <span className="etiket-mono mt-1 flex items-center gap-2 text-metin-soluk">
                      {model.saglayici}
                      {!model.acikKaynak && <Kilit className="size-3" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boyutlar.map((boyut) => (
                <tr key={boyut.anahtar} className="border-b border-kenar-soluk last:border-b-0">
                  <th scope="row" className="px-5 py-4 text-left font-medium text-metin-ikincil">
                    {boyut.ad}
                  </th>
                  {modeller.map((model) => (
                    <td key={model.slug} className="px-5 py-4 text-metin-ikincil">
                      <HucreDegeri icerik={deger(model, boyut.anahtar)} />
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="border-b border-kenar-soluk last:border-b-0">
                <th scope="row" className="px-5 py-4 text-left font-medium text-metin-ikincil">
                  Öne çıkan
                </th>
                {modeller.map((model) => (
                  <td key={model.slug} className="px-5 py-4 text-[0.8125rem] text-metin-soluk">
                    {model.vurgu}
                  </td>
                ))}
              </tr>

              <tr>
                <th scope="row" className="px-5 py-4 text-left font-medium text-uyari">
                  Dikkat
                </th>
                {modeller.map((model) => (
                  <td key={model.slug} className="px-5 py-4">
                    <ul className="space-y-1.5">
                      {(model.siniriliklar ?? ['—']).map((sinir) => (
                        <li key={sinir} className="text-[0.8125rem] text-metin-soluk">
                          {sinir}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-kenar-guclu bg-zemin-derin/60 px-6 py-12 text-center">
          <p className="etiket-mono mb-3 text-metin-soluk">En az iki model seçin</p>
          <p className="mx-auto max-w-md text-[0.875rem] leading-relaxed text-metin-ikincil">
            Karşılaştırma tablosunu görmek için yukarıdan en az iki model seçmeniz gerekiyor.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-uyari/25 bg-uyari/8 p-5">
        <p className="etiket-mono mb-2 text-uyari">Skor sütunu neden yok?</p>
        <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
          Tabloda yalnızca doğrulanabilir yapısal alanlar var. Skor karşılaştırması, ancak test
          verisi, model sürümü, örnekleme ayarları ve örneklem sayısı yayımlandığında eklenir.{' '}
          <Link href="/metodoloji/" className="text-vurgu-parlak underline underline-offset-4">
            Metodoloji ilkeleri
          </Link>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/lab/model-secici/"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-kenar-guclu bg-yuzey/60 px-4 text-[0.8125rem] font-medium text-metin transition-colors hover:border-vurgu"
        >
          Kısıtlara göre model önerisi al
          <Ok className="size-3.5" />
        </Link>
        <Link
          href="/rehber/model-secim-karari/"
          className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[0.8125rem] font-medium text-metin-ikincil transition-colors hover:text-metin"
        >
          Model seçim rehberi
        </Link>
      </div>
    </div>
  );
}
