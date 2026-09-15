import type { SVGProps } from 'react';

type IkonOzellikleri = SVGProps<SVGSVGElement>;

/**
 * Kütüphane bağımlılığı olmadan, tek çizgi kalınlığında ikon seti.
 * Hepsi `currentColor` kullanır; boyut `className` ile verilir.
 */
function Govde({ children, ...rest }: IkonOzellikleri) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Ok = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Govde>
);

export const OkSagUst = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Govde>
);

export const Kevron = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="m6 9 6 6 6-6" />
  </Govde>
);

export const Ara = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Govde>
);

export const Menu = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Govde>
);

export const Kapat = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Govde>
);

export const Gunes = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Govde>
);

export const Ay = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
  </Govde>
);

export const Sistem = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M9 21h6M12 17v4" />
  </Govde>
);

export const Nabiz = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M3 12h3.5l2-6 3.5 12 2.5-7 1.5 3H21" />
  </Govde>
);

export const Kivilcim = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3Z" />
    <path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </Govde>
);

export const Atlas = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 9h17M3.5 15h17" />
    <path d="M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z" />
  </Govde>
);

export const Grafik = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Govde>
);

export const Katman = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Govde>
);

export const Dugum = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="7" r="2.5" />
    <circle cx="12" cy="18" r="2.5" />
    <path d="M8 7.5 10.5 16M15.9 9.2 13.6 16M8.3 6.6l7.2.6" />
  </Govde>
);

export const Kitap = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z" />
  </Govde>
);

export const Hedef = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </Govde>
);

export const Kalkan = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M12 3l7.5 3v6c0 4.5-3.1 8-7.5 9.5C7.6 20 4.5 16.5 4.5 12V6L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </Govde>
);

export const Kod = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />
  </Govde>
);

export const Bina = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M4 21V6.5L12 3l8 3.5V21" />
    <path d="M2 21h20M9 21v-5h6v5M8 9h2M14 9h2M8 12.5h2M14 12.5h2" />
  </Govde>
);

export const Zarf = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Govde>
);

export const Saat = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Govde>
);

export const Yukselen = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M3 17 9.5 10.5l4 4L21 7" />
    <path d="M15 7h6v6" />
  </Govde>
);

export const Dusen = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M3 7l6.5 6.5 4-4L21 17" />
    <path d="M15 17h6v-6" />
  </Govde>
);

export const Kilit = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
    <path d="M8 10V7.5a4 4 0 1 1 8 0V10" />
  </Govde>
);

export const Onay = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Govde>
);

export const Terazi = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M12 4v16M7 20h10M4.5 8h15" />
    <path d="M4.5 8 2 14h5L4.5 8ZM19.5 8 17 14h5l-2.5-6Z" />
  </Govde>
);

export const Simsek = (p: IkonOzellikleri) => (
  <Govde {...p}>
    <path d="M13 2.5 4.8 13.4h5.4L9.6 21.5l8.2-10.9h-5.4l.6-8.1Z" />
  </Govde>
);
