import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import type { KoleksiyonYapilandirmasi } from '@/lib/admin/alanlar/tipler';

/**
 * Basit koleksiyon örneği: `durum` alanı yok, gövde yok, SEO yok.
 * Yapılandırma yalnızca gerçekten var olan alanları tanımlar.
 */
export const YONLENDIRMELER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.yonlendirmeler,
  ad: 'Yönlendirme',
  cogul: 'Yönlendirmeler',
  aciklama:
    'Bir içeriğin adresi değiştiğinde eski adres kalıcı olarak yeni adrese taşınır (MASTER-PLAN §48).',
  anahtarAlan: 'kaynakYol',
  baslikAlani: 'kaynakYol',
  listeKolonlari: [
    { ad: 'kaynakYol', etiket: 'Eski adres', mono: true },
    { ad: 'hedefYol', etiket: 'Yeni adres', mono: true },
    { ad: 'kod', etiket: 'Kod', mono: true },
    { ad: 'aktif', etiket: 'Aktif' },
    { ad: 'gerekce', etiket: 'Gerekçe', enCok: 60 },
  ],
  filtreler: [
    {
      ad: 'kod',
      etiket: 'Kod',
      secenekler: [
        { deger: '301', etiket: '301 — kalıcı' },
        { deger: '302', etiket: '302 — geçici' },
        { deger: '308', etiket: '308 — kalıcı (yöntem korunur)' },
      ],
    },
  ],
  aramaAlanlari: ['kaynakYol', 'hedefYol', 'gerekce'],
  siralama: { olusturuldu: -1 },
  durumluMu: false,
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'kaynakYol',
      etiket: 'Eski adres',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Eğik çizgiyle başlar: /eski-yol/',
    },
    {
      ad: 'hedefYol',
      etiket: 'Yeni adres',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Eğik çizgiyle başlar: /yeni-yol/',
    },
    {
      ad: 'kod',
      etiket: 'HTTP kodu',
      tip: 'secim',
      zorunlu: true,
      // Şemada `bsonType: 'number'`, enum [301, 302, 308] — seçenek değeri
      // metin taşır, belgeye sayı olarak yazılması gerekir.
      sayisalDeger: true,
      varsayilan: '301',
      genislik: 'yarim',
      yardim:
        'Kalıcı seçenekler tarayıcıya 308, geçici olan 307 olarak gider: Next.js ' +
        'uygulama yönlendiricisi 301/302 gönderemez. 308 de kalıcıdır ve arama ' +
        'motoru bağlantı değerini aynı şekilde taşır, ek olarak isteğin yöntemini korur.',
      secenekler: [
        {
          deger: '301',
          etiket: '301 — kalıcı',
          tarif: 'Arama motoru sinyalini taşır (308 olarak gönderilir).',
        },
        {
          deger: '302',
          etiket: '302 — geçici',
          tarif: 'Sinyal taşımaz; nadiren doğru seçim (307 olarak gönderilir).',
        },
        { deger: '308', etiket: '308 — kalıcı, yöntem korunur' },
      ],
    },
    { ad: 'aktif', etiket: 'Aktif', tip: 'mantik', varsayilan: true, genislik: 'yarim' },
    {
      ad: 'gerekce',
      etiket: 'Gerekçe',
      tip: 'uzunMetin',
      satir: 2,
      yardim: 'Neden taşındı? Altı ay sonra bu notu okuyacak kişi için yazın.',
    },
  ],
};
