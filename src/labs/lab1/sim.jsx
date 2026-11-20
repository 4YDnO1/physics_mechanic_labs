import { useRef, useState } from 'react'
import { Canvas, useSimLoop, bg, line, label } from '../../utils/canvas.jsx'
import { Btn, Readout, Select, Slider } from '../../components/controls.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, noisePct, fmt } from '../../utils/stats.js'

const J_TRUE = 0.02
const MF = 0.015
const M_LOAD = 0.2

const R_OPTS = [
  { value: 0.04, label: '0,04 м' },
  { value: 0.05, label: '0,05 м' },
  { value: 0.06, label: '0,06 м' },
]

function kin(R, h) {
  const a = (R * (M_LOAD * G * R - MF)) / (J_TRUE + M_LOAD * R * R)
  const t = Math.sqrt((2 * h) / a)
  const v = a * t
  return { a, t, v, w: v / R, eps: a / R }
}

export default function Lab6Sim({ rows, onResult, onClear }) {
  const [R, setR] = useState(0.05)
  const [h, setH] = useState(1.5)
  const [speed, setSpeed] = useState(3)
  const [phase, setPhase] = useState('idle')
  const [live, setLive] = useState({ t: 0, x: 0 })
  const sim = useRef({ phase: 'idle' })
  const cnv = useRef(null)
  const acc = useRef(0)

  const prepare = () => {
    sim.current = { phase: 'ready', t: 0, x: 0, k: kin(R, h), p: { R, h } }
    setPhase('ready')
    setLive({ t: 0, x: 0 })
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
        s.x = 0.5 * s.k.a * s.t * s.t
        if (s.x >= s.p.h) {
          s.x = s.p.h
          s.t = s.k.t
          s.phase = 'done'
          const tMeas = +(s.k.t * noisePct(0.004)).toFixed(3)
          onResult({ ...s.p, t: tMeas })
          setPhase('done')
        }
      }
      draw(ctx, s)
      acc.current += dt
      if (acc.current > 0.1) {
        acc.current = 0
        setLive({ t: s.t, x: s.x || 0 })
      }
    },
    true
  )

  const statusText = {
    idle: 'Установка не подготовлена. Задайте параметры и нажмите «Подготовить».',
    ready: 'Груз поднят на высоту h. Нажмите «Старт».',
    fall: 'Груз опускается — измеряется время падения…',
    done: 'Опыт завершён. Результат занесён в таблицу.',
  }[phase]

  const last = rows[rows.length - 1]
  const kk = kin(R, h)

  return (
    <div className="practice">
      <div className="sim-col">
        <div className="sim-frame">
          <Canvas canvasRef={cnv} />
          <div className="sim-status">
            <span className="readout">
              t<b>{fmt(live.t, 3)} с</b>
            </span>
            <span className="readout">
              h<b>{fmt(live.x, 2)} м</b>
            </span>
            <span>{statusText}</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <h4>Таблица 1. Результаты измерений времени</h4>
          <DataTable
            rows={rows}
            columns={[
              { key: 'i', label: '№' },
              { key: 'h', label: 'h', unit: 'м' },
              { key: 'R', label: 'R', unit: 'м' },
              { key: 't', label: 't', unit: 'с', format: (v) => fmt(v, 3) },
            ]}
            caption="Высота h и радиус шкива R неизменны в ходе серии опытов"
          />
        </div>
      </div>

      <div className="ctrl-col">
        <div className="ctrl-card">
          <h5>Параметры установки</h5>
          <Select label="Радиус шкива R" value={R} onChange={(v) => setR(+v)} options={R_OPTS} />
          <Slider label="Высота падения h" value={h} onChange={setH} min={0.8} max={2} step={0.05} unit="м" digits={2} />
        </div>
        <div className="ctrl-card">
          <h5>Управление</h5>
          <div className="btn-row">
            <Btn onClick={prepare} disabled={phase === 'fall'}>
              Подготовить
            </Btn>
            <Btn onClick={start} disabled={phase !== 'ready'}>
              Старт
            </Btn>
          </div>
          <Slider label="Скорость анимации" value={speed} onChange={setSpeed} min={1} max={10} step={1} unit="×" digits={0} />
          <div className="small dim" style={{ marginTop: 6 }}>
            Скорость влияет только на ход анимации, измеряемое время соответствует реальному
            процессу.
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Кинематические характеристики</h5>
          <div className="readouts">
            <Readout label="a = 2h/t²" value={fmt(kk.a, 3)} unit="м/с²" hl />
            <Readout label="v = at" value={fmt(kk.v, 2)} unit="м/с" />
            <Readout label="ω = v/R" value={fmt(kk.w, 2)} unit="рад/с" />
            <Readout label="ε = a/R" value={fmt(kk.eps, 2)} unit="рад/с²" />
          </div>
          <div className="small dim" style={{ marginTop: 4 }}>
            Приведены теоретические значения для заданных h и R.
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

function draw(ctx, s) {
  bg(ctx)
  const cx = 300
  const cy = 120
  const Rp = 46

  ctx.fillStyle = '#e7ebf2'
  ctx.fillRect(0, 436, 780, 34)
  line(ctx, 0, 436, 780, 436, '#9aa7bd', 2)

  ctx.strokeStyle = '#90a0bb'
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.moveTo(cx + 30, cy)
  ctx.lineTo(cx + 150, cy)
  ctx.stroke()
  line(ctx, cx + 148, cy - 40, cx + 148, cy + 40, '#90a0bb', 9)

  ctx.fillStyle = '#aeb9cf'
  ctx.beginPath()
  ctx.arc(cx, cy, Rp, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#77839d'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, Rp, 0, Math.PI * 2)
  ctx.stroke()
  const th = s.phase === 'idle' || s.phase === 'ready' ? 0 : (s.x || 0) / (s.p?.R || 0.05)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(th)
  ctx.strokeStyle = '#8b95ac'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, Rp - 6)
  ctx.moveTo(0, 0)
  ctx.lineTo(Rp - 6, 0)
  ctx.stroke()
  ctx.restore()
  label(ctx, 'R', cx + Rp + 8, cy - 6, 14, '#44506b')
  label(ctx, 'А', cx - Rp - 18, cy - Rp + 12, 15, '#44506b')

  const floorLineY = 436
  const wH = 40
  const wTop0 = cy + Rp + 6
  const drop = floorLineY - wH - wTop0
  const hh = s.p?.h || 1.5
  const xx = s.phase === 'idle' || s.phase === 'ready' ? 0 : s.x || 0
  const wTop = Math.min(wTop0 + (xx / hh) * drop, floorLineY - wH)

  line(ctx, cx, cy + Rp - 2, cx, wTop, '#6b5b45', 2.2)

  ctx.fillStyle = '#3f4f78'
  ctx.fillRect(cx - 16, wTop, 32, 10)
  const gg = ctx.createLinearGradient(cx - 16, 0, cx + 16, 0)
  gg.addColorStop(0, '#8e9a6f')
  gg.addColorStop(1, '#5d6b45')
  ctx.fillStyle = gg
  ctx.fillRect(cx - 16, wTop + 10, 32, wH - 10)
  label(ctx, 'm', cx + 24, wTop + wH / 2 + 6, 14, '#44506b')

  const rx = 560
  line(ctx, rx, wTop0, rx, floorLineY - wH, '#9aa7bd', 2)
  for (let i = 0; i <= 4; i++) {
    const yy = wTop0 + (drop * i) / 4
    line(ctx, rx - 6, yy, rx + 6, yy, '#9aa7bd', 2)
    label(ctx, `${(i * 0.5).toFixed(1)}`, rx - 10, yy + 4, 11, '#77839d', 'right')
  }
  label(ctx, 'h, м', rx - 10, wTop0 - 8, 12, '#77839d', 'right')

  label(ctx, `R = ${fmt(s.p?.R ?? 0.05, 2)} м   h = ${fmt(hh, 2)} м`, 22, 30, 13.5, '#44506b')
}
