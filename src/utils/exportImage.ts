import { EditorLayer } from '../types/editor';
import { buildFilterString } from './imageProcessing';

export async function exportEditedImage({
  imageSrc,
  layers,
  adjustments,
  filter,
  rotation,
  flipX,
  flipY,
  width,
  height,
  format,
  quality,
}: {
  imageSrc: string | null;
  layers: EditorLayer[];
  adjustments: any;
  filter: any;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'webp';
  quality: number;
}): Promise<string> {
  if (!imageSrc) return '';

  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = width || image.width;
  canvas.height = height || image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.filter = buildFilterString(adjustments, filter);
  ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
  ctx.restore();

  for (const layer of layers) {
    if (!layer.visible) continue;
    ctx.save();
    ctx.globalAlpha = layer.opacity;

    if (layer.type === 'text') {
      const fontSize = layer.fontSize || 48;
      ctx.font = `${layer.italic ? 'italic' : 'normal'} ${layer.fontWeight || 700} ${fontSize}px ${layer.fontFamily || 'Inter, sans-serif'}`;
      ctx.textAlign = layer.align || 'left';
      ctx.fillStyle = layer.color || '#ffffff';
      ctx.fillText(layer.text, layer.x, layer.y);
    }

    if (layer.type === 'shape') {
      ctx.strokeStyle = layer.stroke || '#ffffff';
      ctx.fillStyle = layer.fill || 'rgba(255,255,255,0.1)';
      ctx.lineWidth = layer.strokeWidth || 2;

      if (layer.shape === 'rect') {
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
      }

      if (layer.shape === 'circle') {
        ctx.beginPath();
        ctx.ellipse(layer.x + layer.width / 2, layer.y + layer.height / 2, Math.abs(layer.width / 2), Math.abs(layer.height / 2), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (layer.shape === 'line') {
        ctx.beginPath();
        ctx.moveTo(layer.x, layer.y);
        ctx.lineTo(layer.x + layer.width, layer.y + layer.height);
        ctx.stroke();
      }

      if (layer.shape === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(layer.x, layer.y);
        ctx.lineTo(layer.x + layer.width, layer.y + layer.height);
        ctx.stroke();
        const angle = Math.atan2(layer.height, layer.width);
        const arrowLength = 16;
        ctx.beginPath();
        ctx.moveTo(layer.x + layer.width, layer.y + layer.height);
        ctx.lineTo(layer.x + layer.width - Math.cos(angle - Math.PI / 6) * arrowLength, layer.y + layer.height - Math.sin(angle - Math.PI / 6) * arrowLength);
        ctx.lineTo(layer.x + layer.width - Math.cos(angle + Math.PI / 6) * arrowLength, layer.y + layer.height - Math.sin(angle + Math.PI / 6) * arrowLength);
        ctx.closePath();
        ctx.fillStyle = layer.stroke;
        ctx.fill();
      }
    }

    if (layer.type === 'drawing') {
      const points = layer.points || [];
      if (points.length < 2) continue;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = layer.erase ? 'rgba(0,0,0,1)' : layer.color || '#ffffff';
      ctx.lineWidth = layer.size || 10;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  const mime = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  return canvas.toDataURL(mime, quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}
