// HUD köşe braketleri — panel ölçeğinde teknik kesim işaretleri (ADR 0008).
// Salt dekoratif: aria-hidden, pointer-events yok. Kapsayıcı `.hud` sınıfını
// ve `position: relative` bağlamını taşımalıdır.
export function HudCerceve() {
  return (
    <>
      <span aria-hidden className="hud-kose left-0 top-0 border-l border-t" />
      <span aria-hidden className="hud-kose right-0 top-0 border-r border-t" />
      <span aria-hidden className="hud-kose bottom-0 left-0 border-b border-l" />
      <span aria-hidden className="hud-kose bottom-0 right-0 border-b border-r" />
    </>
  );
}
