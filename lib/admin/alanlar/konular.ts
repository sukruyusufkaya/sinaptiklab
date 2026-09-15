import { KONU_LISTESI } from '@/lib/veri/temel';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
  type Secenek,
} from '@/lib/admin/alanlar/tipler';

/**
 * Konu taksonomisi. Şemada `kume` serbest metindir (yeni pillar açmak göç
 * gerektirmesin diye), bu yüzden alan `secim` değil `metin`; ancak mevcut küme
 * adları dar bir kümedir ve liste filtresi bunlardan üretilir.
 */
const KUME_SECENEKLERI: readonly Secenek[] = Array.from(
  new Set(KONU_LISTESI.map((konu) => konu.kume)),
)
  .sort((a, b) => a.localeCompare(b, 'tr'))
  .map((kume) => ({ deger: kume, etiket: kume }));

export const KONULAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.konular,
  ad: 'Konu',
  cogul: 'Konular',
  aciklama:
    'Konu taksonomisi: pillar (ana konu) ve cluster (alt konu) hiyerarşisi. Konu formattan ayrıdır — içerik, Atlas girdisi, ders ve test bu slug ile aynı konu merkezinde toplanır (MASTER-PLAN §9).',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Konu' },
    { ad: 'kume', etiket: 'Küme', secenekler: KUME_SECENEKLERI },
    { ad: 'ustKonuSlug', etiket: 'Üst konu', mono: true },
    { ad: 'sira', etiket: 'Sıra', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'kume', etiket: 'Küme', secenekler: KUME_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'slug', 'kume', 'ozet'],
  siralama: { kume: 1, sira: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/konu/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Konu adı',
      tip: 'metin',
      zorunlu: true,
      genislik: 'yarim',
      yardim:
        'Konu merkezi başlığında görünen ad ("AI Agents", "Büyük Dil Modelleri"). Format adı yazılmaz: "AI Agents Rehberi" değil "AI Agents".',
    },
    SLUG_ALANI,
    {
      ad: 'kume',
      etiket: 'Küme (pillar)',
      tip: 'metin',
      zorunlu: true,
      genislik: 'yarim',
      yardim:
        'Konunun bağlı olduğu ana küme adı ("Generative AI", "Responsible AI"). Var olan bir küme adını birebir yazın; yeni küme yalnızca gerçekten yeni bir dal açarken eklenir.',
    },
    DURUM_ALANI,
    {
      ad: 'ustKonuSlug',
      etiket: 'Üst konu',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.konular,
      genislik: 'yarim',
      yardim:
        'Bu konu bir alt konu (cluster) ise üstündeki ana konuyu seçin. Ana konularda boş bırakılır. Kendi slug’unu seçmeyin — hiyerarşi döngüye girer.',
    },
    {
      ad: 'sira',
      etiket: 'Sıra',
      tip: 'sayi',
      genislik: 'yarim',
      yardim:
        'Aynı üst konu altındaki sıralama; küçük sayı önce gelir. Boş bırakılırsa konu listenin sonuna düşer.',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'Konu merkezinin giriş paragrafı ve konu dizinindeki kart metni. Kavramı tanımlamaz (o Atlas girdisinin işi); bu konu altında ne tür içerik bulunacağını söyler.',
    },
    ...SEO_ALANLARI,
  ],
};
