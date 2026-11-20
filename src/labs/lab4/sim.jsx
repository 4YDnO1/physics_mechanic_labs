import { useRef, useState } from 'react'
import { Canvas, useSimLoop, bg, line, label } from '../../utils/canvas.jsx'
import { Btn, Num, Readout, Slider, Select } from '../../components/controls.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, fmt, noisePct } from '../../utils/stats.js'
import { M0, S1, S2, PRINT_M, PRINT_S } from './content.jsx'

const Y0 = 118

export default function Lab4Sim({ version, rows, onResult, onClear }) {
  const isPrint = version === 'print'
  const [m, setM] = useState(0.01)
  const [sPath, setSPath] = useState(0.3)
  const [speed, setSpeed] = useState(2)
  const [phase, setPhase] = useState('idle')
  const [live, setLive] = useState({ t: 0, v: 0, x: 0 })
  const sim = useRef({ phase: 'idle' })
  const cnv = useRef(null)
  const acc = useRef(0)

  const prepare = () => {
    const a = (m * G) / (2 * M0 + m)
    if (isPrint) {
      sim.current = {
        phase: 'ready',
        t: 0,
        x: 0,
        v: 0,
        a,
        tS: Math.sqrt((2 * sPath) / a),
        p: { m, S: sPath, print: true },
      }
    } else {
      const t1 = Math.sqrt((2 * S1) / a)
      const v0 = a * t1
      sim.current = {
        phase: 'ready',
        t: 0,
        x: 0,
        v: 0,
        a,
        v0,
        t1,
        t2: S2 / v0,
        p: { m },
      }
    }
    setPhase('ready')
    setLive({ t: 0, v: 0, x: 0 })
  }

  const start = () => {
    if (sim.current.phase !== 'ready') return
    sim.current.phase = isPrint ? 'run' : 'run1'
    setPhase(sim.current.phase)
  }

  useSimLoop(
    cnv,
    (dt, ctx) => {
      const s = sim.current
      if (s.phase === 'run') {
        s.t += dt * speed
        s.x = 0.5 * s.a * s.t * s.t
        s.v = s.a * s.t
        if (s.x >= s.p.S) {
          s.x = s.p.S
          const tm = +(s.tS * noisePct(0.005)).toFixed(3)
          onResult({ m: s.p.m, M: M0, S: s.p.S, t: tm })
          s.phase = 'done'
          setPhase('done')
        }
      } else if (s.phase === 'run1') {
        s.t += dt * speed
        s.x = 0.5 * s.a * s.t * s.t
        s.v = s.a * s.t
        if (s.x >= S1) {
          s.x = S1
          s.t = 0
          s.v = s.v0
          s.phase = 'run2'
          setPhase('run2')
        }
      } else if (s.phase === 'run2') {
        s.t += dt * speed
        s.x = S1 + s.v0 * s.t
        if (s.x >= S1 + S2) {
          s.x = S1 + S2
          s.phase = 'done'
          const tm = +(s.t2 * noisePct(0.005)).toFixed(3)
          onResult({ m: s.p.m, M: M0, S1, S2, t: tm })
          setPhase('done')
        }
      }
      draw(ctx, s, isPrint)
      acc.current += dt
      if (acc.current > 0.1) {
        acc.current = 0
        const shownT = isPrint
          ? s.phase === 'run' ? s.t : s.phase === 'done' ? s.tS : 0
          : s.phase === 'run2' ? s.t : s.phase === 'done' ? s.t2 : 0
        setLive({ t: shownT, v: s.v || 0, x: s.x || 0 })
      }
    },
    true
  )

  const statusText = isPrint
    ? {
        idle: 'Установка не подготовлена. Задайте m и S, затем нажмите «Подготовка».',
        ready: 'Система в начальном положении. Нажмите «Запустить».',
        run: 'Грузы движутся равноускоренно; измеряется время прохождения пути S…',
        done: 'Опыт завершён. Результаты занесены в таблицу.',
      }[phase]
    : {
        idle: 'Установка не подготовлена. Задайте m и нажмите «Подготовка».',
        ready: 'Система в начальном положении. Нажмите «Запустить».',
        run1: 'Участок S₁: равноускоренное движение под действием перегрузка…',
        run2: 'Участок S₂: равномерное движение (перегрузок отцеплен)…',
        done: 'Опыт завершён. Результаты занесены в таблицу.',
      }[phase]

  return (
    <div className="practice">
      <div className="sim-col">
        <div className="sim-frame">
          <Canvas canvasRef={cnv} />
          <div className="sim-status">
            <span className="readout">
              {isPrint ? 't (путь S)' : 't (уч. S₂)'}<b>{fmt(live.t, 3)} с</b>
            </span>
            <span className="readout">
              v<b>{fmt(live.v, 2)} м/с</b>
            </span>
            <span className="readout">
              S<b>{fmt(live.x, 2)} м</b>
            </span>
            <span>{statusText}</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <h4>Таблица 1. Результаты измерений</h4>
          <DataTable
            rows={rows.map((rw, i) => ({ ...rw, i: i + 1 }))}
            columns={[
              { key: 'i', label: '№' },
              { key: 'm', label: 'm', unit: 'кг' },
              { key: 'M', label: 'M', unit: 'кг' },
              ...(isPrint ? [{ key: 'S', label: 'S', unit: 'м' }] : []),
              { key: 't', label: 't', unit: 'с' },
            ]}
            caption={isPrint
              ? `M = ${fmt(M0, 1)} кг (методичка: m = 10, 20, 30 г; S = 30, 24, 15 см)`
              : `S₁ = ${fmt(S1, 2)} м; S₂ = ${fmt(S2, 2)} м; M = ${fmt(M0, 1)} кг`}
          />
        </div>
      </div>

      <div className="ctrl-col">
        <div className="ctrl-card">
          <h5>Параметры системы</h5>
          {isPrint ? (
            <>
              <Select
                label="Разновес m"
                value={String(m)}
                onChange={(v) => setM(+v)}
                options={PRINT_M.map((v) => ({ value: String(v), label: `${fmt(v * 1000, 0)} г (${fmt(v, 3)} кг)` }))}
              />
              <Select
                label="Путь S"
                value={String(sPath)}
                onChange={(v) => setSPath(+v)}
                options={PRINT_S.map((v) => ({ value: String(v), label: `${fmt(v * 100, 0)} см (${fmt(v, 2)} м)` }))}
              />
            </>
          ) : (
            <Num label="Масса перегрузка m" value={m} onChange={(v) => setM(Math.max(0.004, Math.min(0.02, v || 0)))} min={0.004} max={0.02} step={0.002} unit="кг" digits={3} />
          )}
          <div className="small dim" style={{ marginTop: 4 }}>
            {isPrint
              ? 'Очная методичка: m = 10; 20; 30 г, S = 30; 24; 15 см. Рабочая формула g = 2S(2M+m)/(mt²).'
              : 'Рекомендуемая серия: m = 0,006; 0,008; 0,010; 0,012; 0,014 кг.'}
          </div>
          <div className="readouts" style={{ marginTop: 8 }}>
            <Readout label="Масса груза M" value={fmt(M0, 1)} unit="кг" />
            {isPrint ? (
              <Readout label="Путь S" value={fmt(sPath, 2)} unit="м" />
            ) : (
              <>
                <Readout label="Участок S₁" value={fmt(S1, 2)} unit="м" />
                <Readout label="Участок S₂" value={fmt(S2, 2)} unit="м" />
              </>
            )}
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Управление</h5>
          <div className="btn-row">
            <Btn onClick={prepare} disabled={phase === 'run' || phase === 'run1' || phase === 'run2'}>
              Подготовка
            </Btn>
            <Btn onClick={start} disabled={phase !== 'ready'}>
              Запустить
            </Btn>
          </div>
          <Slider label="Скорость анимации" value={speed} onChange={setSpeed} min={1} max={4} step={1} unit="×" digits={0} />
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

function draw(ctx, s, isPrint) {
  bg(ctx)
  const cx = 390
  const total = isPrint ? (s.p?.S ?? 0.3) : S1 + S2
  const scale = Math.min(500, 232 / total)

  ctx.fillStyle = '#77839d'
  ctx.fillRect(cx - 15, 26, 30, 26)
  ctx.fillStyle = '#5d6f8d'
  ctx.fillRect(cx - 60, 22, 120, 8)

  const pr = 20
  ctx.fillStyle = '#aeb9cf'
  ctx.beginPath()
  ctx.arc(cx, 68, pr, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#77839d'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, 68, pr, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#48597c'
  ctx.beginPath()
  ctx.arc(cx, 68, 5, 0, Math.PI * 2)
  ctx.fill()

  const x = s.phase === 'run' || s.phase === 'run1' || s.phase === 'run2' || s.phase === 'done' ? s.x : 0
  const yL = Y0 + x * scale
  const yR = Y0 + (total - x) * scale
  const lx = cx - pr
  const rx = cx + pr

  line(ctx, lx, 68, lx, yL, '#6b5b45', 2)
  line(ctx, rx, 68, rx, yR, '#6b5b45', 2)

  const wL = 46
  const hL = 52
  const gg = ctx.createLinearGradient(lx - wL / 2, 0, lx + wL / 2, 0)
  gg.addColorStop(0, '#8e9a6f')
  gg.addColorStop(1, '#5d6b45')
  ctx.fillStyle = gg
  ctx.fillRect(lx - wL / 2, yL, wL, hL)
  label(ctx, 'M', lx + wL / 2 + 6, yL + hL / 2 + 4, 13, '#44506b')

  const riderOn = isPrint ? s.phase !== 'done' : s.phase !== 'run2' && s.phase !== 'done'
  if (riderOn) {
    ctx.fillStyle = '#b4533a'
    ctx.fillRect(lx - 17, yL - 13, 34, 13)
    label(ctx, 'm', lx + 24, yL - 4, 13, '#44506b')
  } else if (!isPrint) {
    const catchY = Y0 + S1 * scale
    ctx.fillStyle = '#c96a4a'
    ctx.fillRect(lx - 30, catchY - 6, 16, 10)
    ctx.fillRect(lx + 14, catchY - 6, 16, 10)
  }

  ctx.fillStyle = gg
  ctx.fillRect(rx - wL / 2, yR, wL, hL)
  label(ctx, 'M', rx + wL / 2 + 6, yR + hL / 2 + 4, 13, '#44506b')

  const rux = 560
  line(ctx, rux, Y0, rux, Y0 + total * scale, '#9aa7bd', 2)
  for (let i = 0; i <= 8; i++) {
    const yy = Y0 + (total * scale * i) / 8
    line(ctx, rux - 6, yy, rux + 6, yy, '#9aa7bd', 2)
    label(ctx, fmt((total * i) / 8, 2), rux - 10, yy + 4, 10.5, '#77839d', 'right')
  }
  if (isPrint) {
    const endY = Y0 + total * scale
    ctx.strokeStyle = '#c96a4a'
    ctx.lineWidth = 2.5
    line(ctx, rux - 9, endY, rux + 9, endY, '#c96a4a', 2.5)
    label(ctx, 'S — путь груза', rux + 14, endY + 4, 11, '#c96a4a')
  } else {
    const catchY = Y0 + S1 * scale
    ctx.strokeStyle = '#c96a4a'
    ctx.lineWidth = 2.5
    line(ctx, rux - 9, catchY, rux + 9, catchY, '#c96a4a', 2.5)
    label(ctx, 'S₁ — уловитель', rux + 14, catchY + 4, 11, '#c96a4a')
    const endY = Y0 + total * scale
    line(ctx, rux - 9, endY, rux + 9, endY, '#16803c', 2.5)
    label(ctx, 'S₁+S₂ — конец пути', rux + 14, endY + 4, 11, '#16803c')
  }
  label(ctx, 'S, м', rux - 10, Y0 - 8, 12, '#77839d', 'right')

  ctx.fillStyle = '#e7ebf2'
  ctx.fillRect(0, Y0 + total * scale + hL + 14, 780, 34)
  line(ctx, 0, Y0 + total * scale + hL + 14, 780, Y0 + total * scale + hL + 14, '#9aa7bd', 2)

  if (isPrint) {
    label(ctx, `m = ${fmt(s.p?.m ?? 0.01, 3)} кг   M = ${fmt(M0, 1)} кг   S = ${fmt(s.p?.S ?? 0.3, 2)} м`, 22, 30, 13.5, '#44506b')
    if (s.phase === 'run' || s.phase === 'done') label(ctx, 'равноускоренное движение (a = const)', 22, 52, 13, '#b45309')
  } else {
    label(ctx, `m = ${fmt(s.p?.m ?? 0.01, 3)} кг   M = ${fmt(M0, 1)} кг   S₁ = ${fmt(S1, 2)} м   S₂ = ${fmt(S2, 2)} м`, 22, 30, 13.5, '#44506b')
    if (s.phase === 'run1') label(ctx, 'равноускоренно (a = const)', 22, 52, 13, '#b45309')
    if (s.phase === 'run2' || s.phase === 'done') label(ctx, 'равномерно (a = 0)', 22, 52, 13, '#16803c')
  }
}
