import Link from 'next/link';
import { Kapat, Kilit, Onay, OkSagUst } from '@/components/arayuz/Ikonlar';
import { sayi } from '@/lib/metin';
import { MODALITE_ADI, type Modalite } from '@/lib/modeller/siniflandirma';
import {
  GRUP_ADI,
  KIYAS_BOYUTLARI,
  hucreAnahtari,
  type Boyut,
  type BoyutGrubu,
  type Hucre,
  type KiyasKaydi,
} from '@/lib/modeller/kiyas';

/**
 * Karşılaştırma tablosu — SUNUCU bileşeni.
 *
 * Tablo istemciye taşınmadı ve taşınmamalı: içeriği ilk HTML yanıtında
 * bulunmak zorunda (değişmez kural 4) ve hiçbir parçası kullanıcı etkileşimine
 * bağlı değil. Seçim ve süzgeç URL'de yaşıyor, dolayısıyla tablo saf bir
 * fonksiyon: aynı adres her zaman aynı tabloyu verir.
 *
 * FARK VURGUSU tablonun asıl işi. Üç modelin on üç satırına bakan biri,
 * hangilerinin gerçekten AYRILDIĞINI gözle aramak zorunda kalıyordu. Her satır
 * için hücre anahtarları karşılaştırılır; hepsi aynıysa satır "ortak" sayılır
 * ve `?fark=1` ile gizlenebilir. Karşılaştırma yapan kişinin aradığı şey
 * benzerlik değil ayrımdır.
 *
 * SKOR SÜTUNU YOK ve olmayacak: metodolojisi yayımlanmamış bir ölçüm
 * gösterilmez (MASTER-PLAN §35, §59). Tablodaki tek sayısal alan, sağlayıcının
 * kendi yayımladığı ve kayıtta `kaynakAdres` ile bağlı olan liste fiyatıdır.
 */

type Props = {
  kayitlar: KiyasKaydi[];
  yalnizFarklar: boolean;
};

type Satir = {
  boyut: Boyut;
  hucreler: Hucre[];
  ayni: boolean;
  /** Para satırlarında en ucuz sütunun indeksi — yoksa `-1`. */
  enUcuz: number;
};

function satirlariKur(kayitlar: KiyasKaydi[]): Satir[] {
  return KIYAS_BOYUTLARI.map((boyut) => {
    const hucreler = kayitlar.map((kayit) => boyut.hucre(kayit));
    const anahtarlar = hucreler.map(hucreAnahtari);
    return {
      boyut,
      hucreler,
      ayni: anahtarlar.every((a) => a === anahtarlar[0]),
      enUcuz: enUcuzSutun(hucreler),
    };
  });
}

/**
 * En ucuz sütun — yalnızca TÜM tanımlı değerler AYNI para biriminde ise.
 *
 * Katalogta 130 kayıt USD, 5 kayıt CNY tarifeli. İki para birimini aynı
 * sıralamaya sokmak, kur varsaymak demektir; kur varsaymak da uydurma veridir.
 * Karışık para biriminde sıralama yapılmaz, hücreler olduğu gibi basılır.
 */
function enUcuzSutun(hucreler: Hucre[]): number {
  const paralar = hucreler.filter((h) => h.bicim === 'para' && h.deger != null);
  if (paralar.length < 2) return -1;
  const birimler = new Set(paralar.map((h) => (h.bicim === 'para' ? h.paraBirimi : undefined)));
  if (birimler.size > 1) return -1;

  let enIyi = -1;
  let enDusuk = Number.POSITIVE_INFINITY;
  hucreler.forEach((hucre, sira) => {
    if (hucre.bicim !== 'para' || hucre.deger == null) return;
    if (hucre.deger < enDusuk) {
      enDusuk = hucre.deger;
      enIyi = sira;
    }
  });
  return enIyi;
}

export function KiyasTablosu({ kayitlar, yalnizFarklar }: Props) {
  const satirlar = satirlariKur(kayitlar);
  const gorunur = yalnizFarklar ? satirlar.filter((s) => !s.ayni) : satirlar;
  const gizlenen = satirlar.length - gorunur.length;

  const gruplar = [...new Set(gorunur.map((s) => s.boyut.grup))];

  return (
    <div className="overflow-hidden rounded-2xl border border-kenar">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">
            {kayitlar.map((k) => k.ad).join(', ')} modellerinin yapısal ve fiyat karşılaştırması
          </caption>
          <thead>
            <tr className="border-b border-kenar bg-yuzey/60">
              <th
                scope="col"
                className="etiket-mono sticky left-0 z-10 w-52 bg-yuzey px-5 py-4 text-left text-metin-soluk"
              >
                Boyut
              </th>
              {kayitlar.map((kayit) => (
                <th key={kayit.slug} scope="col" className="px-5 py-4 text-left align-top">
                  <Link
                    href={`/modeller/${kayit.slug}/`}
                    className="block text-[0.9375rem] leading-snug font-semibold tracking-tight text-metin transition-colors hover:text-vurgu-parlak"
                  >
                    {kayit.ad}
                  </Link>
                  <span className="etiket-mono mt-1.5 flex flex-wrap items-center gap-2 text-metin-soluk">
                    {kayit.saglayici}
                    {kayit.acikAgirlik === false && <Kilit className="size-3" />}
                    {kayit.aileMi && (
                      <span className="rounded border border-kenar px-1.5 py-0.5">aile</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {gruplar.map((grup) => (
            <GrupGovdesi
              key={grup}
              grup={grup}
              satirlar={gorunur.filter((s) => s.boyut.grup === grup)}
              sutunSayisi={kayitlar.length}
            />
          ))}
        </table>
      </div>

      {yalnizFarklar && gizlenen > 0 && (
        <p className="border-t border-kenar-soluk bg-zemin-derin px-5 py-3 text-xs text-metin-soluk">
          {gizlenen} satır gizlendi: bu boyutlarda seçilen modeller aynı değeri taşıyor.
        </p>
      )}
      {yalnizFarklar && gizlenen === 0 && (
        <p className="border-t border-kenar-soluk bg-zemin-derin px-5 py-3 text-xs text-metin-soluk">
          Seçilen modeller her boyutta ayrışıyor; gizlenecek ortak satır yok.
        </p>
      )}
    </div>
  );
}

function GrupGovdesi({
  grup,
  satirlar,
  sutunSayisi,
}: {
  grup: BoyutGrubu;
  satirlar: Satir[];
  sutunSayisi: number;
}) {
  return (
    <tbody className="border-b border-kenar last:border-b-0">
      <tr>
        <th
          scope="colgroup"
          colSpan={sutunSayisi + 1}
          className="etiket-mono bg-zemin-derin px-5 py-2.5 text-left text-vurgu-sonuk"
        >
          {GRUP_ADI[grup]}
        </th>
      </tr>
      {satirlar.map((satir) => (
        <tr
          key={satir.boyut.anahtar}
          className={`border-t border-kenar-soluk ${satir.ayni ? '' : 'bg-vurgu-zemin/25'}`}
        >
          <th scope="row" className="sticky left-0 z-10 bg-zemin px-5 py-4 text-left align-top">
            <span className="flex items-start gap-2">
              <span
                aria-hidden
                className={`mt-1.5 h-3.5 w-0.5 shrink-0 rounded-full ${satir.ayni ? 'bg-transparent' : 'bg-vurgu'}`}
              />
              <span>
                <span className="block font-medium text-metin-ikincil">{satir.boyut.ad}</span>
                {satir.boyut.not && (
                  <span className="mt-0.5 block text-[0.6875rem] leading-snug text-metin-soluk">
                    {satir.boyut.not}
                  </span>
                )}
              </span>
            </span>
          </th>
          {satir.hucreler.map((hucre, sira) => (
            <td key={sira} className="px-5 py-4 align-top text-metin-ikincil">
              <HucreGovdesi hucre={hucre} enUcuz={satir.enUcuz === sira} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function HucreGovdesi({ hucre, enUcuz }: { hucre: Hucre; enUcuz: boolean }) {
  switch (hucre.bicim) {
    case 'metin':
      return hucre.deger ? (
        <span className="block leading-relaxed">{hucre.deger}</span>
      ) : (
        <Bilinmiyor />
      );

    case 'rozetler':
      return hucre.deger.length ? (
        <span className="flex flex-wrap gap-1.5">
          {hucre.deger.map((oge) => (
            <span
              key={oge}
              className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-0.5 text-[0.6875rem] text-metin-soluk"
            >
              {MODALITE_ADI[oge as Modalite] ?? oge}
            </span>
          ))}
        </span>
      ) : (
        <Bilinmiyor />
      );

    case 'liste':
      return hucre.deger.length ? (
        <ul className="space-y-1.5">
          {hucre.deger.map((oge) => (
            <li key={oge} className="text-[0.8125rem] leading-relaxed">
              {oge}
            </li>
          ))}
        </ul>
      ) : (
        <Bilinmiyor />
      );

    case 'evet-hayir':
      if (hucre.deger === null) return <Bilinmiyor />;
      return hucre.deger ? (
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

    case 'para':
      if (hucre.deger == null) return <Bilinmiyor not="token tarifesi yayımlanmamış" />;
      return (
        <span className="block">
          <span
            className={`inline-flex items-baseline gap-1.5 font-mono text-[0.9375rem] tabular-nums ${enUcuz ? 'font-semibold text-basari' : 'text-metin'}`}
          >
            {sayi(hucre.deger)}
            <span className="etiket-mono text-metin-soluk">{hucre.paraBirimi}</span>
          </span>
          {enUcuz && (
            <span className="etiket-mono mt-1 block text-basari">bu satırda en düşük</span>
          )}
          {hucre.kosul && (
            <span className="mt-1 block text-[0.6875rem] leading-snug text-uyari">
              {hucre.kosul}
            </span>
          )}
          {hucre.kaynak && (
            <a
              href={hucre.kaynak}
              target="_blank"
              rel="noreferrer"
              className="etiket-mono mt-1.5 inline-flex items-center gap-1 text-metin-soluk underline underline-offset-4 transition-colors hover:text-vurgu-parlak"
            >
              tarife
              <OkSagUst className="size-3" />
            </a>
          )}
        </span>
      );
  }
}

/**
 * Eksik değer AÇIKÇA eksik gösterilir.
 *
 * Boş hücre ile "bu özellik yok" hücresi aynı şey değildir. `acikAgirlik`
 * alanı 13 kayıtta boş; boş bırakılanı "kapalı" saymak, doğrulanmamış bir
 * iddiayı tabloya yazmak olurdu.
 */
function Bilinmiyor({ not }: { not?: string }) {
  return (
    <span className="inline-flex flex-col">
      <span className="text-metin-soluk">—</span>
      <span className="text-[0.6875rem] text-metin-soluk">{not ?? 'kayıtta yok'}</span>
    </span>
  );
}
