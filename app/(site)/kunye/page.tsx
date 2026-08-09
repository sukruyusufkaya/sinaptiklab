// /kunye — yayıncı kimliği ve teknoloji künyesi (BRIEF §2.2). Şeffaflık
// gerekçesi: E-E-A-T sinyali + okuyucunun "bu siteyi kim, neyle yayımlıyor"
// sorusuna tek sayfada cevap. Yığın bilgisi package.json ile tutarlı tutulur.
import type { Metadata } from "next";
import Link from "next/link";
import { Bolum } from "@/components/legal/Bolum";
import { KurumsalBaslik } from "@/components/legal/KurumsalBaslik";
import { AltBaslik, Kutu, Liste, Madde, P } from "@/components/legal/Metin";
import { EPOSTA, SON_GUNCELLEME, YAZAR, epostaBaglantisi } from "@/components/legal/sabitler";
import { Tablo } from "@/components/legal/Tablo";
import { env } from "@/lib/env";

export function generateMetadata(): Metadata {
  return {
    title: "Künye — yayıncı, sorumlu editör, teknoloji ve telif",
    description:
      "Sinaptiklab'ın künyesi: yayıncı kimliği, sorumlu editör, yayın türü, siteyi ayakta tutan teknoloji yığını, telif ve lisans koşulları ile alıntı kuralı.",
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/kunye` },
  };
}

const YIGIN = [
  [
    "Uygulama çatısı",
    "Next.js 16 (App Router), React 19",
    "Sunucu bileşenleri; sayfalar önden üretilir",
  ],
  ["Dil", "TypeScript (katı kip)", "Tip denetimi CI'da zorunlu"],
  [
    "Arayüz",
    "Tailwind CSS v4 + kendi tasarım token'larımız",
    "Renk ve ölçek değerleri tek yerden gelir",
  ],
  ["Veritabanı", "MongoDB Atlas (Frankfurt, AB)", "İçerik, konu ağacı ve arama dizinleri"],
  ["Barındırma", "Vercel (Frankfurt bölgesi)", "Statik üretim + artımlı yeniden doğrulama"],
  ["İçerik biçimi", "MDX", "Metin veritabanında; kod blokları Shiki ile renklendirilir"],
  [
    "Tipografi",
    "Bricolage Grotesque, Newsreader, JetBrains Mono",
    "SIL Open Font License; derleme anında kendi sunucumuza kopyalanır",
  ],
] as const;

export default function KunyeSayfasi() {
  return (
    <>
      <KurumsalBaslik
        indeks="kurumsal · künye"
        baslik="Künye"
        spot="Bu siteyi kim yayımlıyor, kim sorumlu, hangi teknolojiyle çalışıyor ve içeriği hangi koşullarda kullanabilirsiniz — hepsi tek sayfada."
        raylar={[
          { etiket: "yayıncı", deger: "Sinaptiklab" },
          { etiket: "sorumlu editör", deger: YAZAR },
          { etiket: "yayın türü", deger: "dijital süreli yayın" },
          { etiket: "son güncelleme", deger: SON_GUNCELLEME },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="max-w-[var(--govde-olcu)] py-12">
          <Bolum id="yayinci" no="01" baslik="Yayıncı">
            <P>
              <strong className="font-semibold text-murekkep">Sinaptiklab</strong>, bağımsız bir
              Türkçe teknik yayındır. Herhangi bir yayın grubuna, ajansa ya da teknoloji
              sağlayıcısına bağlı değildir; hiçbir kurumdan yayın desteği almamaktadır. Yayın adresi{" "}
              <span className="font-mono text-sm">sinaptiklab.com</span>&rsquo;dur.
            </P>
            <P>
              Sinaptiklab bugün kurumsal bir tüzel kişilik altında değil, kurucusunun şahsi
              sorumluluğunda yayımlanmaktadır. Tüzel kişilik kurulması hâlinde bu bölüm ticaret
              unvanı, adres ve vergi bilgileriyle güncellenecektir.
            </P>
          </Bolum>

          <Bolum id="sorumlu" no="02" baslik="Sorumlu editör ve yazar">
            <P>
              Kurucu, sorumlu editör ve — bugün itibarıyla — tek yazar:{" "}
              <strong className="font-semibold text-murekkep">{YAZAR}</strong>. İçeriğin seçimi,
              doğrulanması, yayımlanması ve düzeltilmesi konusundaki editoryal sorumluluk kendisine
              aittir.
            </P>
            <P>
              İletişim: <a href={`mailto:${EPOSTA}`}>{EPOSTA}</a>. Başvuru başlıklarına göre
              yönlendirme ve yanıt süreleri <Link href="/iletisim">iletişim sayfasındadır</Link>.
            </P>
            <P>
              Konuk yazar programı, belirli bir içerik olgunluğuna ulaşıldıktan sonra davetle
              açılacaktır. Açıldığında konuk yazıları da aynı{" "}
              <Link href="/editoryal-politika#yayin-kapisi">yayın kapılarından</Link> geçecek ve
              yazar künyesi metnin başında görünecektir.
            </P>
          </Bolum>

          <Bolum id="yayin-turu" no="03" baslik="Yayın türü ve düzeni">
            <P>
              Sinaptiklab bir{" "}
              <strong className="font-semibold text-murekkep">dijital süreli yayındır</strong>:
              içerikler tek seferlik makaleler olarak değil, sürümlenen ve düzenli aralıklarla
              yeniden doğrulanan kayıtlar olarak yayımlanır. Sabit bir baskı takvimi yerine, her
              içeriğin kendi tazeleme döngüsü vardır.
            </P>
            <Liste>
              <Madde>
                İçerik türleri: makale, rehber, uygulama, laboratuvar, sözlük terimi, araç kartı,
                ölçüm, vaka çalışması, regülasyon dosyası, kurs ve patika.
              </Madde>
              <Madde>Yayın dili Türkçe; İngilizce ayna sürüm sonraki fazların kararıdır.</Madde>
              <Madde>
                Tüm içerik ücretsiz ve ödeme duvarsızdır; sitede ödeme altyapısı bulunmamaktadır.
              </Madde>
            </Liste>
          </Bolum>

          <Bolum id="teknoloji" no="04" baslik="Teknoloji künyesi">
            <P>
              Teknik bir yayının kendi altyapısını gizlemesi için sebep yok. Site şu bileşenlerle
              çalışıyor:
            </P>
            <Tablo
              ozet="Sinaptiklab'ın çalıştığı teknoloji yığını"
              basliklar={["Katman", "Seçim", "Not"]}
              satirlar={YIGIN}
            />
            <P>
              Sitede üçüncü taraf reklam, sosyal medya gömülü içeriği veya izleyici (tracker) script
              çalışmaz. Hangi verinin nerede tutulduğu ve kimlerin veri işleyen sıfatıyla devrede
              olduğu <Link href="/gizlilik#isleyenler">gizlilik politikasında</Link> ayrıntılıdır.
            </P>
          </Bolum>

          <Bolum id="telif" no="05" baslik="Telif ve lisans">
            <AltBaslik>Metin, görsel ve ölçüm verisi</AltBaslik>
            <P>
              Sitede yayımlanan yazılı içeriğin, özgün görsellerin, şemaların ve ölçüm verilerinin
              telif hakları Sinaptiklab&rsquo;a aittir. İzinsiz çoğaltma, bütünüyle ya da büyük
              ölçüde başka bir mecrada yeniden yayımlama, çeviri yoluyla yeniden yayımlama ve yapay
              zeka çıktısı gibi yeniden paketleyip kaynak göstermeden dağıtma serbest değildir.
            </P>

            <AltBaslik>Kod örnekleri</AltBaslik>
            <P>
              Yazılar içindeki kod blokları ve bağlantı verilen örnek depolar{" "}
              <strong className="font-semibold text-murekkep">MIT Lisansı</strong> ile paylaşılır:
              ticari projeler dahil serbestçe kullanabilir, değiştirebilir ve dağıtabilirsiniz;
              lisans metnini ve telif bildirimini korumanız yeterlidir. Kodun üçüncü taraf bir
              depodan alındığı durumlarda o deponun lisansı geçerlidir ve bu, kod bloğunun yanında
              belirtilir.
            </P>

            <AltBaslik>Alıntı kuralı</AltBaslik>
            <P>
              Yazılarımızdan{" "}
              <strong className="font-semibold text-murekkep">90 kelimeye kadar</strong> alıntı
              yapabilirsiniz; koşullar: alıntının tırnak içinde ya da blok alıntı olarak ayrılması,
              yazarın ve Sinaptiklab&rsquo;ın adının anılması ve alıntının alındığı sayfaya
              doğrudan, takip edilebilir (nofollow olmayan) bir bağlantı verilmesi.
            </P>
            <Kutu etiket="daha fazlası gerekiyorsa">
              <p>
                Daha uzun alıntı, tam metin yeniden yayımı, çeviri ya da eğitim materyalinde
                kullanım için <a href={epostaBaglantisi("İçerik kullanım izni")}>izin isteyin</a> —
                akademik ve eğitim amaçlı taleplere olumlu bakıyoruz. Bu izin Sinaptiklab&rsquo;ın
                kendi tanıdığı bir kullanım iznidir; 5846 sayılı Fikir ve Sanat Eserleri
                Kanunu&rsquo;ndan doğan haklarınız ayrıca saklıdır.
              </p>
            </Kutu>
          </Bolum>

          <Bolum id="makine" no="06" baslik="Makine okunabilir sürümler">
            <P>
              İçeriklerin dil modelleri ve otomatik istemciler için düz metin (Markdown) sürümleri
              vardır; site haritası ve tarayıcı politikası açıktır. Bu yüzeyleri bilerek açık
              tutuyoruz: kaynak göstererek alıntılayan bir asistan, yayının erişimini genişletir.
              Karşılığında beklentimiz aynı:{" "}
              <strong className="font-semibold text-murekkep">
                içerik kullanılıyorsa kaynak gösterilsin.
              </strong>{" "}
              Otomatik erişimin koşulları{" "}
              <Link href="/kullanim-sartlari#otomatik-erisim">kullanım şartlarındadır</Link>.
            </P>
          </Bolum>

          <Bolum id="ilgili" no="07" baslik="İlgili sayfalar">
            <Liste>
              <Madde>
                <Link href="/hakkinda">Hakkında</Link> — yayının amacı, hedef kitlesi ve
                yayımlamadıkları.
              </Madde>
              <Madde>
                <Link href="/editoryal-politika">Editoryal politika</Link> — kaynak, doğrulama,
                düzeltme ve yapay zeka kullanımı kuralları.
              </Madde>
              <Madde>
                <Link href="/kullanim-sartlari">Kullanım şartları</Link> — içeriğin kullanımı,
                garanti reddi ve sorumluluk sınırı.
              </Madde>
              <Madde>
                <Link href="/gizlilik">Gizlilik</Link> ve{" "}
                <Link href="/kvkk-aydinlatma">KVKK aydınlatma metni</Link> — hangi verinin işlendiği
                ve haklarınız.
              </Madde>
            </Liste>
          </Bolum>
        </div>
      </div>
    </>
  );
}
