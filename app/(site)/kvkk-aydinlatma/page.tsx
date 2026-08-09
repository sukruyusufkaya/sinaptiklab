// /kvkk-aydinlatma — 6698 sayılı KVKK md.10 aydınlatma metni (BRIEF §9.3).
// DURUM: taslak; hukuk danışmanı incelemesi bekliyor (sayfanın en üstünde
// görünür şekilde beyan edilir). Metin, sitenin BUGÜN fiilen işlediği veriyi
// anlatır — henüz kurulmamış özellikler "aktif değil" olarak işaretlidir.
import type { Metadata } from "next";
import Link from "next/link";
import { Bolum } from "@/components/legal/Bolum";
import { KurumsalBaslik } from "@/components/legal/KurumsalBaslik";
import {
  AltBaslik,
  Kutu,
  Liste,
  Madde,
  P,
  SiraliListe,
  SiraliMadde,
} from "@/components/legal/Metin";
import { EPOSTA, SON_GUNCELLEME, YAZAR, epostaBaglantisi } from "@/components/legal/sabitler";
import { Tablo } from "@/components/legal/Tablo";
import { TaslakUyarisi } from "@/components/legal/TaslakUyarisi";
import { env } from "@/lib/env";

export function generateMetadata(): Metadata {
  return {
    title: "KVKK Aydınlatma Metni — veri sorumlusu, haklar, başvuru",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni: veri sorumlusu, işlenen veri kategorileri, işleme amaçları ve hukuki sebepleri, yurt dışına aktarım, saklama süreleri, ilgili kişi hakları ve başvuru yolu.",
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/kvkk-aydinlatma` },
  };
}

const KATEGORILER = [
  [
    "İşlem güvenliği kayıtları",
    "IP adresi, tarayıcı ve cihaz bilgisi, istek zamanı, istenen adres",
    "Barındırma sağlayıcısının altyapı günlükleri; bizim tarafımızdan sorgulanmaz",
    "Aktif",
  ],
  [
    "Ölçüm olayları",
    "Ziyaret edilen yol, dış yönlendiren alan adı, zaman damgası",
    "Çerez, kimlik veya IP içermez; bir kişiyle ilişkilendirilemez",
    "Aktif",
  ],
  [
    "İletişim verisi",
    "E-posta adresi, mesajda paylaştığınız ad ve içerik",
    "Yalnızca siz bize yazarsanız oluşur",
    "Aktif",
  ],
  [
    "Bülten aboneliği",
    "E-posta adresi, onay kaydı ve zamanı",
    "Çift onaylı abonelik; altyapı henüz kurulmadı",
    "Aktif değil",
  ],
  [
    "Üyelik verisi",
    "E-posta adresi, görünen ad, oturum kayıtları",
    "Ücretsiz üyelik ve yorum özelliğiyle birlikte gelecek",
    "Aktif değil",
  ],
] as const;

const AMACLAR = [
  [
    "Sitenin güvenli ve kesintisiz sunulması",
    "İşlem güvenliği kayıtları",
    "md.5/2-(ç) hukuki yükümlülük ve md.5/2-(f) meşru menfaat",
  ],
  [
    "Hangi içeriğin nereden okunduğunun ölçülmesi, yayın kararlarının verilmesi",
    "Ölçüm olayları",
    "md.5/2-(f) meşru menfaat",
  ],
  [
    "Başvuru, hata bildirimi ve talepleriniz ile ilgili iletişim kurulması",
    "İletişim verisi",
    "md.5/2-(f) meşru menfaat; KVKK başvurusu ise md.5/2-(ç) hukuki yükümlülük",
  ],
  ["Bülten gönderimi (etkinleştiğinde)", "Bülten aboneliği", "md.5/1 açık rıza"],
  [
    "Üyelik ve yorum hizmetinin sunulması (etkinleştiğinde)",
    "Üyelik verisi",
    "md.5/2-(c) sözleşmenin kurulması ve ifası",
  ],
] as const;

const ALICILAR = [
  [
    "Vercel Inc.",
    "Barındırma ve içerik dağıtımı",
    "ABD merkezli; sunucu bölgesi Frankfurt (AB)",
    "İşlem güvenliği kayıtları, site trafiği",
  ],
  [
    "MongoDB, Inc. (Atlas)",
    "Veritabanı hizmeti",
    "ABD merkezli; küme bölgesi Frankfurt (AB)",
    "İçerik kayıtları ve ölçüm olayları",
  ],
  ["Resend", "E-posta gönderimi — aktif değil", "ABD", "Bülten etkinleştiğinde e-posta adresi"],
  [
    "Upstash",
    "Oran sınırlama / önbellek — aktif değil",
    "Sağlayıcı bölgesine göre",
    "Etkinleştiğinde teknik istek verisi",
  ],
] as const;

const HAKLAR = [
  "Kişisel verinizin işlenip işlenmediğini öğrenme,",
  "İşlenmişse buna ilişkin bilgi talep etme,",
  "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
  "Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme,",
  "Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,",
  "Kanunun 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,",
  "Düzeltme, silme ve yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,",
  "İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç ortaya çıkmasına itiraz etme,",
  "Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.",
] as const;

export default function KvkkAydinlatmaSayfasi() {
  return (
    <>
      <KurumsalBaslik
        indeks="yasal · kvkk aydınlatma"
        baslik="KVKK aydınlatma metni"
        spot="6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi kapsamında, Sinaptiklab'ı ziyaret ettiğinizde hangi verinin neden işlendiğini, nereye aktarıldığını ve haklarınızı açıklar."
        not={<TaslakUyarisi />}
        raylar={[
          { etiket: "veri sorumlusu", deger: YAZAR },
          { etiket: "kanun", deger: "6698 sayılı KVKK" },
          { etiket: "başvuru süresi", deger: "en geç 30 gün" },
          { etiket: "son güncelleme", deger: SON_GUNCELLEME },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="max-w-[var(--govde-olcu)] py-12">
          <Bolum id="veri-sorumlusu" no="01" baslik="Veri sorumlusunun kimliği">
            <P>
              Bu aydınlatma metni, <span className="font-mono text-sm">sinaptiklab.com</span>{" "}
              adresinde yayımlanan Sinaptiklab için düzenlenmiştir. Veri sorumlusu sıfatıyla hareket
              eden <strong className="font-semibold text-murekkep">{YAZAR}</strong>&rsquo;ya{" "}
              <a href={`mailto:${EPOSTA}`}>{EPOSTA}</a> adresinden ulaşabilirsiniz.
            </P>
            <P>
              Sinaptiklab bugün bir tüzel kişilik altında değil, kurucusunun şahsi sorumluluğunda
              yayımlanmaktadır. Tüzel kişilik kurulması hâlinde veri sorumlusu bilgileri güncellenir
              ve gerekli sicil yükümlülükleri yerine getirilir.
            </P>
          </Bolum>

          <Bolum id="kategoriler" no="02" baslik="İşlenen kişisel veri kategorileri">
            <P>
              Sinaptiklab, tasarımı gereği veri toplamayı en aza indirir: içeriğin tamamı üyelik
              gerektirmeden okunur, sitede reklam ve izleyici (tracker) script çalışmaz, parmak izi
              çıkarılmaz. Bugün fiilen işlenen veriler şunlardır:
            </P>
            <Tablo
              ozet="İşlenen kişisel veri kategorileri, içerdiği veriler ve güncel durumları"
              basliklar={["Kategori", "İçerdiği veriler", "Not", "Durum"]}
              satirlar={KATEGORILER}
            />
            <Kutu etiket="çerez ve tarayıcı depolaması">
              <p>
                Sitede reklam, ölçüm veya kişiselleştirme çerezi kullanılmaz. Açık/koyu tema
                tercihiniz tarayıcınızın yerel depolamasında (localStorage) tutulur, sunucuya
                gönderilmez ve kimliğinizle ilişkilendirilmez. Ayrıntı{" "}
                <Link href="/cerez-politikasi">çerez politikasında</Link>.
              </p>
            </Kutu>
          </Bolum>

          <Bolum id="toplama" no="03" baslik="Verilerin toplanma yöntemi">
            <P>
              Veriler tamamen elektronik ortamda toplanır:{" "}
              <strong className="font-semibold text-murekkep">otomatik yollarla</strong> (siteyi
              görüntülemeniz sırasında barındırma altyapısının ürettiği teknik kayıtlar ve kimlik
              içermeyen ölçüm olayları) ve{" "}
              <strong className="font-semibold text-murekkep">sizin beyanınızla</strong> (bize
              e-posta yazmanız; ileride bülten aboneliği ya da üyelik oluşturmanız).
            </P>
          </Bolum>

          <Bolum id="amaclar" no="04" baslik="İşleme amaçları ve hukuki sebepleri">
            <P>
              Her veri kategorisi, aşağıdaki tabloda belirtilen amaçla ve Kanun&rsquo;un 5.
              maddesinde sayılan hukuki sebeplere dayanılarak işlenir.
            </P>
            <Tablo
              ozet="İşleme amaçları, ilgili veri kategorileri ve dayanılan hukuki sebepler"
              basliklar={["Amaç", "Veri", "Hukuki sebep (md.5)"]}
              satirlar={AMACLAR}
            />
            <P>
              Kişisel verileriniz, bu tabloda yazılı amaçların dışında hiçbir amaçla işlenmez;
              profil çıkarma, reklam hedefleme veya üçüncü taraflara satış/pazarlama amaçlı aktarım
              yapılmaz.
            </P>
          </Bolum>

          <Bolum id="aktarim" no="05" baslik="Aktarım ve yurt dışına aktarım">
            <P>
              Site, bulut hizmet sağlayıcıları üzerinde çalışır; bu nedenle veriler sağlayıcıların
              altyapısında bulunur. Aşağıdaki alıcılar hizmet sağlayıcı sıfatıyla devrededir:
            </P>
            <Tablo
              ozet="Veri aktarılan hizmet sağlayıcılar, rolleri, konumları ve aktarılan veriler"
              basliklar={["Alıcı", "Rol", "Konum", "Aktarılan veri"]}
              satirlar={ALICILAR}
            />
            <P>
              Veritabanı ve barındırma bölgesi olarak Frankfurt (Avrupa Birliği) seçilmiştir;
              verilerin fiilen durduğu yer burasıdır. Bununla birlikte sağlayıcıların merkezi yurt
              dışında olduğundan, destek ve bakım süreçlerinde yurt dışına erişim söz konusu
              olabilir. Bu nedenle işleme, Kanun&rsquo;un 9. maddesi kapsamında yurt dışına aktarım
              olarak değerlendirilir; aktarım, ilgili maddede öngörülen uygun güvencelere (standart
              sözleşme dahil) ya da açık rızanıza dayanılarak yapılır.
            </P>
            <P>
              Yetkili kamu kurum ve kuruluşlarından mevzuata uygun bir talep gelmesi hâlinde,
              yalnızca talebin kapsamıyla sınırlı olarak ve hukuki yükümlülük gereği paylaşım
              yapılabilir.
            </P>
          </Bolum>

          <Bolum id="saklama" no="06" baslik="Saklama süreleri">
            <Liste>
              <Madde>
                <strong className="font-semibold text-murekkep">Ölçüm olayları:</strong> 90 gün.
                Süre, veritabanı düzeyinde otomatik silme kuralıyla uygulanır; elle müdahale
                gerekmez.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">İşlem güvenliği kayıtları:</strong>{" "}
                barındırma sağlayıcısının kendi saklama politikasına tabidir; bu kayıtları biz
                oluşturmaz ve arşivlemeyiz.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">İletişim yazışmaları:</strong>{" "}
                başvurunun sonuçlanmasına kadar; olası bir uyuşmazlıkta delil niteliği taşıdığı
                sürece ilgili mevzuattaki zamanaşımı süreleri saklı kalmak üzere.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">Bülten ve üyelik verisi:</strong>{" "}
                aboneliğiniz/üyeliğiniz sürdüğü müddetçe; abonelikten çıktığınızda veya üyeliğinizi
                sildiğinizde silinir. Bu kategoriler henüz aktif değildir.
              </Madde>
            </Liste>
            <P>Saklama süresi dolan veriler silinir, yok edilir veya anonim hâle getirilir.</P>
          </Bolum>

          <Bolum id="haklar" no="07" baslik="İlgili kişi olarak haklarınız">
            <P>Kanun&rsquo;un 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</P>
            <SiraliListe>
              {HAKLAR.map((hak, sira) => (
                <SiraliMadde key={hak} no={sira + 1}>
                  {hak}
                </SiraliMadde>
              ))}
            </SiraliListe>
          </Bolum>

          <Bolum id="basvuru" no="08" baslik="Başvuru yolu ve süresi">
            <P>
              Yukarıdaki haklarınıza ilişkin taleplerinizi{" "}
              <a href={epostaBaglantisi("KVKK başvurusu")}>{EPOSTA}</a> adresine, konu satırına
              &ldquo;KVKK başvurusu&rdquo; yazarak iletebilirsiniz. Başvurunuzda kimliğinizi tespit
              etmeye yarayan bilgiler ile talebinizin konusunun açıkça yer alması gerekir; aksi
              hâlde talebi sonuçlandıramayabiliriz.
            </P>
            <AltBaslik>Süre ve ücret</AltBaslik>
            <P>
              Başvurunuz, talebin niteliğine göre en kısa sürede ve{" "}
              <strong className="font-semibold text-murekkep">en geç otuz gün</strong> içinde
              sonuçlandırılır (md.13). Başvurular kural olarak ücretsizdir; işlemin ayrıca bir
              maliyet gerektirmesi hâlinde ilgili mevzuatta belirlenen tarifeye göre ücret talep
              edilebilir.
            </P>
            <P>
              Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya süresinde cevap
              verilmemesi hâlinde Kişisel Verileri Koruma Kurulu&rsquo;na şikâyette bulunma hakkınız
              saklıdır (md.14). Başvurunun usul ve esasları hakkında Kurum&rsquo;un yayımladığı
              &ldquo;Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ&rdquo; hükümleri
              uygulanır.
            </P>
          </Bolum>

          <Bolum id="guncelleme" no="09" baslik="Metnin güncellenmesi">
            <P>
              Bu aydınlatma metni, sitenin fiilen işlediği veri değiştiğinde güncellenir — örneğin
              bülten aboneliği veya üyelik etkinleştiğinde, yeni bir hizmet sağlayıcı devreye
              girdiğinde ya da hukuk incelemesi tamamlandığında. Güncel sürüm her zaman bu adreste
              yayımlanır; başlıktaki &ldquo;son güncelleme&rdquo; tarihi metnin hangi tarihli
              olduğunu gösterir.
            </P>
            <P>
              İlgili diğer metinler: <Link href="/gizlilik">gizlilik politikası</Link>,{" "}
              <Link href="/cerez-politikasi">çerez politikası</Link> ve{" "}
              <Link href="/kullanim-sartlari">kullanım şartları</Link>.
            </P>
          </Bolum>
        </div>
      </div>
    </>
  );
}
