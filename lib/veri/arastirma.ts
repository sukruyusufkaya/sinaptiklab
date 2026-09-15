import type { ArastirmaYayini } from '@/lib/tipler';
import { ARASTIRMA_GOVDELERI } from './govde/arastirma';

/** ÖRNEK VERİ — yer tutucu. Bkz. `lib/veri/temel.ts` başlığı. */

const HAM_ARASTIRMA: ArastirmaYayini[] = [
  {
    slug: 'state-of-ai-turkiye',
    baslik: 'State of AI Türkiye',
    tur: 'Rapor',
    ozet: 'Şirketlerde yapay zekâ benimsenmesi, yatırım eğilimi, yetenek açığı ve model tercihleri üzerine yıllık saha çalışması.',
    veriNoktasi: 'Yıllık',
    veriEtiketi: 'Amiral gemisi rapor',
    tarih: '2026-06-18',
    yontem: [
      'Anket: farklı sektörlerden karar vericilere yapılandırılmış soru seti.',
      'Derinlemesine görüşme: seçili kurumlarda teknik ve iş tarafı birlikte.',
      'Masa başı araştırma: kamuya açık yatırım ve ilan verileri.',
    ],
    kapsam: [
      { etiket: 'Kapsam', deger: 'Türkiye' },
      { etiket: 'Dönem', deger: 'Yıllık' },
      { etiket: 'Yöntem', deger: 'Anket + görüşme' },
      { etiket: 'Yayın', deger: 'Açık erişim' },
    ],
    bulgular: [
      'Benimseme oranı ile üretime geçme oranı arasındaki fark, olgunluğun asıl göstergesi.',
      'Yetenek açığı, model erişiminden daha belirleyici bir kısıt olarak öne çıkıyor.',
      'Yönetişim, en düşük skorlanan olgunluk boyutu.',
    ],
    sinirliliklar: [
      'Katılım gönüllülük esasına dayanır; sektör dağılımı evreni temsil etmeyebilir.',
      'Öz beyana dayalı sorularda iyimserlik yanlılığı bulunabilir.',
    ],
    atifFormati: 'Sinaptik Research, "State of AI Türkiye", Sinaptik Lab, 2026.',
    lisans: 'CC BY 4.0',
  },
  {
    slug: 'turkce-llm-benchmark',
    baslik: 'Türkçe LLM Benchmark',
    tur: 'Benchmark',
    ozet: 'Türkçe anlama, üretim ve talimat takibi boyutlarında açık metodolojiyle yürütülen karşılaştırmalı değerlendirme.',
    veriNoktasi: 'Açık',
    veriEtiketi: 'Metodoloji yayımlanır',
    tarih: '2026-07-02',
    yontem: [
      'Görev seti: anlama, üretim, talimat takibi ve biçim uyumu alt kümeleri.',
      'Puanlama: kural tabanlı kontrol + iki bağımsız insan değerlendirici.',
      'Tekrar: her görev üç kez, aynı örnekleme ayarlarıyla.',
    ],
    kapsam: [
      { etiket: 'Dil', deger: 'Türkçe' },
      { etiket: 'Alt küme', deger: '4 boyut' },
      { etiket: 'Tekrar', deger: '3 çalıştırma' },
      { etiket: 'Puanlama', deger: 'Karma' },
    ],
    bulgular: [
      'Genel benchmark sıralaması ile Türkçe sıralama her zaman örtüşmüyor.',
      'Biçim uyumu, model ailesi içinde sürümler arasında belirgin şekilde değişiyor.',
    ],
    sinirliliklar: [
      'Sonuçlar ölçüm tarihindeki model sürümüne aittir.',
      'Görev seti tüm alan dillerini kapsamaz.',
    ],
    atifFormati: 'Sinaptik Research, "Türkçe LLM Benchmark", Sinaptik Lab, 2026.',
    lisans: 'CC BY 4.0',
  },
  {
    slug: 'turkish-prompt-injection-dataset',
    baslik: 'Turkish Prompt Injection Dataset',
    tur: 'Veri Seti',
    ozet: 'Türkçe dolaylı istem enjeksiyonu örneklerinden oluşan, lisansı ve üretim yöntemi belgelenmiş veri seti.',
    veriNoktasi: 'CC-BY',
    veriEtiketi: 'Atıf formatı sayfada',
    tarih: '2026-05-21',
    yontem: [
      'Örnekler, gerçek saldırı desenlerinden türetilip elle sınıflandırıldı.',
      'Her kayıt için saldırı türü, hedef yetki ve beklenen savunma etiketlendi.',
    ],
    kapsam: [
      { etiket: 'Kayıt', deger: 'Sürüm notlarında' },
      { etiket: 'Dil', deger: 'Türkçe' },
      { etiket: 'Lisans', deger: 'CC BY 4.0' },
      { etiket: 'Biçim', deger: 'JSONL' },
    ],
    bulgular: [
      'Savunmasız yapılandırmalarda dolaylı enjeksiyon, doğrudan enjeksiyondan daha yüksek başarı oranına sahip.',
    ],
    sinirliliklar: [
      'Veri seti savunma değerlendirmesi içindir; saldırı üretimi için tasarlanmamıştır.',
      'Örnekler zamanla etkisini yitirebilir.',
    ],
    atifFormati: 'Sinaptik Research, "Turkish Prompt Injection Dataset", Sinaptik Lab, 2026.',
    lisans: 'CC BY 4.0',
  },
  {
    slug: 'enterprise-ai-readiness-index',
    baslik: 'Enterprise AI Readiness Index',
    tur: 'Index',
    ozet: 'Strateji, veri, altyapı, yetenek, yönetişim, kullanım senaryosu ve güvenlik boyutlarında kurumsal olgunluk endeksi.',
    veriNoktasi: '7 boyut',
    veriEtiketi: 'Kurumsal değerlendirme',
    tarih: '2026-08-14',
    yontem: [
      'Yedi boyut, her boyutta ağırlıklı gösterge seti.',
      'Skorlar 0–100 aralığına normalize edilir.',
    ],
    kapsam: [
      { etiket: 'Boyut', deger: '7' },
      { etiket: 'Ölçek', deger: '0–100' },
      { etiket: 'Uygulama', deger: 'Öz değerlendirme + görüşme' },
    ],
    bulgular: ['Yönetişim ve yetenek boyutları çoğu kurumda en zayıf iki halka.'],
    sinirliliklar: ['Öz değerlendirme bileşeni kurum içi algıyı yansıtır.'],
    atifFormati: 'Sinaptik Research, "Enterprise AI Readiness Index", Sinaptik Lab, 2026.',
  },
  {
    slug: 'ajan-degerlendirme-notlari',
    baslik: 'Ajan Değerlendirme Notları',
    tur: 'Not',
    ozet: 'Çok adımlı ajan akışlarında görev tamamlama oranı ölçümüne dair yöntem notları ve karşılaşılan tuzaklar.',
    veriNoktasi: 'Yöntem',
    veriEtiketi: 'Araştırma notu',
    tarih: '2026-09-01',
    yontem: ['Görev seti tasarımı', 'Kısmi başarı puanlaması', 'Hata sınıflandırması'],
    bulgular: [
      'Kısmi başarıyı puanlamayan ölçümler, iyileştirmeyi görünmez kılıyor.',
      'Hata sınıflandırması olmadan kök neden analizi yapılamıyor.',
    ],
    sinirliliklar: ['Notlar yöntem tartışması içindir, karşılaştırmalı sonuç içermez.'],
  },
  {
    slug: 'kurumsal-rag-mimari-rehberi',
    baslik: 'Kurumsal RAG Mimari Rehberi',
    tur: 'Whitepaper',
    ozet: 'Erişim denetimi, denetim kaydı ve değerlendirme gereksinimleriyle kurumsal RAG mimarisinin referans tasarımı.',
    veriNoktasi: 'Referans',
    veriEtiketi: 'Mimari doküman',
    tarih: '2026-04-30',
    yontem: ['Referans mimari', 'Tehdit modeli', 'Değerlendirme planı şablonu'],
    bulgular: [
      'Erişim denetimi belge katmanında uygulanmadığında, model katmanındaki filtreler yetersiz kalıyor.',
    ],
    sinirliliklar: ['Doküman mimari rehberidir; ürün karşılaştırması içermez.'],
  },
];

/**
 * Tam metinler `lib/veri/govde/arastirma.ts` içinde tutulur ve burada künye
 * bilgisiyle birleştirilir.
 */
export const ARASTIRMA: ArastirmaYayini[] = HAM_ARASTIRMA.map((yayin) => {
  const ek = ARASTIRMA_GOVDELERI[yayin.slug];
  return ek ? { ...yayin, ...ek } : yayin;
});

export function arastirmaBul(slug: string) {
  return ARASTIRMA.find((yayin) => yayin.slug === slug);
}

export const ARASTIRMA_TURLERI = [
  {
    slug: 'raporlar',
    ad: 'Raporlar',
    tur: 'Rapor' as const,
    ozet: 'Saha araştırmaları ve yıllık durum raporları.',
  },
  {
    slug: 'benchmark',
    ad: 'Benchmarklar',
    tur: 'Benchmark' as const,
    ozet: 'Açık metodolojili karşılaştırmalı değerlendirmeler.',
  },
  {
    slug: 'veri-setleri',
    ad: 'Veri Setleri',
    tur: 'Veri Seti' as const,
    ozet: 'Lisansı ve üretim yöntemi belgelenmiş veri setleri.',
  },
  {
    slug: 'whitepaper',
    ad: 'Whitepaper',
    tur: 'Whitepaper' as const,
    ozet: 'Mimari ve yöntem dokümanları.',
  },
  {
    slug: 'ai-index',
    ad: 'AI Index',
    tur: 'Index' as const,
    ozet: 'Düzenli güncellenen endeksler.',
  },
  {
    slug: 'notlar',
    ad: 'Research Notes',
    tur: 'Not' as const,
    ozet: 'Kısa yöntem ve gözlem notları.',
  },
];

/* --- METODOLOJİ ----------------------------------------------------------- */

export const METODOLOJI_ILKELERI = [
  {
    ad: 'Ölçüm tarihi ve sürüm',
    aciklama:
      'Her sonuç, ölçümün yapıldığı tarih ve model sürümüyle birlikte yayımlanır. Sürüm bilgisi olmayan sonuç yayımlanmaz.',
  },
  {
    ad: 'Görev seti açıklığı',
    aciklama:
      'Kullanılan görev setinin yapısı, alt kümeleri ve örnek sayısı açıklanır. Örnekler kamuya açıksa bağlantı verilir.',
  },
  {
    ad: 'Örnekleme ayarları',
    aciklama:
      'Sıcaklık, üst-p ve tekrar sayısı raporlanır. Aynı ayarlarla yeniden üretilebilir olmayan ölçüm yayımlanmaz.',
  },
  {
    ad: 'Puanlama yöntemi',
    aciklama:
      'Otomatik ve insan değerlendirmesinin payı belirtilir. İnsan değerlendirmesinde değerlendirici sayısı ve uyum ölçüsü paylaşılır.',
  },
  {
    ad: 'Sınırlılıklar',
    aciklama:
      'Her yayın, sonucun ne söylemediğini açıkça listeler. Sınırlılık bölümü olmayan yayın onaylanmaz.',
  },
  {
    ad: 'Ticari bağımsızlık',
    aciklama:
      'Benchmark ve araştırmalar danışmanlık müşterilerinden bağımsız yürütülür; sponsorlu içerik ayrıca işaretlenir.',
  },
];
