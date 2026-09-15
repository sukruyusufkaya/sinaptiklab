import { Bolum } from '@/components/arayuz/Bolum';
import { Zarf } from '@/components/arayuz/Ikonlar';
import { BultenFormu, BultenKapali, BultenSecimi } from '@/components/form/BultenFormu';
import { bultenAktif } from '@/lib/site/ayarlar';
import { BULTEN_KAPALI_ILETISI } from '@/lib/site/form-sozlesmesi';

/**
 * Ana sayfa bülten kutusu.
 *
 * SUNUCU BİLEŞENİ KALDI: `bulten-aktif` ayarı burada, sunucuda okunur; form ve
 * bülten seçimi ayrı istemci bileşenlerine taşındı. Ayar kapalıyken form hiç
 * render edilmez.
 *
 * Bülten seçimi ile formun DOM'da ayrı ızgara hücrelerinde durması gerekiyor
 * (tasarım böyle). İkisini tek gönderimde birleştirmek için onay kutuları
 * HTML'in `form` niteliğiyle forma bağlanır — paylaşılan React durumu
 * gerekmez ve yerleşim hiç değişmez.
 */

const FORM_KIMLIGI = 'bulten-ana-sayfa';

export async function Bulten() {
  const kayitAcik = await bultenAktif();

  return (
    <Bolum kimlik="bulten" etiketlendiren="bulten-basligi">
      <div className="relative overflow-hidden rounded-3xl border border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="izgara-zemin absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_70%_at_70%_50%,black,transparent)]" />
          <div className="absolute -top-24 -left-10 h-72 w-[30rem] rounded-full bg-ikincil/14 blur-[110px]" />
        </div>

        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-kenar bg-yuzey/60 px-3 py-1.5">
              <Zarf className="size-3.5 text-ikincil" />
              <span className="etiket-mono text-metin-ikincil">Owned media</span>
            </div>

            <h2
              id="bulten-basligi"
              className="max-w-xl text-2xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-3xl md:text-[2.25rem]"
            >
              Yapay zekâ dünyasında önemli bir şeyi kaçırma.
            </h2>
            <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-metin-ikincil">
              Haftanın en önemli gelişmelerini, araştırmalarını ve araçlarını beş dakikada oku.
              Hangi bülteni alacağını sen seçersin.
            </p>

            {kayitAcik ? (
              <BultenFormu kimlik={FORM_KIMLIGI} duzen="satir" kaynakYol="/" />
            ) : (
              <BultenKapali duzen="satir" ileti={BULTEN_KAPALI_ILETISI} />
            )}

            <p className="mt-3 text-xs text-metin-soluk">
              Tek tıkla çıkabilirsiniz. E-posta adresiniz üçüncü taraflarla paylaşılmaz.
            </p>
          </div>

          {kayitAcik && <BultenSecimi formKimligi={FORM_KIMLIGI} />}
        </div>
      </div>
    </Bolum>
  );
}
