import { ARAC_KATEGORILERI } from '@/lib/taksonomi';
import type { AiModeli, Arac, Sirket } from '@/lib/tipler';

/** ÖRNEK VERİ — yer tutucu. Bkz. `lib/veri/temel.ts` başlığı. */

/* --- MODELLER ------------------------------------------------------------- */

export const MODELLER: AiModeli[] = [
  {
    slug: 'gpt-ailesi',
    ad: 'GPT Ailesi',
    saglayici: 'OpenAI',
    saglayiciSlug: 'openai',
    tip: 'Multimodal LLM',
    baglamPenceresi: 'Uzun bağlam',
    acikKaynak: false,
    yayin: 'Sürekli güncellenen seri',
    durum: 'guncel',
    vurgu: 'Genel amaçlı kullanım ve geniş araç ekosistemi',
    ozet: 'OpenAI tarafından geliştirilen, metin ve görsel girdiyi birlikte işleyebilen kapalı ağırlıklı büyük dil modeli ailesi. Geniş araç ve SDK ekosistemi nedeniyle prototipleme hızının yüksek olduğu senaryolarda sık tercih edilir.',
    yetenekler: ['Araç çağırma', 'Yapılandırılmış çıktı', 'Görsel anlama', 'Uzun doküman işleme'],
    siniriliklar: ['Ağırlıklar kapalı', 'Veri ikametgâhı sağlayıcıya bağlı'],
    kullanimAlanlari: ['Sohbet arayüzleri', 'Ajan iş akışları', 'Kod yardımı', 'Belge özetleme'],
    api: true,
    modaliteler: ['Metin', 'Görsel'],
    sonDogrulama: '2026-09-10',
  },
  {
    slug: 'claude-ailesi',
    ad: 'Claude Ailesi',
    saglayici: 'Anthropic',
    saglayiciSlug: 'anthropic',
    tip: 'Multimodal LLM',
    baglamPenceresi: 'Uzun bağlam',
    acikKaynak: false,
    yayin: 'Sürekli güncellenen seri',
    durum: 'guncel',
    vurgu: 'Uzun doküman işleme ve araç kullanımı',
    ozet: 'Anthropic tarafından geliştirilen kapalı ağırlıklı büyük dil modeli ailesi. Uzun bağlamda tutarlılık ve araç kullanımı gerektiren ajan akışlarında öne çıkan seçeneklerden biridir.',
    yetenekler: [
      'Araç çağırma',
      'Uzun bağlam tutarlılığı',
      'Görsel anlama',
      'Bilgisayar kullanımı',
    ],
    siniriliklar: ['Ağırlıklar kapalı'],
    kullanimAlanlari: ['Ajan iş akışları', 'Sözleşme ve mevzuat analizi', 'Kod inceleme'],
    api: true,
    modaliteler: ['Metin', 'Görsel'],
    sonDogrulama: '2026-09-10',
  },
  {
    slug: 'gemini-ailesi',
    ad: 'Gemini Ailesi',
    saglayici: 'Google DeepMind',
    saglayiciSlug: 'google-deepmind',
    tip: 'Multimodal LLM',
    baglamPenceresi: 'Çok uzun bağlam',
    acikKaynak: false,
    yayin: 'Sürekli güncellenen seri',
    durum: 'guncel',
    vurgu: 'Multimodal girdi ve platform entegrasyonu',
    ozet: 'Google DeepMind tarafından geliştirilen, metin dışında görsel, ses ve video girdisini de işleyebilen kapalı ağırlıklı model ailesi. Google bulut ve üretkenlik ürünleriyle entegrasyonu güçlüdür.',
    yetenekler: ['Çok modlu girdi', 'Çok uzun bağlam', 'Araç çağırma'],
    siniriliklar: ['Ağırlıklar kapalı'],
    kullanimAlanlari: ['Video ve ses analizi', 'Doküman işleme', 'Arama destekli cevaplama'],
    api: true,
    modaliteler: ['Metin', 'Görsel', 'Ses', 'Video'],
    sonDogrulama: '2026-09-10',
  },
  {
    slug: 'llama-ailesi',
    ad: 'Llama Ailesi',
    saglayici: 'Meta',
    saglayiciSlug: 'meta',
    tip: 'Açık ağırlıklı LLM',
    baglamPenceresi: 'Orta–uzun bağlam',
    acikKaynak: true,
    yayin: 'Açık ağırlık sürümleri',
    durum: 'guncel',
    vurgu: 'Kendi altyapısında barındırma ve uyarlama',
    ozet: 'Meta tarafından açık ağırlıklarla yayımlanan büyük dil modeli ailesi. Veri ikametgâhı veya maliyet öngörülebilirliği kritik olan kurumsal senaryolarda kendi altyapısında barındırmaya imkân verir.',
    yetenekler: [
      'Kendi altyapısında barındırma',
      'İnce ayar',
      'Niceleme ile küçük donanımda çalışma',
    ],
    siniriliklar: [
      'Operasyon yükü kurumun üzerinde',
      'Araç ekosistemi sağlayıcıya göre daha dağınık',
    ],
    kullanimAlanlari: ['Şirket içi asistanlar', 'Düzenlenmiş sektörler', 'Kenar dağıtımı'],
    api: false,
    modaliteler: ['Metin', 'Görsel'],
    sonDogrulama: '2026-09-08',
  },
  {
    slug: 'mistral-ailesi',
    ad: 'Mistral Ailesi',
    saglayici: 'Mistral AI',
    saglayiciSlug: 'mistral-ai',
    tip: 'Açık ağırlıklı LLM',
    baglamPenceresi: 'Orta bağlam',
    acikKaynak: true,
    yayin: 'Açık ağırlık sürümleri',
    durum: 'guncel',
    vurgu: 'Verimlilik odaklı dağıtım',
    ozet: 'Mistral AI tarafından geliştirilen, boyut/performans dengesi gözetilen model ailesi. Hem açık ağırlıklı hem hizmet olarak sunulan sürümleri bulunur.',
    yetenekler: ['Verimli çıkarım', 'Araç çağırma', 'İnce ayar'],
    siniriliklar: ['En büyük modellere göre muhakeme kapasitesi sınırlı'],
    kullanimAlanlari: ['Yüksek hacimli sınıflandırma', 'Maliyet duyarlı akışlar'],
    api: true,
    modaliteler: ['Metin'],
    sonDogrulama: '2026-09-05',
  },
  {
    slug: 'qwen-ailesi',
    ad: 'Qwen Ailesi',
    saglayici: 'Alibaba',
    saglayiciSlug: 'alibaba',
    tip: 'Açık ağırlıklı LLM',
    baglamPenceresi: 'Uzun bağlam',
    acikKaynak: true,
    yayin: 'Açık ağırlık sürümleri',
    durum: 'guncel',
    vurgu: 'Çok dilli kapsama',
    ozet: 'Alibaba tarafından açık ağırlıklarla yayımlanan, çok dilli kapsaması geniş model ailesi. Farklı boyut seçenekleriyle donanım bütçesine göre ölçeklenebilir.',
    yetenekler: ['Çok dilli destek', 'Geniş boyut yelpazesi', 'İnce ayar'],
    siniriliklar: ['Türkçe performansı bağımsız ölçümle doğrulanmalı'],
    kullanimAlanlari: ['Çok dilli destek hatları', 'Araştırma ve deney'],
    api: false,
    modaliteler: ['Metin', 'Görsel'],
    sonDogrulama: '2026-09-05',
  },
];

export function modelBul(slug: string) {
  return MODELLER.find((model) => model.slug === slug);
}

/** Karşılaştırma modülü için yer tutucu skorlar — doğrulanmış ölçüm DEĞİLDİR. */
export const BENCHMARK_ORNEGI = {
  boyutlar: ['Reasoning', 'Kodlama', 'Türkçe', 'RAG', 'Araç Kullanımı'],
  satirlar: [
    { ad: 'Model A', skorlar: [91, 92, 74, 90, 88] },
    { ad: 'Model B', skorlar: [89, 95, 71, 92, 91] },
    { ad: 'Model C', skorlar: [86, 88, 83, 87, 84] },
  ],
};

export const KARSILASTIRMA_BOYUTLARI = [
  { anahtar: 'tip', ad: 'Model tipi' },
  { anahtar: 'baglamPenceresi', ad: 'Bağlam' },
  { anahtar: 'modaliteler', ad: 'Modaliteler' },
  { anahtar: 'acikKaynak', ad: 'Açık ağırlık' },
  { anahtar: 'api', ad: 'Yönetilen API' },
  { anahtar: 'kullanimAlanlari', ad: 'Tipik kullanım' },
];

export const KARSILASTIRMALAR = [
  {
    slug: 'gpt-ailesi-vs-claude-ailesi',
    baslik: 'GPT Ailesi ile Claude Ailesi karşılaştırması',
    sol: 'gpt-ailesi',
    sag: 'claude-ailesi',
    ozet: 'İki kapalı ağırlıklı ailenin araç kullanımı, uzun bağlam davranışı ve ekosistem farkları.',
  },
  {
    slug: 'llama-ailesi-vs-mistral-ailesi',
    baslik: 'Llama Ailesi ile Mistral Ailesi karşılaştırması',
    sol: 'llama-ailesi',
    sag: 'mistral-ailesi',
    ozet: 'Açık ağırlıklı iki ailenin boyut, verimlilik ve barındırma profili.',
  },
  {
    slug: 'gemini-ailesi-vs-gpt-ailesi',
    baslik: 'Gemini Ailesi ile GPT Ailesi karşılaştırması',
    sol: 'gemini-ailesi',
    sag: 'gpt-ailesi',
    ozet: 'Çok modlu girdi kapsamı ve platform entegrasyonu açısından iki aile.',
  },
];

export function karsilastirmaBul(slug: string) {
  return KARSILASTIRMALAR.find((kiyas) => kiyas.slug === slug);
}

/* --- ŞİRKETLER ------------------------------------------------------------ */

export const SIRKETLER: Sirket[] = [
  {
    slug: 'openai',
    ad: 'OpenAI',
    tur: 'Araştırma ve ürün şirketi',
    merkez: 'San Francisco, ABD',
    kurulus: '2015',
    alan: 'Genel amaçlı yapay zekâ, dil ve görsel modelleri',
    ozet: 'OpenAI, genel amaçlı yapay zekâ modelleri geliştiren ve bunları API ile ürünleştiren bir araştırma şirketidir. GPT model ailesi ve etrafındaki araç ekosistemiyle bilinir.',
    urunler: ['GPT model ailesi', 'Geliştirici API', 'Tüketici asistanı'],
    modelSluglari: ['gpt-ailesi'],
    kilometreTaslari: [
      { tarih: '2015', olay: 'Kuruluş.' },
      { tarih: '2020', olay: 'Büyük dil modelini API olarak sunma modeli.' },
      { tarih: '2022', olay: 'Sohbet arayüzüyle kitlesel kullanım.' },
    ],
  },
  {
    slug: 'anthropic',
    ad: 'Anthropic',
    tur: 'Araştırma ve ürün şirketi',
    merkez: 'San Francisco, ABD',
    kurulus: '2021',
    alan: 'Güvenlik odaklı büyük dil modelleri',
    ozet: 'Anthropic, yapay zekâ güvenliği ve yönlendirilebilirlik üzerine odaklanan bir araştırma şirketidir. Claude model ailesini geliştirir.',
    urunler: ['Claude model ailesi', 'Geliştirici API', 'Kurumsal asistan'],
    modelSluglari: ['claude-ailesi'],
    kilometreTaslari: [
      { tarih: '2021', olay: 'Kuruluş.' },
      { tarih: '2023', olay: 'Uzun bağlam odaklı model sürümleri.' },
      { tarih: '2024', olay: 'Araç kullanımı ve ajan yetenekleri.' },
    ],
  },
  {
    slug: 'google-deepmind',
    ad: 'Google DeepMind',
    tur: 'Araştırma birimi',
    merkez: 'Londra, Birleşik Krallık',
    kurulus: '2010',
    alan: 'Temel araştırma, çok modlu modeller, bilim uygulamaları',
    ozet: 'Google DeepMind, Google bünyesindeki yapay zekâ araştırma birimidir. Gemini model ailesi ve bilimsel uygulamalara yönelik modellerle bilinir.',
    urunler: ['Gemini model ailesi', 'Bilimsel modeller', 'Bulut AI hizmetleri'],
    modelSluglari: ['gemini-ailesi'],
    kilometreTaslari: [
      { tarih: '2010', olay: 'DeepMind kuruldu.' },
      { tarih: '2014', olay: 'Google tarafından satın alındı.' },
      { tarih: '2023', olay: 'Google Brain ile birleşme.' },
    ],
  },
  {
    slug: 'meta',
    ad: 'Meta',
    tur: 'Teknoloji şirketi',
    merkez: 'Menlo Park, ABD',
    kurulus: '2004',
    alan: 'Açık ağırlıklı modeller, öneri sistemleri',
    ozet: 'Meta, Llama model ailesini açık ağırlıklarla yayımlayarak açık ekosistemin en büyük katkı sağlayıcılarından biri haline gelmiştir.',
    urunler: ['Llama model ailesi', 'Araştırma yayınları'],
    modelSluglari: ['llama-ailesi'],
  },
  {
    slug: 'mistral-ai',
    ad: 'Mistral AI',
    tur: 'Araştırma ve ürün şirketi',
    merkez: 'Paris, Fransa',
    kurulus: '2023',
    alan: 'Verimli açık ağırlıklı modeller',
    ozet: 'Mistral AI, boyut/performans dengesini önceleyen model aileleriyle Avrupa merkezli bir yapay zekâ şirketidir.',
    urunler: ['Mistral model ailesi', 'Yönetilen API'],
    modelSluglari: ['mistral-ailesi'],
  },
  {
    slug: 'nvidia',
    ad: 'NVIDIA',
    tur: 'Donanım ve yazılım şirketi',
    merkez: 'Santa Clara, ABD',
    kurulus: '1993',
    alan: 'Hızlandırıcı donanım, çıkarım yazılımı',
    ozet: 'NVIDIA, yapay zekâ eğitiminde ve çıkarımında kullanılan hızlandırıcı donanımın ve ilgili yazılım yığınının baskın sağlayıcısıdır.',
    urunler: ['GPU hızlandırıcılar', 'Çıkarım sunucusu yazılımı', 'Geliştirici kütüphaneleri'],
  },
  {
    slug: 'hugging-face',
    ad: 'Hugging Face',
    tur: 'Platform şirketi',
    merkez: 'New York, ABD',
    kurulus: '2016',
    alan: 'Model ve veri seti paylaşımı, açık kaynak araçlar',
    ozet: 'Hugging Face, model ve veri setlerinin paylaşıldığı merkezî bir platform ve açık kaynak kütüphane ekosistemi işletir.',
    urunler: ['Model deposu', 'Veri seti deposu', 'Açık kaynak kütüphaneler'],
  },
  {
    slug: 'alibaba',
    ad: 'Alibaba',
    tur: 'Teknoloji şirketi',
    merkez: 'Hangzhou, Çin',
    kurulus: '1999',
    alan: 'Bulut altyapısı, açık ağırlıklı modeller',
    ozet: 'Alibaba, Qwen model ailesini açık ağırlıklarla yayımlayan ve bulut üzerinden yapay zekâ hizmetleri sunan bir teknoloji şirketidir.',
    urunler: ['Qwen model ailesi', 'Bulut AI hizmetleri'],
    modelSluglari: ['qwen-ailesi'],
  },
];

export function sirketBul(slug: string) {
  return SIRKETLER.find((sirket) => sirket.slug === slug);
}

/* --- ARAÇLAR -------------------------------------------------------------- */

/**
 * Kategori listesi TAKSONOMİDİR, fixture değil: `lib/taksonomi.ts` içinde
 * durur ve buradan yeniden yayımlanır (`ATLAS_KATEGORILERI` ile aynı kalıp).
 * Buradaki eski 12 İngilizce değer veriyle örtüşmüyordu; gerekçe taksonomi
 * dosyasındaki başlıkta.
 */
export { ARAC_KATEGORILERI };

export const ARACLAR: Arac[] = [
  {
    slug: 'kod-asistani',
    ad: 'Kod Asistanı (kategori incelemesi)',
    kategori: 'Coding',
    neIse:
      'Editör içinde bağlam farkında kod tamamlama, açıklama ve test üretimi sağlayan asistan sınıfı.',
    kimKullanmali: 'Aktif geliştirme yapan yazılım ekipleri.',
    enIyiKullanim: 'Var olan kod tabanında tekrarlayan değişiklikleri hızlandırmak.',
    alternatifler: ['Editör eklentileri', 'Terminal tabanlı ajanlar'],
    fiyat: 'Kullanıcı başına aylık abonelik',
    artilar: ['Bağlam farkında öneri', 'Test üretiminde belirgin hız kazancı'],
    eksiler: [
      'Büyük mimari değişikliklerde güvenilirliği düşer',
      'Kod tabanı gizliliği değerlendirilmeli',
    ],
    degerlendirme:
      'Küçük ve orta ölçekli değişikliklerde net verim sağlıyor; mimari kararlarda insan denetimi şart.',
  },
  {
    slug: 'vektor-veritabani',
    ad: 'Vektör Veritabanı (kategori incelemesi)',
    kategori: 'Data Analysis',
    neIse: 'Gömme vektörlerini saklayıp anlamsal yakınlık aramasını mümkün kılar.',
    kimKullanmali: 'RAG veya anlamsal arama kuran ekipler.',
    enIyiKullanim: 'Kurumsal belge setlerinde hibrit arama.',
    alternatifler: ['İlişkisel veritabanı vektör eklentileri', 'Arama motoru vektör desteği'],
    fiyat: 'Barındırılan sürümlerde tüketim bazlı, açık sürümlerde ücretsiz',
    artilar: ['Ölçeklenebilir yaklaşık komşu araması', 'Meta veri filtreleme'],
    eksiler: ['Ayrı bir operasyon yükü', 'Gömme modeli değişince dizin yenilenmeli'],
    degerlendirme:
      'Mevcut veritabanınız vektör desteği veriyorsa ayrı bir sistem eklemeden önce onu ölçün.',
  },
  {
    slug: 'degerlendirme-araci',
    ad: 'Değerlendirme Aracı (kategori incelemesi)',
    kategori: 'Research',
    neIse: 'İstem ve model değişikliklerinin etkisini tanımlı görev setleri üzerinde ölçer.',
    kimKullanmali: 'Üretimde dil modeli çalıştıran her ekip.',
    enIyiKullanim: 'Her sürümde regresyon testi çalıştırmak.',
    alternatifler: ['Kendi test koşucunuz', 'Not defteri tabanlı ölçüm'],
    fiyat: 'Açık kaynak veya takım başına abonelik',
    artilar: ['Değişikliklerin etkisini görünür kılar', 'İnsan değerlendirmesini süreçleştirir'],
    eksiler: ['Görev seti hazırlamak emek ister', 'Otomatik puanlayıcılar yanılabilir'],
    degerlendirme:
      'Model seçiminden önce kurulması gereken ilk altyapı; olmadığı yerde iyileştirme tahmine dayanır.',
  },
  {
    slug: 'gozlemlenebilirlik-araci',
    ad: 'LLM Gözlemlenebilirlik (kategori incelemesi)',
    kategori: 'Productivity',
    neIse: 'İstem, araç çağrısı ve yanıt zincirlerini izleyip maliyet ve gecikmeyi raporlar.',
    kimKullanmali: 'Ajan veya çok adımlı akış işleten ekipler.',
    enIyiKullanim: 'Üretimdeki hata kök nedeni analizi.',
    alternatifler: ['Genel amaçlı APM araçları', 'Kendi kayıt altyapınız'],
    fiyat: 'Olay hacmine göre tüketim bazlı',
    artilar: ['Zincir görünürlüğü', 'Maliyet dağılımı'],
    eksiler: ['Hassas veri kaydı politikası gerektirir'],
    degerlendirme:
      'Ajan akışlarında model değiştirmeden önce görünürlük kurmak neredeyse her zaman daha yüksek getirili.',
  },
  {
    slug: 'belge-isleme-araci',
    ad: 'Belge İşleme (kategori incelemesi)',
    kategori: 'Automation',
    neIse: 'Tarama, form ve tabloları yapılandırılmış veriye dönüştürür.',
    kimKullanmali: 'Finans, lojistik ve sigorta operasyonları.',
    enIyiKullanim: 'Yüksek hacimli fatura ve form işleme.',
    alternatifler: ['Klasik OCR hatları', 'Çok modlu model tabanlı yaklaşımlar'],
    fiyat: 'Sayfa başına veya hacim bazlı',
    artilar: ['Tablo ve form anlamada güçlü', 'İnsan doğrulama akışına bağlanabilir'],
    eksiler: ['Denetimsiz kullanımda sessiz hata oranı yükselir'],
    degerlendirme:
      'Örnekleme yoluyla insan doğrulaması olmadan üretimde tek başına kullanılmamalı.',
  },
  {
    slug: 'ajan-cercevesi',
    ad: 'Ajan Çerçevesi (kategori incelemesi)',
    kategori: 'Coding',
    neIse: 'Planlama, araç çağırma ve bellek yönetimi için hazır yapı taşları sunar.',
    kimKullanmali: 'Ajan tabanlı ürün geliştiren ekipler.',
    enIyiKullanim: 'Prototipten üretime geçişte standart bir iskelet kurmak.',
    alternatifler: ['Doğrudan sağlayıcı SDK’sı', 'Kendi orkestrasyon katmanınız'],
    fiyat: 'Çoğunlukla açık kaynak',
    artilar: ['Hızlı başlangıç', 'Araç şeması standardizasyonu'],
    eksiler: ['Soyutlama katmanı hata ayıklamayı zorlaştırabilir'],
    degerlendirme:
      'Basit akışlarda çerçeve gereksiz karmaşıklık ekler; çok araçlı senaryolarda kazanç belirginleşir.',
  },
];

export function aracBul(slug: string) {
  return ARACLAR.find((arac) => arac.slug === slug);
}
