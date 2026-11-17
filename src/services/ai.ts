export async function autoEnhanceImage(img: HTMLImageElement) {
  // create canvas copy and apply simple auto adjustments
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  const ctx = c.getContext('2d')!
  ctx.drawImage(img,0,0)
  // very simple: increase contrast and sharpness via Canvas filters
  // use an offscreen canvas to apply a filter by redrawing
  // For demo, we'll increase contrast by manipulating pixels
  const id = ctx.getImageData(0,0,c.width,c.height)
  const d = id.data
  const factor = 1.1
  for (let i=0;i<d.length;i+=4){
    for (let j=0;j<3;j++){
      let v = d[i+j]
      v = ((v - 128) * factor) + 128
      d[i+j] = Math.max(0, Math.min(255, v))
    }
  }
  ctx.putImageData(id,0,0)
  const img2 = new Image()
  img2.src = c.toDataURL('image/png')
  await new Promise((r)=> img2.onload = r)
  return img2
}

export async function removeBackgroundNaive(img: HTMLImageElement) {
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  const ctx = c.getContext('2d')!
  ctx.drawImage(img,0,0)
  const id = ctx.getImageData(0,0,c.width,c.height)
  const d = id.data
  // sample corner color
  const r0 = d[0], g0 = d[1], b0 = d[2]
  for (let i=0;i<d.length;i+=4){
    const dr = Math.abs(d[i]-r0)
    const dg = Math.abs(d[i+1]-g0)
    const db = Math.abs(d[i+2]-b0)
    const dist = dr+dg+db
    if (dist < 60) {
      d[i+3] = 0
    }
  }
  ctx.putImageData(id,0,0)
  const img2 = new Image()
  img2.src = c.toDataURL('image/png')
  await new Promise((r)=> img2.onload = r)
  return img2
}

export async function describeImage(img: HTMLImageElement) {
  // Simple heuristic description: brightness, colorfulness
  const c = document.createElement('canvas')
  c.width = Math.min(200, img.width)
  c.height = Math.min(200, img.height)
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, c.width, c.height)
  const id = ctx.getImageData(0,0,c.width,c.height).data
  let r=0,g=0,b=0
  for (let i=0;i<id.length;i+=4){ r+=id[i]; g+=id[i+1]; b+=id[i+2] }
  const px = id.length/4
  r = Math.round(r/px); g = Math.round(g/px); b = Math.round(b/px)
  const brightness = (r+g+b)/3
  const tone = brightness > 180 ? 'bright' : brightness < 70 ? 'dark' : 'balanced'
  const dominant = r > g && r > b ? 'red/orange' : g > r && g > b ? 'green' : 'blue/teal'
  return `A ${tone} image with dominant ${dominant} tones.`
}
