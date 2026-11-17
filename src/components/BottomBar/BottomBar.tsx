import React from 'react'

type Props = {
  zoom: number
  dims?: { w:number; h:number }
}

export default function BottomBar({ zoom, dims }: Props) {
  return (
    <div className="w-full flex items-center justify-between p-3 glass">
      <div className="text-sm">Zoom: {(zoom*100).toFixed(0)}%</div>
      <div className="text-sm">{dims? `${dims.w} x ${dims.h}` : 'No image'}</div>
      <div className="flex gap-2">
        <button className="toolbar-btn">Undo</button>
        <button className="toolbar-btn">Redo</button>
        <button className="toolbar-btn">Reset</button>
        <button className="toolbar-btn">Before/After</button>
      </div>
    </div>
  )
}
