import { ustveriBirlestir } from '../lib/seo/ustveri.ts';

const vakalar = [
  {
    ad: 'editor noindex yazabilir',
    seo: { dizinlenmesin: true },
    varsayilan: { baslik: 'X' },
    bekle: 'noindex',
  },
  {
    ad: 'sayfa kendi noindex kararini verir',
    seo: undefined,
    varsayilan: { baslik: 'X', dizinlenmesin: true },
    bekle: 'noindex',
  },
  {
    ad: 'TEK YONLULUK: editor dizinlenmesin=false ile sayfanin noindex kararini EZEMEZ',
    seo: { dizinlenmesin: false },
    varsayilan: { baslik: 'X', dizinlenmesin: true },
    bekle: 'noindex',
  },
  {
    ad: 'ikisi de sessizse robots hic basilmaz',
    seo: { dizinlenmesin: false },
    varsayilan: { baslik: 'X' },
    bekle: 'yok',
  },
  {
    ad: 'bos dize editorun basligini gecersiz kilar',
    seo: { baslik: '   ' },
    varsayilan: { baslik: 'VARSAYILAN' },
    bekle: 'yok',
  },
];

let hata = 0;
for (const v of vakalar) {
  const u = ustveriBirlestir(v.seo, v.varsayilan as never);
  const robots = u.robots as { index?: boolean } | undefined;
  const gercek = robots === undefined ? 'yok' : robots.index === false ? 'noindex' : 'index';
  const gecti = gercek === v.bekle;
  if (!gecti) hata += 1;
  console.log(`${gecti ? 'GECTI ' : 'DUSTU '} ${v.ad}  (beklenen=${v.bekle} gercek=${gercek})`);
  if (v.ad.startsWith('bos dize')) {
    const b = u.title === 'VARSAYILAN';
    if (!b) hata += 1;
    console.log(`${b ? 'GECTI ' : 'DUSTU '}   -> baslik varsayilana dustu: ${String(u.title)}`);
  }
}
console.log(hata === 0 ? '\nTUM VAKALAR GECTI' : `\n${hata} VAKA DUSTU`);
