'use client';

import { useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Ara, Hedef, Kapat, Onay } from '@/components/arayuz/Ikonlar';
import { anahtar } from '@/lib/metin';

/**
 * Rota kurucusu.
 *
 * İKİ AYRI SEÇİM, TEK ADRESTE: hedef (`?hedef=`) ve zaten bilinenler
 * (`?bilinen=`). İkisi de URL'de yaşar, dolayısıyla kurulan plan paylaşılabilir,
 * yer imine eklenebilir ve geri tuşuyla dönülebilir. Planı istemci durumunda
 * tutmak, birine "şu sırayla öğren" demenin yolunu ekran görüntüsüne indirirdi.
 *
 * "BİLİYORUM" İŞARETİ rotayı gerçekten kısaltır: bir kavramı bilen kişi onun
 * önkoşullarını da biliyordur, bu yüzden işaretlenen düğümün tüm önkoşul ağacı
 * plandan düşer (`rotaCikar()` içinde). Bu, sayfayı bir şemadan bir araca
 * çeviren tek etkileşimdir.
 *
 * Arama `anahtar()` ile ASCII'ye katlanır: "gomme" yazan da "gömme" yazan da
 * aynı sonucu bulur ve `İ`/`ı` çiftinde yerel ayara bağlı kayma olmaz.
 */

export type SeciciDugumu = {
  slug: string;
  ad: string;
  derinlik: number;
  kume?: string;
  dakika: number;
};

type Props = {
  dugumler: SeciciDugumu[];
  hedefler: readonly string[];
  bilinenler: readonly string[];
};

const GORUNUR_SINIR = 40;

export function RotaSecici({ dugumler, hedefler, bilinenler }: Props) {
  const yonlendirici = useRouter();
  const yol = usePathname();
  const [bekliyor, baslat] = useTransition();
  const [sorgu, setSorgu] = useState('');
  const [kip, setKip] = useState<'hedef' | 'bilinen'>('hedef');

  const aranabilir = useMemo(
    () => dugumler.map((d) => ({ dugum: d, metin: anahtar(`${d.ad} ${d.kume ?? ''}`) })),
    [dugumler],
  );

  const eslesen = useMemo(() => {
    const a = anahtar(sorgu);
    const liste = a ? aranabilir.filter(({ metin }) => metin.includes(a)) : aranabilir;
    return liste
      .map(({ dugum }) => dugum)
      .sort((x, y) => x.derinlik - y.derinlik || x.ad.localeCompare(y.ad, 'tr'));
  }, [aranabilir, sorgu]);

  const adHaritasi = useMemo(() => new Map(dugumler.map((d) => [d.slug, d.ad])), [dugumler]);

  function git(yeniHedef: readonly string[], yeniBilinen: readonly string[]) {
    const p = new URLSearchParams();
    if (yeniHedef.length) p.set('hedef', yeniHedef.join(','));
    if (yeniBilinen.length) p.set('bilinen', yeniBilinen.join(','));
    const sorguMetni = p.toString();
    baslat(() => {
      yonlendirici.replace(sorguMetni ? `${yol}?${sorguMetni}` : yol, { scroll: false });
    });
  }

  function degistir(slug: string) {
    if (kip === 'hedef') {
      const yeni = hedefler.includes(slug)
        ? hedefler.filter((s) => s !== slug)
        : [...hedefler, slug];
      // Hedef seçilen bir kavram aynı anda "biliyorum" olamaz.
      git(
        yeni,
        bilinenler.filter((s) => s !== slug),
      );
      return;
    }
    const yeni = bilinenler.includes(slug)
      ? bilinenler.filter((s) => s !== slug)
      : [...bilinenler, slug];
    git(
      hedefler.filter((s) => s !== slug),
      yeni,
    );
  }

  return (
    <div
      className={`rounded-2xl border border-kenar bg-yuzey/40 transition-opacity ${bekliyor ? 'opacity-60' : ''}`}
    >
      {/* Seçili şerit */}
      <div className="space-y-3 border-b border-kenar-soluk p-5">
        <SecimSatiri
          etiket="Hedef"
          bos="Öğrenmek istediğiniz kavramı seçin."
          sluglar={hedefler}
          adHaritasi={adHaritasi}
          renk="vurgu"
          kaldir={(slug) =>
            git(
              hedefler.filter((s) => s !== slug),
              bilinenler,
            )
          }
        />
        <SecimSatiri
          etiket="Biliyorum"
          bos="Bildiğiniz kavramları işaretleyin; rota kısalsın."
          sluglar={bilinenler}
          adHaritasi={adHaritasi}
          renk="basari"
          kaldir={(slug) =>
            git(
              hedefler,
              bilinenler.filter((s) => s !== slug),
            )
          }
        />
      </div>

      {/* Kip ve arama */}
      <div className="space-y-4 border-b border-kenar-soluk p-5">
        <div
          role="radiogroup"
          aria-label="Seçim kipi"
          className="inline-flex rounded-full border border-kenar bg-zemin p-1"
        >
          {(
            [
              ['hedef', 'Hedef seç'],
              ['bilinen', 'Bildiklerimi işaretle'],
            ] as const
          ).map(([deger, etiket]) => (
            <button
              key={deger}
              type="button"
              role="radio"
              aria-checked={kip === deger}
              onClick={() => setKip(deger)}
              className={`rounded-full px-4 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                kip === deger
                  ? 'bg-vurgu-zemin text-vurgu-parlak'
                  : 'text-metin-soluk hover:text-metin'
              }`}
            >
              {etiket}
            </button>
          ))}
        </div>

        <label className="relative block">
          <span className="sr-only">Kavram ara</span>
          <Ara className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-metin-soluk" />
          <input
            type="search"
            value={sorgu}
            onChange={(olay) => setSorgu(olay.target.value)}
            placeholder="Kavram ara — RAG, gömme, ajan…"
            className="h-11 w-full rounded-full border border-kenar bg-zemin pr-4 pl-11 text-[0.875rem] text-metin transition-colors outline-none placeholder:text-metin-soluk focus-visible:border-vurgu"
          />
        </label>
      </div>

      {/* Kavramlar */}
      <div className="p-5">
        <p className="etiket-mono mb-3 text-metin-soluk">
          {eslesen.length} kavram
          {eslesen.length > GORUNUR_SINIR && ` · ilk ${GORUNUR_SINIR} gösteriliyor`}
        </p>
        {eslesen.length === 0 ? (
          <p className="rounded-xl border border-dashed border-kenar-guclu px-5 py-8 text-center text-[0.875rem] text-metin-ikincil">
            Bu aramayla eşleşen kavram yok.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {eslesen.slice(0, GORUNUR_SINIR).map((dugum) => {
              const hedefMi = hedefler.includes(dugum.slug);
              const bilinenMi = bilinenler.includes(dugum.slug);
              return (
                <li key={dugum.slug}>
                  <button
                    type="button"
                    aria-pressed={hedefMi || bilinenMi}
                    onClick={() => degistir(dugum.slug)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.8125rem] transition-[border-color,background-color,color] duration-200 ${
                      hedefMi
                        ? 'border-vurgu/50 bg-vurgu-zemin text-vurgu-parlak'
                        : bilinenMi
                          ? 'border-basari/45 bg-basari/10 text-basari'
                          : 'border-kenar bg-zemin/50 text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
                    }`}
                  >
                    {hedefMi && <Hedef className="size-3.5 shrink-0" />}
                    {bilinenMi && <Onay className="size-3.5 shrink-0" />}
                    <span className="font-medium">{dugum.ad}</span>
                    <span className="etiket-mono text-metin-soluk">K{dugum.derinlik}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function SecimSatiri({
  etiket,
  bos,
  sluglar,
  adHaritasi,
  renk,
  kaldir,
}: {
  etiket: string;
  bos: string;
  sluglar: readonly string[];
  adHaritasi: Map<string, string>;
  renk: 'vurgu' | 'basari';
  kaldir: (slug: string) => void;
}) {
  const sinif =
    renk === 'vurgu'
      ? 'border-vurgu/50 bg-vurgu-zemin text-vurgu-parlak'
      : 'border-basari/45 bg-basari/10 text-basari';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="etiket-mono mr-1 w-20 shrink-0 text-metin-soluk">{etiket}</span>
      {sluglar.length === 0 ? (
        <span className="text-[0.8125rem] text-metin-soluk">{bos}</span>
      ) : (
        sluglar.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => kaldir(slug)}
            className={`group inline-flex items-center gap-2 rounded-full border py-1.5 pr-2.5 pl-3.5 text-[0.8125rem] font-medium transition-colors hover:border-tehlike/60 ${sinif}`}
          >
            {adHaritasi.get(slug) ?? slug}
            <Kapat className="size-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
            <span className="sr-only">seçimden çıkar</span>
          </button>
        ))
      )}
    </div>
  );
}
