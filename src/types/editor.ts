export type ToolName =
  | 'select'
  | 'crop'
  | 'resize'
  | 'rotate'
  | 'brush'
  | 'eraser'
  | 'text'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'line'
  | 'arrow'
  | 'blur'
  | 'pixelate'
  | 'colorpicker';

export type FilterName =
  | 'Original'
  | 'Cinematic'
  | 'Vintage'
  | 'Black & White'
  | 'Warm'
  | 'Cool'
  | 'Dramatic'
  | 'Faded'
  | 'High Contrast';

export type AdjustmentKey =
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'exposure'
  | 'temperature'
  | 'sharpness'
  | 'blur';

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  temperature: number;
  sharpness: number;
  blur: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface EditorLayerBase {
  id: string;
  name: string;
  type: 'text' | 'shape' | 'drawing';
  visible: boolean;
  opacity: number;
}

export interface TextLayer extends EditorLayerBase {
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  italic: boolean;
  color: string;
  align: 'left' | 'center' | 'right';
  opacity: number;
}

export interface ShapeLayer extends EditorLayerBase {
  type: 'shape';
  shape: 'rect' | 'ellipse' | 'triangle' | 'diamond' | 'star' | 'line' | 'arrow' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export interface DrawingStroke extends EditorLayerBase {
  type: 'drawing';
  color: string;
  size: number;
  opacity: number;
  points: Point[];
  erase: boolean;
}

export type EditorLayer = TextLayer | ShapeLayer | DrawingStroke;

export interface EditorState {
  imageSrc: string | null;
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  adjustments: Adjustments;
  filter: FilterName;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  zoom: number;
  pan: { x: number; y: number };
  layers: EditorLayer[];
  selectedLayerId: string | null;
  activeTool: ToolName;
  compareMode: boolean;
  comparePosition: number;
}
