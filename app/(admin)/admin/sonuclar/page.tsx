import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BaglantiSeridi,
  BosKayit,
  PanelBasligi,
  SaklamaHucresi,
  SayacSeridi,
  Sayfalama,
  TabloKabugu,
  type SeritOgesi,
} from '@/components/admin/PanelListesi';
import { saklamaDurumu, zamanMetni } from '@/lib/admin/kisisel-veri';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  gelenKaydiAc,
  readinessSonuclariniListele,
  sonucSayaclari,
  testSluglari,
  testSonuclariniListele,
  type SonucSayaclari,
} from '@/lib/mongo/sorgular/gelen';
import { istemciAdresi } from '@/lib/yetki/oran-sinirlama';
import { oturumGerekli, type OturumKullanicisi } from '@/lib/yetki/oturum';
import { izinVarMi } from '@/lib/yetki/roller';

export const metadata: Metadata = { title: 'Sonuçlar' };
export const dynamic = 'force-dynamic';

/**
 * Test ve AI Readiness sonuçları.
 *
 * Gelen kutusuyla aynı gerekçe: iki koleksiyon da siteden gelen kişisel veri,
 * aynı izinle açılır, aynı saklama okumasını paylaşır. Sekme bağlantıdır
 * (`?bolum=`), JS durumu değildir.
 *
 * Ekran SALT OKUNURDUR ve iş akışı damgası da yoktur: bir test çözümü veya
 * değerlendirme "işlenmez", yalnızca okunur ve saklama süresi sonunda TTL ile
 * silinir. Ortalama puanlar GERÇEK kayıtlardan hesaplanır; kayıt yoksa "—"
 * basılır, örnek sayı gösterilmez.
 */

export default async function SonuclarSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const kullanici = await oturumGerekli();
  if (!izinVarMi(kullanici.roller, 'kisiselveri:oku')) notFound();

  const parametreler = await searchParams;
  const tek = (ad: string): string | undefined => {
    const deger = parametreler[ad];
    return Array.isArray(deger) ? deger[0] : deger;
  };

  const bolum = tek('bolum') === 'readiness' ? 'readiness' : 'test';
  const sayfa = Math.max(1, Number(tek('sayfa') ?? '1') || 1);
  const testSlug = tek('testSlug');
  const iletisimIzni = tek('iletisimIzni');
  const acilanKimlik = tek('tam');

  const sayaclar = await sonucSayaclari(kullanici);
  const hamGorebilir = izinVarMi(kullanici.roller, 'kisiselveri:disaAktar');

  const yolKur = (degisiklikler: Record<string, string | undefined>): string => {
    const p = new URLSearchParams();
    const birlesik: Record<string, string | undefined> = {
      bolum,
      testSlug,
      iletisimIzni,
      sayfa: String(sayfa),
      ...degisiklikler,
    };
    for (const [ad, deger] of Object.entries(birlesik)) {
      if (!deger || deger === 'tumu') continue;
      if (ad === 'sayfa' && deger === '1') continue;
      if (ad === 'bolum' && deger === 'test') continue;
      p.set(ad, deger);
    }
    const metin = p.toString();
    return `/admin/sonuclar/${metin ? `?${metin}` : ''}`;
  };

  const sekmeler: SeritOgesi[] = [
    {
      ad: 'Test sonuçları',
      yol: '/admin/sonuclar/',
      adet: sayaclar.test.toplam,
      etkin: bolum === 'test',
    },
    {
      ad: 'AI Readiness',
      yol: '/admin/sonuclar/?bolum=readiness',
      adet: sayaclar.readiness.toplam,
      etkin: bolum === 'readiness',
    },
  ];

  const acilan =
    acilanKimlik && hamGorebilir
      ? await gelenKaydiAc({
          kullanici,
          koleksiyon:
            bolum === 'readiness' ? KOLEKSIYONLAR.readinessSonuclari : KOLEKSIYONLAR.testSonuclari,
          kimlik: acilanKimlik,
          adres: await istemciAdresi(),
        })
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PanelBasligi
        ustEtiket="YÖNETİM"
        baslik="Sonuçlar"
        aciklama="Test çözümleri ve AI Readiness değerlendirmeleri. Kayıtlar saklama süresi sonunda TTL dizini ile silinir; süresi geçmiş kayıtlar bu ekranda işaretlidir."
        yan={
          <Link
            href="/admin/kisisel-veri/"
            className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
          >
            KVKK envanteri →
          </Link>
        }
      />

      <BaglantiSeridi etiket="BÖLÜM" ogeler={sekmeler} vurgulu />

      {bolum === 'test' ? (
        <TestBolumu
          kullanici={kullanici}
          sayfa={sayfa}
          testSlug={testSlug}
          sayaclar={sayaclar.test}
          yolKur={yolKur}
          hamGorebilir={hamGorebilir}
        />
      ) : (
        <ReadinessBolumu
          kullanici={kullanici}
          sayfa={sayfa}
          iletisimIzni={iletisimIzni}
          sayaclar={sayaclar.readiness}
          yolKur={yolKur}
          hamGorebilir={hamGorebilir}
        />
      )}

      {acilan && (
        <section className="rounded-xl border border-uyari/35 bg-uyari/10 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="etiket-mono text-uyari">HAM KAYIT · MASKESİZ</h2>
            <Link
              href={yolKur({ tam: undefined })}
              className="text-xs text-metin-ikincil underline underline-offset-2"
            >
              kapat
            </Link>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-metin-ikincil">
            Bu görüntüleme denetim kaydına <code className="font-mono">disa-aktar</code> olarak
            yazıldı.
          </p>
          <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[10rem_1fr]">
            {acilan.alanlar.map((alan) => (
              <div key={alan.anahtar} className="grid gap-x-6 sm:col-span-2 sm:grid-cols-subgrid">
                <dt className="font-mono text-xs text-metin-soluk">{alan.anahtar}</dt>
                <dd className="font-mono text-xs break-words text-metin">{alan.deger}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

/* --- TEST SONUÇLARI ------------------------------------------------------- */

async function TestBolumu({
  kullanici,
  sayfa,
  testSlug,
  sayaclar,
  yolKur,
  hamGorebilir,
}: {
  kullanici: OturumKullanicisi;
  sayfa: number;
  testSlug?: string;
  sayaclar: SonucSayaclari['test'];
  yolKur: (degisiklikler: Record<string, string | undefined>) => string;
  hamGorebilir: boolean;
}) {
  const [sonuc, sluglar] = await Promise.all([
    testSonuclariniListele(kullanici, { sayfa, testSlug }),
    testSluglari(kullanici),
  ]);

  const slugSeridi: SeritOgesi[] = [
    { ad: 'Tümü', yol: yolKur({ testSlug: 'tumu', sayfa: '1' }), etkin: !testSlug },
    ...sluglar.map((oge) => ({
      ad: oge.slug,
      yol: yolKur({ testSlug: oge.slug, sayfa: '1' }),
      adet: oge.adet,
      etkin: testSlug === oge.slug,
    })),
  ];

  return (
    <div className="space-y-4">
      <SayacSeridi
        ogeler={[
          { etiket: 'TOPLAM', deger: sayaclar.toplam },
          {
            etiket: 'ORTALAMA PUAN',
            deger: sayaclar.ortalamaPuan ?? '—',
            ipucu: 'Yalnızca gerçek kayıtların ortalaması; kayıt yoksa boş',
          },
          {
            etiket: 'SÜRESİ GEÇMİŞ',
            deger: sayaclar.suresiGecmis,
            uyari: sayaclar.suresiGecmis > 0,
          },
          {
            etiket: 'SAKLAMA SÜRESİ YOK',
            deger: sayaclar.saklamasiz,
            uyari: sayaclar.saklamasiz > 0,
            ipucu: 'saklamaBitis alanı olmayan kayıtlar TTL ile silinmez',
          },
        ]}
      />

      {/* Süzgeç şeridi yalnızca veri varken anlamlı; boş koleksiyonda gizlenir. */}
      {sluglar.length > 0 && <BaglantiSeridi etiket="TEST" ogeler={slugSeridi} />}

      {sonuc.kayitlar.length === 0 ? (
        <BosKayit
          baslik={testSlug ? 'Bu ölçütlere uyan kayıt yok.' : 'Henüz test sonucu yok.'}
          metin="Bir test çözüldüğünde sonuç bu listeye düşer. Liste yalnızca gerçek çözümleri gösterir."
        />
      ) : (
        <TabloKabugu
          basliklar={['Zaman', 'Test', 'Puan', 'Doğru', 'Seviye', 'Süre', 'Hesap', 'Saklama']}
        >
          {sonuc.kayitlar.map((kayit) => {
            const saklama = saklamaDurumu(kayit.saklamaBitis);
            return (
              <tr key={kayit.kimlik} className="border-b border-kenar-soluk last:border-0">
                <td className="px-3 py-2.5 align-top font-mono text-xs whitespace-nowrap text-metin-soluk">
                  {zamanMetni(kayit.olusturuldu)}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-xs text-metin">
                  {kayit.testSlug}
                  {hamGorebilir && (
                    <Link
                      href={yolKur({ tam: kayit.kimlik })}
                      className="ml-2 text-vurgu-parlak underline underline-offset-2"
                    >
                      aç
                    </Link>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-sm tabular-nums text-metin">
                  {kayit.puan ?? '—'}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-xs tabular-nums text-metin-ikincil">
                  {kayit.dogruSayisi ?? '—'}/{kayit.soruSayisi ?? '—'}
                </td>
                <td className="px-3 py-2.5 align-top text-xs text-metin-ikincil">
                  {kayit.seviye ?? '—'}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-xs tabular-nums text-metin-soluk">
                  {typeof kayit.sureSaniye === 'number' ? `${kayit.sureSaniye} sn` : '—'}
                </td>
                <td className="px-3 py-2.5 align-top text-xs text-metin-soluk">
                  {kayit.hesabaBagli ? 'bağlı' : 'anonim'}
                </td>
                <td className="px-3 py-2.5 align-top whitespace-nowrap">
                  <SaklamaHucresi
                    metin={saklama.metin}
                    gecti={saklama.gecti}
                    tanimli={saklama.tanimli}
                  />
                </td>
              </tr>
            );
          })}
        </TabloKabugu>
      )}

      <Sayfalama
        sayfa={sonuc.sayfa}
        sayfaSayisi={sonuc.sayfaSayisi}
        toplam={sonuc.toplam}
        yolKur={(hedef) => yolKur({ sayfa: String(hedef) })}
      />
    </div>
  );
}

/* --- READINESS ------------------------------------------------------------ */

async function ReadinessBolumu({
  kullanici,
  sayfa,
  iletisimIzni,
  sayaclar,
  yolKur,
  hamGorebilir,
}: {
  kullanici: OturumKullanicisi;
  sayfa: number;
  iletisimIzni?: string;
  sayaclar: SonucSayaclari['readiness'];
  yolKur: (degisiklikler: Record<string, string | undefined>) => string;
  hamGorebilir: boolean;
}) {
  const sonuc = await readinessSonuclariniListele(kullanici, { sayfa, iletisimIzni });

  const izinSeridi: SeritOgesi[] = [
    { ad: 'Tümü', yol: yolKur({ iletisimIzni: 'tumu', sayfa: '1' }), etkin: !iletisimIzni },
    {
      ad: 'İletişim izni verenler',
      yol: yolKur({ iletisimIzni: 'true', sayfa: '1' }),
      adet: sayaclar.iletisimIzinli,
      etkin: iletisimIzni === 'true',
    },
  ];

  return (
    <div className="space-y-4">
      <SayacSeridi
        ogeler={[
          { etiket: 'TOPLAM', deger: sayaclar.toplam },
          {
            etiket: 'ORTALAMA PUAN',
            deger: sayaclar.ortalamaPuan ?? '—',
            ipucu: 'Yalnızca gerçek kayıtların ortalaması; kayıt yoksa boş',
          },
          { etiket: 'İLETİŞİM İZNİ', deger: sayaclar.iletisimIzinli },
          {
            etiket: 'SÜRESİ GEÇMİŞ',
            deger: sayaclar.suresiGecmis,
            uyari: sayaclar.suresiGecmis > 0,
          },
          {
            etiket: 'SAKLAMA SÜRESİ YOK',
            deger: sayaclar.saklamasiz,
            uyari: sayaclar.saklamasiz > 0,
            ipucu: 'saklamaBitis alanı olmayan kayıtlar TTL ile silinmez',
          },
        ]}
      />

      <BaglantiSeridi etiket="İZİN" ogeler={izinSeridi} />

      {sonuc.kayitlar.length === 0 ? (
        <BosKayit
          baslik={iletisimIzni ? 'Bu ölçütlere uyan kayıt yok.' : 'Henüz değerlendirme yok.'}
          metin="AI Readiness kaydı yalnızca kullanıcı sonucunu paylaşmayı seçtiğinde oluşur; liste yalnızca o kayıtları gösterir."
        />
      ) : (
        <TabloKabugu
          basliklar={[
            'Zaman',
            'Kurum',
            'Sektör',
            'Çalışan',
            'Puan',
            'Olgunluk',
            'İletişim',
            'Saklama',
          ]}
          genislikSinifi="min-w-[58rem]"
        >
          {sonuc.kayitlar.map((kayit) => {
            const saklama = saklamaDurumu(kayit.saklamaBitis);
            return (
              <tr key={kayit.kimlik} className="border-b border-kenar-soluk last:border-0">
                <td className="px-3 py-2.5 align-top font-mono text-xs whitespace-nowrap text-metin-soluk">
                  {zamanMetni(kayit.olusturuldu)}
                </td>
                <td className="max-w-48 px-3 py-2.5 align-top text-xs break-words text-metin">
                  {kayit.kurumAdi ?? '—'}
                  {hamGorebilir && (
                    <Link
                      href={yolKur({ tam: kayit.kimlik })}
                      className="ml-2 text-vurgu-parlak underline underline-offset-2"
                    >
                      aç
                    </Link>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-xs text-metin-ikincil">
                  {kayit.sektorSlug ?? '—'}
                </td>
                <td className="px-3 py-2.5 align-top text-xs text-metin-ikincil">
                  {kayit.calisanAraligi ?? '—'}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-sm tabular-nums text-metin">
                  {kayit.toplamPuan ?? '—'}
                  <span className="ml-1 font-mono text-[0.625rem] text-metin-soluk">
                    {kayit.boyutSayisi > 0 ? `${kayit.boyutSayisi} boyut` : ''}
                  </span>
                </td>
                <td className="px-3 py-2.5 align-top text-xs text-metin-ikincil">
                  {kayit.olgunlukSeviyesi ?? '—'}
                </td>
                <td className="px-3 py-2.5 align-top text-xs">
                  {kayit.iletisimIzni ? (
                    <span className="text-basari">izin var</span>
                  ) : (
                    <span className="text-metin-soluk">izin yok</span>
                  )}
                  {kayit.eposta && (
                    <span className="mt-0.5 block font-mono text-[0.625rem] text-metin-soluk">
                      {kayit.eposta}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top whitespace-nowrap">
                  <SaklamaHucresi
                    metin={saklama.metin}
                    gecti={saklama.gecti}
                    tanimli={saklama.tanimli}
                  />
                </td>
              </tr>
            );
          })}
        </TabloKabugu>
      )}

      <p className="text-xs leading-relaxed text-metin-soluk">
        İletişim izni olmayan kayıtlara e-posta atılmaz; izin alanı boş olan satırda e-posta varsa
        bu bir veri hatasıdır ve kayıt silinmelidir.
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
