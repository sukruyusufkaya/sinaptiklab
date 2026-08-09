// /editoryal-politika — yayın kuralları (BRIEF §2.2, §4.3). Buradaki her kural
// kodda karşılığı olan bir kuraldır; metin, §4.3 yayın kapılarının okunur dile
// çevrilmiş hâlidir. Kural değişirse hem bu sayfa hem doğrulayıcılar güncellenir.
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
import { env } from "@/lib/env";

export function generateMetadata(): Metadata {
  return {
    title: "Editoryal Politika — kaynak, doğrulama, düzeltme kuralları",
    description:
      "Sinaptiklab'ın yayın kuralları: her iddianın kaynağa bağlanması, yayın öncesi on kontrol, 180 günlük tazeleme döngüsü, düzeltme ve geri çekme politikası, yapay zeka kullanımı beyanı.",
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/editoryal-politika` },
  };
}

const KAPILAR = [
  "İçeriğe bağlı en az bir kaynak var ve metindeki her sayı ile her olgusal iddia bu listeden bir kayda dayanıyor.",
  "Yazının başındaki doğrudan cevap bloğu dolu ve 40–80 kelime arasında; okuyucu sorusunun karşılığını ilk ekranda görüyor.",
  "En az iki soru-cevap maddesi var.",
  "İçindekiler üretilmiş; tüm ara başlıklarda kalıcı, değişmeyen bağlantı kimliği bulunuyor.",
  "Tüm görsellerde anlamlı alternatif metin dolu.",
  "Uygulama ve laboratuvar içeriklerinde çalışan bir kod deposu adresi var.",
  "Araç kartı ve ölçüm içeriklerinde son doğrulama tarihi 90 günden eski değil.",
  "En az üç iç bağlantı ve en az iki dış otoriter kaynak bağlantısı var.",
  "Adres (slug) çakışması yok; adres değiştiyse eski adres için kalıcı yönlendirme kaydı üretilmiş.",
  "Kırık bağlantı taraması temiz — metindeki her dış bağlantı yayın anında erişilebilir.",
] as const;

const DUZELTME_TURLERI = [
  [
    "Dizgi ve biçim",
    "Yazım hatası, bozuk bağlantı biçimi, kod bloğu girintisi",
    "Sessiz düzeltilir, günlüğe işlenmez",
  ],
  [
    "Olgusal düzeltme",
    "Yanlış sayı, yanlış sürüm, kaynağın desteklemediği iddia",
    "Düzeltilir; değişiklik günlüğüne tarih ve gerekçeyle yazılır",
  ],
  [
    "Kapsamlı revizyon",
    "Sonuç değiştiren yeni ölçüm, kırılan API, değişen fiyat modeli",
    "İçerik sürümü yükselir; günlükte neyin neden değiştiği açıklanır",
  ],
  [
    "Geri çekme",
    "Metnin ana tezi savunulamaz hâle geldi",
    "Sayfa silinmez; en üstte geri çekme notu ve gerekçesiyle yayında kalır",
  ],
] as const;

export default function EditoryalPolitikaSayfasi() {
  return (
    <>
      <KurumsalBaslik
        indeks="kurumsal · editoryal politika"
        baslik="Editoryal politika"
        spot="Yayın kurallarımız temenni değil, kod. Kaynak listesi boş bir metin yayına geçemez; bu sayfa, o kuralların insan diline çevrilmiş hâlidir."
        raylar={[
          { etiket: "yayın kapısı", deger: "10 kontrol" },
          { etiket: "tazeleme eşiği", deger: "180 gün" },
          { etiket: "sponsorlu içerik", deger: "yok" },
          { etiket: "son güncelleme", deger: SON_GUNCELLEME },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="max-w-[var(--govde-olcu)] py-12">
          <Bolum id="ilke" no="01" baslik="Temel ilke">
            <P>
              &ldquo;Saha verisi, uydurma yok.&rdquo; Bu cümle bir slogan olarak değil, bir kabul
              ölçütü olarak işler: bir metnin yayımlanabilmesi, iddialarının kaynağa
              bağlanabilmesine bağlıdır. Bağlanamıyorsa metin yayımlanmaz ya da o iddia metinden
              çıkar.
            </P>
            <P>
              Bunun pratik sonucu şudur: bir konuda henüz elimizde ölçüm ya da güvenilir kaynak
              yoksa o konuda yazmayız. Boşluğu tahminle doldurmak, boşluğu bırakmaktan daha
              maliyetlidir.
            </P>
          </Bolum>

          <Bolum id="kaynak" no="02" baslik="Kaynak politikası">
            <P>
              Her içerik, veritabanında kendi kaynak listesiyle birlikte saklanır. Bu liste metadan
              ayrı bir dekor değil, yayın koşuludur: liste boşsa yayın eylemi teknik olarak
              reddedilir. Kaynak sıralamamız:
            </P>
            <Liste>
              <Madde>
                <strong className="font-semibold text-murekkep">Birincil kaynak.</strong> Resmî
                dokümantasyon, sürüm notları, model kartları, hakemli yayınlar, teknik raporlar,
                standart ve mevzuat metinleri.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">Birinci elden ölçüm.</strong> Kendi
                kurduğumuz düzenekte alınan sonuçlar; donanım, sürüm, veri kümesi ve yöntem
                yazılmadan yayımlanmaz.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">İkincil aktarım.</strong> Yalnızca
                birincil kaynağa ulaşılamadığında ve bu durum metinde belirtilerek kullanılır.
              </Madde>
            </Liste>
            <P>
              Her kaynak kaydında bağlantı, yayıncı ve erişim tarihi tutulur. Kaynak bağlantısı
              ölmüş olsa bile kaydın kendisi (başlık, yayıncı, tarih) metinde kalır; okuyucu
              iddianın neye dayandığını her hâlükârda görebilir.
            </P>
            <Kutu etiket="ne kaynak sayılmaz">
              <p>
                Bir dil modelinin çıktısı, kaynağı belirsiz bir ekran görüntüsü, &ldquo;bir
                araştırmaya göre&rdquo; diye başlayan atıfsız cümleler ve tanıtım amaçlı ürün
                sayfalarındaki performans iddiaları kaynak sayılmaz.
              </p>
            </Kutu>
          </Bolum>

          <Bolum id="yayin-kapisi" no="03" baslik="Yayın kapısı — on kontrol">
            <P>
              Bir taslak, aşağıdaki on kontrolün tamamı yeşile dönmeden &ldquo;yayında&rdquo;
              durumuna geçemez. Kontroller yönetim panelinde madde madde görünür; eksik varsa yayın
              düğmesi pasif kalır ve hata mesajı ne yapılması gerektiğini söyler.
            </P>
            <SiraliListe>
              {KAPILAR.map((kapi, sira) => (
                <SiraliMadde key={kapi} no={sira + 1}>
                  {kapi}
                </SiraliMadde>
              ))}
            </SiraliListe>
            <P>
              Bu kapılar yazının iyi olduğunu garanti etmez; yalnızca kötü olmasının bilinen
              yollarını kapatır. Metnin doğruluğu ve derinliği hâlâ insan işidir.
            </P>
          </Bolum>

          <Bolum id="dogrulama" no="04" baslik="Doğrulama ve tazeleme">
            <P>
              Teknik içeriğin raf ömrü vardır. Her yazıda üç ayrı tarih tutulur: ilk yayın tarihi,
              son güncelleme tarihi ve{" "}
              <strong className="font-semibold text-murekkep">son doğrulama tarihi</strong>.
              Sonuncusu, metindeki iddiaların en son ne zaman gerçekten kontrol edildiğini söyler —
              kozmetik bir düzenleme bu tarihi ilerletmez.
            </P>
            <Liste>
              <Madde>
                Araç kartları ve ölçüm içerikleri, son doğrulaması 90 günden eskiyse yayına
                alınamaz.
              </Madde>
              <Madde>
                Son doğrulaması 180 günü geçen her içerik &ldquo;çürüyen içerik&rdquo; listesine
                düşer ve yeniden elden geçirilmek üzere kuyruğa alınır.
              </Madde>
              <Madde>
                Dış bağlantılar düzenli olarak taranır; kırılan bağlantı ya arşiv kopyasıyla
                değiştirilir ya da kaynak kaydı &ldquo;erişilemiyor&rdquo; notuyla işaretlenir.
              </Madde>
            </Liste>
            <P>
              Tazeleme sırasında iddia hâlâ geçerliyse yalnızca doğrulama tarihi ilerler; geçerli
              değilse metin düzeltilir ve aşağıdaki düzeltme politikası işler.
            </P>
          </Bolum>

          <Bolum id="duzeltme" no="05" baslik="Düzeltme ve geri çekme">
            <P>
              Hata yapıyoruz; önemli olan hatanın izinin kalması. Sinaptiklab&rsquo;da bir yazının
              sessizce değiştirilip &ldquo;hiç öyle yazmamıştık&rdquo; hâline gelmesi kabul edilmez.
              Düzeltmeleri dört sınıfta ele alıyoruz:
            </P>
            <Tablo
              ozet="Düzeltme türleri, örnekleri ve uygulanan işlem"
              basliklar={["Tür", "Örnek", "İşlem"]}
              satirlar={DUZELTME_TURLERI}
            />
            <P>
              Olgusal düzeltme ve üzeri her değişiklik, ilgili yazının altındaki değişiklik
              günlüğünde tarih, değişen bilgi ve gerekçesiyle görünür. Yayımlanmış bir adres (URL)
              değiştirilmek zorunda kalırsa eski adres kalıcı yönlendirmeyle korunur; bağlantı veren
              kimse kırık bağlantıyla kalmaz.
            </P>
          </Bolum>

          <Bolum id="yapay-zeka" no="06" baslik="Yapay zeka kullanımı beyanı">
            <P>
              Yapay zeka üzerine yazan bir yayının, bu araçları kendi üretim sürecinde nasıl
              kullandığını gizlemesi tutarsız olurdu. Beyanımız açık:
            </P>
            <Liste>
              <Madde>
                Yapay zeka araçları{" "}
                <strong className="font-semibold text-murekkep">taslak aşamasında</strong>{" "}
                kullanılabilir: kaynak taraması, başlık planı, terim listesi çıkarma, kod örneği
                iskeleti, dil ve tutarlılık denetimi.
              </Madde>
              <Madde>
                Yayımlanan metindeki{" "}
                <strong className="font-semibold text-murekkep">
                  her cümle insan tarafından okunur, doğrulanır ve düzenlenir.
                </strong>{" "}
                Bir dil modelinin ürettiği ifade, bir insan onu kaynağıyla karşılaştırmadan yayına
                çıkmaz.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">
                  Kaynaksız model çıktısı yayımlanmaz.
                </strong>{" "}
                Modelin ürettiği bir sayı, tarih, alıntı ya da API imzası, birincil kaynakta
                doğrulanmadan metinde kalamaz — modelin kendisi kaynak değildir.
              </Madde>
              <Madde>
                Kod örnekleri, nasıl yazıldıklarından bağımsız olarak,{" "}
                <strong className="font-semibold text-murekkep">çalıştırılarak</strong> doğrulanır;
                uygulama ve laboratuvar içeriklerinde kodun bulunduğu depo adresi paylaşılır.
              </Madde>
              <Madde>
                Görsellerde üretken model kullanıldıysa bu, görselin altında belirtilir. Ölçüm
                grafikleri ve mimari şemalar modele çizdirilmez; veriden üretilir.
              </Madde>
            </Liste>
            <P>
              Kısacası yapay zeka bizim için bir yazarlık aracı değil, bir hızlandırıcıdır; metnin
              sorumluluğu her durumda imzayı atan insana aittir.
            </P>
          </Bolum>

          <Bolum id="cikar-catismasi" no="07" baslik="Çıkar çatışması ve sponsorluk">
            <P>
              Bugün itibarıyla Sinaptiklab&rsquo;da{" "}
              <strong className="font-semibold text-murekkep">
                sponsorlu içerik yoktur, ortaklık (affiliate) bağlantısı yoktur, ücretli inceleme
                yoktur.
              </strong>{" "}
              Sitede reklam alanı da bulunmamaktadır. İçeriğin tamamı ücretsizdir ve ödeme altyapısı
              kurulmamıştır.
            </P>
            <P>
              İleride bu durum değişirse — örneğin bir bülten sayısı destekçili yayımlanırsa —
              destek, içeriğin en üstünde ve destekçinin adıyla açıkça belirtilir, editoryal karara
              müdahale kabul edilmez ve sponsorlu birim listeleme ya da sıralama içermez. Böyle bir
              değişiklik olduğunda bu paragraf güncellenir ve tarih bu sayfada görünür.
            </P>
            <P>
              Bir ürün ya da kurumla kişisel bağımız (danışmanlık, ortaklık, çalışan olmak, ücretsiz
              erişim almak) varsa ve o ürün hakkında yazıyorsak, bağ metnin başında beyan edilir.
              Ücretsiz deneme hesabı ya da araştırma kredisi de bu kapsamdadır.
            </P>
          </Bolum>

          <Bolum id="geri-bildirim" no="08" baslik="Hata bildirimi ve geri bildirim">
            <P>
              Bir yanlış gördüyseniz bildirin; bu, yayının en değerli girdisidir. Bildirimi mümkün
              olduğunca eyleme çevrilebilir yapmak için üç şeye ihtiyacımız var:{" "}
              <strong className="font-semibold text-murekkep">yazının adresi</strong>,{" "}
              <strong className="font-semibold text-murekkep">hangi cümledeki hangi iddia</strong>{" "}
              ve mümkünse{" "}
              <strong className="font-semibold text-murekkep">doğrusunu gösteren kaynak</strong>.
            </P>
            <AltBaslik>Nasıl işler</AltBaslik>
            <SiraliListe>
              <SiraliMadde no={1}>
                Bildirim <a href={epostaBaglantisi("İçerik hatası bildirimi")}>{EPOSTA}</a> adresine
                ulaşır; alındığı beş iş günü içinde yanıtlanır.
              </SiraliMadde>
              <SiraliMadde no={2}>
                İddia kaynağıyla karşılaştırılır. Bildirim haklıysa düzeltme yapılır ve değişiklik
                günlüğüne işlenir.
              </SiraliMadde>
              <SiraliMadde no={3}>
                Haklı değilse gerekçesi size yazılı olarak iletilir; metin aynı kalır ama gerekirse
                ifade netleştirilir.
              </SiraliMadde>
            </SiraliListe>
            <P>
              Diğer başvuru başlıkları (işbirliği, basın, kaynak önerisi) için{" "}
              <Link href="/iletisim">iletişim sayfasına</Link> bakın. Bu politikanın sorumlusu,
              yayın sorumlusu ve editör olarak {YAZAR}&rsquo;dır; künye bilgileri{" "}
              <Link href="/kunye">künye sayfasındadır</Link>.
            </P>
          </Bolum>
        </div>
      </div>
    </>
  );
}
