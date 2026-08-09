// /gizlilik — sade dille gizlilik politikası (BRIEF §9.3, §12.2).
// KVKK aydınlatma metninin hukuki dili yerine "ne topluyoruz / ne toplamıyoruz"
// anlatımı. İki metin çelişemez: biri değişirse diğeri aynı commit'te güncellenir.
import type { Metadata } from "next";
import Link from "next/link";
import { Bolum } from "@/components/legal/Bolum";
import { KurumsalBaslik } from "@/components/legal/KurumsalBaslik";
import { Kutu, Liste, Madde, P } from "@/components/legal/Metin";
import { EPOSTA, SON_GUNCELLEME, epostaBaglantisi } from "@/components/legal/sabitler";
import { Tablo } from "@/components/legal/Tablo";
import { TaslakUyarisi } from "@/components/legal/TaslakUyarisi";
import { env } from "@/lib/env";

export function generateMetadata(): Metadata {
  return {
    title: "Gizlilik Politikası — ne topluyoruz, ne toplamıyoruz",
    description:
      "Sinaptiklab'ın gizlilik politikası: reklam takibi ve parmak izi yok, üçüncü taraf script yok. Toplanan tek şey kimliksiz sayfa ölçümü; veri işleyenler ve saklama süreleriyle birlikte açıklanır.",
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/gizlilik` },
  };
}

const ISLEYENLER = [
  [
    "Vercel Inc.",
    "Siteyi barındırma ve dağıtma",
    "Sunucu isteği kayıtları (IP, tarayıcı, zaman)",
    "Sunucu bölgesi Frankfurt (AB); şirket merkezi ABD",
  ],
  [
    "MongoDB, Inc. (Atlas)",
    "İçerik ve ölçüm olaylarının veritabanı",
    "İçerik kayıtları; yol + yönlendiren alan adı + zaman",
    "Küme bölgesi Frankfurt (AB); şirket merkezi ABD",
  ],
  [
    "Resend — aktif değil",
    "Bülten ve bildirim e-postası",
    "Etkinleştiğinde yalnızca e-posta adresi ve onay kaydı",
    "ABD",
  ],
  [
    "Upstash — aktif değil",
    "Oran sınırlama ve önbellek",
    "Etkinleştiğinde geçici teknik istek verisi",
    "Sağlayıcı bölgesine göre",
  ],
] as const;

export default function GizlilikSayfasi() {
  return (
    <>
      <KurumsalBaslik
        indeks="yasal · gizlilik"
        baslik="Gizlilik politikası"
        spot="Kısa cevap: sizi tanımıyoruz ve tanımak istemiyoruz. Sitede reklam takibi, parmak izi çıkarma ve üçüncü taraf script yok; ölçüm yaptığımız tek şey hangi sayfanın nereden okunduğu."
        not={<TaslakUyarisi />}
        raylar={[
          { etiket: "üçüncü taraf script", deger: "0" },
          { etiket: "reklam / takip çerezi", deger: "yok" },
          { etiket: "ölçüm saklama", deger: "90 gün" },
          { etiket: "son güncelleme", deger: SON_GUNCELLEME },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="max-w-[var(--govde-olcu)] py-12">
          <Bolum id="ozet" no="01" baslik="Bir paragrafta">
            <P>
              Sinaptiklab&rsquo;ı okumak için hesap açmanız, çerez onayı vermeniz ya da herhangi bir
              bilgi paylaşmanız gerekmez. Sunucumuza ulaşan tek ölçüm kaydı şudur: hangi sayfa
              görüntülendi, ziyaretçi hangi dış siteden geldi ve ne zaman. Bu kayıtta IP adresi,
              çerez, oturum kimliği veya tarayıcı parmak izi yoktur; iki ziyaretin aynı kişiye ait
              olup olmadığını bilemeyiz ve bilmek istemeyiz.
            </P>
            <P>
              Bu sayfa günlük dille yazılmıştır. Kanuni karşılıkları — hukuki sebepler, aktarım
              esasları ve haklarınız —{" "}
              <Link href="/kvkk-aydinlatma">KVKK aydınlatma metnindedir</Link>.
            </P>
          </Bolum>

          <Bolum id="topladiklarimiz" no="02" baslik="Ne topluyoruz">
            <Liste>
              <Madde>
                <strong className="font-semibold text-murekkep">Sayfa ölçümü.</strong> Sayfayı başka
                bir siteden gelerek açtığınızda, tarayıcınız arka planda tek bir kayıt gönderir:
                görüntülenen yol (örneğin{" "}
                <span className="font-mono text-sm">/makale/ornek-yazi</span>), yönlendiren sitenin
                alan adı (örneğin <span className="font-mono text-sm">google.com</span>) ve zaman
                damgası. Site içi gezinme kayıt üretmez.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">Sunucu istek kayıtları.</strong> Her
                web sitesinde olduğu gibi barındırma sağlayıcımız altyapı düzeyinde teknik günlükler
                tutar. Bu günlükleri biz oluşturmaz, sorgulamaz ve arşivlemeyiz; sağlayıcının kendi
                saklama politikasına tabidir.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">Bize yazdıklarınız.</strong> E-posta
                gönderirseniz adresiniz ve mesajınız doğal olarak elimizde olur. Yalnızca o yazışma
                için kullanılır; listeye eklenmez.
              </Madde>
            </Liste>
            <Kutu etiket="neden ölçüyoruz">
              <p>
                Hangi konunun okunduğunu bilmeden yayın planı yapılamıyor. Ölçüm, &ldquo;kim
                okudu&rdquo; sorusuna değil &ldquo;hangi konu işe yaradı&rdquo; sorusuna cevap
                verecek asgari düzeyde tutuldu; kayıtlar 90 gün sonra veritabanı tarafından otomatik
                silinir.
              </p>
            </Kutu>
          </Bolum>

          <Bolum id="toplamadiklarimiz" no="03" baslik="Ne toplamıyoruz">
            <P>Aşağıdakilerin hiçbiri sitede yoktur — &ldquo;kapalı&rdquo; değil, hiç yok:</P>
            <Liste>
              <Madde>Reklam ağı, yeniden hedefleme pikseli, dönüşüm etiketi.</Madde>
              <Madde>
                Tarayıcı parmak izi çıkarma (ekran, yazı tipi, tuval, ses cihazı sorgulaması).
              </Madde>
              <Madde>
                Üçüncü taraf script — sosyal medya gömülü içeriği, sohbet balonu, ısı haritası,
                oturum kaydı ve harici yazı tipi/CDN çağrısı dahil. Yazı tipleri derleme sırasında
                kendi sunucumuza kopyalanır.
              </Madde>
              <Madde>Kişiselleştirme veya davranış takibi amaçlı çerez.</Madde>
              <Madde>
                Kesin konum verisi, cihaz kimliği, kişilerin listesi ya da benzeri hassas veri.
              </Madde>
              <Madde>
                Ödeme verisi — sitede ödeme altyapısı yoktur, kart bilgisi hiçbir aşamada istenmez.
              </Madde>
            </Liste>
          </Bolum>

          <Bolum id="cerez" no="04" baslik="Çerezler ve tarayıcı depolaması">
            <P>
              Sinaptiklab bugün hiçbir çerez yazmaz. Bu yüzden sitede çerez onay penceresi de
              görmezsiniz: onaylanacak bir şey yok.
            </P>
            <P>
              Açık/koyu tema tercihiniz tarayıcınızın yerel depolamasında (localStorage) saklanır.
              Bu bir çerez değildir; sunucuya hiçbir zaman gönderilmez, yalnızca cihazınızda kalır
              ve tarayıcı verilerini temizlediğinizde silinir. Ayrıntı{" "}
              <Link href="/cerez-politikasi">çerez politikasında</Link>.
            </P>
          </Bolum>

          <Bolum id="isleyenler" no="05" baslik="Veri işleyenler">
            <P>
              Site bulut altyapısı üzerinde çalışır; dolayısıyla veriler aşağıdaki sağlayıcıların
              sistemlerinde bulunur. Listeyi kısa tutmayı ilke edindik: yeni bir sağlayıcı eklenirse
              bu tablo ve <Link href="/kvkk-aydinlatma#aktarim">aydınlatma metni</Link> aynı anda
              güncellenir.
            </P>
            <Tablo
              ozet="Sinaptiklab için veri işleyen hizmet sağlayıcılar ve konumları"
              basliklar={["İşleyen", "Ne için", "Hangi veri", "Nerede"]}
              satirlar={ISLEYENLER}
            />
            <P>
              Verileriniz reklam, pazarlama ya da satış amacıyla hiçbir üçüncü tarafa aktarılmaz;
              veri satışı yapılmaz.
            </P>
          </Bolum>

          <Bolum id="guvenlik" no="06" baslik="Güvenlik">
            <Liste>
              <Madde>Site yalnızca şifreli bağlantı (HTTPS) üzerinden sunulur.</Madde>
              <Madde>
                Tarayıcıda çalışan script&rsquo;ler içerik güvenlik politikasıyla sınırlandırılır;
                dışarıdan script yüklenmesi engellenir.
              </Madde>
              <Madde>
                Yönetim paneli herkese kapalıdır ve kimlik doğrulaması olmadan erişilemez; arama
                motorlarına da kapatılmıştır.
              </Madde>
              <Madde>
                Sunucuya gelen tüm girdiler şema doğrulamasından geçer; beklenmeyen alanlar kayda
                yazılmaz.
              </Madde>
              <Madde>
                Erişim sırları (veritabanı, API anahtarları) kod deposunda tutulmaz; dağıtım
                ortamının gizli değişkenlerinde saklanır.
              </Madde>
            </Liste>
            <P>
              Bir güvenlik açığı fark ederseniz, kamuya duyurmadan önce{" "}
              <a href={epostaBaglantisi("Güvenlik bildirimi")}>bize bildirin</a>; en kısa sürede
              dönüş yapar ve düzeltmeden sonra isterseniz bildirimde adınızı anarız.
            </P>
          </Bolum>

          <Bolum id="haklar" no="07" baslik="Haklarınız ve iletişim">
            <P>
              Kişisel verilerinize ilişkin bilgi alma, düzeltme, silme ve itiraz haklarınızın tam
              listesi ile başvuru usulü{" "}
              <Link href="/kvkk-aydinlatma#haklar">KVKK aydınlatma metnindedir</Link>.
              Başvurularınız en geç otuz gün içinde yanıtlanır.
            </P>
            <P>
              Her konuda tek adres: <a href={`mailto:${EPOSTA}`}>{EPOSTA}</a>. Konu başlıklarına
              göre yönlendirme <Link href="/iletisim">iletişim sayfasında</Link>.
            </P>
          </Bolum>

          <Bolum id="degisiklik" no="08" baslik="Bu politika değişirse">
            <P>
              Gizlilik politikası, sitenin fiilen ne yaptığını anlatır; dolayısıyla site değişince
              politika da değişir. Bülten, üyelik ve yorum özellikleri açıldığında bu sayfa aynı gün
              güncellenecek ve toplanan yeni veri açıkça yazılacaktır. Sizi olumsuz etkileyecek
              nitelikte bir değişiklik olursa bunu ana sayfada da duyururuz.
            </P>
          </Bolum>
        </div>
      </div>
    </>
  );
}
