import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
  type Secenek,
} from '@/lib/admin/alanlar/tipler';

/**
 * Zaman serisi koleksiyonu: tekillik `slug` + `tarih` çiftindedir, yalnızca
 * `slug` değil. Aynı konu için her ölçüm günü ayrı bir belgedir; geçmiş kayıt
 * düzeltilirken o günün belgesi açılır, yenisi eklenmez.
 *
 * Yayın akışı yok (`durum` alanı şemada bulunmaz), bu yüzden `durumluMu: false`.
 */

const YON_SECENEKLERI: readonly Secenek[] = [
  { deger: 'yukselen', etiket: 'Yükselen', tarif: 'Momentum önceki ölçüme göre arttı.' },
  { deger: 'sabit', etiket: 'Sabit', tarif: 'Anlamlı bir değişim yok.' },
  { deger: 'dusen', etiket: 'Düşen', tarif: 'Momentum önceki ölçüme göre azaldı.' },
];

export const RADAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.radar,
  ad: 'Radar kaydı',
  cogul: 'Radar kayıtları',
  aciklama:
    'Trend radarının günlük anlık görüntüleri. Her belge bir konunun bir tarihteki momentumunu ve sinyal kırılımını taşır; tekillik slug + tarih çiftindedir.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Konu' },
    { ad: 'tarih', etiket: 'Ölçüm tarihi', mono: true },
    { ad: 'momentum', etiket: 'Momentum', mono: true },
    { ad: 'yon', etiket: 'Yön', secenekler: YON_SECENEKLERI },
    { ad: 'degisim', etiket: 'Değişim', mono: true },
  ],
  filtreler: [{ ad: 'yon', etiket: 'Yön', secenekler: YON_SECENEKLERI }],
  aramaAlanlari: ['ad', 'slug', 'not'],
  siralama: { tarih: -1, momentum: -1 },
  durumluMu: false,
  siteYolu: (belge) => (belge.slug ? `/radar/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Konu adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Radarda görünen ad; yerleşik İngilizce terim varsa korunur ("AI Agents", "RAG").',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'tarih',
      etiket: 'Ölçüm tarihi',
      tip: 'tarih',
      zorunlu: true,
      yardim:
        'Skorun hesaplandığı gün. Aynı slug + tarih ikilisi bir kez kaydedilebilir: geçmişi düzeltmek için o günün kaydını açın, yeni kayıt eklemeyin.',
      genislik: 'yarim',
    },
    {
      ad: 'momentum',
      etiket: 'Momentum',
      tip: 'sayi',
      zorunlu: true,
      enAz: 0,
      enCok: 100,
      yardim:
        'Bileşik skor, 0–100. Aşağıdaki dört sinyalin yöntem sürümüne göre ağırlıklandırılmış sonucu.',
      genislik: 'yarim',
    },
    {
      ad: 'yon',
      etiket: 'Yön',
      tip: 'secim',
      zorunlu: true,
      secenekler: YON_SECENEKLERI,
      yardim: 'Önceki ölçüme kıyasla hareket. Değişim değeriyle tutarlı olmalı.',
      genislik: 'yarim',
    },
    {
      ad: 'degisim',
      etiket: 'Değişim',
      tip: 'sayi',
      yardim: 'Önceki ölçüme göre momentum farkı; düşüşte eksi yazılır (-7).',
      genislik: 'yarim',
    },
    {
      ad: 'sinyaller',
      etiket: 'Sinyal kırılımı',
      tip: 'json',
      yardim:
        'Momentumu oluşturan ham skorlar. Anahtarlar: yayin, github, modelCikisi, aramaIlgisi — her biri sayı. Örnek: {"yayin": 94, "github": 98, "modelCikisi": 88, "aramaIlgisi": 92}',
    },
    {
      ad: 'not',
      etiket: 'Editör notu',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'Sayıların neyi gösterdiğini bir cümlede söyleyin: hangi sinyal öne çıktı, hangisi geride kaldı.',
    },
    {
      ad: 'yontemSurumu',
      etiket: 'Yöntem sürümü',
      tip: 'metin',
      yardim:
        'Skoru üreten ağırlıklandırma yönteminin sürümü (ör. "radar-2.1"). Ağırlıklar değişirse yeni sürüm yazılır; eski kayıtlar geriye dönük güncellenmez.',
      genislik: 'yarim',
    },
    ...SEO_ALANLARI,
  ],
};
