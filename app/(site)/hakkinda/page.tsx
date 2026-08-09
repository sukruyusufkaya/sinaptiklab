// /hakkinda — kurumsal kimlik sayfası (BRIEF §2.2). İçerik kaynağı: BRIEF §1
// (ürün tezi, ne DEĞİL, pazar boşluğu, hedef kitleler). Tamamen statik.
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
    title: "Hakkında — Sinaptiklab nedir, neden var",
    description:
      "Sinaptiklab, yapay zeka sistemlerini gerçekten üretenler için yazılan, her iddiası kaynaklı ve sürümlü bir Türkçe teknik yayındır. Neden kurulduğu, kime yazdığı ve neyi yayımlamadığı.",
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/hakkinda` },
  };
}

const BOSLUKLAR = [
  ["Kod yok, sadece anlatı var", "Her uygulamada çalışan repo ve çalıştırılabilir defter"],
  [
    "Sayılar kaynaksız ve tarihsiz",
    "Her veri noktasında kaynak bağlantısı ve son doğrulama tarihi",
  ],
  ["Türkçe terminoloji kaosu", "Kanonik Türkçe YZ sözlüğü ve metin içi otomatik terim bağlama"],
  ["Regülasyon hiç konuşulmuyor", "KVKK, şirket içi (on-prem) kurulum ve regüle sektör dosyaları"],
  ["İçerik bir kez yazılıp çürüyor", "Sürümlü içerik ve görünür değişiklik günlüğü"],
  ["Öğrenci için sıra yok", "Yapılandırılmış öğrenme patikaları ve ödevli dersler"],
] as const;

const KITLELER = [
  [
    "Uygulayıcı mühendis",
    "Üretimde çalışan desen, tuzaklar, maliyet",
    "Derin analiz, ölçüm, mimari",
  ],
  [
    "Teknik lider / mimar",
    "Karar gerekçesi, toplam sahip olma maliyeti, risk",
    "Vaka, karşılaştırma, karar rehberi",
  ],
  [
    "Regüle sektör kararvericisi",
    "KVKK uyumu, on-prem, tedarikçi seçimi",
    "Regülasyon dosyası, uyum listesi",
  ],
  ["Öğrenci / kariyer değiştiren", "Sıralı öğrenme, ödev, portföy", "Patika, kurs, laboratuvar"],
  ["Yönetici okuyucu", "Beş dakikada durum", "Bülten, yönetici özeti bloğu"],
] as const;

export default function HakkindaSayfasi() {
  return (
    <>
      <KurumsalBaslik
        indeks="kurumsal · hakkında"
        baslik="Hakkında"
        spot="Sinaptiklab, yapay zeka sistemlerini gerçekten üreten insanlar için yazılmış, her iddiası kaynaklı ve yeniden üretilebilir bir Türkçe teknik yayın ve öğrenme platformudur."
        raylar={[
          { etiket: "konumlandırma", deger: "saha verisi, uydurma yok" },
          { etiket: "dil", deger: "Türkçe (özgün)" },
          { etiket: "erişim", deger: "tamamı ücretsiz" },
          { etiket: "son güncelleme", deger: SON_GUNCELLEME },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="max-w-[var(--govde-olcu)] py-12">
          <Bolum id="tek-cumle" no="01" baslik="Tek cümlede">
            <P>
              Sinaptiklab; model eğiten, veri hattı kuran, üretime çıkaran, satın alma kararı veren
              ya da bu işi öğrenen insanlar için yazılıyor. Ölçü basit: bir yazıdaki her sayı bir
              kaynağa, her uygulama çalışan bir depoya, her iddia bir tarihe bağlı olmalı. Bunu
              sağlayamıyorsak yayımlamıyoruz.
            </P>
            <P>
              Bu bir tercih değil, teknik bir zorunluluk. İçerik yönetim katmanımız, kaynak listesi
              boş olan bir metni &ldquo;yayında&rdquo; durumuna geçiremiyor; kural editörün
              iradesine bırakılmış değil, koda gömülü. Ayrıntısı{" "}
              <Link href="/editoryal-politika">editoryal politikada</Link>.
            </P>
          </Bolum>

          <Bolum id="neden-var" no="02" baslik="Neden var">
            <P>
              Türkçe yapay zeka içeriği bugün üç kümede yoğunlaşıyor: reklam geliriyle dönen{" "}
              <strong className="font-semibold text-murekkep">araç dizinleri</strong>, hız odaklı{" "}
              <strong className="font-semibold text-murekkep">
                genel teknoloji haber siteleri
              </strong>{" "}
              ve bir ürünü satmak için yazılan{" "}
              <strong className="font-semibold text-murekkep">kurumsal blog pazarlaması</strong>.
              Üçü de kendi işini yapıyor; ancak sistemi fiilen kuran kişinin ihtiyacı bu üç kümenin
              hiçbirinde tam karşılanmıyor.
            </P>
            <P>
              Ortaya çıkan boşluklar somut. Bir mühendis &ldquo;RAG&rsquo;te chunk boyutu ne
              olmalı&rdquo; diye aradığında karşısına çıkan yazıların çoğunda ne bir ölçüm, ne bir
              donanım bilgisi, ne de yazının ne zaman doğrulandığı bulunuyor. Türkçe terimler her
              metinde başka türlü karşılanıyor; &ldquo;embedding&rdquo; bir yerde gömme, başka yerde
              vektörleştirme oluyor. Regülasyon tarafı ise neredeyse hiç yazılmıyor: KVKK ile bulut
              tabanlı bir model sağlayıcısını yan yana koyan Türkçe teknik kaynak sayısı bir elin
              parmaklarını geçmiyor.
            </P>
            <Tablo
              ozet="Türkçe yapay zeka içeriğindeki boşluklar ve Sinaptiklab'ın karşılığı"
              basliklar={["Boşluk", "Sinaptiklab'ın cevabı"]}
              satirlar={BOSLUKLAR}
            />
            <P>
              Bu tablonun her satırı bir yayın kuralına çevrildi; ikinci sütun bir vaat değil, yayın
              öncesi kontrol listesinde işaretlenen bir madde.
            </P>
          </Bolum>

          <Bolum id="kime" no="03" baslik="Kime yazıyoruz">
            <P>
              Beş okuyucu profili için yazıyoruz. Her içerik en az birini hedefler; hiçbiri
              &ldquo;herkes&rdquo; için değildir, çünkü herkes için yazılan metin kimseye yetmiyor.
            </P>
            <Tablo
              ozet="Sinaptiklab'ın hedef okuyucu profilleri ve öncelikli içerik türleri"
              basliklar={["Profil", "İhtiyaç", "Ana içerik türü"]}
              satirlar={KITLELER}
            />
            <P>
              Bu yüzden her yazının başında seviye etiketi (giriş, orta, ileri, uzman) ve tahmini
              okuma süresi bulunur: yanlış okuyucunun vaktini almamak da editoryal sorumluluğun bir
              parçası.
            </P>
          </Bolum>

          <Bolum id="ne-yapmiyoruz" no="04" baslik="Ne yapmıyoruz">
            <P>
              Bir yayının kimliği, yayımladığı kadar yayımlamadığıyla da belirlenir. Aşağıdaki
              içerik türleri Sinaptiklab&rsquo;da üretilmez — trafik getirse de üretilmez:
            </P>
            <Liste>
              <Madde>
                <strong className="font-semibold text-murekkep">
                  &ldquo;En iyi 20 yapay zeka aracı&rdquo; tipi ortaklık (affiliate) listeleri.
                </strong>{" "}
                Sıralamanın komisyon oranıyla belirlendiği hiçbir liste yayımlanmaz; sitede ortaklık
                bağlantısı hiç yoktur.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">
                  Kaynaksız, tarihi belirsiz, sayı uyduran haber özetleri.
                </strong>{" "}
                Bir performans iddiası varsa ölçümün kim tarafından, hangi koşulda yapıldığı
                yazılır; yazılamıyorsa sayı metne girmez.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">
                  İngilizce blogların makine çevirisi.
                </strong>{" "}
                Yabancı bir kaynaktan yararlanılıyorsa kaynak gösterilir ve metin yeniden yazılır;
                çeviri, özgün içerik yerine geçmez.
              </Madde>
              <Madde>
                <strong className="font-semibold text-murekkep">
                  Dil modeline yazdırılıp düzeltilmemiş dolgu içerik.
                </strong>{" "}
                Yapay zeka araçlarını nasıl kullandığımızı{" "}
                <Link href="/editoryal-politika#yapay-zeka">açıkça beyan ediyoruz</Link>; kimsenin
                gözden geçirmediği bir paragraf yayına çıkmaz.
              </Madde>
            </Liste>
            <Kutu etiket="ölçülebilir taahhüt">
              <p>
                Bu dört madde sitede aranabilir bir iz bırakır: ortaklık bağlantısı sayısı sıfır,
                sponsorlu içerik sayısı sıfır, kaynak listesi boş yayın sayısı sıfır. Aksini
                bulursanız <a href={epostaBaglantisi("Hata bildirimi")}>bize yazın</a>.
              </p>
            </Kutu>
          </Bolum>

          <Bolum id="nasil" no="05" baslik="Nasıl çalışıyoruz">
            <AltBaslik>Kaynak zorunluluğu</AltBaslik>
            <P>
              Her içerik, veritabanında kendi kaynak listesiyle birlikte durur. Bir metnin yayına
              geçebilmesi için en az bir birincil kaynağa bağlı olması, metindeki her sayının ve her
              olgusal iddianın bu listeden bir kayda dayanması gerekir. Kaynak tercihimiz sırasıyla:
              resmî dokümantasyon ve sürüm notları, hakemli yayınlar ve teknik raporlar, birinci
              elden ölçümlerimiz. İkincil aktarım (haber sitesinin haberi) yalnızca birincil kaynağa
              ulaşılamadığında ve bu durum belirtilerek kullanılır.
            </P>

            <AltBaslik>Sürümleme ve tazeleme</AltBaslik>
            <P>
              Teknik içerik çürür: bir model sürümü değişir, bir kütüphane API&rsquo;si kırılır, bir
              fiyat güncellenir. Bu yüzden içerikler tek seferlik değil sürümlüdür. Her yazının
              yayın tarihi, son güncelleme tarihi ve son doğrulama tarihi ayrı ayrı tutulur; anlamlı
              değişiklikler yazının altındaki değişiklik günlüğüne işlenir. Doğrulaması eskiyen
              içerikler yönetim panelinde &ldquo;çürüyen içerik&rdquo; listesine düşer ve yeniden
              elden geçirilir.
            </P>

            <AltBaslik>Tek yazar, teknik editör</AltBaslik>
            <P>
              Bugün Sinaptiklab tek yazarlı bir yayındır: {YAZAR}. Yayımlanan her metin, yayın
              öncesinde teknik editör gözüyle ikinci bir okumadan geçer — kod çalışıyor mu, kaynak
              iddiayı gerçekten destekliyor mu, terimler sözlükle tutarlı mı. Konuk yazar programı
              belirli bir içerik olgunluğuna ulaşıldıktan sonra davetle açılacaktır; açıldığında da
              aynı kapılardan geçecektir.
            </P>

            <AltBaslik>Açık ve ücretsiz</AltBaslik>
            <P>
              Tüm içerik, kurslar ve laboratuvarlar dahil, ücretsiz ve ödeme duvarsızdır. Sitede
              ödeme altyapısı yoktur. Ücretsiz üyelik ileride yorum yazmak ve okuma durumunu takip
              etmek gibi özellikler için gelecek; içeriğe erişimin koşulu olmayacak.
            </P>
          </Bolum>

          <Bolum id="iletisim" no="06" baslik="İletişim ve şeffaflık">
            <P>
              Yayıncı kimliği, teknoloji künyesi, telif ve alıntı kuralları{" "}
              <Link href="/kunye">künye sayfasında</Link>; kaynak, düzeltme ve yapay zeka kullanımı
              kuralları <Link href="/editoryal-politika">editoryal politikada</Link> ayrıntılı
              yazılıdır. Bir hata bulduysanız veya bir kaynağın iddiayı desteklemediğini
              düşünüyorsanız <a href={`mailto:${EPOSTA}`}>{EPOSTA}</a> adresine yazabilir,{" "}
              <Link href="/iletisim">iletişim sayfasındaki</Link> bildirim şablonunu
              kullanabilirsiniz. Doğrulanan her düzeltme, ilgili yazının değişiklik günlüğüne
              işlenir.
            </P>
          </Bolum>
        </div>
      </div>
    </>
  );
}
