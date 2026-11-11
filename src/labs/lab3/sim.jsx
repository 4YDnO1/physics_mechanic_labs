import { useRef, useState } from 'react'
import { Canvas, useSimLoop, bg, line, label, ball } from '../../utils/canvas.jsx'
import { Btn, Num, Readout, Slider } from '../../components/controls.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, fmt, noisePct } from '../../utils/stats.js'

const MG = 0.2

export const JzTheory = (Jk, Jg, R) => Jk + 4 * (Jg + MG * R * R)

export default function Lab3Sim({ rows, onResult, onClear }) {
  const [Jk, setJk] = useState(0.004)
  const [Jg, setJg] = useState(0.0002)
  const [R, setR] = useState(0.1)
  const [r, setR_] = useState(0.03)
  const [h, setH] = useState(1.0)
  const [m, setM] = useState(0.1)
  const [speed, setSpeed] = useState(2)
  const [phase, setPhase] = useState('idle')
  const [live, setLive] = useState({ t: 0, n: 0, w: 0 })
  const sim = useRef({ phase: 'idle' })
  const cnv = useRef(null)
  const acc = useRef(0)

  const Jzt = JzTheory(Jk, Jg, R)

  const prepare = () => {
    const Jz = JzTheory(Jk, Jg, R)
    const a = (m * G * r * r) / (Jz + m * r * r)
    sim.current = {
      phase: 'ready',
      t: 0,
      theta: 0,
      a,
      tFall: Math.sqrt((2 * h) / a),
      p: { m, r, h, R, Jz },
    }
    setPhase('ready')
    setLive({ t: 0, n: 0, w: 0 })
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
      if (s.phase === 'run') {
        s.t += dt * speed
        s.theta = (s.a * s.t * s.t) / (2 * s.p.r)
        if (s.a * s.t * s.t >= 2 * s.p.h) {
          s.t = s.tFall
          s.theta = (s.a * s.t * s.t) / (2 * s.p.r)
          s.phase = 'done'
          const tm = +(s.tFall * noisePct(0.005)).toFixed(2)
          onResult({ ...s.p, t: tm })
          setPhase('done')
        }
      }
      draw(ctx, s, { Jk, Jg, R, r, h, m })
      acc.current += dt
      if (acc.current > 0.1) {
        acc.current = 0
        setLive({
          t: s.t || 0,
          n: (s.theta || 0) / (2 * Math.PI),
          w: s.phase === 'run' || s.phase === 'done' ? (s.a * (s.t || 0)) / s.p.r : 0,
        })
      }
    },
    true
  )

  const statusText = {
    idle: 'Установка не подготовлена. Задайте параметры и нажмите «Подготовить».',
    ready: `Момент инерции маятника Jz = ${fmt(Jzt, 4)} кг·м². Нажмите «Пуск».`,
    run: 'Груз опускается — маятник Обербека вращается равноускоренно…',
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
          <h4>Таблица 1. Результаты измерений</h4>
          <DataTable
            rows={rows.map((row, i) => ({ ...row, i: i + 1 }))}
            columns={[
              { key: 'i', label: '№' },
              { key: 'm', label: 'm', unit: 'кг' },
              { key: 't', label: 't', unit: 'с' },
              { key: 'r', label: 'r', unit: 'м' },
              { key: 'R', label: 'R', unit: 'м' },
            ]}
            caption={`Jк = ${fmt(Jk, 4)} кг·м²; Jг = ${fmt(Jg, 4)} кг·м²; M = ${fmt(MG, 1)} кг; h = ${fmt(h, 2)} м; Jz(теор) = ${fmt(Jzt, 4)} кг·м²`}
          />
        </div>
      </div>

      <div className="ctrl-col">
        <div className="ctrl-card">
          <h5>Настройка установки</h5>
          <Num label="Момент инерции крестовины Jк" value={Jk} onChange={(v) => setJk(Math.max(0.0005, v || 0))} min={0.0005} max={0.02} step={0.0005} unit="кг·м²" digits={4} />
          <Num label="Момент инерции груза Jг" value={Jg} onChange={(v) => setJg(Math.max(0.00005, v || 0))} min={0.00005} max={0.002} step={0.00005} unit="кг·м²" digits={5} />
          <Slider label="Расстояние грузов R" value={R} onChange={setR} min={0.05} max={0.2} step={0.01} unit="м" digits={2} />
          <Num label="Радиус шкива r" value={r} onChange={(v) => setR_(Math.max(0.02, v || 0))} min={0.02} max={0.05} step={0.005} unit="м" digits={3} />
          <Num label="Высота падения груза h" value={h} onChange={(v) => setH(Math.max(0.6, v || 0))} min={0.6} max={1.2} step={0.05} unit="м" digits={2} />
          <div className="readouts" style={{ marginTop: 8 }}>
            <Readout label="Масса груза на стержне M" value={fmt(MG, 1)} unit="кг" />
            <Readout label="Jz маятника (теор)" value={fmt(Jzt, 4)} unit="кг·м²" hl />
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Груз на нити</h5>
          <Num label="Масса груза m" value={m} onChange={(v) => setM(Math.max(0.05, v || 0))} min={0.05} max={0.5} step={0.05} unit="кг" digits={2} />
          <div className="small dim" style={{ marginTop: 4 }}>
            Рекомендуемая серия опытов: m = 0,1; 0,2; 0,3; 0,3; 0,3 кг.
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Управление</h5>
          <div className="btn-row">
            <Btn onClick={prepare} disabled={phase === 'run'}>
              Подготовить
            </Btn>
            <Btn onClick={start} disabled={phase !== 'ready'}>
              Пуск
            </Btn>
          </div>
          <Slider label="Скорость анимации" value={speed} onChange={setSpeed} min={1} max={10} step={1} unit="×" digits={0} />
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

function draw(ctx, s, ui) {
  bg(ctx)
  const cx = 185
  const cy = 190
  const Jz = s.p?.Jz ?? JzTheory(ui.Jk, ui.Jg, ui.R)
  const rr = s.p?.r ?? ui.r
  const hh = s.p?.h ?? ui.h
  const mm = s.p?.m ?? ui.m

  ctx.strokeStyle = '#90a0bb'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(cx - 40, cy + 8)
  ctx.lineTo(cx - 64, 428)
  ctx.moveTo(cx + 40, cy + 8)
  ctx.lineTo(cx + 64, 428)
  ctx.stroke()

  const th = s.theta || 0
  const Rpx = (s.p?.R ?? ui.R) * 520

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(th)
  ctx.strokeStyle = '#5b6c8f'
  ctx.lineWidth = 7
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2
    ctx.beginPath()
    ctx.moveTo(-Math.cos(a) * Rpx, -Math.sin(a) * Rpx)
    ctx.lineTo(Math.cos(a) * Rpx, Math.sin(a) * Rpx)
    ctx.stroke()
    ball(ctx, Math.cos(a) * Rpx, Math.sin(a) * Rpx, 13, { light: '#c8b89a', dark: '#8a744e' })
  }
  ctx.restore()

  ctx.fillStyle = '#48597c'
  ctx.beginPath()
  ctx.arc(cx, cy, 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#aeb9cf'
  ctx.beginPath()
  ctx.arc(cx, cy, 11, 0, Math.PI * 2)
  ctx.fill()

  const bx = 500
  const by = cy
  line(ctx, cx, cy, bx, by, '#6b5b45', 2)
  ctx.fillStyle = '#77839d'
  ctx.beginPath()
  ctx.arc(bx, by, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5d6f8d'
  ctx.fillRect(bx - 26, by - 26, 52, 10)

  const yTop = by + 12
  const dropPx = 205
  const floorY = yTop + dropPx
  ctx.fillStyle = '#e7ebf2'
  ctx.fillRect(0, floorY + 40, 780, 34)
  line(ctx, 0, floorY + 40, 780, floorY + 40, '#9aa7bd', 2)

  const x = s.phase === 'run' || s.phase === 'done' ? Math.min((s.a * (s.t || 0) ** 2) / 2, hh) : 0
  const wTop = yTop + (x / hh) * dropPx
  line(ctx, bx, by + 9, bx, wTop, '#6b5b45', 2)
  ctx.fillStyle = '#3f4f78'
  ctx.fillRect(bx - 15, wTop, 30, 9)
  const gg = ctx.createLinearGradient(bx - 15, 0, bx + 15, 0)
  gg.addColorStop(0, '#8e9a6f')
  gg.addColorStop(1, '#5d6b45')
  ctx.fillStyle = gg
  ctx.fillRect(bx - 15, wTop + 9, 30, 34)
  label(ctx, 'm', bx + 22, wTop + 30, 13, '#44506b')

  const rx = 600
  line(ctx, rx, yTop, rx, floorY, '#9aa7bd', 2)
  for (let i = 0; i <= 4; i++) {
    const yy = yTop + (dropPx * i) / 4
    line(ctx, rx - 6, yy, rx + 6, yy, '#9aa7bd', 2)
    label(ctx, `${((i * hh) / 4).toFixed(2)}`, rx - 10, yy + 4, 10.5, '#77839d', 'right')
  }
  label(ctx, 'x, м', rx - 10, yTop - 8, 12, '#77839d', 'right')

  label(ctx, 'К', cx - Rpx - 26, cy - Rpx - 4, 14, '#44506b')
  label(ctx, `Jк = ${fmt(ui.Jk, 4)} кг·м²   Jг = ${fmt(ui.Jg, 4)} кг·м²   R = ${fmt(s.p?.R ?? ui.R, 2)} м`, 22, 30, 13, '#44506b')
  label(ctx, `Jz(теор) = ${fmt(Jz, 4)} кг·м²    m = ${fmt(mm, 2)} кг    r = ${fmt(rr, 3)} м    h = ${fmt(hh, 2)} м`, 22, 52, 13, '#44506b')

  if (s.phase === 'run') {
    ctx.strokeStyle = '#d97706'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, Rpx + 26, th % (2 * Math.PI) - 0.5, th % (2 * Math.PI) + 0.2)
    ctx.stroke()
  }
}
