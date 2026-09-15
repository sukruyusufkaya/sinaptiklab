export const SITE = {
  ad: 'Sinaptik Lab',
  kisaAd: 'Sinaptik',
  alanAdi: 'sinaptiklab.com',
  url: 'https://sinaptiklab.com',
  vaat: 'Yapay zekâyı takip et. Anla. Öğren. Uygula.',
  aciklama:
    'Yapay zekâ ekosistemini tek platformda takip edin: günlük gündem, kavram atlası, model veritabanı, öğrenme yolları, özgün araştırma ve kurumsal yapay zekâ çözümleri.',
  dil: 'tr-TR',
  /**
   * Kurucu şirket — altlıkta künye olarak görünür.
   *
   * Sabit burada durur, bileşende değil: aynı bilgi altlığın telif satırında
   * ve "Crafted by" künyesinde iki kez geçiyor, ayrıca kardeş sitelerle
   * (citeance.com) aynı biçimi paylaşıyor. İki yere elle yazmak, adres veya
   * unvan değiştiğinde birinin geride kalması demekti.
   */
  kurucu: {
    ad: 'Alfi Technology',
    url: 'https://alfitechnology.com',
  },
  sosyal: {
    x: 'https://x.com/sinaptiklab',
    linkedin: 'https://www.linkedin.com/company/sinaptiklab',
    github: 'https://github.com/sinaptiklab',
    youtube: 'https://www.youtube.com/@sinaptiklab',
  },
} as const;

/** Discover → Understand → Learn → Build (MASTER-PLAN §1) */
export const KATMANLAR = [
  {
    anahtar: 'kesfet',
    ad: 'Discover',
    soru: 'Yapay zekâ dünyasında ne oluyor?',
    urun: 'Gündem · Radar · Brief · Dergi',
  },
  {
    anahtar: 'anla',
    ad: 'Understand',
    soru: 'Bu teknoloji ne anlama geliyor?',
    urun: 'Atlas · Rehber · Modeller · Araçlar',
  },
  {
    anahtar: 'ogren',
    ad: 'Learn',
    soru: 'Bunu nasıl öğrenebilirim?',
    urun: 'Öğrenme yolları · Dersler · Testler',
  },
  {
    anahtar: 'uygula',
    ad: 'Build',
    soru: 'Projemde nasıl kullanırım?',
    urun: 'Lab · Danışmanlık · Eğitim · Vaka',
  },
] as const;
