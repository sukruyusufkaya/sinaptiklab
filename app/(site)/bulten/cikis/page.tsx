import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Ok } from '@/components/arayuz/Ikonlar';
import { bultendenCik } from '@/lib/site/bulten-cikis';

export const metadata: Metadata = {
  title: 'Bülten aboneliğinden çıkış',
  description: 'Bülten aboneliğinizi tek adımda sonlandırın.',
  // Kişiye özel anahtar taşıyan adres dizine girmez.
  robots: { index: false, follow: false },
};

/*
 * ÇIKIŞ SAYFASI DİNAMİKTİR ve önbelleğe alınmaz: adres kişiye özel bir anahtar
 * taşır ve sayfa bir YAZMA yapar. Statik üretim burada hem yanlış (anahtar
 * derleme anında bilinmez) hem tehlikeli olurdu.
 */
export const dynamic = 'force-dynamic';

/**
 * Bülten çıkışı.
 *
 * `/bulten/` sayfası "tek tıkla çıkabilirsiniz" diye söz veriyordu ve abonelik
 * eylemi her kayda bir `cikisAnahtari` yazıyordu; ama anahtarı okuyan rota hiç
 * yazılmamıştı — vaadin arkasında hiçbir şey yoktu. Bu sayfa o boşluğu kapatır.
 *
 * Çıkış GET ile yapılır, bilinçli olarak: çıkış bağlantısı e-posta istemcisinden
 * tıklanır ve orada form gönderimi güvenilmez. İşlem yıkıcı değildir (kayıt
 * silinmez, `onayDurumu: 'cikti'` yazılır) ve anahtar tahmin edilemez olduğu
 * için önden getirme (prefetch) ile kazara tetiklenmesi de zararsızdır.
 */
export default async function BultenCikisSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ anahtar?: string }>;
}) {
  const { anahtar } = await searchParams;
  const sonuc = anahtar ? await bultendenCik(anahtar) : ({ durum: 'gecersiz' } as const);

  const METINLER = {
    cikildi: {
      rozet: 'ÇIKIŞ TAMAMLANDI',
      ton: 'basari' as const,
      baslik: 'Aboneliğiniz sonlandırıldı',
      ozet:
        'Bu adrese artık bülten gönderilmeyecek. Kaydınız silinmedi; talebinizin kaydı ' +
        'saklanıyor, böylece yeniden abone olup olmadığınız ayırt edilebiliyor.',
    },
    'zaten-cikmis': {
      rozet: 'ZATEN ÇIKILMIŞ',
      ton: 'notr' as const,
      baslik: 'Bu adres zaten listede değil',
      ozet: 'Daha önce çıkış yapılmış. Ek bir işlem gerekmiyor.',
    },
    gecersiz: {
      rozet: 'BAĞLANTI GEÇERSİZ',
      ton: 'uyari' as const,
      baslik: 'Bu çıkış bağlantısı geçerli değil',
      ozet:
        'Bağlantı eksik veya artık geçerli değil. Bültenlerin altındaki güncel çıkış ' +
        'bağlantısını kullanın; sorun sürerse bize yazın.',
    },
  };

  const metin = METINLER[sonuc.durum];

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Bülten', yol: '/bulten/' },
          { ad: 'Çıkış', yol: '/bulten/cikis/' },
        ]}
        etiket="BÜLTEN"
        baslik={metin.baslik}
        ozet={metin.ozet}
        eylemler={
          <>
            <Dugme href="/bulten/" gorunum="ikincil">
              Bülten sayfası
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/gizlilik/" gorunum="ikincil">
              Gizlilik politikası
            </Dugme>
          </>
        }
      />

      <Bolum>
        <div className="olcu">
          <Rozet ton={metin.ton}>{metin.rozet}</Rozet>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-metin-ikincil">
            Fikrinizi değiştirirseniz bülten sayfasından yeniden abone olabilirsiniz. Adresiniz
            üçüncü taraflarla pazarlama amacıyla paylaşılmaz.
          </p>
        </div>
      </Bolum>
    </>
  );
}
