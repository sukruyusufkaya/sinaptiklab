import type { BeceriDugumu } from '@/lib/ogrenme/beceri-veri';

/**
 * Beceri ağının yönlü çizge (DAG) görselleştirmesi.
 *
 * SUNUCU BİLEŞENİ: düzen istek anında hesaplanır, SVG statik biçimde gönderilir.
 * Diyagram hem erişilebilir hem taranabilir kalır (MASTER-PLAN §112).
 *
 * İKİ ŞEY ÖNCEKİ SÜRÜMDEN FARKLI:
 *
 * 1. **Baryantre sıralaması.** Önceki düzen her katmandaki düğümleri tanım
 *    sırasına göre yan yana diziyordu; 17 düğümde idare ediyordu, 35 düğümde
 *    okların birbirini kesmesi diyagramı okunmaz hâle getirirdi. Artık her
 *    düğüm, önkoşullarının ORTALAMA konumuna yakın yerleştirilir — çizge
 *    çiziminde standart barycenter sezgiseli. Kesişim sayısını en aza indirmez
 *    (o problem NP-zor) ama pratikte belirgin biçimde azaltır.
 *
 * 2. **Rota vurgusu.** Kullanıcı bir hedef seçtiğinde diyagram genel bir şema
 *    olmaktan çıkıp O KİŞİNİN yolunu gösterir: rotadaki düğümler ve aralarındaki
 *    kenarlar öne çıkar, kalanı söner. Bir çizgenin değeri çizilmesinde değil,
 *    üzerinde yol bulunabilmesindedir.
 */

const DUGUM_GENISLIK = 150;
const DUGUM_YUKSEKLIK = 42;
const SATIR_ARALIGI = 104;
const KENAR_BOSLUK = 28;
const SOL_SERIT = 92;

type Yerlesim = {
  slug: string;
  ad: string;
  katman: number;
  x: number;
  y: number;
  onkosullar: string[];
};

function yerlesimKur(dugumler: BeceriDugumu[]) {
  const katmanlar = new Map<number, BeceriDugumu[]>();
  for (const dugum of dugumler) {
    katmanlar.set(dugum.derinlik, [...(katmanlar.get(dugum.derinlik) ?? []), dugum]);
  }

  const sirali = [...katmanlar.entries()].sort((a, b) => a[0] - b[0]);
  const enGenis = Math.max(...sirali.map(([, liste]) => liste.length));
  const genislik = Math.max(860, SOL_SERIT + enGenis * (DUGUM_GENISLIK + 22));
  const yukseklik = sirali.length * SATIR_ARALIGI + KENAR_BOSLUK * 2;

  const yerlesim = new Map<string, Yerlesim>();

  for (const [katman, liste] of sirali) {
    // Baryantre: önkoşulları zaten yerleşmiş üst katmanlardadır, çünkü katmanlar
    // derinliğe göre artan sırada işleniyor. Önkoşulu olmayan düğüm ortada durur.
    const agirlikli = liste
      .map((dugum) => {
        const konumlar = dugum.onkosullar
          .map((o) => yerlesim.get(o)?.x)
          .filter((x): x is number => typeof x === 'number');
        const merkez = konumlar.length
          ? konumlar.reduce((t, x) => t + x, 0) / konumlar.length
          : genislik / 2;
        return { dugum, merkez };
      })
      .sort((a, b) => a.merkez - b.merkez || a.dugum.ad.localeCompare(b.dugum.ad, 'tr'));

    const alan = genislik - SOL_SERIT;
    const adim = alan / agirlikli.length;
    agirlikli.forEach(({ dugum }, sira) => {
      yerlesim.set(dugum.slug, {
        slug: dugum.slug,
        ad: dugum.ad,
        katman,
        x: SOL_SERIT + (sira + 0.5) * adim,
        y: KENAR_BOSLUK + katman * SATIR_ARALIGI + DUGUM_YUKSEKLIK / 2,
        onkosullar: dugum.onkosullar,
      });
    });
  }

  return { yerlesim, genislik, yukseklik, katmanSayisi: sirali.length };
}

export function BeceriAgiDiyagrami({
  dugumler,
  vurgulu = [],
}: {
  dugumler: BeceriDugumu[];
  /** Rotadaki düğümler — verildiğinde diyagram bu yolu öne çıkarır. */
  vurgulu?: readonly string[];
}) {
  const { yerlesim, genislik, yukseklik, katmanSayisi } = yerlesimKur(dugumler);
  const yerlesimler = [...yerlesim.values()];
  const vurguKumesi = new Set(vurgulu);
  const rotaVar = vurguKumesi.size > 0;

  const baglar = yerlesimler.flatMap((dugum) =>
    dugum.onkosullar
      .map((onkosul) => yerlesim.get(onkosul))
      .filter((kaynak): kaynak is Yerlesim => Boolean(kaynak))
      .map((kaynak) => ({
        kaynak,
        hedef: dugum,
        // Kenar ancak İKİ UCU da rotadaysa vurgulanır: rotadaki bir düğüme
        // rota dışından gelen ok, kullanıcının atlayacağı bir bağdır.
        vurgulu: vurguKumesi.has(kaynak.slug) && vurguKumesi.has(dugum.slug),
      })),
  );

  return (
    <figure className="overflow-hidden rounded-2xl border border-kenar bg-zemin-derin">
      <div className="overflow-x-auto p-5 sm:p-7">
        <svg
          viewBox={`0 0 ${genislik} ${yukseklik}`}
          className="h-auto w-full min-w-[860px]"
          role="img"
          aria-label={`Beceri ağı: ${yerlesimler.length} kavram, ${baglar.length} önkoşul bağı, ${katmanSayisi} katman${rotaVar ? `. Seçilen rotada ${vurguKumesi.size} kavram vurgulanmış.` : ''}`}
        >
          <defs>
            <marker
              id="beceri-ok"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill="var(--kenar-guclu)" />
            </marker>
            <marker
              id="beceri-ok-vurgu"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill="var(--vurgu)" />
            </marker>
          </defs>

          {/* Katman şeridi */}
          <g>
            {Array.from({ length: katmanSayisi }, (_, katman) => (
              <text
                key={katman}
                x="10"
                y={KENAR_BOSLUK + katman * SATIR_ARALIGI + DUGUM_YUKSEKLIK / 2 + 4}
                fontSize="10"
                fontFamily="var(--font-mono)"
                letterSpacing="0.07em"
                fill="var(--metin-soluk)"
              >
                {katman === 0 ? 'GİRİŞ' : `KATMAN ${katman}`}
              </text>
            ))}
          </g>

          {/* Bağlar — vurgulular en üstte çizilsin diye ikiye ayrıldı. */}
          <g>
            {[...baglar]
              .sort((a, b) => Number(a.vurgulu) - Number(b.vurgulu))
              .map(({ kaynak, hedef, vurgulu: vurguluBag }) => {
                const y1 = kaynak.y + DUGUM_YUKSEKLIK / 2;
                const y2 = hedef.y - DUGUM_YUKSEKLIK / 2;
                const orta = (y1 + y2) / 2;
                const sonuk = rotaVar && !vurguluBag;
                return (
                  <path
                    key={`${kaynak.slug}-${hedef.slug}`}
                    d={`M ${kaynak.x} ${y1} C ${kaynak.x} ${orta}, ${hedef.x} ${orta}, ${hedef.x} ${y2}`}
                    fill="none"
                    stroke={vurguluBag ? 'var(--vurgu)' : 'var(--kenar-guclu)'}
                    strokeWidth={vurguluBag ? '1.75' : '1.25'}
                    strokeOpacity={sonuk ? '0.18' : vurguluBag ? '0.9' : '0.65'}
                    markerEnd={`url(#${vurguluBag ? 'beceri-ok-vurgu' : 'beceri-ok'})`}
                  />
                );
              })}
          </g>

          {/* Düğümler */}
          <g>
            {yerlesimler.map((dugum) => {
              const x = dugum.x - DUGUM_GENISLIK / 2;
              const y = dugum.y - DUGUM_YUKSEKLIK / 2;
              const rotada = vurguKumesi.has(dugum.slug);
              const sonuk = rotaVar && !rotada;

              return (
                <a key={dugum.slug} href={`#kavram-${dugum.slug}`} aria-label={dugum.ad}>
                  <rect
                    x={x}
                    y={y}
                    width={DUGUM_GENISLIK}
                    height={DUGUM_YUKSEKLIK}
                    rx="11"
                    fill={rotada ? 'var(--vurgu-zemin)' : 'var(--yuzey)'}
                    stroke={rotada ? 'var(--vurgu)' : 'var(--kenar)'}
                    strokeWidth={rotada ? '1.75' : '1.25'}
                    opacity={sonuk ? '0.35' : '1'}
                  />
                  <text
                    x={dugum.x}
                    y={dugum.y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight={rotada ? '600' : '500'}
                    fill={rotada ? 'var(--vurgu-parlak)' : 'var(--metin-ikincil)'}
                    opacity={sonuk ? '0.45' : '1'}
                  >
                    {dugum.ad.length > 19 ? `${dugum.ad.slice(0, 18)}…` : dugum.ad}
                  </text>
                </a>
              );
            })}
          </g>
        </svg>
      </div>

      <figcaption className="border-t border-kenar px-5 py-4 sm:px-7">
        <p className="text-xs leading-relaxed text-metin-soluk">
          Oklar önkoşul yönünü gösterir: bir kavrama gelen tüm oklar, onu öğrenmeden önce
          tamamlanması gereken kavramlardır. Aynı katmandaki kavramlar birbirinden bağımsız
          öğrenilebilir.{' '}
          {rotaVar
            ? 'Vurgulu düğümler ve aralarındaki oklar seçtiğiniz rotayı gösterir.'
            : 'Bir hedef seçtiğinizde diyagram size özel rotayı vurgular.'}{' '}
          Düğüme tıklayarak aşağıdaki kavram kartına gidebilirsiniz.
        </p>
      </figcaption>
    </figure>
  );
}
