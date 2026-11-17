export type ShapeData = {
  shape: 'rect' | 'ellipse' | 'line' | 'arrow'
  x: number
  y: number
  w: number
  h: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export type TextData = {
  text: string
  x: number
  y: number
  size?: number
  color?: string
  bold?: boolean
  italic?: boolean
  align?: CanvasTextAlign
}

export type Layer = {
  id: string
  name: string
  type: 'image' | 'text' | 'drawing' | 'shape'
  visible: boolean
  opacity: number
  data?: any
}
