import { useRef, useState } from 'react'
import { Canvas, useSimLoop, bg, line, label } from '../../utils/canvas.jsx'
import { Btn, Readout, Select, Slider } from '../../components/controls.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, noisePct, fmt } from '../../utils/stats.js'

const J_TRUE = 0.02
const MF = 0.015

const R_OPTS = [
  { value: 0.04, label: '0,04 м' },
  { value: 0.05, label: '0,05 м' },
  { value: 0.06, label: '0,06 м' },
]

function kin(r, h, m) {
  const a1 = (r * (m * G * r - MF)) / (J_TRUE + m * r * r)
  const tFall = Math.sqrt((2 * h) / a1)
  const wEnd = (a1 * tFall) / r
  const eps2 = MF / J_TRUE
  const tStop = wEnd / eps2
  return { a1, tFall, wEnd, eps2, tStop }
}

export default function Lab1Sim({ rows, onResult, onClear }) {
  const [r, setR] = useState(0.05)
  const [h, setH] = useState(1.5)
  const [m, setM] = useState(0.2)
  const [speed, setSpeed] = useState(3)
  const [phase, setPhase] = useState('idle')
  const [live, setLive] = useState({ t: 0, n: 0, w: 0 })
  const sim = useRef({ phase: 'idle' })
  const cnv = useRef(null)
  const acc = useRef(0)

  const prepare = () => {
    sim.current = {
      phase: 'ready',
      t: 0,
      theta: 0,
      omega: 0,
      x: 0,
      k: kin(r, h, m),
      p: { r, h, m },
      rec: null,
    }
    setPhase('ready')
    setLive({ t: 0, n: 0, w: 0 })
  }

  const start = () => {
    if (sim.current.phase !== 'ready') return
    sim.current.phase = 'fall'
    setPhase('fall')
  }

  useSimLoop(
    cnv,
    (dt, ctx) => {
      const s = sim.current
      const spd = speed
      if (s.phase === 'fall') {
        s.t += dt * spd
        s.x = 0.5 * s.k.a1 * s.t * s.t
        s.theta = s.x / s.p.r
        s.omega = s.k.a1 * s.t / s.p.r
        if (s.x >= s.p.h) {
          s.x = s.p.h
          s.tFall = s.t
          const n1True = s.p.h / (2 * Math.PI * s.p.r)
          s.rec = {
            t: +(s.tFall + (Math.random() < 0.5 ? -0.01 : 0.01)).toFixed(2),
            n1: +(n1True * noisePct(0.004)).toFixed(1),
          }
          s.phase = 'spin'
          s.omega = s.k.wEnd
          setPhase('spin')
        }
      } else if (s.phase === 'spin') {
        s.omega -= s.k.eps2 * dt * spd
        s.theta += s.omega * dt * spd
        if (s.omega <= 0) {
          s.omega = 0
          s.phase = 'done'
          const n2True = (s.theta - s.p.h / s.p.r) / (2 * Math.PI)
          s.rec.n2 = +(n2True * noisePct(0.004)).toFixed(1)
          onResult({ ...s.p, t: s.rec.t, n1: s.rec.n1, n2: s.rec.n2 })
          setPhase('done')
        }
      }
      draw(ctx, s, phase)
      acc.current += dt
      if (acc.current > 0.1) {
        acc.current = 0
        setLive({ t: s.tFall ?? s.t, n: s.theta / (2 * Math.PI), w: s.omega })
      }
    },
    true
  )

  const statusText = {
    idle: 'Установка не подготовлена. Задайте параметры и нажмите «Подготовить».',
    ready: 'Груз поднят на высоту h. Нажмите «Старт».',
    fall: 'Падение груза — маховик раскручивается…',
    spin: 'Свободный выбег маховика после касания грузом пола…',
    done: 'Опыт завершён. Результаты занесены в таблицу.',
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
              n<b>{fmt(live.n, 1)} об</b>
            </span>
            <span className="readout">
              ω<b>{fmt(live.w, 1)} рад/с</b>
            </span>
            <span>{statusText}</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <h4>Таблица результатов</h4>
          <DataTable
            rows={rows}
            columns={[
              { key: 'i', label: '№' },
              { key: 'm', label: 'm', unit: 'кг' },
              { key: 't', label: 't', unit: 'с' },
              { key: 'n1', label: 'n₁', unit: 'об' },
              { key: 'n2', label: 'n₂', unit: 'об' },
            ]}
            caption={
              rows.length
                ? `Радиус шкива r = ${fmt(rows[0].r, 2)} м; высота падения груза h = ${fmt(rows[0].h, 2)} м`
                : 'Таблица 1. Результаты измерений'
            }
          />
        </div>
      </div>

      <div className="ctrl-col">
        <div className="ctrl-card">
          <h5>Параметры установки</h5>
          <Select label="Радиус шкива r" value={r} onChange={(v) => setR(+v)} options={R_OPTS} />
          <Slider label="Высота падения h" value={h} onChange={setH} min={0.8} max={2} step={0.05} unit="м" digits={2} />
          <Slider label="Масса груза m" value={m} onChange={setM} min={0.1} max={0.5} step={0.01} unit="кг" digits={2} />
        </div>
        <div className="ctrl-card">
          <h5>Управление</h5>
          <div className="btn-row">
            <Btn onClick={prepare} disabled={phase === 'fall' || phase === 'spin'}>
              Подготовить
            </Btn>
            <Btn onClick={start} disabled={phase !== 'ready'}>
              Старт
            </Btn>
          </div>
          <Slider label="Скорость анимации" value={speed} onChange={setSpeed} min={1} max={10} step={1} unit="×" digits={0} />
          <div className="small dim" style={{ marginTop: 6 }}>
            Скорость влияет только на ход модели по времени, измеряемые значения соответствуют
            реальному времени процесса.
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Измеряемые величины</h5>
          <div className="readouts">
            <Readout label="t — время падения" value={rows.length ? fmt(rows[rows.length - 1].t, 2) : '—'} unit="с" hl />
            <Readout label="n₁ — оборотов при падении" value={rows.length ? fmt(rows[rows.length - 1].n1, 1) : '—'} unit="об" />
            <Readout label="n₂ — оборотов до остановки" value={rows.length ? fmt(rows[rows.length - 1].n2, 1) : '—'} unit="об" />
          </div>
          {rows.length > 0 && (
            <div className="btn-row">
              <Btn variant="danger" onClick={onClear}>
                Очистить таблицу
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function draw(ctx, s, phase) {
  bg(ctx)
  const cx = 235
  const cy = 168
  const Rf = 106
  const Rp = 38

  ctx.fillStyle = '#e7ebf2'
  ctx.fillRect(0, 436, 780, 34)
  line(ctx, 0, 436, 780, 436, '#9aa7bd', 2)

  ctx.strokeStyle = '#90a0bb'
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.moveTo(cx - 52, cy + 24)
  ctx.lineTo(cx - 84, 432)
  ctx.moveTo(cx + 52, cy + 24)
  ctx.lineTo(cx + 84, 432)
  ctx.stroke()

  const th = s.theta || 0
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(th)
  ctx.strokeStyle = '#7c8db0'
  ctx.lineWidth = 11
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18)
    ctx.lineTo(Math.cos(a) * 96, Math.sin(a) * 96)
    ctx.stroke()
  }
  ctx.strokeStyle = '#5b6c8f'
  ctx.lineWidth = 15
  ctx.beginPath()
  ctx.arc(0, 0, Rf - 4, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = '#48597c'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(0, 0, Rf + 4, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#e05252'
  ctx.beginPath()
  ctx.arc(0, Rf - 4, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = '#48597c'
  ctx.beginPath()
  ctx.arc(cx, cy, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#aeb9cf'
  ctx.beginPath()
  ctx.arc(cx, cy, Rp, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#77839d'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, Rp, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = '#8b95ac'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, Rp - 7, 0, Math.PI * 2)
  ctx.stroke()

  label(ctx, 'А', cx - Rf - 16, cy - Rf + 10, 15, '#44506b')
  label(ctx, 'В', cx + Rp + 10, cy + 6, 15, '#44506b')

  const y0 = cy + Rp
  const wTop0 = y0 + 8
  const floorLineY = 436
  const wH = 46
  const drop = floorLineY - wH - wTop0
  const hh = s.p?.h || 1.5
  const xx = s.phase === 'idle' || s.phase === 'ready' ? 0 : s.x || 0
  const wTop = Math.min(wTop0 + (xx / hh) * drop, floorLineY - wH)

  ctx.strokeStyle = '#6b5b45'
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(cx, y0)
  if (s.phase === 'spin' || s.phase === 'done') {
    ctx.quadraticCurveTo(cx + 30, (y0 + floorLineY) / 2, cx, floorLineY - wH)
  } else {
    ctx.lineTo(cx, wTop)
  }
  ctx.stroke()

  ctx.fillStyle = '#3f4f78'
  ctx.fillRect(cx - 16, wTop, 32, 10)
  const gh = 36
  const gg = ctx.createLinearGradient(cx - 16, 0, cx + 16, 0)
  gg.addColorStop(0, '#8e9a6f')
  gg.addColorStop(1, '#5d6b45')
  ctx.fillStyle = gg
  ctx.fillRect(cx - 16, wTop + 10, 32, gh)
  label(ctx, 'm', cx + 24, wTop + gh / 2 + 12, 14, '#44506b')

  const rx = 480
  line(ctx, rx, wTop0, rx, floorLineY - wH, '#9aa7bd', 2)
  for (let i = 0; i <= 4; i++) {
    const yy = wTop0 + (drop * i) / 4
    line(ctx, rx - 6, yy, rx + 6, yy, '#9aa7bd', 2)
    label(ctx, `${(i * 0.5).toFixed(1)}`, rx - 10, yy + 4, 11, '#77839d', 'right')
  }
  label(ctx, 'h, м', rx - 10, wTop0 - 8, 12, '#77839d', 'right')

  label(ctx, `r = ${fmt(s.p?.r ?? 0.05, 2)} м   h = ${fmt(hh, 2)} м   m = ${fmt(s.p?.m ?? 0.2, 2)} кг`, 22, 30, 13.5, '#44506b')

  if (s.phase === 'spin' || s.phase === 'fall') {
    ctx.strokeStyle = '#d97706'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, Rf + 22, th % (2 * Math.PI) - 0.5, th % (2 * Math.PI) + 0.2)
    ctx.stroke()
  }
}

