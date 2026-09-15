import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR, TANIMLAR } from '@/lib/mongo/koleksiyonlar';
import { oturumGerekli } from '@/lib/yetki/oturum';
import { izinVarMi } from '@/lib/yetki/roller';

export const metadata: Metadata = { title: 'Kişisel veri' };
export const dynamic = 'force-dynamic';

/**
 * KVKK işleme envanteri ve saklama durumu.
 *
 * Bu ekran kişisel veriyi LİSTELEMEZ — yalnızca ne kadar veri olduğunu,
 * saklama süresinin işlediğini ve TTL dizininin ayakta olduğunu gösterir.
 * Kayıt içeriğine erişim veri sahibi talebi üzerine, ayrı ve kayda geçen
 * bir akışla yapılır.
 */

const IZLENEN = [
  {
    koleksiyon: KOLEKSIYONLAR.kullanicilar,
    ad: 'Kullanıcılar',
    veri: 'E-posta, ad, parola özeti, rıza kayıtları',
    saklama: 'Hesap silinene kadar',
    ttlAlani: null,
    panelYolu: '/admin/kullanicilar/',
  },
  {
    koleksiyon: KOLEKSIYONLAR.aboneler,
    ad: 'Bülten aboneleri',
    veri: 'E-posta, onay tarihi ve kaynağı',
    saklama: 'Çıkışa kadar (çift onay zorunlu)',
    ttlAlani: null,
    panelYolu: '/admin/gelen/?bolum=aboneler',
  },
  {
    koleksiyon: KOLEKSIYONLAR.formKayitlari,
    ad: 'Form kayıtları',
    veri: 'İletişim, teklif, etkinlik kaydı alanları',
    saklama: 'saklamaBitis → TTL ile otomatik silinir',
    ttlAlani: 'saklamaBitis',
    panelYolu: '/admin/gelen/',
  },
  {
    koleksiyon: KOLEKSIYONLAR.testSonuclari,
    ad: 'Test sonuçları',
    veri: 'Puan, beceri kırılımı, anonim oturum anahtarı',
    saklama: 'saklamaBitis → TTL ile otomatik silinir',
    ttlAlani: 'saklamaBitis',
    panelYolu: '/admin/sonuclar/',
  },
  {
    koleksiyon: KOLEKSIYONLAR.readinessSonuclari,
    ad: 'AI Readiness sonuçları',
    veri: 'Kurum adı, boyut skorları, iletişim izni',
    saklama: 'saklamaBitis → TTL ile otomatik silinir',
    ttlAlani: 'saklamaBitis',
    panelYolu: '/admin/sonuclar/?bolum=readiness',
  },
] as const;

export default async function KisiselVeriSayfasi() {
  const kullanici = await oturumGerekli();
  if (!izinVarMi(kullanici.roller, 'kisiselveri:oku')) notFound();

  const db = await veritabani();

  const satirlar = await Promise.all(
    IZLENEN.map(async (hedef) => {
      const koleksiyon = db.collection(hedef.koleksiyon);
      const [adet, dizinler] = await Promise.all([
        koleksiyon.countDocuments(),
        koleksiyon.indexes(),
      ]);

      const ttlDizini = dizinler.find((d) => 'expireAfterSeconds' in d);
      const suresiGecmis = hedef.ttlAlani
        ? await koleksiyon.countDocuments({ [hedef.ttlAlani]: { $lt: new Date() } })
        : 0;

      return {
        ...hedef,
        adet,
        ttlVar: Boolean(ttlDizini),
        ttlAdi: ttlDizini?.name,
        suresiGecmis,
      };
    }),
  );

  const kisiselVeriKoleksiyonlari = TANIMLAR.filter((t) => t.kisiselVeri).map((t) => t.ad);
  const izlenmeyenler = kisiselVeriKoleksiyonlari.filter(
    (ad) => !IZLENEN.some((i) => i.koleksiyon === ad),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="etiket-mono text-metin-soluk">YÖNETİM</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-metin">Kişisel veri</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-ikincil">
          KVKK işleme envanteri. Bu ekran kişisel veriyi listelemez; yalnızca hacmi, saklama
          süresinin işlediğini ve TTL dizininin ayakta olduğunu gösterir. Kayıtların kendisi
          maskelenmiş hâlde ilgili ekranda görülür (koleksiyon adının yanındaki bağlantı).
        </p>
      </div>

      {/* Envanter */}
      <div className="overflow-x-auto rounded-xl border border-kenar">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <thead>
            <tr className="bg-zemin-derin">
              {['Koleksiyon', 'Veri', 'Kayıt', 'Saklama', 'TTL'].map((baslik) => (
                <th
                  key={baslik}
                  scope="col"
                  className="etiket-mono border-b border-kenar px-3 py-2.5 text-left text-metin-soluk"
                >
                  {baslik}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {satirlar.map((satir) => (
              <tr key={satir.koleksiyon} className="border-b border-kenar-soluk last:border-0">
                <td className="px-3 py-2.5 align-top">
                  <span className="block text-metin">{satir.ad}</span>
                  <code className="block font-mono text-xs text-metin-soluk">
                    {satir.koleksiyon}
                  </code>
                  <Link
                    href={satir.panelYolu}
                    className="mt-1 inline-block text-xs text-vurgu-parlak underline underline-offset-2"
                  >
                    kayıtları aç →
                  </Link>
                </td>
                <td className="max-w-64 px-3 py-2.5 align-top text-xs text-metin-ikincil">
                  {satir.veri}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-sm tabular-nums text-metin">
                  {satir.adet}
                </td>
                <td className="max-w-56 px-3 py-2.5 align-top text-xs text-metin-ikincil">
                  {satir.saklama}
                </td>
                <td className="px-3 py-2.5 align-top">
                  {satir.ttlAlani === null ? (
                    <span className="etiket-mono text-metin-soluk">gerekmiyor</span>
                  ) : satir.ttlVar ? (
                    <span className="etiket-mono text-basari">
                      {satir.ttlAdi}
                      {satir.suresiGecmis > 0 && (
                        <span className="ml-1.5 text-uyari">{satir.suresiGecmis} bekliyor</span>
                      )}
                    </span>
                  ) : (
                    <span className="etiket-mono text-tehlike">DİZİN YOK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {satirlar.some((s) => s.ttlAlani !== null && !s.ttlVar) && (
        <p className="rounded-xl border border-tehlike/35 bg-tehlike/10 px-4 py-3 text-sm text-tehlike">
          Bir veya daha fazla koleksiyonda TTL dizini yok. Saklama süresi fiilen uygulanmıyor
          demektir. <code className="font-mono">npm run mongo:kur</code> çalıştırın.
        </p>
      )}

      {satirlar.some((s) => s.suresiGecmis > 0) && (
        <p className="rounded-xl border border-uyari/35 bg-uyari/10 px-4 py-3 text-sm text-uyari">
          Süresi geçmiş kayıtlar var. MongoDB TTL süpürücüsü yaklaşık her 60 saniyede çalışır; bu
          sayı kalıcı olarak artıyorsa dizini kontrol edin.
        </p>
      )}

      {izlenmeyenler.length > 0 && (
        <p className="rounded-xl border border-uyari/35 bg-uyari/10 px-4 py-3 text-sm text-uyari">
          Şemada kişisel veri işaretli ama bu ekranda izlenmeyen koleksiyonlar:{' '}
          <code className="font-mono">{izlenmeyenler.join(', ')}</code>
        </p>
      )}

      {/* Veri sahibi hakları */}
      <section className="rounded-xl border border-kenar bg-yuzey/40 p-5">
        <h2 className="etiket-mono mb-3 text-metin">VERİ SAHİBİ HAKLARI</h2>
        <p className="text-sm leading-relaxed text-metin-ikincil">
          Erişim, silme, taşınabilirlik ve rızanın geri alınması talepleri şu an
          <strong> elle </strong> yürütülüyor. Talep geldiğinde:
        </p>
        <ol className="mt-3 space-y-2 text-sm text-metin-ikincil">
          {[
            'Talebi kayda geçirin (tarih, kimlik doğrulama yöntemi, talep türü).',
            'İlgili koleksiyonlarda e-posta ile arama yapın.',
            'Silme talebinde denetim kaydı KALIR — yalnızca kişisel veri kaydı silinir.',
            'Sonucu talep sahibine yazılı bildirin ve bildirimi kayda geçirin.',
          ].map((adim, sira) => (
            <li key={adim} className="flex gap-3">
              <span className="etiket-mono shrink-0 text-vurgu-parlak">{sira + 1}</span>
              {adim}
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-kenar-soluk pt-3 text-xs leading-relaxed text-metin-soluk">
          Otomatik talep akışı henüz yok. Bu bir eksiklik olarak işaretlidir; canlıya çıkıştan önce{' '}
          <Link
            href="/kvkk-aydinlatma/"
            target="_blank"
            className="text-vurgu-parlak underline underline-offset-2"
          >
            KVKK aydınlatma metni
          </Link>{' '}
          ile bu ekranın tutarlı olduğu hukuk tarafından doğrulanmalı.
        </p>
      </section>
    </div>
  );
}
