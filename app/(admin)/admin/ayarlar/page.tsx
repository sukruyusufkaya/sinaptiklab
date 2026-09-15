import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AyarlarFormu, type AyarGorunumu } from '@/components/admin/AyarlarFormu';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR, TANIMLAR } from '@/lib/mongo/koleksiyonlar';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { izinVarMi } from '@/lib/yetki/roller';

export const metadata: Metadata = { title: 'Ayarlar' };
export const dynamic = 'force-dynamic';

/** Tanınan ayar anahtarları. Serbest anahtar yazılamaz — güvenli varsayılan. */
const TANIMLI_AYARLAR = [
  {
    anahtar: 'bakim-kipi',
    ad: 'Bakım kipi',
    tip: 'mantik' as const,
    aciklama: 'Açıkken site ziyaretçilere bakım sayfası gösterir. Panel etkilenmez.',
    varsayilan: false,
  },
  {
    anahtar: 'duyuru-seridi',
    ad: 'Duyuru şeridi',
    tip: 'metin' as const,
    aciklama: 'Sitenin üstünde görünen tek satırlık duyuru. Boşsa şerit gösterilmez.',
    varsayilan: '',
  },
  {
    anahtar: 'manset-slug',
    ad: 'Manşet içeriği',
    tip: 'metin' as const,
    aciklama: 'Ana sayfada manşete çıkacak içeriğin slug değeri. Boşsa en yeni içerik.',
    varsayilan: '',
  },
  {
    anahtar: 'bulten-aktif',
    ad: 'Bülten kaydı açık',
    tip: 'mantik' as const,
    aciklama: 'Kapalıyken bülten formları devre dışı görünür.',
    varsayilan: true,
  },
];

export default async function AyarlarSayfasi() {
  const kullanici = await oturumGerekli();
  if (!izinVarMi(kullanici.roller, 'ayar:yaz')) notFound();

  const db = await veritabani();
  const kayitlar = await db.collection(KOLEKSIYONLAR.ayarlar).find({}).toArray();
  const harita = new Map(kayitlar.map((k) => [String(k.anahtar), k.deger]));

  const ayarlar: AyarGorunumu[] = TANIMLI_AYARLAR.map((tanim) => ({
    ...tanim,
    deger: harita.has(tanim.anahtar) ? harita.get(tanim.anahtar) : tanim.varsayilan,
  }));

  /* Sistem durumu — canlıya çıkış öncesi hızlı kontrol. */
  const dizinSayimlari = await Promise.all(
    TANIMLAR.map(async (tanim) => ({
      ad: tanim.ad,
      belge: await db.collection(tanim.ad).countDocuments(),
      dizin: (await db.collection(tanim.ad).indexes()).length,
    })),
  );

  const toplamBelge = dizinSayimlari.reduce((t, k) => t + k.belge, 0);
  const toplamDizin = dizinSayimlari.reduce((t, k) => t + k.dizin, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <p className="etiket-mono text-metin-soluk">YÖNETİM</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">Ayarlar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-ikincil">
          Yalnızca tanımlı anahtarlar yazılabilir; serbest anahtar kabul edilmez. Her değişiklik
          denetim kaydına düşer.
        </p>
      </div>

      <AyarlarFormu ayarlar={ayarlar} />

      {/* Sistem durumu */}
      <section className="rounded-xl border border-kenar bg-yuzey/40 p-5">
        <h2 className="etiket-mono mb-3 text-metin">SİSTEM DURUMU</h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          {[
            { etiket: 'Koleksiyon', deger: TANIMLAR.length },
            { etiket: 'Belge', deger: toplamBelge },
            { etiket: 'Dizin', deger: toplamDizin },
          ].map((oge) => (
            <div key={oge.etiket}>
              <dt className="etiket-mono text-metin-soluk">{oge.etiket}</dt>
              <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-metin">
                {oge.deger}
              </dd>
            </div>
          ))}
        </dl>

        <details className="mt-4 border-t border-kenar-soluk pt-3">
          <summary className="etiket-mono cursor-pointer text-metin-soluk">
            koleksiyon kırılımı
          </summary>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {dizinSayimlari
              .slice()
              .sort((a, b) => b.belge - a.belge)
              .map((k) => (
                <li key={k.ad} className="flex items-baseline justify-between gap-2 text-xs">
                  <code className="font-mono text-metin-ikincil">{k.ad}</code>
                  <span className="font-mono tabular-nums text-metin-soluk">
                    {k.belge} belge · {k.dizin} dizin
                  </span>
                </li>
              ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
