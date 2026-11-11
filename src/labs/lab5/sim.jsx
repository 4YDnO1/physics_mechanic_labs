import { useRef, useState } from 'react'
import { Canvas, useSimLoop, bg, line, label, ball } from '../../utils/canvas.jsx'
import { Btn, Num, Readout, Radio, Select, Slider } from '../../components/controls.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, fmt, noisePct } from '../../utils/stats.js'
import { BALLS, LIQUIDS, H_BOTTOM } from './content.jsx'

const SURF_Y = 104
const BOT_Y = 442
const PX = (BOT_Y - SURF_Y) / 0.5

export default function Lab5Sim({ rows, onResult, onClear }) {
  const [vessel, setVessel] = useState('1')
  const [mat, setMat] = useState('0')
  const [r, setR] = useState(0.002)
  const [h1, setH1] = useState(0.1)
  const [h2, setH2] = useState(0.1)
  const [speed, setSpeed] = useState(8)
  const [phase, setPhase] = useState('idle')
  const [live, setLive] = useState({ a: 0, v: 0, t: null })
  const sim = useRef({ phase: 'idle' })
  const cnv = useRef(null)
  const acc = useRef(0)

  const liq = LIQUIDS[+vessel - 1]
  const bm = BALLS[+mat]
  const h = vessel === '1' ? h1 : h2
  const l = H_BOTTOM - h

  const drop = () => {
    const rhoS = bm.rho
    const rhoL = liq.rho
    const a0 = (G * (rhoS - rhoL)) / rhoS
    const tau = (2 * rhoS * r * r) / (9 * liq.eta)
    sim.current = {
      phase: 'fall',
      t: 0,
      y: 0,
      v: 0,
      a0,
      tau,
      hh: h,
      vsl: +vessel,
      p: { vessel: +vessel, name: bm.name, rhoS, rhoL, r, h, l },
      started: false,
    }
    setPhase('fall')
    setLive({ a: a0, v: 0, t: null })
  }

  const reset = () => {
    sim.current.phase = 'idle'
    setPhase('idle')
    setLive({ a: 0, v: 0, t: null })
  }

  useSimLoop(
    cnv,
    (dt, ctx) => {
      const s = sim.current
      if (s.phase === 'fall') {
        // Точное решение уравнения dv/dt = a0 - v/tau (метод не зависит от шага):
        // v(d) = vInf + (v - vInf)·e^(-d/tau);  y(d) = y + vInf·d + (v - vInf)·tau·(1 - e^(-d/tau)),
        // поэтому записываемое время t НЕ зависит от скорости демонстрации.
        const vi = s.a0 * s.tau
        const yAt = (d) => s.y + vi * d + (s.v - vi) * s.tau * (1 - Math.exp(-d / s.tau))
        const adv = (d) => {
          const e = Math.exp(-d / s.tau)
          s.y += vi * d + (s.v - vi) * s.tau * (1 - e)
          s.v = vi + (s.v - vi) * e
        }
        const timeTo = (target, lim) => {
          if (yAt(lim) < target) return null
          let lo = 0
          let hi = lim
          for (let i = 0; i < 40; i++) {
            const mid = (lo + hi) / 2
            if (yAt(mid) < target) lo = mid
            else hi = mid
          }
          return (lo + hi) / 2
        }
        let rem = dt * speed
        while (rem > 1e-9 && s.phase === 'fall') {
          if (!s.started) {
            const d1 = timeTo(s.hh, rem)
            if (d1 == null) {
              adv(rem)
              break
            }
            adv(d1)
            s.started = true
            s.t = 0
            rem -= d1
          } else {
            const d2 = timeTo(H_BOTTOM, rem)
            if (d2 == null) {
              adv(rem)
              s.t += rem
              break
            }
            adv(d2)
            s.t += d2
            s.y = H_BOTTOM
            s.phase = 'done'
            const tm = +(s.t * noisePct(0.006)).toFixed(2)
            onResult({ ...s.p, t: tm })
            setPhase('done')
          }
        }
      }
      draw(ctx, s, { vessel, h1, h2, mat, r })
      acc.current += dt
      if (acc.current > 0.08) {
        acc.current = 0
        const a = s.phase === 'fall' ? s.a0 - s.v / s.tau : s.phase === 'done' ? 0 : 0
        setLive({ a: s.phase === 'idle' ? 0 : a, v: s.v || 0, t: s.started ? s.t : null })
      }
    },
    true
  )

  const statusText = {
    idle: 'Выберите сосуд, материал и радиус шарика, затем нажмите «Бросить шарик».',
    fall: 'Шарик тонет: следите за ускорением a — оно стремится к нулю (равномерное движение).',
    done: 'Шарик дошёл до нижней метки. Время t занесено в таблицу.',
  }[phase]

  const t1rows = rows.filter((rw) => rw.vessel === 1)
  const t2rows = rows.filter((rw) => rw.vessel === 2)
  const curRows = rows.filter((rw) => rw.vessel === +vessel)
  const curName = bm.name
  const curCount = curRows.filter((rw) => rw.name === curName).length
  const matsCount = new Set(curRows.map((rw) => rw.name)).size
  const tblCols = [
    { key: 'i', label: '№' },
    { key: 'name', label: 'Шарик', txt: true },
    { key: 'rhoS', label: 'ρш', unit: 'кг/м³', format: (v) => fmt(v, 0) },
    { key: 'rhoL', label: 'ρж', unit: 'кг/м³', format: (v) => fmt(v, 0) },
    { key: 'r', label: 'r', unit: 'м' },
    { key: 'h', label: 'h', unit: 'м' },
    { key: 'l', label: 'l', unit: 'м' },
    { key: 't', label: 't', unit: 'с' },
  ]

  return (
    <div className="practice">
      <div className="sim-col">
        <div className="sim-frame">
          <Canvas canvasRef={cnv} />
          <div className="sim-status">
            <span className="readout">
              a<b>{fmt(live.a, 3)} м/с²</b>
            </span>
            <span className="readout">
              ν<b>{fmt(live.v, 3)} м/с</b>
            </span>
            <span className="readout">
              t<b>{live.t == null ? '—' : fmt(live.t, 2) + ' с'}</b>
            </span>
            <span>{statusText}</span>
          </div>
        </div>
        <div className="two-tables" style={{ marginTop: 14 }}>
          <div>
            <h4>Таблица 1. Жидкость №1</h4>
            <DataTable
              rows={t1rows.map((rw, i) => ({ ...rw, i: i + 1 }))}
              columns={tblCols}
              caption={`ρж = ${fmt(LIQUIDS[0].rho, 0)} кг/м³`}
              minRows={5}
            />
          </div>
          <div>
            <h4>Таблица 2. Жидкость №2</h4>
            <DataTable
              rows={t2rows.map((rw, i) => ({ ...rw, i: i + 1 }))}
              columns={tblCols}
              caption={`ρж = ${fmt(LIQUIDS[1].rho, 0)} кг/м³`}
              minRows={5}
            />
          </div>
        </div>
      </div>

      <div className="ctrl-col">
        <div className="ctrl-card">
          <h5>Сосуд с жидкостью</h5>
          <Radio
            options={[
              { value: '1', label: 'Сосуд 1 (жидк. №1)' },
              { value: '2', label: 'Сосуд 2 (жидк. №2)' },
            ]}
            value={vessel}
            onChange={setVessel}
          />
          <div className="readouts" style={{ marginTop: 8 }}>
            <Readout label="ρж" value={fmt(liq.rho, 0)} unit="кг/м³" />
            <Readout label="Верхняя метка h" value={fmt(h, 2)} unit="м" />
            <Readout label="Расстояние l" value={fmt(l, 2)} unit="м" hl />
          </div>
          <div className="small dim" style={{ marginTop: 6 }}>
            В этом сосуде: {curRows.length} опытов, материалов шарика — {matsCount}. Требуется
            минимум 2 материала по 3 опыта.
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Шарик</h5>
          <Select
            label="Материал шарика"
            value={mat}
            onChange={setMat}
            options={BALLS.map((b, i) => ({ value: String(i), label: `${b.name} (ρ = ${fmt(b.rho, 0)} кг/м³)` }))}
          />
          <Slider label="Радиус шарика r" value={r} onChange={setR} min={0.001} max={0.003} step={0.0005} unit="м" digits={3} />
          <div className="readouts" style={{ marginTop: 8 }}>
            <Readout label="ρш" value={fmt(bm.rho, 0)} unit="кг/м³" />
            <Readout label={`«${curName}» в этом сосуде`} value={`${curCount} / 3`} unit="опыта" />
          </div>
          <div className="small dim" style={{ marginTop: 4 }}>
            Размер шарика на схеме увеличен для наглядности.
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Метки уровней</h5>
          <Slider label="Верхняя метка, сосуд 1 (h₁)" value={h1} onChange={setH1} min={0.02} max={0.4} step={0.01} unit="м" digits={2} />
          <Slider label="Верхняя метка, сосуд 2 (h₂)" value={h2} onChange={setH2} min={0.02} max={0.4} step={0.01} unit="м" digits={2} />
          <div className="small dim" style={{ marginTop: 4 }}>
            Нижняя метка общая: 0,45 м от поверхности.
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Управление</h5>
          <div className="btn-row">
            <Btn onClick={drop} disabled={phase === 'fall'}>
              Бросить шарик
            </Btn>
            <Btn onClick={reset}>Сброс</Btn>
          </div>
          <Slider label="Скорость демонстрации" value={speed} onChange={setSpeed} min={1} max={20} step={1} unit="×" digits={0} />
          {rows.length > 0 && (
            <div className="btn-row">
              <Btn variant="danger" onClick={onClear}>
                Очистить таблицы
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
  const vsl = ui.vessel

  const x1 = 235
  const x2 = 545
  drawVessel(ctx, x1, LIQUIDS[0], vsl === '1', ui.h1)
  drawVessel(ctx, x2, LIQUIDS[1], vsl === '2', ui.h2)

  if (s.phase === 'fall' || s.phase === 'done') {
    const bx = s.vsl === 1 ? x1 : x2
    const bm = BALLS[+ui.mat]
    const yy = SURF_Y + s.y * PX
    ball(ctx, bx, yy, 4 + ui.r * 1500, { light: bm.color, dark: '#565f70' })
  }

  label(ctx, `ρж1 = ${fmt(LIQUIDS[0].rho, 0)} кг/м³ (η ≈ ${fmt(LIQUIDS[0].eta, 2)} Па·с)`, x1 - 58, 76, 12.5, '#44506b')
  label(ctx, `ρж2 = ${fmt(LIQUIDS[1].rho, 0)} кг/м³ (η ≈ ${fmt(LIQUIDS[1].eta, 2)} Па·с)`, x2 - 58, 76, 12.5, '#44506b')
}

function drawVessel(ctx, x, liq, active, h) {
  const halfW = 64
  ctx.fillStyle = liq.eta > 0.5 ? 'rgba(217,192,138,0.75)' : 'rgba(169,203,217,0.75)'
  ctx.fillRect(x - halfW, SURF_Y, halfW * 2, BOT_Y - SURF_Y)
  line(ctx, x - halfW, SURF_Y, x + halfW, SURF_Y, '#ffffff', 2)

  ctx.strokeStyle = active ? '#db2777' : '#7d8aa5'
  ctx.lineWidth = active ? 4 : 3
  ctx.beginPath()
  ctx.moveTo(x - halfW, SURF_Y - 10)
  ctx.lineTo(x - halfW, BOT_Y + 12)
  ctx.lineTo(x + halfW, BOT_Y + 12)
  ctx.lineTo(x + halfW, SURF_Y - 10)
  ctx.stroke()

  const yTop = SURF_Y + h * PX
  ctx.setLineDash([7, 4])
  line(ctx, x - halfW, yTop, x + halfW, yTop, '#c0344f', 2)
  label(ctx, `h = ${h.toFixed(2).replace('.', ',')} м`, x + halfW + 8, yTop + 4, 11.5, '#c0344f')
  const yBot = SURF_Y + H_BOTTOM * PX
  line(ctx, x - halfW, yBot, x + halfW, yBot, '#16803c', 2)
  label(ctx, '0,45 м', x + halfW + 8, yBot + 4, 11.5, '#16803c')
  ctx.setLineDash([])

  const midY = (yTop + yBot) / 2
  ctx.strokeStyle = '#8b96ac'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x - halfW - 26, yTop)
  ctx.lineTo(x - halfW - 26, yBot)
  ctx.moveTo(x - halfW - 26, midY)
  ctx.lineTo(x - halfW - 18, midY)
  ctx.stroke()
  label(ctx, 'l', x - halfW - 30, midY + 4, 13, '#44506b', 'right')
}
