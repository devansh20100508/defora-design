import React, { useEffect, useRef, useState } from 'react'
import type { EditorLayer, Adjustments } from '../../types/editor'
import { loadImageFromFile } from '../../utils/image'
import { pixelateImage, blurImage } from '../../services/filters'
import { showToast } from '../../utils/toast'

type Props = {
  imageSrc: string | null
  originalImageSrc?: string | null
  layers: EditorLayer[]
  setLayers: (l: EditorLayer[] | ((prev: EditorLayer[])=>EditorLayer[])) => void
  activeTool?: string
  selectedLayerId?: string | null
  setSelectedLayerId?: (id: string | null) => void
  zoom?: number
  setZoom?: (z:number)=>void
  adjustments?: Adjustments
  filter?: string
  rotation?: number
  flipX?: boolean
  flipY?: boolean
  compareMode?: boolean
  comparePosition?: number
  pan?: { x:number, y:number }
  setPan?: (p:{x:number,y:number})=>void
  onUploadImage?: ()=>void
  onDemoImage?: ()=>void
  onAddTextLayer?: (x:number,y:number)=>void
  onAddShapeLayer?: (shape:string, start:{x:number,y:number}, end:{x:number,y:number})=>void
}

export default function CanvasEditor({ imageSrc, originalImageSrc, layers, setLayers, activeTool, selectedLayerId, setSelectedLayerId, zoom=1, setZoom, pan, setPan, onUploadImage, onDemoImage, onAddTextLayer, onAddShapeLayer }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [localZoom, setLocalZoom] = useState(zoom)
  const [localPan, setLocalPan] = useState(pan || { x:0, y:0 })
  const drawing = useRef(false)
  const last = useRef<{x:number,y:number}|null>(null)
  const drawLayerId = useRef<string | null>(null)
  const [cropRect, setCropRect] = useState<{x:number,y:number,w:number,h:number}|null>(null)
  const dragLayerId = useRef<string|null>(null)
  const dragOffset = useRef<{x:number,y:number}>({x:0,y:0})
  const [spacePan, setSpacePan] = useState(false)
  const panning = useRef(false)
  const panLast = useRef<{x:number,y:number}|null>(null)

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, zoom, pan])

  // render shapes on top of image/drawing layers
  function drawShapes(ctx: CanvasRenderingContext2D){
    layers.forEach(layer=>{
      if (!layer.visible) return
          if (layer.type === 'shape'){
            const s = (layer as any).data || (layer as any)
            ctx.save()
            ctx.globalAlpha = (layer as any).opacity ?? 1
            const x = s.x ?? 0
            const y = s.y ?? 0
            const w = s.w ?? s.width ?? 0
            const h = s.h ?? s.height ?? 0
            if (s.fill){ ctx.fillStyle = s.fill; ctx.fillRect(x, y, w, h) }
            if (s.stroke){ ctx.strokeStyle = s.stroke; ctx.lineWidth = s.strokeWidth || 2; ctx.strokeRect(x, y, w, h) }
            ctx.restore()
          }
    })
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    await addImageFile(f)
  }

  async function addImageFile(file: File) {
    if (!file.type.startsWith('image/')) return alert('Unsupported file')
    // Prefer the app-level upload flow — dispatch event the App listens for
    try {
      window.dispatchEvent(new CustomEvent('pixelforge-upload', { detail: file }))
    } catch (err) {
      console.error(err)
      alert('Failed to upload image')
    }
  }

  useEffect(()=>{
    function onDropFile(e: any){
      const f: File = e.detail
      addImageFile(f)
    }
    function onSmartCrop(e: any){
      const ratio: number = e.detail.ratio
      // center crop with ratio on canvas
      const canvas = canvasRef.current!
      const cw = canvas.width, ch = canvas.height
      let w = cw, h = Math.round(w / ratio)
      if (h > ch) { h = ch; w = Math.round(h * ratio) }
      const x = Math.round((cw - w)/2)
      const y = Math.round((ch - h)/2)
      setCropRect({ x, y, w, h })
    }
    window.addEventListener('drop-file', onDropFile as EventListener)
    window.addEventListener('smart-crop', onSmartCrop as EventListener)
    return ()=> { window.removeEventListener('drop-file', onDropFile as EventListener); window.removeEventListener('smart-crop', onSmartCrop as EventListener) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers])

  function getCanvasPos(e: React.MouseEvent){
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function startDrawing(e: React.MouseEvent){
    if (spacePan){
      panning.current = true
      panLast.current = getCanvasPos(e)
      return
    }
    if (activeTool === 'brush' || activeTool === 'eraser' || activeTool==='draw'){
      const canvas = canvasRef.current!
      drawing.current = true
      last.current = getCanvasPos(e)
      // ensure a drawing layer
      let dlayer = layers.find(l=> l.type==='drawing' && l.name==='Brush')
      if (!dlayer){
        const c = document.createElement('canvas')
        c.width = canvas.width; c.height = canvas.height
        const id = Date.now().toString()
        dlayer = { id, name: 'Brush', type: 'drawing', visible: true, opacity: 1, data: { canvas: c } }
        drawLayerId.current = id
        setLayers((prev:any)=> [...prev, dlayer])
      } else {
        drawLayerId.current = dlayer.id
      }
      return
    }
    // start shape drawing
    if (activeTool === 'rect' || activeTool === 'ellipse' || activeTool === 'line' || activeTool === 'arrow'){
      drawing.current = true
      const pos = getCanvasPos(e)
      last.current = pos
      const id = Date.now().toString()
      const shape = { id, name: 'Shape', type: 'shape', visible: true, opacity: 1, data: { shape: activeTool === 'rect' ? 'rect' : activeTool === 'ellipse' ? 'ellipse' : activeTool === 'line' ? 'line' : 'arrow', x: pos.x, y: pos.y, w: 0, h: 0, fill: 'rgba(255,255,255,0.06)', stroke: '#fff', strokeWidth: 2 } }
      setLayers((prev:any)=> [...prev, shape])
      return
    }
  }

  function drawMove(e: React.MouseEvent){
    if (panning.current){
      const pos = getCanvasPos(e)
      if (panLast.current){
        const dx = pos.x - panLast.current.x
        const dy = pos.y - panLast.current.y
        const base = pan || localPan
        if (setPan) setPan({ x: (base.x || 0) + dx, y: (base.y || 0) + dy })
        else setLocalPan(p=> ({ x: p.x + dx, y: p.y + dy }))
        panLast.current = pos
      }
      return
    }
    if (!drawing.current) return
    const pos = getCanvasPos(e)
    // if drawing shapes, update last added shape
    if (activeTool === 'rect' || activeTool === 'ellipse' || activeTool === 'line' || activeTool === 'arrow'){
      const s = layers[layers.length-1]
      if (!s || s.type !== 'shape') return
      const start = last.current!
      const w = pos.x - start.x
      const h = pos.y - start.y
      setLayers((prev:any)=> prev.map((l:any, idx:number)=> idx === prev.length-1 ? {...l, data: {...l.data, w, h}} : l))
      return
    }
    const dlayer = layers.find(l=> l.id === drawLayerId.current)
    if (!dlayer) return
    const c: HTMLCanvasElement = dlayer.data.canvas
    const ctx = c.getContext('2d')!
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : '#ffffff'
    ctx.lineWidth = 8
    if (activeTool === 'eraser') ctx.globalCompositeOperation = 'destination-out'
    else ctx.globalCompositeOperation = 'source-over'
    if (last.current) {
      ctx.beginPath()
      ctx.moveTo(last.current.x, last.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
    last.current = pos
    // update layer canvas in-place and re-render without history for performance
    setLayers((prev:any)=> prev.map((l:any)=> l.id===dlayer!.id? {...l, data: {...l.data, canvas: c}}: l))
  }

  function endDrawing(){
    if (panning.current){
      panning.current = false
      panLast.current = null
      return
    }
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    // push history snapshot
    setLayers([...layers])
  }

  useEffect(()=>{
    function onKeyDown(e: KeyboardEvent){
      if (e.code === 'Space'){
        setSpacePan(true)
        e.preventDefault()
      }
    }
    function onKeyUp(e: KeyboardEvent){
      if (e.code === 'Space'){
        setSpacePan(false)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return ()=>{ window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  },[])

  function handleCanvasClick(e: React.MouseEvent){
    if (activeTool === 'text'){
      const pos = getCanvasPos(e)
      // if App provided handler, use it to create a proper EditorLayer
      if (onAddTextLayer) {
        onAddTextLayer(pos.x, pos.y)
        return
      }
      // move selected text layer if any
      if (selectedLayerId){
        setLayers((prev:any)=> prev.map((l:any)=> l.id===selectedLayerId && l.type==='text'? {...l, x: pos.x, y: pos.y}: l))
      }
    }
    if (activeTool === 'crop'){
      const pos = getCanvasPos(e)
      setCropRect({ x: pos.x-100, y: pos.y-60, w: 200, h: 120 })
    }
    if (activeTool === 'pixelate'){
      const imageLayer = layers.find(l=> l.type === 'image')
      if (!imageLayer || !imageLayer.data?.img) { showToast('No image'); return }
      const size = Number(prompt('Pixel size (1-100)', '10') || '10')
      pixelateImage(imageLayer.data.img, size).then(img => {
        setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img}}: l))
        showToast('Pixelated')
      })
    }
    if (activeTool === 'blur'){
      const imageLayer = layers.find(l=> l.type === 'image')
      if (!imageLayer || !imageLayer.data?.img) { showToast('No image'); return }
      const r = Number(prompt('Blur radius (px)', '4') || '4')
      blurImage(imageLayer.data.img, r).then(img => {
        setLayers(layers.map(l=> l.id===imageLayer.id? {...l, data: {...l.data, img}}: l))
        showToast('Blur applied')
      })
    }
  }

  function applyCrop(){
    if (!cropRect) return
    // apply crop to first image layer
    const imgLayer = layers.find(l=> l.type==='image')
    const canvas = canvasRef.current!
    if (!imgLayer || !imgLayer.data?.img) return
    const img: HTMLImageElement = imgLayer.data.img
    // compute displayed image rect
    const iw = img.width; const ih = img.height
    const cw = canvas.width; const ch = canvas.height
    const scale = Math.min(cw / iw, ch / ih) * zoom
    const w = iw * (cw / iw < ch / ih ? scale/scale : scale/scale) // simplified
    // map cropRect to image pixel coordinates roughly
    const sx = Math.max(0, Math.floor((cropRect.x) / (cw) * iw))
    const sy = Math.max(0, Math.floor((cropRect.y) / (ch) * ih))
    const sw = Math.min(iw, Math.floor(cropRect.w / cw * iw))
    const sh = Math.min(ih, Math.floor(cropRect.h / ch * ih))
    const oc = document.createElement('canvas')
    oc.width = sw; oc.height = sh
    const octx = oc.getContext('2d')!
    octx.drawImage(img, sx, sy, sw, sh, 0,0, sw, sh)
    const newImg = new Image()
    newImg.src = oc.toDataURL('image/png')
    newImg.onload = ()=>{
      setLayers(layers.map(l=> l.id===imgLayer.id? {...l, data: {...l.data, img: newImg}}: l))
      setCropRect(null)
    }
  }


  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const effectivePan = pan || localPan
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // checkerboard
    const size = 16
    for (let y = 0; y < canvas.height; y += size) {
      for (let x = 0; x < canvas.width; x += size) {
        const even = ((x / size) + (y / size)) % 2 === 0
        ctx.fillStyle = even ? '#111' : '#0b0b0b'
        ctx.fillRect(x, y, size, size)
      }
    }
    // composite layers (image layers first)
    let drewImage = false
    layers.forEach((layer) => {
      if (!layer.visible) return
      ctx.globalAlpha = layer.opacity ?? 1
      if (layer.type === 'image' && layer.data?.img) {
        const img: HTMLImageElement = layer.data.img
        const iw = img.width
        const ih = img.height
        const cw = canvas.width
        const ch = canvas.height
        const scale = Math.min(cw / iw, ch / ih)
        const w = iw * scale * zoom
        const h = ih * scale * zoom
        const x = (cw - w) / 2 + (effectivePan?.x || 0)
        const y = (ch - h) / 2 + (effectivePan?.y || 0)
        // Apply adjustments if present
        const adj = layer.data.adjustments || {}
        const filters = []
        if (adj.brightness) filters.push(`brightness(${adj.brightness}%)`)
        if (adj.contrast) filters.push(`contrast(${adj.contrast}%)`)
        if (adj.saturate) filters.push(`saturate(${adj.saturate}%)`)
        if (adj.hue) filters.push(`hue-rotate(${adj.hue}deg)`)
        if (adj.blur) filters.push(`blur(${adj.blur}px)`)
        ctx.save()
        // @ts-ignore
        ctx.filter = filters.join(' ') || 'none'
        ctx.drawImage(img, x, y, w, h)
        ctx.restore()
        drewImage = true
      } else if (layer.type === 'text') {
        const t: any = (layer as any).data || (layer as any)
        ctx.save()
        ctx.globalAlpha = (layer as any).opacity ?? 1
        ctx.fillStyle = t.color || '#fff'
        const size = t.fontSize || t.size || 24
        const weight = (t.fontWeight || (t.bold ? 700 : 400))
        const family = t.fontFamily || t.font || 'sans-serif'
        const italic = t.italic ? 'italic' : ''
        ctx.font = `${italic} ${weight} ${size}px ${family}`.trim()
        ctx.textAlign = t.align || 'left'
        ctx.fillText(t.text || '', t.x || 50, t.y || 50)
        ctx.restore()
      } else if (layer.type === 'drawing' && layer.data?.canvas) {
        ctx.save()
        ctx.globalAlpha = layer.opacity
        ctx.drawImage(layer.data.canvas, 0, 0)
        ctx.restore()
      }
    })
    // if no image layer was present, fall back to imageSrc prop (App-managed primary image)
    if (!drewImage && imageSrc) {
      // load cached image if needed
      const imgRef: any = (canvasRef as any)._appImageRef || { img: null }
      if (!imgRef.img || imgRef.src !== imageSrc) {
        const loadingImg = new Image()
        loadingImg.onload = () => {
          (canvasRef as any)._appImageRef = { img: loadingImg, src: imageSrc }
          draw()
        }
        loadingImg.src = imageSrc
      } else {
        const img: HTMLImageElement = imgRef.img
        const iw = img.width
        const ih = img.height
        const cw = canvas.width
        const ch = canvas.height
        const scale = Math.min(cw / iw, ch / ih)
        const w = iw * scale * zoom
        const h = ih * scale * zoom
        const x = (cw - w) / 2 + (effectivePan?.x || 0)
        const y = (ch - h) / 2 + (effectivePan?.y || 0)
        ctx.drawImage(img, x, y, w, h)
      }
    }
    // shapes
    drawShapes(ctx)
    ctx.globalAlpha = 1
  }

  useEffect(() => {
    const el = containerRef.current
    const canvas = canvasRef.current
    if (!el || !canvas) return
    // size canvas to container
    function fit() {
      const rect = el.getBoundingClientRect()
      canvas.width = Math.max(800, Math.floor(rect.width - 40))
      canvas.height = Math.max(500, Math.floor(rect.height - 40))
      draw()
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current])

  return (
    <div ref={containerRef} onDrop={handleDrop} onDragOver={(e)=>e.preventDefault()} className="flex-1 p-6">
      <div className="relative h-full w-full rounded-md border border-white/6 glass">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain rounded-md"
          onMouseDown={(e)=>{ startDrawing(e); }}
          onMouseMove={(e)=>{ drawMove(e); }}
          onMouseUp={()=> endDrawing()}
          onClick={(e)=> handleCanvasClick(e)}
          onWheel={(e)=>{ e.preventDefault(); const delta = e.deltaY; setZoom(z=> Math.max(0.1, Math.min(4, z - delta*0.001))) }}
        />
        <div className="absolute top-3 left-3 bg-black/40 text-xs px-2 py-1 rounded">Zoom: {(zoom*100).toFixed(0)}%</div>
        <div className="absolute bottom-3 left-3 bg-black/40 text-xs px-2 py-1 rounded">{layers.find(l=>l.type==='image')?.data?.img ? `${layers.find(l=>l.type==='image')!.data.img.width} x ${layers.find(l=>l.type==='image')!.data.img.height}` : 'No image'}</div>
        {layers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-3xl font-bold">Create. Edit. Transform.</div>
            <div className="text-sm text-white/70">Powerful image editing with intelligent AI tools.</div>
            <div className="flex gap-2">
              <button className="glass px-4 py-2" onClick={()=>{ const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange = ()=>{ const f = i.files?.[0]; if (f) addImageFile(f) }; i.click()}}>Upload Image</button>
              <button className="glass px-4 py-2" onClick={()=>{
                // generate demo gradient image
                const c = document.createElement('canvas')
                c.width = 1200; c.height = 800
                const ctx = c.getContext('2d')!
                const g = ctx.createLinearGradient(0,0, c.width, c.height)
                g.addColorStop(0, '#ff7a18'); g.addColorStop(0.5, '#af002d'); g.addColorStop(1, '#32004f')
                ctx.fillStyle = g; ctx.fillRect(0,0,c.width,c.height)
                ctx.fillStyle = 'rgba(255,255,255,0.08)'
                ctx.font = '80px serif'
                ctx.fillText('Demo', 80, 200)
                c.toBlob((blob)=>{
                  if (!blob) return
                  const file = new File([blob], 'demo.png', { type: 'image/png' })
                  // route demo image through app handler
                  window.dispatchEvent(new CustomEvent('pixelforge-upload', { detail: file }))
                })
              }}>Try Demo Image</button>
            </div>
          </div>
        )}
        {cropRect && (
          <div className="absolute" style={{ left: cropRect.x, top: cropRect.y, width: cropRect.w, height: cropRect.h, border: '2px dashed rgba(255,255,255,0.6)' }}>
            <div className="absolute -top-8 right-0 flex gap-2">
              <button className="glass px-2 py-1" onClick={applyCrop}>Apply</button>
              <button className="glass px-2 py-1" onClick={()=>setCropRect(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
