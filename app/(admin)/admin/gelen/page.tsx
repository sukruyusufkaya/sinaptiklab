import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IslemDurumuDugmeleri } from '@/components/admin/GelenEylemleri';
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
import {
  FORM_TURLERI,
  FORM_TURU_ADI,
  ISLEM_DURUMLARI,
  ISLEM_DURUMU_ADI,
  ONAY_DURUMLARI,
  ONAY_DURUMU_ADI,
} from '@/lib/admin/gelen-sabitleri';
import { saklamaDurumu, zamanMetni } from '@/lib/admin/kisisel-veri';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  aboneleriListele,
  formKayitlariniListele,
  gelenKaydiAc,
  gelenSayaclari,
  type GelenSayaclari,
} from '@/lib/mongo/sorgular/gelen';
import { istemciAdresi } from '@/lib/yetki/oran-sinirlama';
import { oturumGerekli, type OturumKullanicisi } from '@/lib/yetki/oturum';
import { izinVarMi } from '@/lib/yetki/roller';

export const metadata: Metadata = { title: 'Gelen kutusu' };
export const dynamic = 'force-dynamic';

/**
 * Gelen kutusu: form kayıtları ve bülten aboneleri.
 *
 * NEDEN TEK EKRAN, İKİ SEKME: iki koleksiyon da siteden gelen KİŞİSEL VERİdir,
 * aynı izinle (`kisiselveri:oku`) açılır, aynı KVKK uyarısını ve aynı saklama
 * okumasını paylaşır. Ayrı rotalara bölmek bu başlığı ve uyarıyı kopyalar,
 * gezinmeye iki öge daha ekler ve editörün "gelen ne var" sorusunu iki tıka
 * yayar. Sekme JS durumu değil BAĞLANTI (`?bolum=`): geri düğmesi çalışır,
 * bağlantı paylaşılabilir.
 *
 * Ekran SALT OKUNURDUR. Düzenleme formu yok — bu kayıtlar kullanıcı girdisidir,
 * editör içeriğini düzeltmez. Tek istisna `islemDurumu` kuyruk damgasıdır.
 *
 * MASKELEME: e-posta ve kişiye ait form alanları maskeli basılır. Ham kayıt
 * `?tam=<kimlik>` ile açılır; o yol `kisiselveri:disaAktar` ister ve her
 * açılışta denetim kaydı yazar (bkz. `gelenKaydiAc`).
 */

type Bolum = 'formlar' | 'aboneler';

export default async function GelenSayfasi({
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

  const istenen = tek('bolum');
  const bolum: Bolum = istenen === 'aboneler' ? 'aboneler' : 'formlar';
  const sayfa = Math.max(1, Number(tek('sayfa') ?? '1') || 1);
  const formTuru = tek('formTuru');
  const islemDurumu = tek('islemDurumu');
  const onayDurumu = tek('onayDurumu');
  const acilanKimlik = tek('tam');

  const sayaclar = await gelenSayaclari(kullanici);
  const hamGorebilir = izinVarMi(kullanici.roller, 'kisiselveri:disaAktar');

  const yolKur = (degisiklikler: Record<string, string | undefined>): string => {
    const p = new URLSearchParams();
    const birlesik: Record<string, string | undefined> = {
      bolum,
      formTuru,
      islemDurumu,
      onayDurumu,
      sayfa: String(sayfa),
      ...degisiklikler,
    };
    for (const [ad, deger] of Object.entries(birlesik)) {
      if (!deger || deger === 'tumu') continue;
      if (ad === 'sayfa' && deger === '1') continue;
      if (ad === 'bolum' && deger === 'formlar') continue;
      p.set(ad, deger);
    }
    const metin = p.toString();
    return `/admin/gelen/${metin ? `?${metin}` : ''}`;
  };

  const sekmeler: SeritOgesi[] = [
    {
      ad: 'Form kayıtları',
      yol: '/admin/gelen/',
      adet: sayaclar.form.toplam,
      etkin: bolum === 'formlar',
    },
    {
      ad: 'Bülten aboneleri',
      yol: '/admin/gelen/?bolum=aboneler',
      adet: sayaclar.abone.toplam,
      etkin: bolum === 'aboneler',
    },
  ];

  // Ham kayıt yalnızca açıkça istendiğinde ve yetki varsa çözülür.
  const acilan =
    acilanKimlik && hamGorebilir
      ? await gelenKaydiAc({
          kullanici,
          koleksiyon: bolum === 'aboneler' ? KOLEKSIYONLAR.aboneler : KOLEKSIYONLAR.formKayitlari,
          kimlik: acilanKimlik,
          adres: await istemciAdresi(),
        })
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PanelBasligi
        ustEtiket="YÖNETİM"
        baslik="Gelen kutusu"
        aciklama="Siteden gelen form gönderimleri ve bülten abonelikleri. Kişisel veri taşır: e-posta ve kişiye ait alanlar maskeli gösterilir, ham kayıt ayrı bir istekle ve denetim kaydı bırakılarak açılır."
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

      {bolum === 'formlar' ? (
        <FormBolumu
          kullanici={kullanici}
          sayfa={sayfa}
          formTuru={formTuru}
          islemDurumu={islemDurumu}
          sayaclar={sayaclar.form}
          yolKur={yolKur}
          hamGorebilir={hamGorebilir}
        />
      ) : (
        <AboneBolumu
          kullanici={kullanici}
          sayfa={sayfa}
          onayDurumu={onayDurumu}
          sayaclar={sayaclar.abone}
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
            yazıldı. Ekran görüntüsü almayın; iş bitince kapatın.
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

/* --- FORM KAYITLARI ------------------------------------------------------- */

async function FormBolumu({
  kullanici,
  sayfa,
  formTuru,
  islemDurumu,
  sayaclar,
  yolKur,
  hamGorebilir,
}: {
  kullanici: OturumKullanicisi;
  sayfa: number;
  formTuru?: string;
  islemDurumu?: string;
  sayaclar: GelenSayaclari['form'];
  yolKur: (degisiklikler: Record<string, string | undefined>) => string;
  hamGorebilir: boolean;
}) {
  const sonuc = await formKayitlariniListele(kullanici, { sayfa, formTuru, islemDurumu });
  const yazabilir = izinVarMi(kullanici.roller, 'kisiselveri:yaz');

  const turSeridi: SeritOgesi[] = [
    { ad: 'Tümü', yol: yolKur({ formTuru: 'tumu', sayfa: '1' }), etkin: !formTuru },
    ...FORM_TURLERI.map((tur) => ({
      ad: FORM_TURU_ADI[tur] ?? tur,
      yol: yolKur({ formTuru: tur, sayfa: '1' }),
      etkin: formTuru === tur,
    })),
  ];

  const durumSeridi: SeritOgesi[] = [
    { ad: 'Tümü', yol: yolKur({ islemDurumu: 'tumu', sayfa: '1' }), etkin: !islemDurumu },
    ...ISLEM_DURUMLARI.map((durum) => ({
      ad: ISLEM_DURUMU_ADI[durum],
      yol: yolKur({ islemDurumu: durum, sayfa: '1' }),
      etkin: islemDurumu === durum,
      adet:
        durum === 'yeni'
          ? sayaclar.yeni
          : durum === 'islemde'
            ? sayaclar.islemde
            : sayaclar.kapandi,
    })),
  ];

  return (
    <div className="space-y-4">
      <SayacSeridi
        ogeler={[
          { etiket: 'TOPLAM', deger: sayaclar.toplam },
          { etiket: 'YENİ', deger: sayaclar.yeni, uyari: sayaclar.yeni > 0 },
          { etiket: 'İŞLEMDE', deger: sayaclar.islemde },
          { etiket: 'KAPANDI', deger: sayaclar.kapandi },
          {
            etiket: 'SÜRESİ GEÇMİŞ',
            deger: sayaclar.suresiGecmis,
            uyari: sayaclar.suresiGecmis > 0,
            ipucu: 'saklamaBitis geçmiş; TTL süpürücüsü bekleniyor',
          },
        ]}
      />

      {sayaclar.saklamasiz > 0 && (
        <p className="rounded-xl border border-tehlike/35 bg-tehlike/10 px-4 py-3 text-sm text-tehlike">
          {sayaclar.saklamasiz} kayıtta <code className="font-mono">saklamaBitis</code> alanı yok.
          TTL dizini bu kayıtları hiçbir zaman silmez; saklama süresi fiilen sonsuzdur.
        </p>
      )}

      <BaglantiSeridi etiket="FORM" ogeler={turSeridi} />
      <BaglantiSeridi etiket="DURUM" ogeler={durumSeridi} />

      {sonuc.kayitlar.length === 0 ? (
        <BosKayit
          baslik={
            formTuru || islemDurumu ? 'Bu ölçütlere uyan kayıt yok.' : 'Henüz form kaydı yok.'
          }
          metin="Bu liste yalnızca sitenin gönderdiği gerçek form kayıtlarını gösterir; örnek kayıt eklenmez."
        />
      ) : (
        <TabloKabugu
          basliklar={['Geldi', 'Form', 'Alanlar', 'Kaynak', 'Saklama', 'Durum']}
          genislikSinifi="min-w-[60rem]"
        >
          {sonuc.kayitlar.map((kayit) => {
            const saklama = saklamaDurumu(kayit.saklamaBitis);
            return (
              <tr key={kayit.kimlik} className="border-b border-kenar-soluk last:border-0">
                <td className="px-3 py-2.5 align-top font-mono text-xs whitespace-nowrap text-metin-soluk">
                  {zamanMetni(kayit.olusturuldu)}
                </td>
                <td className="px-3 py-2.5 align-top text-xs text-metin">
                  {FORM_TURU_ADI[kayit.formTuru] ?? kayit.formTuru}
                </td>
                <td className="max-w-96 px-3 py-2.5 align-top">
                  <dl className="space-y-0.5">
                    {kayit.alanlar.map((alan) => (
                      <div key={alan.anahtar} className="flex gap-2 text-xs">
                        <dt className="shrink-0 font-mono text-metin-soluk">{alan.anahtar}</dt>
                        <dd
                          className={`min-w-0 break-words ${
                            alan.maskeli ? 'font-mono text-metin-ikincil' : 'text-metin-ikincil'
                          }`}
                        >
                          {alan.metin}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {hamGorebilir && (
                    <Link
                      href={yolKur({ tam: kayit.kimlik })}
                      className="mt-1.5 inline-block text-xs text-vurgu-parlak underline underline-offset-2"
                    >
                      ham kaydı aç
                    </Link>
                  )}
                </td>
                <td className="max-w-48 px-3 py-2.5 align-top font-mono text-xs break-words text-metin-soluk">
                  {kayit.kaynakYol ?? '—'}
                  {kayit.politikaSurumu && (
                    <span className="mt-0.5 block">rıza: {kayit.politikaSurumu}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top whitespace-nowrap">
                  <SaklamaHucresi
                    metin={saklama.metin}
                    gecti={saklama.gecti}
                    tanimli={saklama.tanimli}
                  />
                </td>
                <td className="px-3 py-2.5 align-top">
                  {yazabilir ? (
                    <IslemDurumuDugmeleri kimlik={kayit.kimlik} mevcut={kayit.islemDurumu} />
                  ) : (
                    <span className="etiket-mono text-metin-ikincil">
                      {ISLEM_DURUMU_ADI[kayit.islemDurumu as keyof typeof ISLEM_DURUMU_ADI] ??
                        kayit.islemDurumu}
                    </span>
                  )}
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

/* --- ABONELER ------------------------------------------------------------- */

async function AboneBolumu({
  kullanici,
  sayfa,
  onayDurumu,
  sayaclar,
  yolKur,
  hamGorebilir,
}: {
  kullanici: OturumKullanicisi;
  sayfa: number;
  onayDurumu?: string;
  sayaclar: GelenSayaclari['abone'];
  yolKur: (degisiklikler: Record<string, string | undefined>) => string;
  hamGorebilir: boolean;
}) {
  const sonuc = await aboneleriListele(kullanici, { sayfa, onayDurumu });

  const onaySeridi: SeritOgesi[] = [
    { ad: 'Tümü', yol: yolKur({ onayDurumu: 'tumu', sayfa: '1' }), etkin: !onayDurumu },
    ...ONAY_DURUMLARI.map((durum) => ({
      ad: ONAY_DURUMU_ADI[durum] ?? durum,
      yol: yolKur({ onayDurumu: durum, sayfa: '1' }),
      etkin: onayDurumu === durum,
      adet:
        durum === 'bekliyor'
          ? sayaclar.bekliyor
          : durum === 'onayli'
            ? sayaclar.onayli
            : sayaclar.cikti,
    })),
  ];

  return (
    <div className="space-y-4">
      <SayacSeridi
        ogeler={[
          { etiket: 'TOPLAM', deger: sayaclar.toplam },
          {
            etiket: 'ONAY BEKLİYOR',
            deger: sayaclar.bekliyor,
            ipucu: 'Çift onay tamamlanmamış kayıtlar; bülten gönderilmez',
          },
          { etiket: 'ONAYLI', deger: sayaclar.onayli },
          { etiket: 'ÇIKTI', deger: sayaclar.cikti },
        ]}
      />

      <BaglantiSeridi etiket="ONAY" ogeler={onaySeridi} />

      {sonuc.kayitlar.length === 0 ? (
        <BosKayit
          baslik={onayDurumu ? 'Bu ölçütlere uyan kayıt yok.' : 'Henüz abone kaydı yok.'}
          metin="Bülten formu çift onaylı bir kayıt yazdığında abone burada görünür. Liste yalnızca gerçek kayıtları gösterir."
        />
      ) : (
        <TabloKabugu basliklar={['Kayıt', 'E-posta', 'Onay', 'Kaynak', 'Listeler', 'Rıza sürümü']}>
          {sonuc.kayitlar.map((kayit) => (
            <tr key={kayit.kimlik} className="border-b border-kenar-soluk last:border-0">
              <td className="px-3 py-2.5 align-top font-mono text-xs whitespace-nowrap text-metin-soluk">
                {zamanMetni(kayit.olusturuldu)}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-xs text-metin">
                {kayit.eposta}
                {hamGorebilir && (
                  <Link
                    href={yolKur({ tam: kayit.kimlik })}
                    className="ml-2 text-xs text-vurgu-parlak underline underline-offset-2"
                  >
                    aç
                  </Link>
                )}
              </td>
              <td className="px-3 py-2.5 align-top text-xs">
                <span
                  className={
                    kayit.onayDurumu === 'onayli'
                      ? 'text-basari'
                      : kayit.onayDurumu === 'cikti'
                        ? 'text-metin-soluk'
                        : 'text-uyari'
                  }
                >
                  {ONAY_DURUMU_ADI[kayit.onayDurumu] ?? kayit.onayDurumu}
                </span>
                <span className="mt-0.5 block font-mono text-[0.625rem] text-metin-soluk">
                  {kayit.onayDurumu === 'cikti'
                    ? zamanMetni(kayit.cikisTarihi)
                    : zamanMetni(kayit.onayTarihi)}
                </span>
              </td>
              <td className="max-w-48 px-3 py-2.5 align-top font-mono text-xs break-words text-metin-soluk">
                {kayit.onayKaynagi ?? '—'}
              </td>
              <td className="px-3 py-2.5 align-top text-xs text-metin-ikincil">
                {kayit.listeler.length ? kayit.listeler.join(', ') : '—'}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-xs text-metin-soluk">
                {kayit.politikaSurumu ?? '—'}
              </td>
            </tr>
          ))}
        </TabloKabugu>
      )}

      <p className="text-xs leading-relaxed text-metin-soluk">
        Abone kayıtlarında TTL dizini yoktur: kayıt çıkışa kadar saklanır (bkz. KVKK envanteri).
        Silme talebi geldiğinde kayıt elle silinir ve denetim kaydı kalır.
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
