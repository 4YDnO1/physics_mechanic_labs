import { useEffect, useRef } from 'react'

export const SIM_W = 780
export const SIM_H = 470

export function Canvas({ canvasRef }) {
  return (
    <canvas
      ref={canvasRef}
      width={SIM_W}
      height={SIM_H}
      style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: `${SIM_W}/${SIM_H}` }}
    />
  )
}

export function useSimLoop(canvasRef, frameFn, active = true) {
  const fnRef = useRef(frameFn)
  fnRef.current = frameFn
  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const cnv = canvasRef.current
      if (cnv) {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        const cw = Math.round(cnv.clientWidth * dpr) || SIM_W * dpr
        const ch = Math.round(cw * (SIM_H / SIM_W))
        if (cnv.width !== cw || cnv.height !== ch) {
          cnv.width = cw
          cnv.height = ch
        }
        const ctx = cnv.getContext('2d')
        const k = cw / SIM_W
        ctx.setTransform(k, 0, 0, k, 0, 0)
        fnRef.current(dt, ctx)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active, canvasRef])
}

export function bg(ctx, color = '#fbfcfe') {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, SIM_W, SIM_H)
  ctx.strokeStyle = 'rgba(93, 118, 168, 0.10)'
  ctx.lineWidth = 1
  for (let x = 40; x < SIM_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SIM_H); ctx.stroke()
  }
  for (let y = 40; y < SIM_H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SIM_W, y); ctx.stroke()
  }
}

export function stand(ctx, x, yTop, yBot) {
  ctx.fillStyle = '#8fa2bd'
  ctx.fillRect(x - 4, yTop, 8, yBot - yTop)
  ctx.fillStyle = '#5d6f8d'
  ctx.fillRect(x - 55, yBot, 110, 10)
}

export function ball(ctx, x, y, r, fill) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r)
  g.addColorStop(0, fill.light)
  g.addColorStop(1, fill.dark)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

export function line(ctx, x1, y1, x2, y2, color = '#444c63', w = 1.6) {
  ctx.strokeStyle = color
  ctx.lineWidth = w
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

export function label(ctx, text, x, y, size = 13, color = '#44506b', align = 'left') {
  ctx.fillStyle = color
  ctx.font = `${size}px "Segoe UI", sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, x, y)
}
