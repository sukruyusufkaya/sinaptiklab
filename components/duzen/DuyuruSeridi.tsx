import { guvenliAdres } from '@/lib/guvenlik/adres';

/**
 * Panelden yazılan duyuru şeridi.
 *
 * Metin editör girdisidir; bu yüzden HTML olarak DEĞİL düz metin olarak basılır
 * (React zaten kaçışlar). Metnin sonunda bir adres varsa bağlantıya çevrilir ve
 * adres `guvenliAdres` süzgecinden geçer: `javascript:` gibi bir şema yazılmışsa
 * bağlantı hiç basılmaz.
 *
 * Şerit kapatılabilir DEĞİL: kapatma düğmesi istemci durumu ve depolama
 * gerektirir, duyurunun görülmesi ise bir editoryal karardır. Duyuru
 * gösterilmeyecekse panelden metni boşaltmak yeterlidir.
 */

export function DuyuruSeridi({ metin }: { metin: string }) {
  /*
   * Editör "Metin — https://..." biçiminde yazabilir. Son boşluktan sonraki
   * parça bir adresse ayrılır; değilse tüm metin düz metin olarak kalır.
   */
  const parcalar = metin.trim().split(/\s+/);
  const sonParca = parcalar.at(-1) ?? '';
  const adres = /^(https?:\/\/|\/)/.test(sonParca) ? guvenliAdres(sonParca) : undefined;
  const govde = adres ? parcalar.slice(0, -1).join(' ') : metin;

  return (
    <div
      role="region"
      aria-label="Site duyurusu"
      className="border-b border-kenar bg-vurgu/8 px-4 py-2.5 text-center"
    >
      <p className="text-[0.8125rem] leading-snug text-metin-ikincil">
        {govde}
        {adres && (
          <>
            {' '}
            <a
              href={adres}
              className="font-medium text-vurgu-parlak underline underline-offset-2"
              {...(adres.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              ayrıntı
            </a>
          </>
        )}
      </p>
    </div>
  );
}
