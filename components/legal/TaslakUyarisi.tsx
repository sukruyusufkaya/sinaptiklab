// Yasal metinlerin en üstünde duran dürüstlük bloğu. Bu sayfalar (KVKK
// aydınlatma, gizlilik, çerez, kullanım şartları) mühendis tarafından
// yazıldı; hukuk danışmanı incelemesinden GEÇMEDİ. Bunu gizlemek
// "uydurma yok" ilkesinin ihlali olurdu — okuyucu durumu ilk ekranda görür.
// Görsel dil: components/mdx/Uyari.tsx ile aynı (sol kalın bordür + mono etiket).
export function TaslakUyarisi() {
  return (
    <aside
      role="note"
      aria-label="Metnin hukuki durumu"
      className="border-l-4 border-uyari bg-kagit-alt px-4 py-3"
    >
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-murekkep-2">
        taslak · hukuk incelemesi bekliyor
      </span>
      <p className="mt-2 text-sm leading-relaxed text-murekkep-2">
        Bu metin taslak niteliğindedir; yayın öncesi hukuk danışmanı incelemesi bekliyor. Aşağıdaki
        anlatım, sitenin bugün fiilen ne yaptığını dürüstçe tarif etmek için yazıldı; nihai hukuki
        metin incelemeden sonra bu adreste yayımlanacak ve bu uyarı kaldırılacaktır.
      </p>
    </aside>
  );
}
