import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Atlas, Hedef, Kitap, Kod, Ok, Onay, Saat, Terazi } from '@/components/arayuz/Ikonlar';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { SSSSemasi } from '@/lib/seo/jsonld';
import { BeceriAgiDiyagrami } from '@/components/gorsel/BeceriAgiDiyagrami';
import { RotaSecici } from '@/components/ogrenme/RotaSecici';
import { beceriAgi, rotaUret, slugParametresi } from '@/lib/ogrenme/beceri-veri';
import type { BeceriDugumu, RotaAdimi } from '@/lib/ogrenme/beceri-veri';
import { SEVIYE_ADI } from '@/lib/taksonomi';

export const metadata: Metadata = {
  title: 'Beceri Ağı',
  description:
    'Yapay zekâ kavramlarının önkoşul haritası ve rota üreticisi. Hedefinizi seçin, bildiklerinizi işaretleyin; sistem en kısa öğrenme sırasını dersleri ve doğrulama testleriyle birlikte çıkarsın.',
  alternates: { canonical: '/ogren/beceri-grafigi/' },
};

/**
 * Beceri ağı — önkoşul haritası ve ROTA ÜRETİCİSİ.
 *
 * ÖNCEKİ HÂLİN SORUNU şuydu: sayfa 17 düğümlük bir çizge çiziyor ve orada
 * bırakıyordu. Diyagram doğruydu ama üzerinde hiçbir işlem yapılamıyordu;
 * okur "RAG öğrenmek istiyorum, nereden başlayayım" sorusunu sorup cevabı
 * gözle aramak zorundaydı. Bir çizgenin değeri çizilmesinde değil, ÜZERİNDE
 * YOL BULUNABİLMESİNDEDİR.
 *
 * Şimdi sayfa bir araç: hedef seçilir, bilinenler işaretlenir, sistem en kısa
 * önkoşul sırasını çıkarır ve her adıma o kavramı işleyen gerçek dersleri,
 * doğrulayan testleri ve pratik yapılacak lab projelerini bağlar. Seçim URL'de
 * durduğu için kurulan plan paylaşılabilir.
 *
 * DÜĞÜMLER UYDURULMADI: 35 kavramın her biri yayındaki bir Atlas girdisidir ve
 * ders/lab/meslek bağları zaten var olan alanlardan türetilir. Sayfa yeni bir
 * içerik katmanı açmaz; sitede duran 148 dersi ve 100 testi ilk kez "hangi
 * kavram için" sorusuna göre erişilebilir kılar.
 */

const SORULAR = [
  {
    soru: 'Beceri ağı nedir, neden düz bir liste değil?',
    cevap:
      'Öğrenme sırası doğrusal değildir: bazı kavramlar birbirinden bağımsız öğrenilebilirken bazıları belirli bir öncekini zorunlu kılar. Düz bir liste bu iki durumu ayırt edemez ve herkese aynı sırayı dayatır. Yönlü çizge ise hem zorunlu sırayı hem de paralel öğrenilebilecek dalları gösterir; böylece sistem "RAG öğrenmek istiyor ama gömme bilgisi eksik" gibi bir tespiti yapabilir ve rotayı kişiye göre kısaltabilir.',
  },
  {
    soru: 'Süreler nereden geliyor, tahmin mi?',
    cevap:
      'Tahmin değil, toplam. Her adımın süresi o kavramı işleyen yayındaki derslerin gerçek süre alanlarının toplamıdır; uydurma bir "ortalama öğrenme süresi" üretilmez. Bir kavrama bağlı ders yoksa süre sıfır görünür ve bu sıfır emek gerektiği anlamına gelmez — Atlas girdisini okumak yine gerekir. Kişisel hız, ön bilgi ve pratik süresi bu toplamın dışındadır.',
  },
  {
    soru: 'Bir kavramı bildiğimi işaretlersem ne oluyor?',
    cevap:
      'O kavram ve onun tüm önkoşul ağacı rotadan düşer. Mantık şudur: bir kavramı gerçekten biliyorsanız, onu anlamanızı sağlayan alt kavramları da biliyorsunuzdur. Bu yüzden "transformer biliyorum" demek, dikkat mekanizmasını, derin öğrenmeyi ve sinir ağlarını da rotadan çıkarır. Emin değilseniz işaretlemeyin: rotayı gereğinden kısa tutmak, atlanan kavramın ilerideki adımlarda anlaşılmamasına yol açar.',
  },
  {
    soru: 'Önkoşul ilişkileri nasıl belirlendi?',
    cevap:
      'Editoryal olarak. Bu ilişkiler veriden türetilemez; "X\'i anlamak için Y gerekir" bir ölçüm değil bir yargıdır. Her kenar, üst kavramın alt kavramı anlamak için neyi sağladığıyla birlikte yazılır ve rota üretildiğinde bu gerekçe her adımın yanında görünür. Ok çizmek bilgi taşımaz; okun neden orada olduğunu söylemek taşır.',
  },
  {
    soru: 'Bu ağ öğrenme yollarının yerine mi geçiyor?',
    cevap:
      'Hayır, farklı soruları cevaplıyorlar. Öğrenme yolu bir ROLE göre kurulmuş, bölümlere ayrılmış ve sıralanmış bir programdır — "AI Engineer olmak istiyorum" diyene baştan sona bir müfredat verir. Beceri ağı ise tek bir KAVRAMA göre çalışır: "şunu öğrenmem gerekiyor, en kısa yol nedir" sorusuna cevap verir ve bildiklerinize göre kısalır. İkisi birbirini besler; rota adımlarındaki dersler zaten yolların içindeki derslerdir.',
  },
];

export default async function BeceriAgiSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametre = await searchParams;
  const hedefler = slugParametresi(parametre.hedef, 4);
  const bilinenler = slugParametresi(parametre.bilinen);

  const [ag, rota] = await Promise.all([beceriAgi(), rotaUret(hedefler, bilinenler)]);
  const { dugumler } = ag;

  const katmanlar = new Map<number, BeceriDugumu[]>();
  for (const dugum of dugumler) {
    katmanlar.set(dugum.derinlik, [...(katmanlar.get(dugum.derinlik) ?? []), dugum]);
  }
  const katmanListesi = [...katmanlar.entries()].sort((a, b) => a[0] - b[0]);

  const dersSayisi = new Set(dugumler.flatMap((d) => d.dersler.map((x) => x.slug))).size;
  const saat = Math.round(ag.toplamDakika / 60);
  const rotaSaat = rota.toplamDakika / 60;

  return (
    <>
      <SSSSemasi sorular={SORULAR} />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Öğren', yol: '/ogren/' },
          { ad: 'Beceri Ağı', yol: '/ogren/beceri-grafigi/' },
        ]}
        etiket="LEARN"
        baslik="Beceri ağı"
        ozet="Yapay zekâ kavramları bir liste değil yönlü bir ağ oluşturur. Hedefinizi seçin, bildiklerinizi işaretleyin; sistem en kısa öğrenme sırasını derslerle ve doğrulama testleriyle birlikte çıkarsın."
        olcumler={[
          { deger: `${dugumler.length}`, etiket: 'Kavram' },
          { deger: `${ag.toplamBag}`, etiket: 'Önkoşul bağı' },
          { deger: `${katmanListesi.length}`, etiket: 'Katman' },
          { deger: `${dersSayisi}`, etiket: 'Bağlı ders' },
          { deger: `${saat} sa`, etiket: 'Ders içeriği' },
        ]}
        eylemler={
          <>
            <Dugme href="#rota">
              Rotanı kur
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/ogren/yollar/" gorunum="ikincil">
              Rol bazlı yollar
            </Dugme>
          </>
        }
        desen="nokta"
      />

      {/* --- Rota kurucusu --- */}
      <Bolum kimlik="rota" zemin="derin">
        <BolumBasligi
          numara="01"
          etiket="ROTA"
          baslik="Hedefine giden en kısa sıra"
          aciklama="Hedef seçin, bildiklerinizi işaretleyin. Seçim adres çubuğuna yazılır: kurduğunuz planı paylaşabilir, yer imine ekleyebilirsiniz."
        />

        <div className="space-y-6">
          <RotaSecici
            dugumler={dugumler.map((d) => ({
              slug: d.slug,
              ad: d.ad,
              derinlik: d.derinlik,
              kume: d.kume,
              dakika: d.dakika,
            }))}
            hedefler={hedefler}
            bilinenler={bilinenler}
          />

          {rota.bilinmeyen.length > 0 && (
            <p className="rounded-xl border border-uyari/25 bg-uyari/8 px-4 py-3 text-xs leading-relaxed text-uyari">
              Adreste ağda karşılığı olmayan {rota.bilinmeyen.length} slug var (
              {rota.bilinmeyen.join(', ')}) ve yok sayıldı. Bağlantı eski bir sürümden geliyor
              olabilir.
            </p>
          )}

          {rota.adimlar.length > 0 ? (
            <RotaPlani rota={rota} rotaSaat={rotaSaat} />
          ) : hedefler.length > 0 ? (
            <div className="rounded-2xl border border-basari/30 bg-basari/8 px-6 py-10 text-center">
              <p className="etiket-mono mb-2 text-basari">Rota boş</p>
              <p className="mx-auto max-w-lg text-[0.9375rem] leading-relaxed text-metin-ikincil">
                Seçtiğiniz hedef ve önkoşullarının tamamını zaten bildiğinizi işaretlediniz.
                Bildiklerinizden birini kaldırın ya da daha ileri bir hedef seçin.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-kenar-guclu bg-zemin/60 px-6 py-10 text-center">
              <p className="etiket-mono mb-2 text-metin-soluk">Henüz hedef seçilmedi</p>
              <p className="mx-auto max-w-lg text-[0.9375rem] leading-relaxed text-metin-ikincil">
                Yukarıdan bir kavram seçtiğinizde, oraya ulaşmak için hangi kavramların hangi
                sırayla öğrenilmesi gerektiğini, her adımın hangi derslerle çalışılacağını ve hangi
                testle doğrulanacağını çıkarırız.
              </p>
              <ul className="mt-6 flex flex-wrap justify-center gap-2">
                {['rag', 'ai-agent', 'guardrails', 'llmops', 'multimodal-ai'].map((slug) => {
                  const dugum = dugumler.find((d) => d.slug === slug);
                  if (!dugum) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/ogren/beceri-grafigi/?hedef=${slug}#rota`}
                        scroll={false}
                        className="inline-flex items-center gap-2 rounded-full border border-vurgu/35 bg-vurgu-zemin px-4 py-2 text-[0.8125rem] font-medium text-vurgu-parlak transition-colors hover:border-vurgu"
                      >
                        <Hedef className="size-3.5" />
                        {dugum.ad}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </Bolum>

      {/* --- Diyagram --- */}
      <Bolum kimlik="diyagram">
        <BolumBasligi
          numara="02"
          etiket="DİYAGRAM"
          baslik="Ağın tamamı"
          aciklama={
            rota.adimlar.length > 0
              ? 'Rotanızdaki kavramlar ve aralarındaki bağlar vurgulanmış; kalan ağ soluk.'
              : 'Yönlü çizge: her ok bir önkoşul ilişkisini gösterir. SVG olarak üretilir, büyütüldüğünde bozulmaz.'
          }
        />
        <BeceriAgiDiyagrami dugumler={dugumler} vurgulu={rota.adimlar.map((a) => a.slug)} />
      </Bolum>

      {/* --- Katmanlar --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="03"
          etiket="KATMANLAR"
          baslik="Önkoşul derinliğine göre"
          aciklama="Aynı katmandaki kavramlar birbirinden bağımsız öğrenilebilir. Bir alt katmana geçmek için üstteki önkoşulların tamamlanması gerekir."
        />
        <div className="space-y-3">
          {katmanListesi.map(([seviye, liste]) => (
            <div key={seviye} className="rounded-2xl border border-kenar bg-yuzey/40 p-5">
              <div className="mb-3.5 flex flex-wrap items-center gap-3 border-b border-kenar-soluk pb-3">
                <span className="etiket-mono grid size-7 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                  {seviye}
                </span>
                <span className="etiket-mono text-metin-soluk">
                  {seviye === 0 ? 'Giriş katmanı' : `${seviye}. derinlik`} · {liste.length} kavram ·{' '}
                  {Math.round(liste.reduce((t, d) => t + d.dakika, 0) / 60)} sa ders
                </span>
              </div>
              <ul className="flex flex-wrap gap-2">
                {[...liste]
                  .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'))
                  .map((dugum) => (
                    <li key={dugum.slug}>
                      <a
                        href={`#kavram-${dugum.slug}`}
                        className="group flex flex-col rounded-xl border border-kenar bg-zemin/60 px-4 py-2.5 transition-colors hover:border-vurgu/45"
                      >
                        <span className="text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                          {dugum.ad}
                        </span>
                        <span className="etiket-mono mt-1 text-metin-soluk">
                          {dugum.dersler.length} ders · {dugum.acar.length} kavramın önünü açar
                        </span>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Bolum>

      {/* --- Kavram kartları --- */}
      <Bolum>
        <BolumBasligi
          numara="04"
          etiket="KAVRAMLAR"
          baslik="Her kavramın künyesi"
          aciklama="Önkoşulları, önünü açtığı kavramlar, o kavramı işleyen dersler, doğrulayan testler, pratik yapılacak lab projeleri ve hangi mesleklerin ihtiyaç duyduğu."
          baglantiYolu="/atlas/"
          baglantiMetni="AI Atlas"
        />
        <ul className="space-y-4">
          {[...dugumler]
            .sort((a, b) => a.derinlik - b.derinlik || a.ad.localeCompare(b.ad, 'tr'))
            .map((dugum) => (
              <KavramKarti key={dugum.slug} dugum={dugum} dugumler={dugumler} />
            ))}
        </ul>
      </Bolum>

      {/* --- Yöntem --- */}
      <Bolum zemin="derin">
        <BolumBasligi numara="05" etiket="YÖNTEM" baslik="Bu ağ nasıl kuruldu?" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              ad: 'Düğümler uydurulmadı',
              tarif: `Her kavram yayındaki bir Atlas girdisidir; ad, özet ve seviye o kayıttan okunur. Atlas'ta karşılığı olmayan bir kavram ağa hiç girmez, çünkü tıklandığında boş bir sayfa açan bir düğüm bilgi değil gürültüdür.`,
            },
            {
              ad: 'Bağlar türetildi, yazılmadı',
              tarif: `Ders bağı dersin kavram listesinden, lab bağı projenin kavram listesinden, meslek bağı mesleğin ilgili kavramlarından, test bağı ise kavramın konusundan gelir. Dördü de zaten var olan ve bütünlük denetiminden geçen alanlardır.`,
            },
            {
              ad: 'Tek editoryal veri: önkoşul',
              tarif: `Ağda elle yazılan tek şey "X için önce Y gerekir" ilişkisidir ve bu bir ölçüm değil bir yargıdır. Her kenar, üst kavramın neyi sağladığıyla birlikte yazılır; gerekçe rotada her adımın yanında görünür.`,
            },
          ].map((kart) => (
            <div key={kart.ad} className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="text-[0.9375rem] font-semibold tracking-tight text-metin">{kart.ad}</p>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {kart.tarif}
              </p>
            </div>
          ))}
        </div>

        {(ag.eksikAtlas.length > 0 || ag.cizgeHatalari.length > 0) && (
          <div className="mt-6 rounded-xl border border-uyari/25 bg-uyari/8 p-5">
            <p className="etiket-mono mb-2 text-uyari">Ağ tutarlılık uyarısı</p>
            <ul className="space-y-1 text-[0.8125rem] leading-relaxed text-metin-ikincil">
              {ag.eksikAtlas.map((slug) => (
                <li key={slug}>Atlas girdisi bulunamadığı için düşürüldü: {slug}</li>
              ))}
              {ag.cizgeHatalari.map((hata) => (
                <li key={hata}>{hata}</li>
              ))}
            </ul>
          </div>
        )}
      </Bolum>

      <Bolum>
        <div className="olcu">
          <SSSBolumu sorular={SORULAR} />
        </div>
      </Bolum>
    </>
  );
}

/* --- ROTA PLANI ----------------------------------------------------------- */

function RotaPlani({
  rota,
  rotaSaat,
}: {
  rota: Awaited<ReturnType<typeof rotaUret>>;
  rotaSaat: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-vurgu/35">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-vurgu/25 bg-vurgu-zemin/50 px-6 py-5">
        <Ozet deger={`${rota.adimlar.length}`} etiket="Adım" />
        <Ozet
          deger={rotaSaat >= 1 ? `${rotaSaat.toFixed(1)} sa` : `${rota.toplamDakika} dk`}
          etiket="Ders içeriği"
        />
        <Ozet deger={`${rota.testler.length}`} etiket="Doğrulama testi" />
        {rota.atlanan.length > 0 && (
          <Ozet deger={`${rota.atlanan.length}`} etiket="Bildiğiniz için atlandı" />
        )}
      </div>

      <ol className="divide-y divide-kenar-soluk">
        {rota.adimlar.map((adim) => (
          <RotaAdimiSatiri key={adim.slug} adim={adim} />
        ))}
      </ol>

      <div className="space-y-2 border-t border-kenar bg-zemin-derin px-6 py-4">
        <p className="text-xs leading-relaxed text-metin-soluk">
          Süreler, kavramı işleyen yayındaki derslerin gerçek sürelerinin toplamıdır — tahmin
          değildir. Kişisel hız, ön bilgi ve pratik süresi bu toplamın dışındadır; ders bağı olmayan
          bir kavram 0 dakika gösterir ve bu sıfır emek gerektiği anlamına gelmez.
        </p>
        {rota.atlanan.length > 0 && (
          <p className="text-xs leading-relaxed text-metin-soluk">
            Bildiğinizi işaretlediğiniz kavramların önkoşul ağacı da rotadan düşürüldü. Emin
            değilseniz işareti kaldırın: atlanan bir kavram, ilerideki adımların anlaşılmamasına yol
            açar.
          </p>
        )}
      </div>
    </div>
  );
}

function Ozet({ deger, etiket }: { deger: string; etiket: string }) {
  return (
    <span className="flex flex-col">
      <span className="font-mono text-xl tabular-nums text-vurgu-parlak">{deger}</span>
      <span className="etiket-mono text-metin-soluk">{etiket}</span>
    </span>
  );
}

function RotaAdimiSatiri({ adim }: { adim: RotaAdimi }) {
  return (
    <li className="bg-yuzey/25 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
        <div className="lg:w-72 lg:shrink-0">
          <div className="flex items-center gap-3">
            <span className="etiket-mono grid size-7 shrink-0 place-items-center rounded-full border border-vurgu/40 bg-vurgu-zemin text-vurgu-parlak">
              {adim.sira}
            </span>
            <Link
              href={`/atlas/${adim.slug}/`}
              className="text-[1.0625rem] font-semibold tracking-tight text-metin transition-colors hover:text-vurgu-parlak"
            >
              {adim.ad}
            </Link>
          </div>
          <p className="etiket-mono mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-metin-soluk">
            <span>Katman {adim.derinlik}</span>
            {adim.seviye && <span>{SEVIYE_ADI[adim.seviye] ?? adim.seviye}</span>}
            {adim.dakika > 0 && (
              <span className="inline-flex items-center gap-1">
                <Saat className="size-3" />
                {adim.dakika} dk
              </span>
            )}
          </p>
          {/* Okun neden orada olduğu — adımın gerekçesi. */}
          <p className="mt-3 border-l-2 border-vurgu/40 pl-3 text-[0.8125rem] leading-relaxed text-metin-ikincil">
            {adim.kapi}
          </p>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {adim.dersler.length > 0 ? (
            <div>
              <p className="etiket-mono mb-2 text-metin-soluk">
                <Kitap className="mr-1.5 inline size-3.5" />
                Bu kavramı işleyen dersler
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {adim.dersler.slice(0, 6).map((ders) => (
                  <li key={ders.slug}>
                    <Link
                      href={`/ogren/dersler/${ders.slug}/`}
                      className="inline-flex items-center gap-2 rounded-lg border border-kenar bg-zemin/60 px-3 py-1.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-vurgu-parlak"
                    >
                      {ders.ad}
                      <span className="etiket-mono text-metin-soluk">{ders.dakika}dk</span>
                    </Link>
                  </li>
                ))}
                {adim.dersler.length > 6 && (
                  <li className="etiket-mono self-center text-metin-soluk">
                    +{adim.dersler.length - 6} ders daha
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-kenar px-3 py-2 text-[0.8125rem] text-metin-soluk">
              Bu kavram için henüz ders yayımlanmadı; Atlas girdisi tek kaynak.
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {adim.testler.length > 0 && (
              <div className="min-w-0">
                <p className="etiket-mono mb-2 text-metin-soluk">
                  <Terazi className="mr-1.5 inline size-3.5" />
                  Doğrulama
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {adim.testler.slice(0, 2).map((test) => (
                    <li key={test.slug}>
                      <Link
                        href={`/testler/${test.slug}/`}
                        className="etiket-mono inline-flex items-center gap-1.5 rounded-full border border-kenar px-2.5 py-1 text-metin-soluk transition-colors hover:border-vurgu/45 hover:text-vurgu-parlak"
                      >
                        {test.ad}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {adim.lab.length > 0 && (
              <div className="min-w-0">
                <p className="etiket-mono mb-2 text-metin-soluk">
                  <Kod className="mr-1.5 inline size-3.5" />
                  Pratik
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {adim.lab.slice(0, 2).map((proje) => (
                    <li key={proje.slug}>
                      <Link
                        href={`/lab/${proje.slug}/`}
                        className="etiket-mono inline-flex items-center gap-1.5 rounded-full border border-kenar px-2.5 py-1 text-metin-soluk transition-colors hover:border-vurgu/45 hover:text-vurgu-parlak"
                      >
                        {proje.ad}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/* --- KAVRAM KARTI --------------------------------------------------------- */

function KavramKarti({ dugum, dugumler }: { dugum: BeceriDugumu; dugumler: BeceriDugumu[] }) {
  const adOf = (slug: string) => dugumler.find((d) => d.slug === slug)?.ad ?? slug;

  return (
    <li
      id={`kavram-${dugum.slug}`}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-kenar bg-yuzey/40"
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-kenar-soluk bg-zemin-derin px-6 py-4">
        <span className="etiket-mono grid size-7 shrink-0 place-items-center rounded-full border border-kenar text-metin-soluk">
          {dugum.derinlik}
        </span>
        <Link
          href={`/atlas/${dugum.slug}/`}
          className="inline-flex items-center gap-2 text-[1.0625rem] font-semibold tracking-tight text-metin transition-colors hover:text-vurgu-parlak"
        >
          <Atlas className="size-4 text-metin-soluk" />
          {dugum.ad}
        </Link>
        {dugum.seviye && (
          <span className="etiket-mono rounded-full border border-kenar px-2.5 py-1 text-metin-soluk">
            {SEVIYE_ADI[dugum.seviye] ?? dugum.seviye}
          </span>
        )}
        {dugum.konuAdi && (
          <Link
            href={`/konu/${dugum.konuSlug}/`}
            className="etiket-mono ml-auto text-metin-soluk transition-colors hover:text-vurgu-parlak"
          >
            {dugum.konuAdi}
          </Link>
        )}
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div>
          <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">{dugum.kapi}</p>

          <div className="mt-5 space-y-3">
            <BagSatiri
              etiket="Önce gerekir"
              bos="Giriş kavramı — önkoşulu yok."
              sluglar={dugum.onkosullar}
              adOf={adOf}
            />
            <BagSatiri
              etiket="Önünü açar"
              bos="Ağın ucunda; bu kavrama dayanan başka kavram yok."
              sluglar={dugum.acar}
              adOf={adOf}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Sayac deger={dugum.dersler.length} etiket="ders" ek={`${dugum.dakika} dk`} />
            <Sayac deger={dugum.testler.length} etiket="test" />
            <Sayac deger={dugum.lab.length} etiket="lab projesi" />
            <Sayac deger={dugum.meslekler.length} etiket="meslek ihtiyaç duyuyor" />
          </div>

          {dugum.meslekler.length > 0 && (
            <div>
              <p className="etiket-mono mb-2 text-metin-soluk">Bu kavrama ihtiyaç duyan roller</p>
              <ul className="flex flex-wrap gap-1.5">
                {dugum.meslekler.map((meslek) => (
                  <li key={meslek.slug}>
                    <Link
                      href={`/kariyer/${meslek.slug}/`}
                      className="etiket-mono inline-flex rounded-full border border-kenar bg-zemin/60 px-2.5 py-1 text-metin-soluk transition-colors hover:border-vurgu/45 hover:text-vurgu-parlak"
                    >
                      {meslek.ad}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-kenar-soluk pt-4">
            <Link
              href={`/ogren/beceri-grafigi/?hedef=${dugum.slug}#rota`}
              scroll={false}
              className="inline-flex items-center gap-2 rounded-full border border-vurgu/40 bg-vurgu-zemin px-4 py-2 text-[0.8125rem] font-medium text-vurgu-parlak transition-colors hover:border-vurgu"
            >
              <Hedef className="size-3.5" />
              Buraya giden rotayı kur
            </Link>
            <Link
              href={`/ogren/beceri-grafigi/?bilinen=${dugum.slug}#rota`}
              scroll={false}
              className="inline-flex items-center gap-2 rounded-full border border-kenar px-4 py-2 text-[0.8125rem] font-medium text-metin-soluk transition-colors hover:border-basari/45 hover:text-basari"
            >
              <Onay className="size-3.5" />
              Bunu biliyorum
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

function BagSatiri({
  etiket,
  bos,
  sluglar,
  adOf,
}: {
  etiket: string;
  bos: string;
  sluglar: string[];
  adOf: (slug: string) => string;
}) {
  return (
    <div>
      <p className="etiket-mono mb-1.5 text-metin-soluk">{etiket}</p>
      {sluglar.length === 0 ? (
        <p className="text-[0.8125rem] text-metin-soluk">{bos}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {sluglar.map((slug) => (
            <li key={slug}>
              <a
                href={`#kavram-${slug}`}
                className="inline-flex rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-0.5 text-[0.75rem] text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-vurgu-parlak"
              >
                {adOf(slug)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sayac({ deger, etiket, ek }: { deger: number; etiket: string; ek?: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="font-mono text-lg tabular-nums text-metin">{deger}</span>
      <span className="etiket-mono text-metin-soluk">
        {etiket}
        {ek && deger > 0 ? ` · ${ek}` : ''}
      </span>
    </span>
  );
}
