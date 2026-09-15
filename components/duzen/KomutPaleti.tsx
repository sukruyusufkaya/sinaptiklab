'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ara, Kapat, Ok } from '@/components/arayuz/Ikonlar';
import { ARAMA_ONERILERI, ara, type AramaKaydi } from '@/lib/arama';

/**
 * Palet yalnızca açıkken monte edilir (bkz. SiteKabugu); böylece her açılışta
 * sorgu ve seçim kendiliğinden sıfırlanır, effect içinde setState gerekmez.
 *
 * Dizin ve puanlama `lib/arama.ts` içinde; aynı mantık /ara/ sayfası tarafından
 * da kullanılır.
 */
export function KomutPaleti({ kapat }: { kapat: () => void }) {
  const yonlendirici = useRouter();
  const [sorgu, setSorgu] = useState('');
  const [secili, setSecili] = useState(0);
  const girdiRef = useRef<HTMLInputElement>(null);

  /*
   * DİZİN İLK AÇILIŞTA ÇEKİLİR.
   *
   * Dizin ~900 kayıt; site kabuğu her sayfada monte olduğu için prop olarak
   * geçirmek onu her sayfanın yüküne eklerdi. Palet zaten yalnızca açıkken
   * monte ediliyor (bkz. SiteKabugu), dolayısıyla bu getirme paleti gerçekten
   * açan ziyaretçi için bir kez çalışır; yanıt tarayıcıda önbelleğe alınır.
   *
   * Getirme tamamlanana kadar `dizin` boştur ve arama sonuç döndürmez; öneri
   * listesi bu sırada da görünür olduğu için palet boş açılmaz.
   */
  const [dizin, setDizin] = useState<AramaKaydi[]>([]);

  useEffect(() => {
    const iptal = new AbortController();
    fetch('/arama-dizini', { signal: iptal.signal })
      .then((yanit) => (yanit.ok ? yanit.json() : Promise.reject(new Error(String(yanit.status)))))
      .then((veri: { kayitlar?: AramaKaydi[] }) => setDizin(veri.kayitlar ?? []))
      .catch((hata) => {
        if (hata instanceof Error && hata.name !== 'AbortError') {
          console.error('[KomutPaleti] arama dizini alınamadı:', hata);
        }
      });
    return () => iptal.abort();
  }, []);

  const sonuclar = useMemo(() => ara(dizin, sorgu, 12), [dizin, sorgu]);

  useEffect(() => {
    const zaman = setTimeout(() => girdiRef.current?.focus(), 30);
    const onceki = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(zaman);
      document.body.style.overflow = onceki;
    };
  }, []);

  function sorguDegisti(yeni: string) {
    setSorgu(yeni);
    setSecili(0);
  }

  function tusaBas(olay: React.KeyboardEvent) {
    if (olay.key === 'Escape') {
      kapat();
    } else if (olay.key === 'ArrowDown') {
      olay.preventDefault();
      setSecili((s) => (sonuclar.length ? (s + 1) % sonuclar.length : 0));
    } else if (olay.key === 'ArrowUp') {
      olay.preventDefault();
      setSecili((s) => (sonuclar.length ? (s - 1 + sonuclar.length) % sonuclar.length : 0));
    } else if (olay.key === 'Enter') {
      const hedef = sonuclar[secili];
      if (hedef) {
        olay.preventDefault();
        kapat();
        yonlendirici.push(hedef.yol);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Sitede ara">
      <button
        type="button"
        className="absolute inset-0 bg-zemin-derin/75 backdrop-blur-sm"
        onClick={kapat}
        aria-label="Aramayı kapat"
      />

      <div className="giris-animasyonu relative mx-auto mt-[10vh] w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-kenar bg-zemin shadow-yukseltilmis">
        <div className="flex items-center gap-3 border-b border-kenar px-4">
          <Ara className="size-4.5 shrink-0 text-metin-soluk" />
          <input
            ref={girdiRef}
            value={sorgu}
            onChange={(olay) => sorguDegisti(olay.target.value)}
            onKeyDown={tusaBas}
            placeholder="Kavram, model, ders veya sayfa ara…"
            aria-label="Arama"
            className="h-14 flex-1 bg-transparent text-[0.9375rem] text-metin outline-none placeholder:text-metin-soluk"
          />
          <button
            type="button"
            onClick={kapat}
            className="grid size-7 place-items-center rounded-full text-metin-soluk hover:bg-yuzey-2 hover:text-metin"
            aria-label="Kapat"
          >
            <Kapat className="size-4" />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {!sorgu && (
            <div className="p-3">
              <p className="etiket-mono mb-3 text-metin-soluk">Öneriler</p>
              <div className="flex flex-wrap gap-2">
                {ARAMA_ONERILERI.map((oneri) => (
                  <button
                    key={oneri}
                    type="button"
                    onClick={() => sorguDegisti(oneri)}
                    className="rounded-full border border-kenar px-3 py-1.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
                  >
                    {oneri}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-metin-soluk">
                Arama; kavram, model, ders, haber, araştırma ve kurumsal sayfaları birlikte tarar.
                Sonuç bulunamayan sorgular editoryal yol haritasına kaydedilir.
              </p>
            </div>
          )}

          {sorgu && sonuclar.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-metin-ikincil">
                <span className="font-medium text-metin">“{sorgu}”</span> için sonuç yok.
              </p>
              <p className="mt-2 text-xs text-metin-soluk">
                Bu sorgu kaydedildi; içerik açığı panosunda değerlendirilecek.
              </p>
            </div>
          )}

          {sonuclar.map((sonuc, sira) => (
            <button
              key={`${sonuc.yol}-${sonuc.ad}`}
              type="button"
              onMouseEnter={() => setSecili(sira)}
              onClick={() => {
                kapat();
                yonlendirici.push(sonuc.yol);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                sira === secili ? 'bg-yuzey-2' : ''
              }`}
            >
              <span className="etiket-mono w-20 shrink-0 text-metin-soluk">{sonuc.grup}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-metin">{sonuc.ad}</span>
                {sonuc.aciklama && (
                  <span className="block truncate text-xs text-metin-soluk">{sonuc.aciklama}</span>
                )}
              </span>
              <Ok
                className={`size-4 shrink-0 text-metin-soluk ${sira === secili ? 'opacity-100' : 'opacity-0'}`}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-kenar px-4 py-2.5">
          <div className="etiket-mono flex items-center gap-3 text-metin-soluk">
            <span>↑↓ gezin</span>
            <span>↵ aç</span>
            <span>esc kapat</span>
          </div>
          <span className="etiket-mono text-metin-soluk">Sinaptik Search</span>
        </div>
      </div>
    </div>
  );
}
