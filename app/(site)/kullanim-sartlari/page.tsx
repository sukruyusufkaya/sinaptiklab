// /kullanim-sartlari — içeriğin kullanımı, lisans, garanti reddi (BRIEF §2.2).
// Not: sitede hesap, ödeme ve kullanıcı içeriği HENÜZ yok; bu yüzden metin
// üyelik/ödeme koşulları uydurmaz, yalnız bugünkü gerçeği düzenler.
import type { Metadata } from "next";
import Link from "next/link";
import { Bolum } from "@/components/legal/Bolum";
import { KurumsalBaslik } from "@/components/legal/KurumsalBaslik";
import { AltBaslik, Kutu, Liste, Madde, P } from "@/components/legal/Metin";
import { EPOSTA, SON_GUNCELLEME, epostaBaglantisi } from "@/components/legal/sabitler";
import { TaslakUyarisi } from "@/components/legal/TaslakUyarisi";
import { env } from "@/lib/env";

export function generateMetadata(): Metadata {
  return {
    title: "Kullanım Şartları — içerik kullanımı, lisans ve sorumluluk",
    description:
      "Sinaptiklab kullanım şartları: içeriğin kullanımı ve alıntı kuralları, kod örneklerinin MIT lisansı, otomatik erişim koşulları, garanti reddi, sorumluluk sınırı ve uygulanacak hukuk.",
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/kullanim-sartlari` },
  };
}

export default function KullanimSartlariSayfasi() {
  return (
    <>
      <KurumsalBaslik
        indeks="yasal · kullanım şartları"
        baslik="Kullanım şartları"
        spot="Sinaptiklab'ı kullanırken geçerli koşullar: içeriği nasıl kullanabileceğiniz, kod örneklerinin lisansı ve teknik içeriğin neyi garanti etmediği."
        not={<TaslakUyarisi />}
        raylar={[
          { etiket: "erişim", deger: "ücretsiz, üyeliksiz" },
          { etiket: "kod lisansı", deger: "MIT" },
          { etiket: "alıntı", deger: "90 kelimeye kadar" },
          { etiket: "son güncelleme", deger: SON_GUNCELLEME },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="max-w-[var(--govde-olcu)] py-12">
          <Bolum id="kapsam" no="01" baslik="Kapsam ve kabul">
            <P>
              Bu şartlar, <span className="font-mono text-sm">sinaptiklab.com</span> adresinde
              yayımlanan tüm sayfalar, makine okunabilir sürümler ve bağlantı verilen örnek kod
              depoları için geçerlidir. Siteyi kullanmanız bu şartları kabul ettiğiniz anlamına
              gelir; kabul etmiyorsanız siteyi kullanmamanız gerekir.
            </P>
            <P>
              Sitenin tamamı ücretsizdir; içeriği okumak için hesap açmanız gerekmez. Bugün
              itibarıyla sitede üyelik, yorum, forum ve ödeme özellikleri bulunmamaktadır; bu
              özellikler eklendiğinde ilgili koşullar bu metne eklenecektir.
            </P>
          </Bolum>

          <Bolum id="icerik-kullanimi" no="02" baslik="İçeriğin kullanımı ve alıntı">
            <P>
              Yazılı içeriğin, özgün görsellerin, şemaların ve ölçüm verilerinin telif hakları
              Sinaptiklab&rsquo;a aittir. Kişisel okuma, öğrenme, sınıf içi kullanım ve bağlantı
              paylaşımı serbesttir; bunun için izin istemenize gerek yoktur.
            </P>
            <AltBaslik>Serbest olan</AltBaslik>
            <Liste>
              <Madde>
                <strong className="font-semibold text-murekkep">90 kelimeye kadar alıntı.</strong>{" "}
                Koşullar: alıntının tırnak ya da blok alıntı olarak ayrılması, yazar ve Sinaptiklab
                adının anılması ve alıntı yapılan sayfaya doğrudan, takip edilebilir bir bağlantı
                verilmesi.
              </Madde>
              <Madde>
                Sayfa bağlantısını her ortamda paylaşmak, kaynak göstererek atıf yapmak.
              </Madde>
              <Madde>
                Sunum, ders ya da ekip içi çalışmada, kaynak göstererek şekil veya tablo kullanmak.
              </Madde>
            </Liste>
            <AltBaslik>İzne tabi olan</AltBaslik>
            <Liste>
              <Madde>
                Metnin bütününü veya büyük bölümünü başka bir mecrada yeniden yayımlamak.
              </Madde>
              <Madde>Çeviri yoluyla yeniden yayımlamak.</Madde>
              <Madde>
                İçeriği yeniden paketleyip (özet, video anlatım, yapay zeka çıktısı) kaynak
                göstermeden dağıtmak — bu kullanım izne tabi değil, doğrudan yasaktır.
              </Madde>
              <Madde>Ücretli bir eğitim ya da ürünün parçası olarak kullanmak.</Madde>
            </Liste>
            <P>
              İzin talepleri için <a href={epostaBaglantisi("İçerik kullanım izni")}>{EPOSTA}</a>;
              akademik ve eğitim amaçlı taleplere olumlu bakıyoruz. Bu bölümdeki serbestiler
              Sinaptiklab&rsquo;ın kendi tanıdığı kullanım izinleridir; 5846 sayılı Fikir ve Sanat
              Eserleri Kanunu&rsquo;ndan doğan haklarınız ayrıca saklıdır.
            </P>
          </Bolum>

          <Bolum id="kod" no="03" baslik="Kod örnekleri lisansı">
            <P>
              Yazılar içindeki kod blokları ve Sinaptiklab adına yayımlanan örnek depolar{" "}
              <strong className="font-semibold text-murekkep">MIT Lisansı</strong> ile paylaşılır:
              ticari projeler dahil serbestçe kullanabilir, değiştirebilir ve dağıtabilirsiniz;
              lisans metnini ve telif bildirimini korumanız yeterlidir.
            </P>
            <Liste>
              <Madde>
                Kod üçüncü taraf bir kaynaktan alınmışsa o kaynağın lisansı geçerlidir ve bu, kod
                bloğunun yanında belirtilir.
              </Madde>
              <Madde>
                MIT Lisansı, kodun herhangi bir amaca uygunluğunu garanti etmez; kodun sizin
                ortamınızda doğru çalıştığını doğrulamak size aittir.
              </Madde>
              <Madde>
                Örneklerde geçen API anahtarı, uç nokta ve model adları örnek amaçlıdır; kendi
                kimlik bilgilerinizi kullanmanız gerekir.
              </Madde>
            </Liste>
          </Bolum>

          <Bolum
            id="otomatik-erisim"
            no="04"
            baslik="Otomatik erişim ve makine okunabilir sürümler"
          >
            <P>
              İçeriklerin dil modelleri ve otomatik istemciler için düz metin sürümleri vardır;
              tarayıcı politikası <span className="font-mono text-sm">/robots.txt</span> dosyasında
              açıkça yayımlanır ve yapay zeka tarayıcılarına bilerek izin verilir. Karşılığında
              beklentimiz nettir:
            </P>
            <Liste>
              <Madde>
                <strong className="font-semibold text-murekkep">Kaynak gösterin.</strong> İçerik bir
                yanıt ya da özet üretmek için kullanılıyorsa Sinaptiklab adı ve sayfa bağlantısı
                belirtilmelidir.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">robots.txt&rsquo;e uyun.</strong>{" "}
                Kapalı yollara (yönetim paneli, API uçları, arama sonuç sayfaları) erişim
                denenmemelidir.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">Makul hızda gezinin.</strong>{" "}
                Hizmeti aksatacak yoğunlukta istek gönderilmesi, altyapıya zarar verecek tarama ve
                güvenlik önlemlerini aşma girişimleri yasaktır.
              </Madde>
            </Liste>
            <P>
              Bu kurallara aykırı otomatik erişim engellenebilir. Toplu erişim ya da veri kümesi
              ihtiyacınız varsa engelle uğraşmak yerine{" "}
              <a href={epostaBaglantisi("Toplu erişim talebi")}>bize yazın</a>.
            </P>
          </Bolum>

          <Bolum id="garanti" no="05" baslik="Garanti reddi">
            <P>
              Sinaptiklab içeriği{" "}
              <strong className="font-semibold text-murekkep">
                bilgilendirme ve öğretme amaçlıdır
              </strong>
              . Her metin kaynağıyla birlikte yayımlanır ve düzenli olarak yeniden doğrulanır; buna
              rağmen içerik &ldquo;olduğu gibi&rdquo; sunulur ve hatasız, eksiksiz veya güncel
              olduğu garanti edilmez.
            </P>
            <Kutu etiket="özellikle dikkat">
              <p>
                Teknik içerik hızla eskir: model sürümleri değişir, kütüphane arayüzleri kırılır,
                fiyatlar güncellenir. Her sayfada son doğrulama tarihi görünür — üretim kararı
                vermeden önce bu tarihe bakın ve iddiayı kendi ortamınızda doğrulayın.
              </p>
            </Kutu>
            <P>
              Sitedeki hiçbir içerik hukuki, mali, tıbbi ya da mesleki danışmanlık değildir. KVKK ve
              regülasyon içerikleri dahil olmak üzere uyum konularındaki yazılar genel
              bilgilendirmedir; somut durumunuz için yetkin bir danışmana başvurmanız gerekir.
              Mimari tercihler, tedarikçi seçimi ve üretime çıkma kararları{" "}
              <strong className="font-semibold text-murekkep">
                okuyucunun kendi sorumluluğundadır
              </strong>
              .
            </P>
          </Bolum>

          <Bolum id="sorumluluk" no="06" baslik="Sorumluluk sınırı">
            <P>
              Yürürlükteki mevzuatın izin verdiği azami ölçüde; sitenin kullanılmasından, içeriğe
              güvenilerek alınan kararlardan, kod örneklerinin çalıştırılmasından ya da sitenin
              geçici olarak erişilemez olmasından doğabilecek doğrudan veya dolaylı zararlardan
              Sinaptiklab sorumlu tutulamaz. Kasıt ve ağır kusur hâlleri ile mevzuatta öngörülen
              emredici sorumluluk hükümleri saklıdır.
            </P>
            <P>
              Bir hata bulduğunuzda bildirmenizi bekleriz: bildirilen olgusal hatalar düzeltilir ve
              ilgili yazının değişiklik günlüğüne işlenir. Süreç{" "}
              <Link href="/editoryal-politika#duzeltme">editoryal politikada</Link> tanımlıdır.
            </P>
          </Bolum>

          <Bolum id="dis-baglantilar" no="07" baslik="Dış bağlantılar">
            <P>
              Kaynak gösterme zorunluluğumuz gereği yazılarda çok sayıda dış bağlantı bulunur. Bu
              adreslerin içeriği, güncelliği, güvenliği ve gizlilik uygulamaları ilgili sitelerin
              sorumluluğundadır; bir bağlantı vermemiz o siteyi onayladığımız anlamına gelmez.
            </P>
            <P>
              Bir bağlantıya tıkladığınızda artık hedef sitenin kendi kullanım şartları ve çerez
              politikası geçerlidir. Kırık veya artık ilgisiz bir bağlantı fark ederseniz{" "}
              <Link href="/iletisim">bize bildirin</Link>; bağlantılar düzenli olarak taranır,
              kırılan adresler ya arşiv kopyasıyla değiştirilir ya da işaretlenir.
            </P>
          </Bolum>

          <Bolum id="degisiklik" no="08" baslik="Hizmetin sürekliliği ve değişiklik hakkı">
            <P>
              Sinaptiklab, içeriği ve site işlevlerini önceden bildirmeksizin değiştirme, yeniden
              düzenleme, geçici olarak durdurma veya sonlandırma hakkını saklı tutar. Yayımlanmış
              bir sayfanın adresi değişmek zorunda kalırsa eski adres kalıcı yönlendirmeyle korunur;
              bağlantı veren kimse kırık bağlantıyla kalmaz.
            </P>
            <P>
              Bu kullanım şartları da güncellenebilir. Güncel sürüm her zaman bu adreste yayımlanır
              ve başlıktaki &ldquo;son güncelleme&rdquo; tarihinden hangi tarihli olduğunu
              görebilirsiniz. Değişiklikten sonra siteyi kullanmaya devam etmeniz güncel şartları
              kabul ettiğiniz anlamına gelir.
            </P>
          </Bolum>

          <Bolum id="hukuk" no="09" baslik="Uygulanacak hukuk">
            <P>
              Bu kullanım şartlarına ve Sinaptiklab&rsquo;ın kullanımından doğabilecek
              uyuşmazlıklara{" "}
              <strong className="font-semibold text-murekkep">Türkiye Cumhuriyeti hukuku</strong>{" "}
              uygulanır. Yetkili mahkeme ve icra dairelerinin belirlenmesinde yürürlükteki mevzuat
              hükümleri geçerlidir; tüketici sıfatını haiz kişiler bakımından tüketici mevzuatının
              öngördüğü başvuru yolları saklıdır.
            </P>
            <P>
              Şartlarla ilgili sorularınız için: <a href={`mailto:${EPOSTA}`}>{EPOSTA}</a>. İlgili
              diğer metinler: <Link href="/gizlilik">gizlilik politikası</Link>,{" "}
              <Link href="/kvkk-aydinlatma">KVKK aydınlatma metni</Link>,{" "}
              <Link href="/cerez-politikasi">çerez politikası</Link> ve{" "}
              <Link href="/kunye">künye</Link>.
            </P>
          </Bolum>
        </div>
      </div>
    </>
  );
}
