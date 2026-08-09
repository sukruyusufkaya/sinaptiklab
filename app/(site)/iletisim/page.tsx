// /iletisim — tek adres + konu bazlı yönlendirme (BRIEF §2.2).
// Bilinçli karar: FORM YOK. Form, spam koruması, oran sınırı ve kişisel veri
// işleme sorumluluğu getirir; bunların altyapısı Faz 7'de gelecek. O zamana
// kadar mailto, hem dürüst hem sıfır veri toplayan çözüm.
import type { Metadata } from "next";
import Link from "next/link";
import { Bolum } from "@/components/legal/Bolum";
import { KurumsalBaslik } from "@/components/legal/KurumsalBaslik";
import { Kutu, Liste, Madde, P, SiraliListe, SiraliMadde } from "@/components/legal/Metin";
import { EPOSTA, SON_GUNCELLEME, YAZAR, epostaBaglantisi } from "@/components/legal/sabitler";
import { Tablo } from "@/components/legal/Tablo";
import { env } from "@/lib/env";

export function generateMetadata(): Metadata {
  return {
    title: "İletişim — hata bildirimi, kaynak düzeltme, işbirliği",
    description:
      "Sinaptiklab'a nasıl ulaşılır: içerik hatası bildirimi, kaynak düzeltme, işbirliği ve basın başvuruları için konu başlıkları, yanıt süreleri ve bildirim şablonu.",
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/iletisim` },
  };
}

const KONULAR = [
  [
    "İçerik hatası",
    "Yanlış sayı, eskimiş sürüm, çalışmayan kod, kırık bağlantı",
    "İçerik hatası bildirimi",
  ],
  [
    "Kaynak düzeltme",
    "Kaynak iddiayı desteklemiyor ya da daha iyi bir birincil kaynak var",
    "Kaynak düzeltme önerisi",
  ],
  ["İşbirliği", "Konuk yazı, ortak ölçüm, vaka çalışması, konuşma daveti", "İşbirliği önerisi"],
  ["Basın", "Röportaj, alıntı talebi, görsel kullanımı", "Basın başvurusu"],
  ["Kişisel veri (KVKK)", "Aydınlatma metni kapsamındaki başvurular ve haklar", "KVKK başvurusu"],
  ["Diğer", "Yukarıdakilere girmeyen her şey", "Genel"],
] as const;

export default function IletisimSayfasi() {
  return (
    <>
      <KurumsalBaslik
        indeks="kurumsal · iletişim"
        baslik="İletişim"
        spot="Tek adres, konu başlığıyla yönlendirme. En değerli mesaj türü içerik hatası bildirimi: bir yanlış gördüyseniz, düzeltmesi bizim işimiz."
        raylar={[
          { etiket: "adres", deger: EPOSTA },
          { etiket: "yanıt hedefi", deger: "5 iş günü" },
          { etiket: "kvkk başvurusu", deger: "en geç 30 gün" },
          { etiket: "son güncelleme", deger: SON_GUNCELLEME },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="max-w-[var(--govde-olcu)] py-12">
          <Bolum id="adres" no="01" baslik="Adres">
            <P>
              Tüm başvurular tek adrese gelir ve doğrudan sorumlu editöre ({YAZAR}) ulaşır; arada
              destek ekibi yoktur.
            </P>
            <p className="mt-6">
              <a href={`mailto:${EPOSTA}`} className="dugme-birincil">
                {EPOSTA} <span aria-hidden>→</span>
              </a>
            </p>
            <Kutu etiket="form neden yok">
              <p>
                Bilinçli bir karar: iletişim formu, spam filtresi, oran sınırı ve form üzerinden
                gelen kişisel verinin saklanması demektir. Bunların altyapısı henüz kurulmadı;
                kurulana kadar hiç veri toplamayan e-posta yolunu kullanıyoruz. Form geldiğinde{" "}
                <Link href="/kvkk-aydinlatma">aydınlatma metni</Link> de aynı gün güncellenecek.
              </p>
            </Kutu>
          </Bolum>

          <Bolum id="konular" no="02" baslik="Konu başlığıyla yönlendirin">
            <P>
              Doğru başlık, doğru sırada yanıtlanmayı sağlar. E-postanın konu satırına aşağıdaki
              ifadelerden birini yazmanız yeterli:
            </P>
            <Tablo
              ozet="Başvuru türleri ve kullanılacak e-posta konu başlıkları"
              basliklar={["Tür", "Ne zaman", "Konu satırı"]}
              satirlar={KONULAR}
            />
            <p className="mt-5 flex flex-wrap gap-3">
              <a href={epostaBaglantisi("İçerik hatası bildirimi")} className="dugme-cerceve">
                Hata bildir
              </a>
              <a href={epostaBaglantisi("İşbirliği önerisi")} className="dugme-cerceve">
                İşbirliği
              </a>
              <a href={epostaBaglantisi("KVKK başvurusu")} className="dugme-cerceve">
                KVKK başvurusu
              </a>
            </p>
          </Bolum>

          <Bolum id="hata-bildirimi" no="03" baslik="Hata bildirirken ne gönderin">
            <P>
              Bir düzeltmeyi hızlandıran üç bilgi var. Üçü de varsa bildirim genellikle aynı gün
              sonuçlanır:
            </P>
            <SiraliListe>
              <SiraliMadde no={1}>
                <strong className="font-semibold text-murekkep">Sayfanın adresi (URL).</strong>{" "}
                Mümkünse ilgili başlığın çapa bağlantısı — her ara başlığın yanındaki bağlantı
                simgesi kalıcı adres verir.
              </SiraliMadde>
              <SiraliMadde no={2}>
                <strong className="font-semibold text-murekkep">Hangi iddia yanlış.</strong> İlgili
                cümleyi kopyalayıp yapıştırın; &ldquo;yazıda bir hata var&rdquo; tek başına
                izlenebilir değil.
              </SiraliMadde>
              <SiraliMadde no={3}>
                <strong className="font-semibold text-murekkep">Doğrusunu gösteren kaynak.</strong>{" "}
                Resmî dokümantasyon, sürüm notu, hakemli yayın ya da yeniden üretilebilir bir ölçüm.
                Kaynağınız yoksa da yazın; doğrulaması bize ait.
              </SiraliMadde>
            </SiraliListe>
            <P>
              Kod çalışmıyorsa çalıştırdığınız ortamı da ekleyin: işletim sistemi, çalışma zamanı
              sürümü, paket sürümleri ve tam hata çıktısı. Ölçüm sonucumuz sizinkinden farklıysa
              donanım ve yapılandırma bilgisi kritik.
            </P>
            <P>
              Kabul edilen düzeltmeler ilgili yazının değişiklik günlüğüne işlenir. İsterseniz
              bildirimde adınız anılır; istemezseniz anılmaz — e-postanızda belirtin. Süreç{" "}
              <Link href="/editoryal-politika#duzeltme">editoryal politikada</Link> ayrıntılı.
            </P>
          </Bolum>

          <Bolum id="yanit" no="04" baslik="Yanıt süresi">
            <Liste>
              <Madde>
                <strong className="font-semibold text-murekkep">Genel başvurular:</strong> hedefimiz
                beş iş günü. Tek kişilik bir yayın olduğumuz için yoğun dönemlerde gecikme olabilir;
                yanıtsız kalan mesaj olursa aynı başlıkla tekrar yazmaktan çekinmeyin.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">İçerik hatası bildirimi:</strong>{" "}
                öncelikli kuyruk. Bariz bir olgusal hata söz konusuysa düzeltme, doğrulanır
                doğrulanmaz yapılır.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">KVKK başvuruları:</strong> ilgili
                mevzuatın öngördüğü süre içinde, en geç 30 gün içinde yanıtlanır. Ayrıntı{" "}
                <Link href="/kvkk-aydinlatma#basvuru">aydınlatma metninde</Link>.
              </Madde>
            </Liste>
          </Bolum>

          <Bolum id="henuz-yok" no="05" baslik="Henüz olmayan kanallar">
            <P>Şeffaflık için: aşağıdakiler bugün mevcut değil, ileride gelebilir.</P>
            <Liste>
              <Madde>İletişim formu ve site içi bildirim düğmesi.</Madde>
              <Madde>
                Bülten aboneliği — altyapı kurulduğunda çift onaylı olarak açılacak; o güne kadar
                hiçbir yerde e-posta adresi toplanmıyor.
              </Madde>
              <Madde>
                Üyelik, yorum ve forum; yayın topluluğu bileşenleri sonraki fazların konusu.
              </Madde>
              <Madde>Telefon hattı ve fiziki ofis adresi bulunmamaktadır.</Madde>
            </Liste>
            <P>
              Sinaptiklab&rsquo;ın kim tarafından, hangi altyapıyla yayımlandığı{" "}
              <Link href="/kunye">künye sayfasında</Link>; hangi verinin işlendiği{" "}
              <Link href="/gizlilik">gizlilik politikasındadır</Link>.
            </P>
          </Bolum>
        </div>
      </div>
    </>
  );
}
