import React from 'react'
import { Select, Crop, RotateCw, RotateCcw, Pen, Trash, Type, Square, Circle, Image, Scissors } from 'lucide-react'

type Props = {
  onTool: (t: string)=>void
  currentTool?: string
}

export default function LeftToolbar({ onTool, currentTool }: Props) {
  const tools = [
    { id: 'select', icon: <Select size={18}/>, title: 'Select' },
    { id: 'crop', icon: <Crop size={18}/>, title: 'Crop' },
    { id: 'resize', icon: <RotateCw size={18}/>, title: 'Resize' },
    { id: 'rotate', icon: <RotateCcw size={18}/>, title: 'Rotate/Flip' },
    { id: 'brush', icon: <Pen size={18}/>, title: 'Brush/Draw' },
    { id: 'eraser', icon: <Trash size={18}/>, title: 'Eraser' },
    { id: 'text', icon: <Type size={18}/>, title: 'Text' },
    { id: 'rect', icon: <Square size={18}/>, title: 'Rectangle' },
    { id: 'ellipse', icon: <Circle size={18}/>, title: 'Ellipse' },
    { id: 'line', icon: <RotateCw size={18}/>, title: 'Line' },
    { id: 'arrow', icon: <RotateCcw size={18}/>, title: 'Arrow' },
    { id: 'pixelate', icon: <Image size={18}/>, title: 'Pixelate' },
    { id: 'blur', icon: <Scissors size={18}/>, title: 'Blur' },
    { id: 'colorpicker', icon: <Image size={18}/>, title: 'Color Picker' },
    { id: 'crop2', icon: <Scissors size={18}/>, title: 'Crop (alt)' },
  ]

  return (
    <div className="w-14 flex flex-col gap-2 p-2 glass" role="toolbar" aria-label="Tools">
      {tools.map(t=> (
          <button key={t.id} aria-label={t.title} title={t.title} className={`toolbar-btn ${currentTool===t.id? 'tool-active': ''}`} onClick={()=>onTool(t.id)} tabIndex={0}>
          {t.icon}
        </button>
      ))}
    </div>
  )
}
