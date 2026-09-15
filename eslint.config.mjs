import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const yapilandirma = [
  /*
   * `_*` — depo kökünde bırakılmış geçici çalışma betikleri. Üretim ajanları
   * doğrulama için buraya kısa betikler yazıp siliyor; silinmeyen bir tanesi
   * lint kapısını konu dışı bir ayrıştırma hatasıyla kırıyordu. `.gitignore`
   * bunların commit edilmesini, bu satır da kaliteyi engellemesini önler.
   */
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '_*'] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
];

export default yapilandirma;
