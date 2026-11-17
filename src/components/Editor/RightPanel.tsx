import React from 'react'
import { Layer } from '../../types'
import { applyFilterByName, pixelateImage, blurImage } from '../../services/filters'
import { showToast } from '../../utils/toast'

type Props = {
  layers: Layer[]
  setLayers: (l: Layer[]) => void
  selectedId?: string | null
}

export default function RightPanel({ layers, setLayers, selectedId }: Props) {
  const imageLayer = layers.find(l=>l.type==='image')
  const selectedLayer = layers.find(l=> l.id === selectedId)

  function updateAdjustment(key: string, value: number) {
    if (!imageLayer) return
    const next = layers.map(l=> {
      if (l.id !== imageLayer.id) return l
      return { ...l, data: { ...l.data, adjustments: { ...(l.data?.adjustments||{}), [key]: value } } }
    })
    setLayers(next)
  }

  function reset() {
    if (!imageLayer) return
    const next = layers.map(l=> l.type==='image'? {...l, data: {...l.data, adjustments: {}}}: l)
    setLayers(next)
  }

  return (
    <div className="w-80 glass p-4 space-y-4">
      <div className="font-semibold">Adjustments</div>
      <div>
        <label className="text-xs">Brightness</label>
        <input type="range" min="0" max="200" defaultValue={100} onChange={(e)=>updateAdjustment('brightness', Number(e.target.value))} />
      </div>
      <div>
        <label className="text-xs">Contrast</label>
        <input type="range" min="0" max="200" defaultValue={100} onChange={(e)=>updateAdjustment('contrast', Number(e.target.value))} />
      </div>
      <div>
        <label className="text-xs">Saturation</label>
        <input type="range" min="0" max="200" defaultValue={100} onChange={(e)=>updateAdjustment('saturate', Number(e.target.value))} />
      </div>
      <div>
        <label className="text-xs">Hue</label>
        <input type="range" min="0" max="360" defaultValue={0} onChange={(e)=>updateAdjustment('hue', Number(e.target.value))} />
      </div>
      <div className="pt-2">
        <button className="glass px-3 py-1" onClick={reset}>Reset</button>
      </div>
      <div>
        <div className="font-semibold">Filters</div>
        <div className="flex flex-wrap gap-2">
          {['Original','Vintage','Cinematic','Black & White','Warm','Cool','Dramatic','Faded','High Contrast'].map(f=> (
            <button key={f} className="glass px-2 py-1" onClick={async ()=>{
              if (!imageLayer || !imageLayer.data?.img) return showToast('No image')
              if (f === 'Original') { setLayers(layers.map(l=> l.type==='image'? {...l, data: {...l.data, adjustments: {}}}: l)); showToast('Reset to original'); return }
              const img = await applyFilterByName(imageLayer.data.img, f)
              setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img}}: l))
              showToast(`${f} applied`)
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-semibold">Pixelate / Blur</div>
        <div className="flex gap-2 items-center">
          <input type="range" min={1} max={50} defaultValue={10} id="pixelRange" />
          <button className="glass px-2 py-1" onClick={async ()=>{
            if (!imageLayer || !imageLayer.data?.img) return showToast('No image')
            const v = Number((document.getElementById('pixelRange') as HTMLInputElement).value)
            const img = await pixelateImage(imageLayer.data.img, v)
            setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img}}: l))
            showToast('Pixelated')
          }}>Pixelate</button>
        </div>
        <div className="flex gap-2 items-center mt-2">
          <input type="range" min={0} max={40} defaultValue={4} id="blurRange" />
          <button className="glass px-2 py-1" onClick={async ()=>{
            if (!imageLayer || !imageLayer.data?.img) return showToast('No image')
            const v = Number((document.getElementById('blurRange') as HTMLInputElement).value)
            const img = await blurImage(imageLayer.data.img, v)
            setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img}}: l))
            showToast('Blur applied')
          }}>Blur</button>
        </div>
      </div>
      <div>
        <div className="font-semibold">Smart Crop</div>
        <div className="flex gap-2 flex-wrap">
          <button className="glass px-2 py-1" onClick={()=>window.dispatchEvent(new CustomEvent('smart-crop', { detail: { ratio: 1/1 } }))}>1:1</button>
          <button className="glass px-2 py-1" onClick={()=>window.dispatchEvent(new CustomEvent('smart-crop', { detail: { ratio: 4/5 } }))}>4:5</button>
          <button className="glass px-2 py-1" onClick={()=>window.dispatchEvent(new CustomEvent('smart-crop', { detail: { ratio: 16/9 } }))}>16:9</button>
          <button className="glass px-2 py-1" onClick={()=>window.dispatchEvent(new CustomEvent('smart-crop', { detail: { ratio: 9/16 } }))}>9:16</button>
          <button className="glass px-2 py-1" onClick={()=>window.dispatchEvent(new CustomEvent('smart-crop', { detail: { ratio: 3/2 } }))}>3:2</button>
        </div>
      </div>
      <div className="pt-4">
        <div className="font-semibold">Transform</div>
        {imageLayer ? (
          <div className="space-y-2">
            <div>
              <label className="text-xs">Width</label>
              <input type="number" defaultValue={imageLayer.data.img.width} onBlur={(e)=>{
                const w = Number(e.currentTarget.value)
                const img: HTMLImageElement = imageLayer.data.img
                const c = document.createElement('canvas')
                const h = Math.round(w * (img.height / img.width))
                c.width = w; c.height = h
                c.getContext('2d')!.drawImage(img,0,0,w,h)
                const n = new Image(); n.src = c.toDataURL('image/png')
                n.onload = ()=> setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img: n}}: l))
              }} />
            </div>
            <div>
              <label className="text-xs">Rotate</label>
              <input type="range" min={0} max={360} defaultValue={0} onChange={(e)=>{
                const deg = Number(e.currentTarget.value)
                // simple rotate applied to image
                const img: HTMLImageElement = imageLayer.data.img
                const c = document.createElement('canvas')
                const ctx = c.getContext('2d')!
                const rad = deg * Math.PI/180
                const w = img.width, h = img.height
                c.width = w; c.height = h
                ctx.clearRect(0,0,w,h)
                ctx.save()
                ctx.translate(w/2,h/2)
                ctx.rotate(rad)
                ctx.drawImage(img, -w/2, -h/2)
                ctx.restore()
                const n = new Image(); n.src = c.toDataURL('image/png')
                n.onload = ()=> setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img: n}}: l))
              }} />
            </div>
            <div className="flex gap-2">
              <button className="glass px-2 py-1" onClick={()=>{
                const img: HTMLImageElement = imageLayer.data.img
                const c = document.createElement('canvas')
                c.width = img.width; c.height = img.height
                const ctx = c.getContext('2d')!
                ctx.translate(c.width,0); ctx.scale(-1,1); ctx.drawImage(img,0,0)
                const n = new Image(); n.src = c.toDataURL('image/png')
                n.onload = ()=> setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img: n}}: l))
              }}>Flip H</button>
              <button className="glass px-2 py-1" onClick={()=>{
                const img: HTMLImageElement = imageLayer.data.img
                const c = document.createElement('canvas')
                c.width = img.width; c.height = img.height
                const ctx = c.getContext('2d')!
                ctx.translate(0,c.height); ctx.scale(1,-1); ctx.drawImage(img,0,0)
                const n = new Image(); n.src = c.toDataURL('image/png')
                n.onload = ()=> setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img: n}}: l))
              }}>Flip V</button>
            </div>
          </div>
        ) : <div className="text-xs text-white/60">No image loaded</div>}
      </div>

      {selectedLayer && selectedLayer.type === 'text' && (
        <div>
          <div className="font-semibold">Text</div>
          <div>
            <label className="text-xs">Content</label>
            <input defaultValue={selectedLayer.data.text} className="w-full p-1 rounded bg-black/20" onBlur={(e)=> setLayers(layers.map(l=> l.id===selectedLayer.id? {...l, data: {...l.data, text: e.currentTarget.value}}: l))} />
          </div>
          <div>
            <label className="text-xs">Size</label>
            <input type="number" defaultValue={selectedLayer.data.size || 24} onBlur={(e)=> setLayers(layers.map(l=> l.id===selectedLayer.id? {...l, data: {...l.data, size: Number(e.currentTarget.value)}}: l))} />
          </div>
          <div>
            <label className="text-xs">Color</label>
            <input type="color" defaultValue={selectedLayer.data.color || '#ffffff'} onChange={(e)=> setLayers(layers.map(l=> l.id===selectedLayer.id? {...l, data: {...l.data, color: e.currentTarget.value}}: l))} />
          </div>
        </div>
      )}

      {selectedLayer && selectedLayer.type === 'shape' && (
        <div>
          <div className="font-semibold">Shape</div>
          <div>
            <label className="text-xs">Fill</label>
            <input type="color" defaultValue={selectedLayer.data.fill || '#ffffff'} onChange={(e)=> setLayers(layers.map(l=> l.id===selectedLayer.id? {...l, data: {...l.data, fill: e.currentTarget.value}}: l))} />
          </div>
          <div>
            <label className="text-xs">Stroke</label>
            <input type="color" defaultValue={selectedLayer.data.stroke || '#ffffff'} onChange={(e)=> setLayers(layers.map(l=> l.id===selectedLayer.id? {...l, data: {...l.data, stroke: e.currentTarget.value}}: l))} />
          </div>
          <div>
            <label className="text-xs">Stroke Width</label>
            <input type="range" min={0} max={20} defaultValue={selectedLayer.data.strokeWidth || 2} onChange={(e)=> setLayers(layers.map(l=> l.id===selectedLayer.id? {...l, data: {...l.data, strokeWidth: Number(e.currentTarget.value)}}: l))} />
          </div>
        </div>
      )}
    </div>
  )
}
