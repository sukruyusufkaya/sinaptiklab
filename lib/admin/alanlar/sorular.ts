import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEVIYE_SECENEKLERI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Soru bankası: kimlik ile tekilleşen ölçüm kayıtları (MASTER-PLAN §26).
 *
 * Slug taşımaz — soru kendi adresinde yayımlanmaz, testin içinde sunulur.
 * Bu yüzden `anahtarAlan` 'kimlik'tir ve `siteYolu` tanımlı değildir.
 * Doğru cevap ve açıklama sunucuda kalır; panelde ikisi de düzenlenebilir.
 */
export const SORULAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.sorular,
  ad: 'Soru',
  cogul: 'Sorular',
  aciklama:
    'Testlerin ve seviye ölçümünün beslendiği soru bankası. Her kayıt bir metadata kaydıdır: konu, zorluk, ölçtüğü beceri, doğru cevap ve öğretici açıklama.',
  anahtarAlan: 'kimlik',
  baslikAlani: 'soru',
  listeKolonlari: [
    { ad: 'kimlik', etiket: 'Kimlik', mono: true },
    { ad: 'soru', etiket: 'Soru', enCok: 80 },
    { ad: 'konu', etiket: 'Konu' },
    { ad: 'zorluk', etiket: 'Zorluk', secenekler: SEVIYE_SECENEKLERI },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'zorluk', etiket: 'Zorluk', secenekler: SEVIYE_SECENEKLERI },
  ],
  aramaAlanlari: ['kimlik', 'soru', 'beceri', 'altKonu', 'aciklama'],
  siralama: { kimlik: 1 },
  durumluMu: true,
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'kimlik',
      etiket: 'Kimlik',
      tip: 'metin',
      zorunlu: true,
      genislik: 'yarim',
      yardim:
        'Tekil kod; konu kısaltması ve sıra numarası: ai_001, rag_004. Yayımlandıktan sonra değiştirilmez — test sonuçları bu koda bağlanır.',
    },
    {
      ad: 'konu',
      etiket: 'Konu',
      tip: 'metin',
      zorunlu: true,
      genislik: 'yarim',
      yardim:
        'Atlas kategorisiyle birebir aynı yazım: Large Language Models, Machine Learning, RAG. Konu sayfalarındaki eşleşme bu metinle kurulur.',
    },
    {
      ad: 'altKonu',
      etiket: 'Alt konu',
      tip: 'metin',
      genislik: 'yarim',
      yardim: 'Konunun içindeki dar başlık: Chunking, Dikkat, Onay akışı.',
    },
    {
      ad: 'zorluk',
      etiket: 'Zorluk',
      tip: 'secim',
      zorunlu: true,
      secenekler: SEVIYE_SECENEKLERI,
      genislik: 'yarim',
      yardim:
        'Seviye testi soruyu bu alana göre seçer. Tanımı bilmek yetiyorsa başlangıç, karşılaştırma gerekiyorsa orta, ödünleşim kararı gerekiyorsa ileri.',
    },
    {
      ad: 'beceri',
      etiket: 'Ölçülen beceri',
      tip: 'metin',
      zorunlu: true,
      genislik: 'yarim',
      yardim:
        'Sorunun ölçtüğü tek beceri: Kavram ayrımı, Model seçimi, Tehdit modelleme. Test sonucu raporu bu alanla gruplanır.',
    },
    {
      ad: 'soru',
      etiket: 'Soru metni',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      enAz: 10,
      yardim:
        'Tek soru, tek doğru cevap. "Aşağıdakilerden hangisi değildir" gibi olumsuz kalıplardan kaçının; en az 10 karakter.',
    },
    {
      ad: 'secenekler',
      etiket: 'Seçenekler',
      tip: 'metinDizisi',
      zorunlu: true,
      enAz: 2,
      enCok: 6,
      yardim:
        'Her satır bir seçenek; en az 2, en fazla 6. Sıra doğru cevap indeksini belirler, bu yüzden sonradan satır araya eklemeyin. Çeldiriciler de akla yatkın olmalı.',
    },
    {
      ad: 'dogruIndeks',
      etiket: 'Doğru seçenek indeksi',
      tip: 'sayi',
      zorunlu: true,
      enAz: 0,
      enCok: 5,
      genislik: 'yarim',
      yardim:
        'Sayma 0 ile başlar: ilk seçenek 0, ikinci 1, üçüncü 2. Seçenek sırasını değiştirdiyseniz bu sayıyı da güncelleyin.',
    },
    {
      ad: 'aciklama',
      etiket: 'Açıklama',
      tip: 'uzunMetin',
      satir: 4,
      yardim:
        'Cevaptan sonra gösterilir. Yalnızca doğrunun neden doğru olduğunu değil, diğer seçeneklerin neden yanlış olduğunu da yazın.',
    },
    {
      ad: 'etiketler',
      etiket: 'Etiketler',
      tip: 'metinDizisi',
      yardim:
        'Testlerdeki "soruEtiketi" alanıyla eşleşen seçim etiketleri. Bir soru birden çok teste bu alan üzerinden girer.',
    },
    {
      ad: 'ilgiliAtlas',
      etiket: 'İlgili Atlas girdisi',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.atlas,
      genislik: 'yarim',
      yardim: 'Yanlış cevaplayana okuma önerisi olarak gösterilir.',
    },
    DURUM_ALANI,
  ],
};
