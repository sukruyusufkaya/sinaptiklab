import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IncelemeDugmesi } from '@/components/admin/GelenEylemleri';
import {
  BaglantiSeridi,
  BosKayit,
  PanelBasligi,
  SayacSeridi,
  Sayfalama,
  TabloKabugu,
  type SeritOgesi,
} from '@/components/admin/PanelListesi';
import { gunMetni } from '@/lib/admin/kisisel-veri';
import { aramaKayitlariniListele, aramaSayaclari } from '@/lib/mongo/sorgular/gelen';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { izinVarMi } from '@/lib/yetki/roller';

export const metadata: Metadata = { title: 'Arama açığı' };
export const dynamic = 'force-dynamic';

/**
 * İçerik açığı panosu — `arama_kayitlari` koleksiyonunun panel yüzeyi.
 *
 * Sonuç üretmeyen arama sorguları en dürüst içerik yol haritasıdır: kullanıcı
 * bir şey aradı, bulamadı. Varsayılan görünüm bu yüzden "sonuç üretmeyen"dir;
 * `icerik_acigi` dizini ({ sonucBulundu: 1, adet: -1 }) tam bu sorgu için var.
 *
 * Kişisel veri saklanmaz: şema yalnızca sorgu metni ve sayaç tutar (ekranın
 * izni bu yüzden `arama:oku`, `kisiselveri:oku` değil).
 *
 * Ekran salt okunurdur; tek yazma yolu editoryal "incelendi" damgasıdır ve o
 * damga `ayar:yaz` ister (moderatör açığı görür, damgayı vurmaz).
 */

const GORUNUM_ETIKETI: Record<string, string> = {
  acik: 'Sonuç üretmeyen',
  incelenmedi: 'İncelenmemiş',
  sonuclu: 'Sonuç dönen',
  tumu: 'Tümü',
};

export default async function AramaSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const kullanici = await oturumGerekli();
  if (!izinVarMi(kullanici.roller, 'arama:oku')) notFound();

  const parametreler = await searchParams;
  const tek = (ad: string): string | undefined => {
    const deger = parametreler[ad];
    return Array.isArray(deger) ? deger[0] : deger;
  };

  // Varsayılan görünüm içerik açığıdır; "tumu" açıkça istenir.
  const istenen = tek('gorunum');
  const gorunum =
    istenen === 'tumu' || istenen === 'sonuclu' || istenen === 'incelenmedi' ? istenen : 'acik';
  const sayfa = Math.max(1, Number(tek('sayfa') ?? '1') || 1);

  const [sayaclar, sonuc] = await Promise.all([
    aramaSayaclari(kullanici),
    aramaKayitlariniListele(kullanici, { gorunum, sayfa }),
  ]);

  const isaretleyebilir = izinVarMi(kullanici.roller, 'ayar:yaz');

  const yolKur = (degisiklikler: { gorunum?: string; sayfa?: string }): string => {
    const p = new URLSearchParams();
    const birlesik = { gorunum, sayfa: String(sayfa), ...degisiklikler };
    for (const [ad, deger] of Object.entries(birlesik)) {
      if (!deger) continue;
      if (ad === 'sayfa' && deger === '1') continue;
      if (ad === 'gorunum' && deger === 'acik') continue;
      p.set(ad, deger);
    }
    const metin = p.toString();
    return `/admin/arama/${metin ? `?${metin}` : ''}`;
  };

  const gorunumler: SeritOgesi[] = (['acik', 'incelenmedi', 'sonuclu', 'tumu'] as const).map(
    (ad) => ({
      ad: GORUNUM_ETIKETI[ad] ?? ad,
      yol: yolKur({ gorunum: ad, sayfa: '1' }),
      etkin: gorunum === ad,
      adet:
        ad === 'acik'
          ? sayaclar.acik
          : ad === 'incelenmedi'
            ? sayaclar.incelenmedi
            : ad === 'tumu'
              ? sayaclar.toplam
              : undefined,
    }),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PanelBasligi
        ustEtiket="OPERASYON"
        baslik="Arama açığı"
        aciklama="Sonuç üretmeyen sorgular en dürüst içerik yol haritasıdır: kullanıcı bir şey aradı ve bulamadı. Kişisel veri saklanmaz; yalnızca sorgu metni ve sayaç tutulur."
      />

      <SayacSeridi
        ogeler={[
          { etiket: 'SORGU', deger: sayaclar.toplam },
          {
            etiket: 'SONUÇ ÜRETMEYEN',
            deger: sayaclar.acik,
            uyari: sayaclar.acik > 0,
          },
          {
            etiket: 'İNCELENMEMİŞ',
            deger: sayaclar.incelenmedi,
            uyari: sayaclar.incelenmedi > 0,
            ipucu: 'Sonuçsuz ve editoryal ekibin henüz değerlendirmediği sorgular',
          },
        ]}
      />

      <BaglantiSeridi etiket="GÖRÜNÜM" ogeler={gorunumler} vurgulu />

      {sonuc.kayitlar.length === 0 ? (
        <BosKayit
          baslik={
            gorunum === 'acik' && sayaclar.toplam > 0
              ? 'Sonuç üretmeyen sorgu yok.'
              : 'Henüz arama kaydı yok.'
          }
          metin={
            gorunum === 'acik' && sayaclar.toplam > 0
              ? 'Kayıtlı her sorgunun karşılığı var. Diğer görünümlerden tüm sorguları inceleyebilirsiniz.'
              : 'Site içi arama kullanıldığında sorgular bu koleksiyona yazılır ve burada sıklığa göre sıralanır.'
          }
        />
      ) : (
        <TabloKabugu
          basliklar={['Adet', 'Sorgu', 'Sonuç', 'Son görülme', 'İnceleme']}
          genislikSinifi="min-w-[46rem]"
        >
          {sonuc.kayitlar.map((kayit) => (
            <tr key={kayit.kimlik} className="border-b border-kenar-soluk last:border-0">
              <td className="px-3 py-2.5 align-top font-mono text-sm tabular-nums text-metin">
                {kayit.adet}
              </td>
              <td className="max-w-80 px-3 py-2.5 align-top text-sm break-words text-metin">
                {kayit.sorgu}
              </td>
              <td className="px-3 py-2.5 align-top text-xs">
                {kayit.sonucBulundu === false ? (
                  <span className="text-uyari">sonuç yok</span>
                ) : kayit.sonucBulundu === true ? (
                  <span className="text-metin-soluk">
                    {kayit.ilkSonucYolu ? (
                      <Link
                        href={kayit.ilkSonucYolu}
                        target="_blank"
                        className="font-mono text-vurgu-parlak"
                      >
                        {kayit.ilkSonucYolu}
                      </Link>
                    ) : (
                      'sonuç var'
                    )}
                  </span>
                ) : (
                  <span className="text-metin-soluk">—</span>
                )}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-xs whitespace-nowrap text-metin-soluk">
                {gunMetni(kayit.sonGorulme)}
              </td>
              <td className="px-3 py-2.5 align-top">
                {isaretleyebilir ? (
                  <IncelemeDugmesi kimlik={kayit.kimlik} inceledi={kayit.inceledi} />
                ) : (
                  <span className="etiket-mono text-metin-soluk">
                    {kayit.inceledi ? 'incelendi' : 'bekliyor'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </TabloKabugu>
      )}

      <p className="text-xs leading-relaxed text-metin-soluk">
        Bu listedeki her sorgu bir içerik fikridir. Karşılığı olan bir Atlas girdisi veya rehber
        açıldığında sorgu kendiliğinden &quot;sonuç dönen&quot; görünümüne geçer; değerlendirilip
        yazılmayacağına karar verilen sorgular ise incelendi olarak işaretlenir.
      </p>

      <Sayfalama
        sayfa={sonuc.sayfa}
        sayfaSayisi={sonuc.sayfaSayisi}
        toplam={sonuc.toplam}
        yolKur={(hedef) => yolKur({ sayfa: String(hedef) })}
      />
    </div>
  );
}
