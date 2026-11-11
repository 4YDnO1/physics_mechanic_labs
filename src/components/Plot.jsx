export default function Plot({ points, xLabel, yLabel, fitThroughOrigin = true }) {
  const W = 640
  const H = 420
  const m = { l: 74, r: 24, t: 22, b: 56 }
  const iw = W - m.l - m.r
  const ih = H - m.t - m.b

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const xMax = Math.max(...xs, 0) * 1.12 || 1
  const yMax = Math.max(...ys, 0) * 1.12 || 1
  const X = (v) => m.l + (v / xMax) * iw
  const Y = (v) => m.t + ih - (v / yMax) * ih

  let slope = null
  if (fitThroughOrigin && points.length >= 2) {
    let num = 0
    let den = 0
    for (const p of points) {
      num += p.x * p.y
      den += p.x * p.x
    }
    slope = den > 0 ? num / den : null
  }

  const niceStep = (max) => {
    const raw = max / 5
    const pow = Math.pow(10, Math.floor(Math.log10(raw)))
    const n = raw / pow
    const step = n >= 5 ? 5 : n >= 2 ? 2 : 1
    return step * pow
  }
  const xStep = niceStep(xMax)
  const yStep = niceStep(yMax)
  const ticks = (step, max) => {
    const arr = []
    for (let v = 0; v <= max + 1e-9; v += step) arr.push(+v.toFixed(10))
    return arr
  }
  const fmtTick = (v) => {
    if (v === 0) return '0'
    const a = Math.abs(v)
    if (a < 0.01 || a >= 10000) return v.toExponential(1).replace('.', ',')
    return String(+v.toFixed(4)).replace('.', ',')
  }

  return (
    <div className="plot-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        <rect x={m.l} y={m.t} width={iw} height={ih} fill="#fdfefe" stroke="#d8dee9" />
        {ticks(xStep, xMax).map((v) => (
          <g key={'x' + v}>
            <line x1={X(v)} y1={m.t} x2={X(v)} y2={m.t + ih} stroke="#e7ecf4" />
            <text x={X(v)} y={m.t + ih + 18} fontSize="12" fill="#5b6778" textAnchor="middle">
              {fmtTick(v)}
            </text>
          </g>
        ))}
        {ticks(yStep, yMax).map((v) => (
          <g key={'y' + v}>
            <line x1={m.l} y1={Y(v)} x2={m.l + iw} y2={Y(v)} stroke="#e7ecf4" />
            <text x={m.l - 8} y={Y(v) + 4} fontSize="12" fill="#5b6778" textAnchor="end">
              {fmtTick(v)}
            </text>
          </g>
        ))}
        {slope != null && (
          <line
            x1={X(0)}
            y1={Y(0)}
            x2={X(xMax)}
            y2={Y(slope * xMax)}
            stroke="#16803c"
            strokeWidth="2"
            strokeDasharray="7 5"
          />
        )}
        {points.map((p, i) => (
          <circle key={i} cx={X(p.x)} cy={Y(p.y)} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
        ))}
        <text x={m.l + iw / 2} y={H - 10} fontSize="13.5" fill="#44506b" textAnchor="middle">
          {xLabel}
        </text>
        <text
          x={14}
          y={m.t + ih / 2}
          fontSize="13.5"
          fill="#44506b"
          textAnchor="middle"
          transform={`rotate(-90 14 ${m.t + ih / 2})`}
        >
          {yLabel}
        </text>
      </svg>
    </div>
  )
}
