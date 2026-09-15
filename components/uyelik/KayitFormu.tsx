'use client';

import Link from 'next/link';
import { UyelikAlani, UyelikFormu } from '@/components/uyelik/UyelikFormu';
import { uyeKaydol } from '@/lib/site/uyelik-eylemleri';
import {
  BULTEN_LISTELERI,
  DENEYIM_SEVIYELERI,
  EN_COK_ILGI_ALANI,
  HAFTALIK_SAATLER,
  HEDEFLER,
  KURUM_SINIRI,
  type Secenek,
} from '@/lib/site/uyelik-profili';

/**
 * Üye kayıt formu.
 *
 * "Rolüm" alanı ÖĞRENME rolüdür (`ogrenmeRolu`), yetki rolü değil. Yetki rolü
 * (`roller`) hiçbir koşulda formdan okunmaz — sunucu tarafı her kayda `['uye']`
 * yazar. Bu ayrım olmasa forma `roller=sahip` yazan biri kendini yönetici
 * yapabilirdi.
 *
 * FORM ÜÇ BÖLÜME AYRILDI. Önceki hâli dört alandı (ad, e-posta, parola, rol)
 * ve kişiselleştirme için yeterli veri toplamıyordu: site 20 rota, 100 test,
 * 10 sektör ve 4 bülten listesi taşıyor ama hangisinin kime uyduğunu bilmenin
 * yolu yoktu. Alanlar artık üç başlıkta toplanıyor — hesap, öğrenme profili,
 * bültenler — ve ZORUNLU OLAN YALNIZCA HESAP BÖLÜMÜ. Profil alanlarının hepsi
 * atlanabilir; her biri "neden soruyoruz" açıklamasıyla geliyor. Zorunlu
 * olmayan alanı zorunluymuş gibi göstermek kayıt akışını uzatır ve KVKK
 * tarafında da veri minimizasyonuna aykırıdır.
 */

/** Bölüm başlığı — formu üç mantıksal gruba ayırır. */
function BolumBasi({
  numara,
  baslik,
  aciklama,
}: {
  numara: string;
  baslik: string;
  aciklama: string;
}) {
  return (
    <div className="mt-2 border-t border-kenar-soluk pt-5 first:mt-0 first:border-0 first:pt-0">
      <div className="flex items-baseline gap-2.5">
        <span className="etiket-mono text-metin-soluk">{numara}</span>
        <h3 className="text-sm font-semibold tracking-tight text-metin">{baslik}</h3>
      </div>
      <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-metin-soluk">{aciklama}</p>
    </div>
  );
}

/** Radyo grubu: tek seçim, hepsi atlanabilir. */
function SecimGrubu({
  ad,
  secenekler,
  sutun = 1,
}: {
  ad: string;
  secenekler: readonly Secenek[];
  sutun?: 1 | 2;
}) {
  return (
    <div className={`grid gap-2 ${sutun === 2 ? 'sm:grid-cols-2' : ''}`} role="radiogroup">
      {secenekler.map((s) => (
        <label
          key={s.deger}
          className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-kenar bg-zemin/40 p-3 transition-colors hover:border-vurgu/45 has-checked:border-vurgu has-checked:bg-vurgu-zemin/40"
        >
          <input
            type="radio"
            name={ad}
            value={s.deger}
            className="mt-0.5 size-3.5 shrink-0 accent-[var(--vurgu)]"
          />
          <span className="min-w-0">
            <span className="block text-[0.8125rem] font-medium text-metin">{s.etiket}</span>
            {s.tarif && (
              <span className="mt-0.5 block text-[0.6875rem] leading-relaxed text-metin-soluk">
                {s.tarif}
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}

/** Çoklu seçim çipleri: aynı adla birden çok değer gönderilir. */
function CokluSecim({ ad, secenekler }: { ad: string; secenekler: readonly Secenek[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {secenekler.map((s) => (
        <label
          key={s.deger}
          className="cursor-pointer rounded-full border border-kenar bg-zemin/40 px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu/45 has-checked:border-vurgu has-checked:bg-vurgu-zemin has-checked:text-vurgu-parlak"
        >
          <input type="checkbox" name={ad} value={s.deger} className="sr-only" />
          {s.etiket}
        </label>
      ))}
    </div>
  );
}

export function KayitFormu({
  roller,
  konular,
  sektorler,
}: {
  roller: readonly string[];
  konular: readonly Secenek[];
  sektorler: readonly Secenek[];
}) {
  return (
    <UyelikFormu
      eylem={uyeKaydol}
      baslik="Hesap oluştur"
      dugmeMetni="Hesap oluştur"
      altBilgi={
        <p className="mt-4 text-[0.6875rem] leading-relaxed text-metin-soluk">
          Parolanız yalnızca özet (hash) olarak saklanır; düz metin hiçbir yerde tutulmaz. Profil
          bilgileri yalnızca size uygun içerik önermek için kullanılır ve üçüncü taraflarla
          paylaşılmaz.
        </p>
      }
    >
      {(alanHatasi) => (
        <>
          <BolumBasi
            numara="01"
            baslik="Hesap"
            aciklama="Giriş için gereken bilgiler. Yalnızca bu bölüm zorunludur."
          />

          <UyelikAlani
            ad="adSoyad"
            etiket="Ad soyad"
            otomatik="name"
            zorunlu={false}
            hata={alanHatasi('adSoyad')}
          />
          <UyelikAlani
            ad="eposta"
            etiket="E-posta"
            tur="email"
            otomatik="email"
            hata={alanHatasi('eposta')}
          />
          <UyelikAlani
            ad="parola"
            etiket="Parola"
            tur="password"
            otomatik="new-password"
            ipucu="En az 12 karakter. Uzunluk, karmaşıklıktan daha çok koruma sağlar."
            hata={alanHatasi('parola')}
          />

          <BolumBasi
            numara="02"
            baslik="Öğrenme profili"
            aciklama="Hepsi isteğe bağlı. Doldurursanız rota, ders ve test önerileri buna göre sıralanır; sonradan hesap sayfanızdan değiştirebilirsiniz."
          />

          <div>
            <label htmlFor="ogrenmeRolu" className="etiket-mono mb-1.5 block text-metin-soluk">
              Rolüm
            </label>
            <select
              id="ogrenmeRolu"
              name="ogrenmeRolu"
              className="h-11 w-full rounded-lg border border-kenar bg-zemin/70 px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu"
            >
              <option value="">Belirtmek istemiyorum</option>
              {roller.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[0.6875rem] text-metin-soluk">
              Öğrenme rotası önerisi için kullanılır.
            </p>
          </div>

          <div>
            <p className="etiket-mono mb-2 text-metin-soluk">Deneyim seviyem</p>
            <SecimGrubu ad="deneyimSeviyesi" secenekler={DENEYIM_SEVIYELERI} />
            <p className="mt-1.5 text-[0.6875rem] text-metin-soluk">
              Testler ve dersler bu seviyeden başlar.
            </p>
          </div>

          <div>
            <p className="etiket-mono mb-2 text-metin-soluk">Amacım</p>
            <SecimGrubu ad="hedef" secenekler={HEDEFLER} />
          </div>

          <div>
            <p className="etiket-mono mb-2 text-metin-soluk">
              İlgi alanlarım{' '}
              <span className="text-metin-soluk/70">(en çok {EN_COK_ILGI_ALANI} konu)</span>
            </p>
            <CokluSecim ad="ilgiAlanlari" secenekler={konular} />
            <p className="mt-2 text-[0.6875rem] text-metin-soluk">
              Seçtiğiniz konuların haberleri, kavramları ve testleri öne çıkar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sektorSlug" className="etiket-mono mb-1.5 block text-metin-soluk">
                Sektörüm
              </label>
              <select
                id="sektorSlug"
                name="sektorSlug"
                className="h-11 w-full rounded-lg border border-kenar bg-zemin/70 px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu"
              >
                <option value="">Belirtmek istemiyorum</option>
                {sektorler.map((s) => (
                  <option key={s.deger} value={s.deger}>
                    {s.etiket}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[0.6875rem] text-metin-soluk">
                Sektörünüze uygun vaka çalışmaları önerilir.
              </p>
            </div>

            <div>
              <label htmlFor="haftalikSaat" className="etiket-mono mb-1.5 block text-metin-soluk">
                Ayırabileceğim süre
              </label>
              <select
                id="haftalikSaat"
                name="haftalikSaat"
                className="h-11 w-full rounded-lg border border-kenar bg-zemin/70 px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu"
              >
                <option value="">Belirtmek istemiyorum</option>
                {HAFTALIK_SAATLER.map((s) => (
                  <option key={s.deger} value={s.deger}>
                    {s.etiket}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[0.6875rem] text-metin-soluk">
                Rotanın kaç haftaya yayılacağını belirler.
              </p>
            </div>
          </div>

          <UyelikAlani
            ad="kurum"
            etiket="Kurum"
            otomatik="organization"
            zorunlu={false}
            ipucu={`İsteğe bağlı, en çok ${KURUM_SINIRI} karakter. Yalnızca kurumsal içerik önerisi için kullanılır.`}
            hata={alanHatasi('kurum')}
          />

          <BolumBasi
            numara="03"
            baslik="Bültenler"
            aciklama="İşaretlemezseniz hiçbir bülten gönderilmez. Her e-postanın altında tek tıkla çıkış bağlantısı bulunur."
          />

          <div>
            <CokluSecim ad="bultenListeleri" secenekler={BULTEN_LISTELERI} />
            <ul className="mt-2.5 space-y-1">
              {BULTEN_LISTELERI.map((s) => (
                <li key={s.deger} className="text-[0.6875rem] leading-relaxed text-metin-soluk">
                  <span className="text-metin-ikincil">{s.etiket}</span> — {s.tarif}
                </li>
              ))}
            </ul>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-metin-ikincil">
            <input
              type="checkbox"
              name="kosullar"
              aria-describedby={alanHatasi('kosullar') ? 'kosullar-hata' : undefined}
              className="mt-0.5 size-3.5 shrink-0 accent-[var(--vurgu)]"
            />
            <span>
              <Link href="/kullanim-sartlari/" className="underline underline-offset-2">
                Kullanım şartlarını
              </Link>{' '}
              ve{' '}
              <Link href="/kvkk-aydinlatma/" className="underline underline-offset-2">
                KVKK aydınlatma metnini
              </Link>{' '}
              okudum, kabul ediyorum.
            </span>
          </label>
          {alanHatasi('kosullar') && (
            <p id="kosullar-hata" className="text-[0.6875rem] text-tehlike">
              {alanHatasi('kosullar')}
            </p>
          )}
        </>
      )}
    </UyelikFormu>
  );
}
