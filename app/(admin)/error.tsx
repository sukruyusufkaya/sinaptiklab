'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Panel hata sınırı.
 *
 * Editörün ekranı site ziyaretçisinin ekranından farklı davranır: burada hata
 * ayıklamaya yarayan bilgi GİZLENMEZ, çünkü paneli yalnızca kimliği doğrulanmış
 * personel görür ve bir kaydı kaybetmemek için ne olduğunu bilmek ister.
 * Yine de yığın izi basılmaz — `digest` ile sunucu günlüğüne bakılır.
 *
 * Kapsam `(admin)` rota grubudur; düzenin kendisi (yetki kapısı) hata verirse
 * `app/global-error.tsx` devreye girer.
 */

export default function PanelHataSinir({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[panel] hata', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="etiket-mono text-uyari">PANEL HATASI</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-metin">
        Bu ekran yüklenemedi.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-metin-ikincil">
        Kaydedilmemiş bir düzenlemeniz varsa <strong>sekmeyi kapatmayın</strong>: geri gidip formu
        yeniden açtığınızda alanlar veritabanındaki son hâli gösterir. Hata sürüyorsa aşağıdaki
        numarayı geliştirmeye iletin.
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-xs text-metin-soluk">
          digest: <span className="text-metin-ikincil">{error.digest}</span>
        </p>
      )}
      {error.message && (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-kenar bg-yuzey/40 px-3 py-2 font-mono text-xs text-metin-ikincil">
          {error.message}
        </pre>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center rounded-lg bg-vurgu px-4 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak"
        >
          Yeniden dene
        </button>
        <Link
          href="/admin/"
          className="text-sm text-metin-ikincil underline underline-offset-4 transition-colors hover:text-metin"
        >
          gösterge paneline dön
        </Link>
      </div>
    </div>
  );
}
