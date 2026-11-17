export async function applyFilterByName(img: HTMLImageElement, name: string) {
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  if (name === 'Black & White'){
    const id = ctx.getImageData(0,0,c.width,c.height)
    const d = id.data
    for (let i=0;i<d.length;i+=4){
      const v = Math.round(0.3*d[i] + 0.59*d[i+1] + 0.11*d[i+2])
      d[i]=d[i+1]=d[i+2]=v
    }
    ctx.putImageData(id,0,0)
  } else if (name === 'Vintage'){
    ctx.fillStyle = 'rgba(255,204,102,0.08)'
    ctx.globalCompositeOperation = 'overlay'
    ctx.fillRect(0,0,c.width,c.height)
    ctx.globalCompositeOperation = 'source-over'
  } else if (name === 'Cinematic'){
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(20,10,40,0.12)'
    ctx.fillRect(0,0,c.width,c.height)
    ctx.globalCompositeOperation = 'source-over'
  } else if (name === 'Warm'){
    ctx.fillStyle = 'rgba(255,160,80,0.06)'
    ctx.fillRect(0,0,c.width,c.height)
  } else if (name === 'Cool'){
    ctx.fillStyle = 'rgba(80,160,255,0.06)'
    ctx.fillRect(0,0,c.width,c.height)
  } else if (name === 'Dramatic'){
    // increase contrast
    const id = ctx.getImageData(0,0,c.width,c.height)
    const d = id.data
    const factor = 1.2
    for (let i=0;i<d.length;i+=4){
      for (let j=0;j<3;j++){
        let v = d[i+j]
        v = ((v - 128) * factor) + 128
        d[i+j] = Math.max(0, Math.min(255, v))
      }
    }
    ctx.putImageData(id,0,0)
  } else if (name === 'Faded'){
    ctx.globalAlpha = 0.85
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,c.width,c.height)
    ctx.globalAlpha = 1
  } else if (name === 'High Contrast'){
    const id = ctx.getImageData(0,0,c.width,c.height)
    const d = id.data
    const factor = 1.5
    for (let i=0;i<d.length;i+=4){
      for (let j=0;j<3;j++){
        let v = d[i+j]
        v = ((v - 128) * factor) + 128
        d[i+j] = Math.max(0, Math.min(255, v))
      }
    }
    ctx.putImageData(id,0,0)
  }
  const out = new Image()
  out.src = c.toDataURL('image/png')
  await new Promise((r)=> out.onload = r)
  return out
}

export async function pixelateImage(img: HTMLImageElement, pixelSize = 10){
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  const ctx = c.getContext('2d')!
  // draw scaled down
  const w = Math.max(1, Math.floor(img.width / pixelSize))
  const h = Math.max(1, Math.floor(img.height / pixelSize))
  const tmp = document.createElement('canvas')
  tmp.width = w; tmp.height = h
  const tctx = tmp.getContext('2d')!
  tctx.drawImage(img, 0,0,w,h)
  // draw scaled up with nearest neighbor
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(tmp, 0,0,w,h, 0,0,c.width,c.height)
  const out = new Image(); out.src = c.toDataURL('image/png')
  await new Promise((r)=> out.onload = r)
  return out
}

export async function blurImage(img: HTMLImageElement, radius = 4){
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  const ctx = c.getContext('2d')!
  // rely on canvas filter when available
  // @ts-ignore
  ctx.filter = `blur(${radius}px)`
  ctx.drawImage(img, 0,0)
  // @ts-ignore
  ctx.filter = 'none'
  const out = new Image(); out.src = c.toDataURL('image/png')
  await new Promise((r)=> out.onload = r)
  return out
}
