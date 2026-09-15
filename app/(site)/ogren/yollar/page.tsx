import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { FiltreSeridi } from '@/components/arayuz/Filtreler';
import { Katman, Saat } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { ogrenmeYollari } from '@/lib/icerik/ogrenme';
import { anahtar } from '@/lib/metin';

export const metadata: Metadata = {
  title: 'Öğrenme Yolları',
  description:
    'Role göre yirmi öğrenme rotası: her rota bir hedefe bağlıdır ve bölümleri aynı döngüyle ilerler — teori, örnek, lab, test, proje.',
  alternates: { canonical: '/ogren/yollar/' },
};

/**
 * Rol adından ASCII çapa üretir.
 *
 * Çapa kimliği `id` özniteliğine ve `#...` adresine giriyor; Türkçe harf ve
 * boşluk taşıyamaz. `anahtar()` küçültmeyi yerel ayardan bağımsız yapar —
 * `'I'.toLocaleLowerCase('tr')` çalıştığı makineye göre farklı sonuç verirdi.
 */
function rolCapasi(rol: string): string {
  return `rol-${anahtar(rol)}`;
}

export default async function YollarSayfasi() {
  const OGRENME_YOLLARI = await ogrenmeYollari();

  /*
   * ROL FİLTRESİ ARTIK GERÇEKTEN ÇALIŞIYOR.
   *
   * Önceki sürüm `FiltreSeridi`'ye 12 öğe veriyordu ve HEPSİNİN `yol` alanı
   * `/ogren/yollar/` idi. İki ayrı kusur: (1) React aynı `key` ile iki çocuk
   * uyarısı veriyordu, (2) daha önemlisi, "Yazılımcı" rozetine tıklamak
   * kullanıcıyı aynı sayfaya geri getiriyordu — rozetler süs olmuştu.
   *
   * Çözüm yeni bir rota AÇMAK DEĞİL: `?rol=` gibi bir facet adresi,
   * MASTER-PLAN §51'in "facet kombinasyonları indekslenmez" ilkesine aykırı
   * olurdu. Bunun yerine sayfa role göre BÖLÜMLENDİ ve rozetler o bölümlerin
   * çapalarına bağlandı; adres tekil kalıyor, bağlantı gerçekten bir yere
   * gidiyor ve tarayıcı içi gezinme crawl edilebilir.
   */
  const gruplar = new Map<string, typeof OGRENME_YOLLARI>();
  for (const yol of OGRENME_YOLLARI) {
    gruplar.set(yol.rol, [...(gruplar.get(yol.rol) ?? []), yol]);
  }
  const roller = [...gruplar.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'tr'),
  );

  return (
    <>
      <ListeSemasi
        ad="Öğrenme yolları"
        ogeler={OGRENME_YOLLARI.map((yol) => ({ ad: yol.ad, yol: `/ogren/yollar/${yol.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Öğren', yol: '/ogren/' },
          { ad: 'Öğrenme Yolları', yol: '/ogren/yollar/' },
        ]}
        etiket="LEARN"
        baslik="Öğrenme yolları"
        ozet="Her rota bir hedefe bağlıdır ve bölümleri aynı döngüyle ilerler: teori → örnek → lab → test → proje."
        olcumler={[
          { deger: `${OGRENME_YOLLARI.length}`, etiket: 'Rota' },
          { deger: `${OGRENME_YOLLARI.reduce((t, y) => t + y.bolum, 0)}`, etiket: 'Bölüm' },
          { deger: `${OGRENME_YOLLARI.reduce((t, y) => t + y.saat, 0)} sa`, etiket: 'İçerik' },
          { deger: `${roller.length}`, etiket: 'Rol' },
        ]}
      />

      <Bolum>
        <div className="mb-9">
          <FiltreSeridi
            etiket="Rollere göre"
            aktifYol=""
            ogeler={roller.map(([rol, liste]) => ({
              ad: rol,
              yol: `#${rolCapasi(rol)}`,
              adet: liste.length,
            }))}
          />
        </div>

        <div className="space-y-14">
          {roller.map(([rol, liste]) => (
            <section key={rol} id={rolCapasi(rol)} className="scroll-mt-28">
              <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-kenar-soluk pb-3">
                <h2 className="text-[1.25rem] font-semibold tracking-tight text-metin">{rol}</h2>
                <p className="etiket-mono text-metin-soluk">
                  {liste.length} rota · {liste.reduce((t, y) => t + y.bolum, 0)} bölüm · ~
                  {liste.reduce((t, y) => t + y.saat, 0)} sa
                </p>
              </div>

              <KartIzgarasi kolon={3}>
                {liste.map((yol) => (
                  <Kart
                    key={yol.slug}
                    yol={`/ogren/yollar/${yol.slug}/`}
                    ustEtiket={yol.seviyeAraligi}
                    baslik={yol.ad}
                    aciklama={yol.aciklama}
                    rozetler={yol.cikti.map((cikti) => (
                      <KartEtiketi key={cikti}>{cikti}</KartEtiketi>
                    ))}
                    altBilgi={
                      <span className="inline-flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                          <Katman className="size-3.5" />
                          {yol.bolum} bölüm
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Saat className="size-3.5" />~{yol.saat} sa
                        </span>
                      </span>
                    }
                  />
                ))}
              </KartIzgarasi>
            </section>
          ))}
        </div>
      </Bolum>
    </>
  );
}
