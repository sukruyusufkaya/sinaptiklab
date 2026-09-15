export type Tema = 'sistem' | 'aydinlik' | 'karanlik';

export const TEMA_ANAHTARI = 'sinaptik-tema';

const dinleyiciler = new Set<() => void>();

function bildir() {
  for (const geriCagir of dinleyiciler) geriCagir();
}

/**
 * Tema, React state'inde değil DOM'da (`<html data-tema>`) yaşar; ilk boyamadan
 * önce çalışan satır içi betik onu zaten kurmuştur. Bu yüzden okuma bir dış
 * store aboneliği olarak modellenir — effect içinde setState gerekmez.
 */
export function temaAbone(geriCagir: () => void) {
  dinleyiciler.add(geriCagir);
  window.addEventListener('storage', geriCagir);
  return () => {
    dinleyiciler.delete(geriCagir);
    window.removeEventListener('storage', geriCagir);
  };
}

export function temaOku(): Tema {
  const deger = document.documentElement.getAttribute('data-tema');
  return deger === 'aydinlik' || deger === 'karanlik' ? deger : 'sistem';
}

/** Sunucuda ve hidrasyondan önce her zaman "sistem" varsayılır. */
export function temaSunucuda(): Tema {
  return 'sistem';
}

export function temaYaz(yeni: Tema) {
  const kok = document.documentElement;
  if (yeni === 'sistem') kok.removeAttribute('data-tema');
  else kok.setAttribute('data-tema', yeni);

  try {
    if (yeni === 'sistem') localStorage.removeItem(TEMA_ANAHTARI);
    else localStorage.setItem(TEMA_ANAHTARI, yeni);
  } catch {
    /* depolama kapalı olabilir; tema yine de bu oturumda uygulanır */
  }

  bildir();
}
