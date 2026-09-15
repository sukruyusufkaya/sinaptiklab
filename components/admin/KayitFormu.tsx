'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { BlokEditoru } from '@/components/admin/BlokEditoru';
import { NesneDizisiAlani } from '@/components/admin/NesneDizisiAlani';
import { Onay, Ok } from '@/components/arayuz/Ikonlar';
import { kayitDurumDegistir, kayitKaydet, kayitSil } from '@/lib/admin/eylemler';
import { onizlemeBaglantisiOlustur } from '@/lib/admin/onizleme-eylemleri';
import { alanDegeri, type Alan, type IstemciYapilandirmasi } from '@/lib/admin/alanlar/tipler';
import type { Blok } from '@/lib/tipler';

/**
 * Konfigürasyondan render edilen kayıt formu.
 *
 * Form motorunun sözleşmesi: HER alan konfigürasyondan gelir. Bir alanı
 * eklemek/çıkarmak için bu dosya değişmez, yalnızca
 * `lib/admin/alanlar/<koleksiyon>.ts` değişir.
 */

const ALAN =
  'w-full rounded-lg border border-kenar bg-zemin px-3 py-2 text-sm text-metin outline-none transition-colors focus:border-vurgu disabled:opacity-60';

export type IliskiHaritasi = Record<string, { deger: string; etiket: string }[]>;

export function KayitFormu({
  yapilandirma,
  belge,
  iliskiler,
  izinler,
  siteYolu,
}: {
  /**
   * Fonksiyon taşımayan yapılandırma. Ham `KoleksiyonYapilandirmasi` buraya
   * geçirilemez: `siteYolu` bir fonksiyondur ve RSC sınırından geçmez.
   */
  yapilandirma: IstemciYapilandirmasi;
  belge: Record<string, unknown> | null;
  iliskiler: IliskiHaritasi;
  izinler: string[];
  /** Sunucuda hesaplanmış "sitede gör" adresi. */
  siteYolu?: string;
}) {
  const [hata, setHata] = useState<string>();
  const [ileti, setIleti] = useState<string>();
  const [alanHatalari, setAlanHatalari] = useState<Record<string, string>>({});
  const [onizleme, setOnizleme] = useState<{ adres: string; biterZaman: string }>();
  const [kopyalandi, setKopyalandi] = useState(false);
  const [bekliyor, baslat] = useTransition();
  const onizlemeKutusu = useRef<HTMLInputElement>(null);
  const yonlendirici = useRouter();

  const kimlik = typeof belge?._id === 'string' ? belge._id : undefined;
  const yeniMi = !kimlik;
  const durum = typeof belge?.durum === 'string' ? belge.durum : 'taslak';

  const yayinlayabilir =
    yapilandirma.koleksiyon === 'icerikler'
      ? izinler.includes('icerik:yayinla')
      : izinler.includes('varlik:yaz') || izinler.includes('icerik:yayinla');

  function sonucuIsle(sonuc: Awaited<ReturnType<typeof kayitKaydet>>, yenile = true) {
    if (sonuc.tamam) {
      setHata(undefined);
      setAlanHatalari({});
      setIleti(sonuc.ileti);
      if (yeniMi && sonuc.veri?.yol) {
        yonlendirici.replace(sonuc.veri.yol);
      } else if (yenile) {
        yonlendirici.refresh();
      }
    } else {
      setIleti(undefined);
      setHata(sonuc.hata);
      setAlanHatalari(sonuc.alanHatalari ?? {});
    }
  }

  function kaydet(veri: FormData) {
    baslat(async () => {
      const sonuc = await kayitKaydet({
        koleksiyon: yapilandirma.koleksiyon,
        kimlik,
        veri,
      });
      sonucuIsle(sonuc);
    });
  }

  function durumDegistir(yeniDurum: string) {
    if (!kimlik) return;
    baslat(async () => {
      const sonuc = await kayitDurumDegistir({
        koleksiyon: yapilandirma.koleksiyon,
        kimlik,
        durum: yeniDurum,
      });
      if (sonuc.tamam) {
        setHata(undefined);
        setIleti(sonuc.ileti);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  /**
   * Önizleme bağlantısı üretir.
   *
   * Mutlak adres İSTEMCİDE kurulur: sunucu tarafındaki eylem yalnızca göreli
   * yolu döndürür, böylece yerelde, önizleme dağıtımında ve canlıda aynı kod
   * doğru kökü üretir (ortam değişkenine bağımlılık yok). `window` yalnızca
   * bu olay işleyicisi içinde okunur — render sırasında değil, yani
   * hidrasyon uyuşmazlığı çıkmaz.
   */
  function onizlemeUret() {
    if (!kimlik) return;
    baslat(async () => {
      const sonuc = await onizlemeBaglantisiOlustur({
        koleksiyon: yapilandirma.koleksiyon,
        kimlik,
      });
      if (!sonuc.tamam) {
        setIleti(undefined);
        setHata(sonuc.hata);
        return;
      }
      if (!sonuc.veri) return;
      setHata(undefined);
      setIleti(sonuc.ileti);
      setKopyalandi(false);
      setOnizleme({
        adres: `${window.location.origin}${sonuc.veri.yol}`,
        biterZaman: sonuc.veri.biterZaman,
      });
    });
  }

  async function onizlemeyiKopyala() {
    if (!onizleme) return;
    try {
      await navigator.clipboard.writeText(onizleme.adres);
      setKopyalandi(true);
    } catch {
      // Pano izni yoksa (http, eski tarayıcı) adresi seçili bırak: elle kopyalanır.
      setKopyalandi(false);
      onizlemeKutusu.current?.select();
    }
  }

  function sil() {
    if (!kimlik) return;
    baslat(async () => {
      const sonuc = await kayitSil({ koleksiyon: yapilandirma.koleksiyon, kimlik });
      if (sonuc.tamam) {
        yonlendirici.replace(sonuc.veri?.yol ?? `/admin/koleksiyon/${yapilandirma.koleksiyon}/`);
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Durum şeridi */}
      {yapilandirma.durumluMu && !yeniMi && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-kenar bg-yuzey/40 px-4 py-3">
          <span className="etiket-mono text-metin-soluk">DURUM</span>
          <DurumRozeti durum={durum} />

          <span className="ml-auto flex flex-wrap gap-1.5">
            {durum !== 'taslak' && (
              <GecisDugmesi onClick={() => durumDegistir('taslak')} bekliyor={bekliyor}>
                Taslağa çek
              </GecisDugmesi>
            )}
            {durum === 'taslak' && (
              <GecisDugmesi onClick={() => durumDegistir('incelemede')} bekliyor={bekliyor}>
                İncelemeye gönder
              </GecisDugmesi>
            )}
            {durum !== 'yayinda' && yayinlayabilir && (
              <GecisDugmesi onClick={() => durumDegistir('yayinda')} bekliyor={bekliyor} birincil>
                Yayımla
              </GecisDugmesi>
            )}
            {durum === 'yayinda' && yayinlayabilir && (
              <GecisDugmesi onClick={() => durumDegistir('arsiv')} bekliyor={bekliyor}>
                Arşivle
              </GecisDugmesi>
            )}
            {/*
              Yayımlanmamış kayıt sitede görünmez; onay için gösterilecek tek
              adres önizleme bağlantısıdır. Yayındaki kayıtta gizlenir —
              orada "sitede gör" zaten gerçek sayfayı açar.
            */}
            {durum !== 'yayinda' && (
              <GecisDugmesi onClick={onizlemeUret} bekliyor={bekliyor}>
                Önizleme bağlantısı
              </GecisDugmesi>
            )}
            {siteYolu && (
              <Link
                href={siteYolu}
                target="_blank"
                className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
              >
                sitede gör ↗
              </Link>
            )}
          </span>
        </div>
      )}

      {/* Önizleme bağlantısı — üretildikten sonra kopyalanabilir hâlde durur */}
      {onizleme && (
        <div className="space-y-2.5 rounded-xl border border-uyari/35 bg-uyari/8 px-4 py-3.5">
          <p className="etiket-mono text-uyari">ÖNİZLEME BAĞLANTISI</p>
          <p className="text-xs leading-relaxed text-metin-ikincil">
            Bağlantıyı bilen herkes bu taslağı görebilir; panel oturumu gerekmez. Arama motorlarına
            kapalıdır ve{' '}
            <span className="text-metin">
              {new Intl.DateTimeFormat('tr-TR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(onizleme.biterZaman))}
            </span>{' '}
            tarihinde kendiliğinden geçersiz olur.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={onizlemeKutusu}
              type="text"
              readOnly
              value={onizleme.adres}
              onFocus={(olay) => olay.currentTarget.select()}
              aria-label="Önizleme adresi"
              className="min-w-0 flex-1 rounded-lg border border-kenar bg-zemin px-3 py-2 font-mono text-xs text-metin-ikincil outline-none focus:border-vurgu"
            />
            <button
              type="button"
              onClick={onizlemeyiKopyala}
              className="rounded-lg border border-kenar px-3 py-2 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
            >
              {kopyalandi ? 'kopyalandı' : 'kopyala'}
            </button>
            <a
              href={onizleme.adres}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-kenar px-3 py-2 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
            >
              aç ↗
            </a>
          </div>
        </div>
      )}

      {/* Bildirimler */}
      {hata && (
        <p
          role="alert"
          className="rounded-lg border border-tehlike/35 bg-tehlike/10 px-4 py-3 text-sm text-tehlike"
        >
          {hata}
        </p>
      )}
      {ileti && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg border border-basari/35 bg-basari/10 px-4 py-3 text-sm text-basari"
        >
          <Onay className="size-4 shrink-0" />
          {ileti}
        </p>
      )}

      <form action={kaydet} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {yapilandirma.alanlar.map((alan) => {
            const duzenlenebilir = !alan.izin || izinler.includes(alan.izin);
            const tamGenislik =
              alan.genislik !== 'yarim' ||
              alan.tip === 'bloklar' ||
              alan.tip === 'nesneDizisi' ||
              alan.tip === 'uzunMetin' ||
              alan.tip === 'metinDizisi';

            return (
              <div key={alan.ad} className={tamGenislik ? 'sm:col-span-2' : ''}>
                <label
                  htmlFor={`alan-${alan.ad}`}
                  className="etiket-mono mb-1.5 flex items-baseline gap-1.5 text-metin-soluk"
                >
                  {alan.etiket}
                  {alan.zorunlu && <span className="text-tehlike">*</span>}
                  {alan.maskeli && <span className="text-uyari">· kişisel veri</span>}
                  {!duzenlenebilir && <span className="text-uyari">· yetki gerekli</span>}
                </label>

                <AlanBileseni
                  alan={alan}
                  deger={belge ? alanDegeri(belge, alan.ad) : alan.varsayilan}
                  secenekler={alan.hedefKoleksiyon ? iliskiler[alan.ad] : undefined}
                  devreDisi={!duzenlenebilir}
                />

                {alan.yardim && (
                  <p className="mt-1.5 text-xs leading-relaxed text-metin-soluk">{alan.yardim}</p>
                )}
                {alanHatalari[alan.ad] && (
                  <p className="mt-1.5 text-xs text-tehlike">{alanHatalari[alan.ad]}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Eylemler */}
        <div className="flex flex-wrap items-center gap-3 border-t border-kenar pt-4">
          <button
            type="submit"
            disabled={bekliyor}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-vurgu px-5 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak disabled:opacity-60"
          >
            {bekliyor ? 'Kaydediliyor…' : yeniMi ? 'Oluştur' : 'Kaydet'}
            {!bekliyor && <Ok className="size-4" />}
          </button>

          <Link
            href={`/admin/koleksiyon/${yapilandirma.koleksiyon}/`}
            className="text-sm text-metin-ikincil transition-colors hover:text-metin"
          >
            Listeye dön
          </Link>

          {!yeniMi && yapilandirma.silinebilir !== false && (
            <button
              type="button"
              onClick={sil}
              disabled={bekliyor}
              className="ml-auto rounded-lg border border-kenar px-4 py-2 text-sm text-metin-soluk transition-colors hover:border-tehlike hover:text-tehlike disabled:opacity-50"
            >
              Sil
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* --- ALAN BİLEŞENİ -------------------------------------------------------- */

function AlanBileseni({
  alan,
  deger,
  secenekler,
  devreDisi,
}: {
  alan: Alan;
  deger: unknown;
  secenekler?: { deger: string; etiket: string }[];
  devreDisi?: boolean;
}) {
  const kimlik = `alan-${alan.ad}`;

  switch (alan.tip) {
    case 'bloklar':
      return <BlokEditoru ad={alan.ad} baslangic={Array.isArray(deger) ? (deger as Blok[]) : []} />;

    case 'nesneDizisi':
      return (
        <NesneDizisiAlani
          ad={alan.ad}
          altAlanlar={alan.altAlanlar ?? []}
          baslangic={Array.isArray(deger) ? (deger as Record<string, unknown>[]) : []}
        />
      );

    case 'json':
      return (
        <textarea
          id={kimlik}
          name={alan.ad}
          defaultValue={deger === undefined ? '' : JSON.stringify(deger, null, 2)}
          rows={alan.satir ?? 6}
          spellCheck={false}
          disabled={devreDisi}
          className={`${ALAN} font-mono text-xs`}
        />
      );

    case 'uzunMetin':
      return (
        <textarea
          id={kimlik}
          name={alan.ad}
          defaultValue={typeof deger === 'string' ? deger : ''}
          rows={alan.satir ?? 4}
          maxLength={alan.enCok}
          disabled={devreDisi}
          className={ALAN}
        />
      );

    case 'metinDizisi':
      return (
        <textarea
          id={kimlik}
          name={alan.ad}
          defaultValue={Array.isArray(deger) ? (deger as string[]).join('\n') : ''}
          rows={Math.max(3, Array.isArray(deger) ? deger.length + 1 : 3)}
          disabled={devreDisi}
          placeholder="Her satır bir madde"
          className={ALAN}
        />
      );

    case 'mantik':
      return (
        <label className="flex items-center gap-2 py-2 text-sm text-metin-ikincil">
          <input
            id={kimlik}
            type="checkbox"
            name={alan.ad}
            defaultChecked={Boolean(deger ?? alan.varsayilan)}
            disabled={devreDisi}
            className="size-4 accent-[var(--vurgu)]"
          />
          Evet
        </label>
      );

    case 'secim': {
      const mevcut =
        typeof deger === 'string' || typeof deger === 'number'
          ? String(deger)
          : String(alan.varsayilan ?? '');
      /*
       * KAYITLI DEĞER SEÇENEKLER ARASINDA YOKSA KAYBOLMAZ.
       *
       * Tarayıcı, `defaultValue` seçenek listesinde bulunmayan bir `<select>`
       * için İLK seçeneği seçili gösterir. Zorunlu bir alanda bu, kaydı açıp
       * kaydetmenin veriyi SESSİZCE değiştirmesi demektir — kullanıcı hiçbir
       * şeye dokunmasa bile. `araclar.kategori` alanında tam bu oldu: 56
       * kaydın 50'sinin değeri paneldeki 12 seçeneğin dışındaydı.
       *
       * Taksonomi düzeltildi, ama koruma kalıcı: listede olmayan mevcut değer
       * kendi seçeneği olarak basılır ve "listede yok" diye işaretlenir.
       * Editör bilerek değiştirebilir; kaza ile değiştiremez.
       */
      const listede = (alan.secenekler ?? []).some((s) => String(s.deger) === mevcut);
      return (
        <select
          id={kimlik}
          name={alan.ad}
          defaultValue={mevcut}
          disabled={devreDisi}
          className={ALAN}
        >
          {!alan.zorunlu && <option value="">— yok —</option>}
          {mevcut !== '' && !listede && <option value={mevcut}>{mevcut} — listede yok</option>}
          {alan.secenekler?.map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
              {s.tarif ? ` — ${s.tarif}` : ''}
            </option>
          ))}
        </select>
      );
    }

    case 'cokluSecim':
      return (
        <select
          id={kimlik}
          name={alan.ad}
          multiple
          defaultValue={Array.isArray(deger) ? (deger as string[]) : []}
          disabled={devreDisi}
          className={`${ALAN} min-h-24`}
        >
          {alan.secenekler?.map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
            </option>
          ))}
        </select>
      );

    case 'iliski':
      return (
        <select
          id={kimlik}
          name={alan.ad}
          defaultValue={typeof deger === 'string' ? deger : ''}
          disabled={devreDisi}
          className={ALAN}
        >
          <option value="">— yok —</option>
          {(secenekler ?? []).map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
            </option>
          ))}
        </select>
      );

    case 'cokluIliski':
      return (
        <select
          id={kimlik}
          name={alan.ad}
          multiple
          defaultValue={Array.isArray(deger) ? (deger as string[]) : []}
          disabled={devreDisi}
          className={`${ALAN} min-h-24`}
        >
          {(secenekler ?? []).map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
            </option>
          ))}
        </select>
      );

    case 'sayi':
      return (
        <input
          id={kimlik}
          type="number"
          name={alan.ad}
          defaultValue={typeof deger === 'number' ? deger : ''}
          min={alan.enAz}
          max={alan.enCok}
          disabled={devreDisi}
          className={ALAN}
        />
      );

    case 'tarih':
      return (
        <input
          id={kimlik}
          type="date"
          name={alan.ad}
          defaultValue={typeof deger === 'string' ? deger.slice(0, 10) : ''}
          disabled={devreDisi}
          className={ALAN}
        />
      );

    case 'zaman':
      return (
        <input
          id={kimlik}
          type="datetime-local"
          name={alan.ad}
          defaultValue={
            deger instanceof Date
              ? deger.toISOString().slice(0, 16)
              : typeof deger === 'string'
                ? deger.slice(0, 16)
                : ''
          }
          disabled={devreDisi}
          className={ALAN}
        />
      );

    default:
      return (
        <input
          id={kimlik}
          type="text"
          name={alan.ad}
          defaultValue={typeof deger === 'string' ? deger : ''}
          maxLength={alan.enCok}
          disabled={devreDisi}
          spellCheck={alan.tip !== 'slug'}
          className={alan.tip === 'slug' ? `${ALAN} font-mono text-xs` : ALAN}
        />
      );
  }
}

/* --- KÜÇÜK PARÇALAR ------------------------------------------------------- */

export function DurumRozeti({ durum }: { durum: string }) {
  const TON: Record<string, string> = {
    taslak: 'border-kenar-guclu text-metin-soluk',
    incelemede: 'border-uyari/45 bg-uyari/10 text-uyari',
    yayinda: 'border-basari/45 bg-basari/10 text-basari',
    arsiv: 'border-kenar text-metin-soluk',
  };
  const AD: Record<string, string> = {
    taslak: 'Taslak',
    incelemede: 'İncelemede',
    yayinda: 'Yayında',
    arsiv: 'Arşiv',
  };

  return (
    <span className={`etiket-mono rounded-full border px-2.5 py-1 ${TON[durum] ?? TON.taslak}`}>
      {AD[durum] ?? durum}
    </span>
  );
}

function GecisDugmesi({
  onClick,
  bekliyor,
  birincil,
  children,
}: {
  onClick: () => void;
  bekliyor: boolean;
  birincil?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={bekliyor}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        birincil
          ? 'bg-vurgu text-white hover:bg-vurgu-parlak'
          : 'border border-kenar text-metin-ikincil hover:border-vurgu hover:text-metin'
      }`}
    >
      {children}
    </button>
  );
}
