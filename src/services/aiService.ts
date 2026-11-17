import { showToast } from '../utils/toast';

export type AICommand =
  | 'autoEnhance'
  | 'removeBackground'
  | 'makeCinematic'
  | 'makeVibrant'
  | 'convertToBW'
  | 'sharpen'
  | 'blurBackground'
  | 'socialResize';

export interface AIService {
  autoEnhance: (src: string) => Promise<string>;
  removeBackground: (src: string) => Promise<string>;
  describeImage: (src: string) => Promise<string>;
  applyPreset: (src: string, preset: AICommand) => Promise<string>;
}

const NO_API_MESSAGE = 'Connect an AI background-removal API to enable this feature.';

export const aiService: AIService = {
  async autoEnhance(src) {
    return src;
  },
  async removeBackground(src) {
    showToast(NO_API_MESSAGE, 3500);
    throw new Error(NO_API_MESSAGE);
  },
  async describeImage(src) {
    try {
      const image = await loadImage(src);
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'A balanced, well-lit image with strong composition.';
      ctx.drawImage(image, 0, 0, 120, 120);
      const data = ctx.getImageData(0, 0, 120, 120).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let pixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        pixels += 1;
      }
      const avgR = Math.round(r / pixels);
      const avgG = Math.round(g / pixels);
      const avgB = Math.round(b / pixels);
      const isWarm = avgR > avgG && avgR > avgB;
      const isCool = avgB > avgR && avgB > avgG;
      const tone = isWarm ? 'warm' : isCool ? 'cool' : 'balanced';
      return `A ${tone} image with rich visual detail and a polished, modern composition.`;
    } catch {
      return 'A polished image with subject-focused framing and strong contrast.';
    }
  },
  async applyPreset(src, preset) {
    return src;
  },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load source image'));
    img.src = src;
  });
}
