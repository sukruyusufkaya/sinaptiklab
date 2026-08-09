// /cerez-politikasi — BRIEF §9.3. Şu anki durum: site HİÇ çerez yazmıyor,
// bu yüzden onay penceresi de yok. Sayfa bunu açıklar ve tema tercihinin neden
// çerez olmadığını anlatır. Çerez eklendiği gün bu metin aynı commit'te güncellenir.
import type { Metadata } from "next";
import Link from "next/link";
import { Bolum } from "@/components/legal/Bolum";
import { KurumsalBaslik } from "@/components/legal/KurumsalBaslik";
import { Kutu, Liste, Madde, P } from "@/components/legal/Metin";
import { EPOSTA, SON_GUNCELLEME } from "@/components/legal/sabitler";
import { Tablo } from "@/components/legal/Tablo";
import { TaslakUyarisi } from "@/components/legal/TaslakUyarisi";
import { env } from "@/lib/env";

export function generateMetadata(): Metadata {
  return {
    title: "Çerez Politikası — hangi çerezleri kullanıyoruz",
    description:
      "Sinaptiklab bugün hiçbir çerez yazmaz; bu yüzden çerez onay penceresi de yoktur. Tema tercihinin neden çerez sayılmadığı, üçüncü taraf çerez durumu ve tarayıcıdan silme yolları.",
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/cerez-politikasi` },
  };
}

const DURUM = [
  ["Zorunlu (teknik) çerez", "Oturum, güvenlik, dil tercihi", "Kullanılmıyor"],
  ["Performans / analitik çerez", "Ziyaretçi ölçümü", "Kullanılmıyor — ölçüm çerezsiz yapılıyor"],
  ["İşlevsel çerez", "Arayüz tercihlerinin hatırlanması", "Kullanılmıyor — tema localStorage'da"],
  ["Reklam / hedefleme çerezi", "Reklam gösterimi, yeniden hedefleme", "Kullanılmıyor"],
  ["Üçüncü taraf çerezi", "Gömülü içerik, sosyal medya, sohbet balonu", "Kullanılmıyor"],
] as const;

export default function CerezPolitikasiSayfasi() {
  return (
    <>
      <KurumsalBaslik
        indeks="yasal · çerez politikası"
        baslik="Çerez politikası"
        spot="Sinaptiklab bugün tarayıcınıza hiçbir çerez yazmaz. Onaylayacak bir şey olmadığı için sitede çerez onay penceresi de görmezsiniz."
        not={<TaslakUyarisi />}
        raylar={[
          { etiket: "kullanılan çerez", deger: "0" },
          { etiket: "üçüncü taraf çerezi", deger: "yok" },
          { etiket: "onay penceresi", deger: "gerekmiyor" },
          { etiket: "son güncelleme", deger: SON_GUNCELLEME },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="max-w-[var(--govde-olcu)] py-12">
          <Bolum id="cerez-nedir" no="01" baslik="Çerez nedir">
            <P>
              Çerez (cookie), bir web sitesinin tarayıcınıza kaydettiği küçük bir metin dosyasıdır.
              Bu dosyanın ayırt edici özelliği, siteye yaptığınız{" "}
              <strong className="font-semibold text-murekkep">
                her istekle birlikte sunucuya otomatik olarak geri gönderilmesidir
              </strong>
              . Oturumunuzun açık kalması bu sayede çalışır; aynı mekanizma, farklı sitelerde sizi
              izlemek için de kullanılabildiğinden çerezler gizlilik tartışmalarının merkezindedir.
            </P>
            <P>
              Çerezler genellikle amaçlarına göre sınıflandırılır: sitenin çalışması için zorunlu
              olanlar, ölçüm yapanlar, tercih hatırlayanlar ve reklam amaçlı olanlar. Türkiye ve
              Avrupa uygulamasında, zorunlu olmayan çerezler için kullanıcının önceden onayı aranır.
            </P>
          </Bolum>

          <Bolum id="durum" no="02" baslik="Sinaptiklab hangilerini kullanıyor">
            <P>
              Hiçbirini. Aşağıdaki tablo, yaygın çerez kategorilerinin sitedeki güncel karşılığını
              gösterir:
            </P>
            <Tablo
              ozet="Çerez kategorileri ve Sinaptiklab'daki güncel durumları"
              basliklar={["Kategori", "Tipik kullanım", "Sinaptiklab'da"]}
              satirlar={DURUM}
            />
            <P>
              Bunu doğrulayabilirsiniz: tarayıcınızın geliştirici araçlarında{" "}
              <span className="font-mono text-sm">Application → Cookies</span> bölümünü açıp bu
              siteyi seçtiğinizde liste boş görünür.
            </P>
            <Kutu etiket="onay penceresi neden yok">
              <p>
                Çerez onay pencereleri, zorunlu olmayan çerezler için gereklidir. Böyle bir çerez
                kullanmadığımız için onay istemek anlamsız olurdu; sırf &ldquo;uyumlu
                görünmek&rdquo; adına ekran kaplayan bir pencere göstermek de okuma deneyimini
                bozardı. Durum değişirse pencere değil, bu sayfa ve{" "}
                <Link href="/kvkk-aydinlatma">aydınlatma metni</Link> önce güncellenir.
              </p>
            </Kutu>
          </Bolum>

          <Bolum id="tema" no="03" baslik="Tema tercihi neden çerez değil">
            <P>
              Sitede açık/koyu tema seçebilirsiniz ve bu tercih bir sonraki ziyaretinizde
              hatırlanır. Tercih,{" "}
              <strong className="font-semibold text-murekkep">localStorage</strong> adı verilen
              tarayıcı depolamasında <span className="font-mono text-sm">tema</span> anahtarıyla
              tutulur.
            </P>
            <Liste>
              <Madde>
                localStorage verisi sunucuya{" "}
                <strong className="font-semibold text-murekkep">
                  hiçbir zaman otomatik gönderilmez
                </strong>
                ; çerezden farkı budur. Değer yalnızca sizin cihazınızda kalır ve sayfa açılırken
                tarayıcı tarafından okunur.
              </Madde>
              <Madde>
                Sakladığı tek bilgi <span className="font-mono text-sm">&quot;light&quot;</span> ya
                da <span className="font-mono text-sm">&quot;dark&quot;</span> kelimesidir; kimlik,
                oturum ya da davranış bilgisi içermez.
              </Madde>
              <Madde>
                Hiç tema seçmezseniz hiçbir şey kaydedilmez; site işletim sisteminizin görünüm
                tercihine uyar.
              </Madde>
            </Liste>
          </Bolum>

          <Bolum id="ucuncu-taraf" no="04" baslik="Üçüncü taraf çerezleri">
            <P>
              Sitede üçüncü taraf script çalışmadığı için üçüncü taraf çerezi de oluşmaz: reklam
              ağı, sosyal medya gömülü içeriği, video oynatıcı, sohbet balonu, ısı haritası veya
              harici yazı tipi çağrısı bulunmaz. Yazı tipleri derleme sırasında kendi sunucumuza
              kopyalanır, ziyaretiniz sırasında dışarıya istek gitmez.
            </P>
            <P>
              Yazılarda dış kaynaklara bağlantı veririz; bir bağlantıya tıklayıp başka bir siteye
              geçtiğinizde artık o sitenin çerez politikası geçerlidir. Bu konuda{" "}
              <Link href="/kullanim-sartlari#dis-baglantilar">kullanım şartlarına</Link>{" "}
              bakabilirsiniz.
            </P>
          </Bolum>

          <Bolum id="ileride" no="05" baslik="İleride ne değişecek">
            <P>
              Ücretsiz üyelik, yorum ve bülten özellikleri açıldığında{" "}
              <strong className="font-semibold text-murekkep">zorunlu (teknik) çerez</strong>{" "}
              kullanmamız gerekecek. Bunlar, oturumunuzun açık kalması ve form güvenliği için
              zorunludur; ölçüm ya da reklam amacı taşımaz. O gün geldiğinde:
            </P>
            <Liste>
              <Madde>Bu sayfa, kullanılan her çerezin adı, amacı ve ömrüyle güncellenecek.</Madde>
              <Madde>
                Zorunlu olmayan bir çerez kullanılacaksa, varsayılan tercih{" "}
                <strong className="font-semibold text-murekkep">reddetmek</strong> olacak şekilde
                onay mekanizması eklenecek.
              </Madde>
              <Madde>
                Reklam ve davranışsal hedefleme çerezleri hiçbir koşulda kullanılmayacak; bu, iş
                modelimizin değil ilkemizin sonucudur.
              </Madde>
            </Liste>
          </Bolum>

          <Bolum id="silme" no="06" baslik="Tarayıcıdan silme ve engelleme">
            <P>
              Çerezleri ve site verilerini her zaman kendiniz yönetebilirsiniz. Masaüstü ve mobil
              tarayıcıların hemen hepsinde ilgili ayarlar{" "}
              <span className="font-mono text-sm">Ayarlar → Gizlilik ve güvenlik</span> başlığı
              altındadır; buradan çerezleri tümüyle engelleyebilir, yalnızca üçüncü taraf
              çerezlerine izin vermeyebilir veya kayıtlı site verilerini silebilirsiniz.
            </P>
            <Liste>
              <Madde>
                Yalnızca bu sitenin verisini silmek için: adres çubuğundaki kilit/site bilgisi
                simgesine tıklayıp &ldquo;çerezler ve site verileri&rdquo; bölümünden temizleyin.
                Tema tercihiniz de bu işlemle silinir.
              </Madde>
              <Madde>
                Geliştirici araçlarını kullanıyorsanız{" "}
                <span className="font-mono text-sm">Application → Local Storage</span> altında{" "}
                <span className="font-mono text-sm">tema</span> anahtarını doğrudan
                kaldırabilirsiniz.
              </Madde>
              <Madde>
                Çerezleri tümüyle engellemek Sinaptiklab&rsquo;ın okunmasını etkilemez; site çerez
                kullanmadığı için bir işlevi kaybetmezsiniz.
              </Madde>
            </Liste>
            <P>
              Sorunuz olursa <a href={`mailto:${EPOSTA}`}>{EPOSTA}</a> adresine yazabilir, hangi
              verinin işlendiğini <Link href="/gizlilik">gizlilik politikasından</Link>{" "}
              okuyabilirsiniz.
            </P>
          </Bolum>
        </div>
      </div>
    </>
  );
}
