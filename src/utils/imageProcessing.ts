import { Adjustments, FilterName } from '../types/editor';

export function buildFilterString(adjustments: Adjustments, filter: FilterName): string {
  const brightness = adjustments.brightness / 100;
  const contrast = adjustments.contrast / 100;
  const saturation = adjustments.saturation / 100;
  const exposure = adjustments.exposure / 100;
  const temp = adjustments.temperature / 100;
  const blur = adjustments.blur;

  const filterMap: Record<FilterName, string> = {
    Original: 'none',
    Cinematic: 'contrast(1.15) saturate(1.2) sepia(0.08)',
    Vintage: 'contrast(1.05) saturate(0.8) sepia(0.18) hue-rotate(-10deg)',
    'Black & White': 'grayscale(1) contrast(1.2)',
    Warm: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) sepia(0.15) hue-rotate(${temp * 12}deg)`,
    Cool: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) hue-rotate(${temp * -18}deg)`,
    Dramatic: 'contrast(1.4) saturate(1.5) brightness(1.05)',
    Faded: 'contrast(0.9) saturate(0.7) brightness(1.08)',
    'High Contrast': 'contrast(1.6) saturate(1.4) brightness(1.02)',
  };

  const base = filterMap[filter] || filterMap.Original;
  return `brightness(${Math.min(2, brightness * 1.35)}) contrast(${Math.min(2, contrast * 1.2)}) saturate(${Math.max(0.2, saturation)}) sepia(${Math.max(0, Math.min(0.5, (exposure - 1) * 0.35))}) blur(${blur * 0.6}px) ${base}`.replace(/\s+/g, ' ').trim();
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function toDataUrlFromImage(image: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL('image/png');
}

export function createDemoImageData(): string {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
      <defs>
        <linearGradient id='sky' x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stop-color='#0f172a'/>
          <stop offset='35%' stop-color='#3b1f5f'/>
          <stop offset='100%' stop-color='#f59e0b'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='800' fill='url(#sky)'/>
      <circle cx='930' cy='170' r='88' fill='#fbbf24' opacity='0.9'/>
      <path d='M0 550 C 190 430, 280 530, 420 500 S 720 440, 840 520 S 1060 620, 1200 540 L1200 800 L0 800 Z' fill='#0b1120'/>
      <path d='M0 610 C 180 560, 290 640, 470 580 S 760 555, 1200 630 L1200 800 L0 800 Z' fill='#111827'/>
      <rect x='120' y='470' width='250' height='180' rx='28' fill='#f5f5f4' opacity='0.92'/>
      <rect x='165' y='500' width='160' height='30' rx='15' fill='#d4d4d8'/>
      <rect x='165' y='555' width='140' height='28' rx='14' fill='#a1a1aa'/>
      <circle cx='890' cy='250' r='35' fill='#f8fafc' opacity='0.9'/>
      <path d='M530 280 L760 310 L850 520 L530 520 Z' fill='#f8fafc' opacity='0.18'/>
      <path d='M540 300 L710 330 L770 490 L540 490 Z' fill='#f8fafc' opacity='0.22'/>
      <path d='M560 430 L690 420 L660 700 L600 700 Z' fill='#e2e8f0' opacity='0.7'/>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
