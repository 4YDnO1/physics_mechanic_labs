import { useRef, useState } from 'react'
import { Canvas, useSimLoop, bg, line, label, ball, stand } from '../../utils/canvas.jsx'
import { Btn, Radio, Readout, Slider } from '../../components/controls.jsx'
import DataTable from '../../components/DataTable.jsx'
import { fmt, noisePct } from '../../utils/stats.js'
import { N_OSC } from './content.jsx'

const G = 9.81
const L = 0.8

function makeParams(A0, beta) {
  const omega0 = Math.sqrt(G / L)
  const omega = Math.sqrt(Math.max(0.0001, omega0 * omega0 - beta * beta))
  const T = (2 * Math.PI) / omega
  return { A0, beta, omega0, omega, T }
}

function draw(ctx, s, p, mode) {
  bg(ctx)
  const theta = ((p.A0 * Math.exp(-p.beta * s.t) * Math.cos(p.omega * s.t)) * Math.PI) / 180
  const px = 200
  const py = 80
  const len = 315

  stand(ctx, px, py - 26, py + 34)
  line(ctx, px, py, px, py + len, '#cbd5e1', 1.2)
  ctx.save()
  ctx.setLineDash([6, 5])
  line(ctx, px - 90, py + len + 26, px + 90, py + len + 26, '#94a3b8', 1)
  ctx.restore()

  const bx = px + len * Math.sin(theta)
  const by = py + len * Math.cos(theta)
  line(ctx, px, py, bx, by, '#475569', 3)
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.arc(px, py, 7, 0, Math.PI * 2)
  ctx.fill()
  ball(ctx, bx, by, 34, { light: '#fb923c', dark: '#c2410c' })

  label(ctx, '0°', px + 8, py + len + 24, 12)
  label(ctx, `${fmt(p.A0, 1)}°`, px + len * Math.sin((p.A0 * Math.PI) / 180) + 8, py + len * Math.cos((p.A0 * Math.PI) / 180), 12, '#b45309')
  label(ctx, `−${fmt(p.A0, 1)}°`, px - len * Math.sin((p.A0 * Math.PI) / 180) - 52, py + len * Math.cos((p.A0 * Math.PI) / 180), 12, '#b45309')

  const gx = 430
  const gy = 64
  const gw = 322
  const gh = 330
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(gx, gy, gw, gh)
  ctx.strokeStyle = '#d8dee9'
  ctx.lineWidth = 1
  ctx.strokeRect(gx, gy, gw, gh)

  const tEnd = s.total || N_OSC * p.T
  const yAmp = p.A0 * 1.15
  const X = (t) => gx + (t / tEnd) * gw
  const Y = (v) => gy + gh / 2 - (v / yAmp) * (gh / 2)

  line(ctx, gx, Y(0), gx + gw, Y(0), '#94a3b8', 1)
  ctx.save()
  ctx.setLineDash([5, 5])
  line(ctx, X(0), Y(p.A0), X(tEnd), Y(p.A0), '#f59e0b', 1.2)
  line(ctx, X(0), Y(-p.A0), X(tEnd), Y(-p.A0), '#f59e0b', 1.2)
  ctx.restore()
  label(ctx, '+A₀', gx + 4, Y(p.A0) - 5, 11, '#b45309')
  label(ctx, '−A₀', gx + 4, Y(-p.A0) + 14, 11, '#b45309')

  const shown = Math.min(s.t, tEnd)
  ctx.strokeStyle = mode === 'period' ? '#ea580c' : '#2563eb'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i <= 260; i++) {
    const t = (shown * i) / 260
    const v = p.A0 * Math.exp(-p.beta * t) * Math.cos(p.omega * t)
    if (i === 0) ctx.moveTo(X(t), Y(v))
    else ctx.lineTo(X(t), Y(v))
  }
  ctx.stroke()

  const cur = p.A0 * Math.exp(-p.beta * shown) * Math.cos(p.omega * shown)
  ctx.fillStyle = mode === 'period' ? '#ea580c' : '#2563eb'
  ctx.beginPath()
  ctx.arc(X(shown), Y(cur), 4, 0, Math.PI * 2)
  ctx.fill()
  label(ctx, 't, с', gx + gw - 24, gy + gh + 18, 12)
  label(ctx, 'x, град', gx - 38, gy + 16, 12)
  label(ctx, fmt(tEnd, 1), gx + gw - 12, Y(0) + 16, 11, '#64748b')
}

export default function Lab5Sim({ version, rows, onResult, onClear }) {
  const isPrint = version === 'print'
  const [mode, setMode] = useState('period')
  const [A0, setA0] = useState(isPrint ? 5 : 6)
  const [beta, setBeta] = useState(0.07)
  const [speed, setSpeed] = useState(4)
  const [phase, setPhase] = useState('idle')
  const [live, setLive] = useState({ t: 0, x: 0 })
  const sim = useRef({ phase: 'idle', t: 0, total: 0, done: false, p: null })
  const cnv = useRef(null)
  const acc = useRef(0)

  const p = makeParams(A0, beta)
  const total = mode === 'period' ? N_OSC * p.T : (9 * p.T) / 2 + 0.02

  const prepare = () => {
    const pp = makeParams(A0, beta)
    sim.current = {
      phase: 'ready',
      t: 0,
      total: mode === 'period' ? N_OSC * pp.T : (9 * pp.T) / 2 + 0.02,
      done: false,
      p: pp,
    }
    setPhase('ready')
    setLive({ t: 0, x: A0 })
  }

  const start = () => {
    if (sim.current.phase !== 'ready') return
    sim.current.phase = 'run'
    setPhase('run')
  }

  useSimLoop(
    cnv,
    (dt, ctx) => {
      const s = sim.current
      const pp = s.p || p
      if (s.phase === 'run') {
        s.t += dt * speed
        if (s.t >= s.total) {
          s.t = s.total
          if (!s.done) {
            s.done = true
            if (mode === 'period') {
              onResult({
                kind: 'T',
                t10: +(N_OSC * pp.T * noisePct(0.003)).toFixed(2),
                A0: pp.A0,
              })
            } else {
              const A = Array.from({ length: 10 }, (_, i) =>
                i === 0 ? pp.A0 : +(pp.A0 * Math.exp((-pp.beta * i * pp.T) / 2) * noisePct(0.012)).toFixed(2)
              )
              onResult({ kind: 'A', A })
            }
          }
          setPhase('done')
        }
      }
      const x = pp.A0 * Math.exp(-pp.beta * s.t) * Math.cos(pp.omega * s.t)
      draw(ctx, s, pp, mode)
      acc.current += dt
      if (acc.current > 0.1) {
        acc.current = 0
        setLive({ t: s.t, x })
      }
    },
    true
  )

  const periodRows = rows.filter((r) => r.kind === 'T')
  const ampRows = rows.filter((r) => r.kind === 'A')
  const lastAmp = ampRows[ampRows.length - 1]

  const statusText = {
    idle: 'Выберите режим, задайте параметры и нажмите «Подготовить».',
    ready: 'Маятник отклонён. Нажмите «Старт» для измерения.',
    run: mode === 'period' ? 'Идёт отсчёт 10 колебаний…' : 'Регистрируются амплитуды A₀…A₉…',
    done: 'Опыт завершён, результат занесён в таблицу.',
  }[phase]

  return (
    <div className="practice">
      <div className="sim-col">
        <div className="sim-frame">
          <Canvas canvasRef={cnv} />
          <div className="sim-status">
            <span className="readout">
              t<b>{fmt(live.t, 2)} с</b>
            </span>
            <span className="readout">
              x<b>{fmt(live.x, 2)}°</b>
            </span>
            <span>{statusText}</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <h4>Таблица 1. Время десяти колебаний</h4>
          <DataTable
            rows={periodRows.map((r, i) => ({ ...r, no: i + 1 }))}
            columns={[
              { key: 'no', label: 'Опыт' },
              { key: 'A0', label: 'A₀', unit: 'град' },
              { key: 't10', label: 't₁₀', unit: 'с', format: (v) => fmt(v, 2) },
            ]}
            minRows={3}
          />
          <h4 style={{ marginTop: 12 }}>Таблица 2. Амплитуды колебаний</h4>
          <DataTable
            rows={lastAmp ? [{ ...lastAmp.A }] : []}
            columns={Array.from({ length: 10 }, (_, i) => ({
              key: String(i),
              label: `A${i}`,
              unit: 'град',
              format: (v) => fmt(v, 2),
            }))}
          />
        </div>
      </div>

      <div className="ctrl-col">
        <div className="ctrl-card">
          <h5>Режим измерения</h5>
          <Radio
            value={mode}
            onChange={(v) => {
              setMode(v)
              setPhase('idle')
              sim.current = { phase: 'idle', t: 0, total: 0, done: false, p: null }
            }}
            options={[
              { value: 'period', label: 'Период (10 колебаний)' },
              { value: 'amp', label: 'Амплитуды A₀…A₉' },
            ]}
          />
        </div>
        <div className="ctrl-card">
          <h5>Параметры маятника</h5>
          <Slider label="Начальная амплитуда A₀" value={A0} onChange={setA0} min={3} max={10} step={0.5} unit="град" digits={1} />
          <Slider label="Коэффициент затухания β" value={beta} onChange={setBeta} min={0.02} max={0.2} step={0.005} unit="с⁻¹" digits={3} />
          <div className="readouts">
            <Readout label="T (модель)" value={fmt(p.T, 3)} unit="с" hl />
            <Readout label="ω" value={fmt(p.omega, 3)} unit="рад/с" />
            <Readout label="τ = 1/β" value={fmt(1 / beta, 2)} unit="с" />
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Управление</h5>
          <div className="btn-row">
            <Btn onClick={prepare} disabled={phase === 'run'}>
              Подготовить
            </Btn>
            <Btn onClick={start} disabled={phase !== 'ready'}>
              Старт
            </Btn>
            <Btn onClick={onClear}>Очистить</Btn>
          </div>
          <Slider label="Скорость анимации" value={speed} onChange={setSpeed} min={1} max={12} step={1} unit="×" digits={0} />
          <div className="small dim" style={{ marginTop: 6 }}>
            Скорость влияет только на анимацию; измеряемые время и амплитуды рассчитываются по модели установки.
          </div>
        </div>
      </div>
    </div>
  )
}
