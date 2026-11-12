import { useRef, useState } from 'react'
import { Canvas, useSimLoop, bg, line, label, ball } from '../../utils/canvas.jsx'
import { Btn, Readout, Slider, Radio, Select } from '../../components/controls.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, fmt, rnd } from '../../utils/stats.js'

const L = 0.5
const Lpx = 295
const PIVY = 46
const CX = 390

const MASS_OPTS = [
  { value: '0.04', label: '40 г' },
  { value: '0.112', label: '112 г' },
]

const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI
const ballR = (m) => 12 + 13 * Math.cbrt(m / 0.5)

const resolveBalls = (s) => {
  const R1 = ballR(s.p.m1)
  const R2 = ballR(s.p.m2)
  const q1x = CX - (R1 + R2) / 2 - 1
  const q2x = CX + (R1 + R2) / 2 + 1
  const x1 = q1x + Lpx * Math.sin(s.th1)
  const x2 = q2x + Lpx * Math.sin(s.th2)
  if (x2 - x1 < R1 + R2) {
    const avg = (s.th1 + s.th2) / 2
    const half = 1 / Lpx
    s.th1 = avg + half
    s.th2 = avg - half
    const v1 = Lpx * s.w1
    const v2 = Lpx * s.w2
    if (v1 - v2 > 0) {
      const { m1, m2 } = s.p
      s.w1 = (((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)) / Lpx
      s.w2 = (((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)) / Lpx
    }
  }
}

export default function Lab2Sim({ rows, onResult, onClear, version = 'web' }) {
  const isPrint = version === 'print'
  const [mode, setMode] = useState('elastic')
  const [a1, setA1] = useState(isPrint ? 10 : 45)
  const [m1, setM1] = useState(isPrint ? 0.112 : 0.2)
  const [m2, setM2] = useState(isPrint ? 0.04 : 0.1)
  const [phase, setPhase] = useState('idle')
  const [live, setLive] = useState({ th1: 0, th2: 0 })
  const sim = useRef({ phase: 'idle' })
  const cnv = useRef(null)
  const acc = useRef(0)

  const prepare = () => {
    const a = rad(a1)
    sim.current = {
      phase: 'ready',
      p: { mode, a1, m1, m2 },
      th1: -a,
      w1: 0,
      th2: 0,
      w2: 0,
      rec1: null,
      rec2: null,
      post: false,
      settled: false,
    }
    setPhase('ready')
    setLive({ th1: -a, th2: 0 })
  }

  const start = () => {
    if (sim.current.phase !== 'ready') return
    sim.current.phase = 'fly'
    setPhase('fly')
  }

  const step = (s, dt) => {
    const sub = 8
    const h = dt / sub
    for (let i = 0; i < sub; i++) {
      if (s.phase === 'fly') {
        s.w1 += -(G / L) * Math.sin(s.th1) * h
        s.th1 += s.w1 * h
        if (s.th1 >= 0) {
          s.th1 = 0
          const v1 = 2 * Math.sqrt(G * L) * Math.sin(rad(s.p.a1) / 2)
          if (s.p.mode === 'elastic') {
            const u1 = ((s.p.m1 - s.p.m2) / (s.p.m1 + s.p.m2)) * v1
            const u2 = ((2 * s.p.m1) / (s.p.m1 + s.p.m2)) * v1
            s.w1 = u1 / L
            s.w2 = u2 / L
          } else {
            const u = (s.p.m1 / (s.p.m1 + s.p.m2)) * v1
            s.w1 = u / L
            s.w2 = u / L
          }
          s.phase = 'post'
          s.post = true
          setPhase('post')
        }
      } else if (s.phase === 'post' || s.phase === 'done') {
        const k = s.phase === 'done' ? Math.max(0, 1 - 1.2 * h) : 1
        const pw1 = s.w1
        const pw2 = s.w2
        s.w1 += -(G / L) * Math.sin(s.th1) * h
        s.w1 *= k
        s.th1 += s.w1 * h
        if (s.p.mode === 'elastic') {
          s.w2 += -(G / L) * Math.sin(s.th2) * h
          s.w2 *= k
          s.th2 += s.w2 * h
          if (s.phase === 'post') {
            if (s.rec1 === null && (Math.abs(s.w1) < 1e-4 || s.w1 * pw1 < 0)) {
              const mag = Math.abs(deg(s.th1))
              const sgn = s.th1 >= 0 ? 1 : -1
              s.rec1 = sgn * Math.max(0, mag + rnd(-0.5, 0.5))
              if (mag < 0.05) s.rec1 = rnd(-0.4, 0.4)
            }
            if (s.rec2 === null && (Math.abs(s.w2) < 1e-4 || s.w2 * pw2 < 0)) {
              s.rec2 = Math.max(0.2, Math.abs(deg(s.th2)) + rnd(-0.5, 0.5))
            }
            if (s.rec1 !== null && s.rec2 !== null) {
              s.phase = 'done'
              onResult({
                mode: 'elastic',
                a1: s.p.a1,
                a1p: +s.rec1.toFixed(1),
                a2p: +s.rec2.toFixed(1),
                m1: s.p.m1,
                m2: s.p.m2,
              })
              setPhase('done')
            }
          }
        } else {
          s.th2 = s.th1
          s.w2 = s.w1
          if (s.phase === 'post' && s.rec1 === null && (Math.abs(s.w1) < 1e-4 || s.w1 * pw1 < 0)) {
            s.rec1 = Math.max(0.2, Math.abs(deg(s.th1)) + rnd(-0.5, 0.5))
            s.phase = 'done'
            onResult({
              mode: 'inelastic',
              a1: s.p.a1,
              ap: +s.rec1.toFixed(1),
              m1: s.p.m1,
              m2: s.p.m2,
            })
            setPhase('done')
          }
        }
        resolveBalls(s)
      }
    }
  }

  useSimLoop(
    cnv,
    (dt, ctx) => {
      const s = sim.current
      step(s, dt)
      draw(ctx, s)
      acc.current += dt
      if (acc.current > 0.08) {
        acc.current = 0
        setLive({ th1: s.th1 || 0, th2: s.th2 || 0 })
      }
    },
    true
  )

  const statusText = {
    idle: 'Установка не подготовлена. Задайте параметры и нажмите «Подготовить».',
    ready: 'Шар 1 удерживается электромагнитом. Нажмите «Пуск».',
    fly: 'Шар 1 падает с электромагнита…',
    post: 'Удар произошёл — регистрируются углы максимального отклонения…',
    done: 'Опыт завершён. Результаты занесены в таблицу.',
  }[phase]

  const elastRows = rows.filter((r) => r.mode === 'elastic')
  const inelRows = rows.filter((r) => r.mode === 'inelastic')
  const shown = mode === 'elastic' ? elastRows : inelRows

  return (
    <div className="practice">
      <div className="sim-col">
        <div className="sim-frame">
          <Canvas canvasRef={cnv} />
          <div className="sim-status">
            <span className="readout">
              θ₁<b>{fmt(deg(live.th1), 1)}°</b>
            </span>
            <span className="readout">
              θ₂<b>{fmt(deg(live.th2), 1)}°</b>
            </span>
            <span>{statusText}</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <h4>Таблица результатов — {mode === 'elastic' ? 'абсолютно упругий удар' : 'абсолютно неупругий удар'}</h4>
          {mode === 'elastic' ? (
            <DataTable
              rows={shown.map((r, i) => ({ ...r, i: i + 1 }))}
              columns={[
                { key: 'i', label: '№' },
                { key: 'a1', label: 'α₁', unit: '°' },
                { key: 'a1p', label: "α₁'", unit: '°' },
                { key: 'a2p', label: "α₂'", unit: '°' },
                { key: 'm1', label: 'm₁', unit: 'кг' },
                { key: 'm2', label: 'm₂', unit: 'кг' },
              ]}
              caption="Таблица 1. Упругий удар: α₁ — начальный угол; α₁', α₂' — углы после удара"
            />
          ) : (
            <DataTable
              rows={shown.map((r, i) => ({ ...r, i: i + 1 }))}
              columns={[
                { key: 'i', label: '№' },
                { key: 'a1', label: 'α₁', unit: '°' },
                { key: 'ap', label: "α'", unit: '°' },
                { key: 'm1', label: 'm₁', unit: 'кг' },
                { key: 'm2', label: 'm₂', unit: 'кг' },
              ]}
              caption="Таблица 2. Неупругий удар: α₁ — начальный угол; α' — угол сцепившихся шаров"
            />
          )}
        </div>
      </div>

      <div className="ctrl-col">
        <div className="ctrl-card">
          <h5>Вид удара</h5>
          <Radio
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              { value: 'elastic', label: 'Абсолютно упругий' },
              { value: 'inelastic', label: 'Абсолютно неупругий' },
            ]}
          />
        </div>
        <div className="ctrl-card">
          <h5>Характеристики шаров</h5>
          {isPrint ? (
            <>
              <Select label="Масса шара 1, m₁" value={String(m1)} onChange={(v) => setM1(+v)} options={MASS_OPTS} />
              <Select label="Масса шара 2, m₂" value={String(m2)} onChange={(v) => setM2(+v)} options={MASS_OPTS} />
              <Readout label="Начальный угол α₁" value={fmt(a1, 0)} unit="°" />
              <div className="small dim" style={{ marginTop: 4 }}>
                Массы выбираются из набора методики: 112 г (тяжёлый) и 40 г (лёгкий). Опыты
                проводят как с <b>равными</b> шарами (m₁ = m₂), так и с <b>разными</b> (112 г и 40 г);
                α₁ = 10°, l = {fmt(L, 2)} м.
              </div>
            </>
          ) : (
            <>
              <Slider label="Масса шара 1, m₁" value={m1} onChange={setM1} min={0.05} max={0.5} step={0.01} unit="кг" digits={2} />
              <Slider label="Масса шара 2, m₂" value={m2} onChange={setM2} min={0.05} max={0.5} step={0.01} unit="кг" digits={2} />
              <Slider label="Начальный угол α₁" value={a1} onChange={setA1} min={15} max={70} step={1} unit="°" digits={0} />
              <div className="small dim" style={{ marginTop: 4 }}>
                Длина маятников l = {fmt(L, 2)} м. При m₁ &lt; m₂ первый шар после упругого удара
                отскакивает назад.
              </div>
            </>
          )}
        </div>
        <div className="ctrl-card">
          <h5>Управление</h5>
          <div className="btn-row">
            <Btn onClick={prepare} disabled={phase === 'fly' || phase === 'post'}>
              Подготовить
            </Btn>
            <Btn onClick={start} disabled={phase !== 'ready'}>
              Пуск
            </Btn>
          </div>
        </div>
        <div className="ctrl-card">
          <h5>Измеряемые величины</h5>
          <div className="readouts">
            {mode === 'elastic' ? (
              <>
                <Readout label="α₁' (после удара)" value={elastRows.length ? fmt(elastRows[elastRows.length - 1].a1p, 1) : '—'} unit="°" hl />
                <Readout label="α₂' (после удара)" value={elastRows.length ? fmt(elastRows[elastRows.length - 1].a2p, 1) : '—'} unit="°" hl />
              </>
            ) : (
              <Readout label="α' (сцепившихся шаров)" value={inelRows.length ? fmt(inelRows[inelRows.length - 1].ap, 1) : '—'} unit="°" hl />
            )}
          </div>
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

  function draw(ctx, s) {
    bg(ctx)
    const R1 = ballR(s.p?.m1 ?? m1)
    const R2 = ballR(s.p?.m2 ?? m2)
    const q1x = CX - (R1 + R2) / 2 - 1
    const q2x = CX + (R1 + R2) / 2 + 1

    ctx.fillStyle = '#77839d'
    ctx.fillRect(CX - 230, PIVY - 12, 460, 10)
    for (let x = CX - 225; x < CX + 225; x += 26) {
      line(ctx, x, PIVY - 2, x - 8, PIVY - 14, '#9aa7bd', 1.4)
    }

    for (const [px, base] of [
      [q1x, -75],
      [q2x, -75],
    ]) {
      ctx.strokeStyle = 'rgba(120,134,164,0.35)'
      ctx.lineWidth = 1
      for (let a = base; a <= 75; a += 15) {
        const aa = rad(a)
        const x1 = px + (Lpx - 6) * Math.sin(aa)
        const y1 = PIVY + (Lpx - 6) * Math.cos(aa)
        const x2 = px + (Lpx + 6) * Math.sin(aa)
        const y2 = PIVY + (Lpx + 6) * Math.cos(aa)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        if (px === q2x) {
          label(ctx, `${a}`, px + (Lpx + 20) * Math.sin(aa) - 8, PIVY + (Lpx + 20) * Math.cos(aa) + 4, 10, '#8a94ab')
        }
      }
    }

    const aMag = rad(s.p?.a1 ?? a1)
    const magX = q1x + (Lpx - ballR(s.p?.m1 ?? m1) - 14) * Math.sin(-aMag)
    const magY = PIVY + (Lpx - ballR(s.p?.m1 ?? m1) - 14) * Math.cos(-aMag)
    const magOn = s.phase === 'idle' || s.phase === 'ready'
    ctx.save()
    ctx.translate(magX, magY)
    ctx.rotate(-aMag)
    ctx.fillStyle = magOn ? '#b4533a' : '#8d99ae'
    ctx.fillRect(-13, -20, 26, 22)
    ctx.fillStyle = magOn ? '#e08a63' : '#c3ccd9'
    ctx.fillRect(-13, -20, 26, 6)
    ctx.restore()
    label(ctx, 'электромагнит', magX - 40, magY - 26, 11, '#8a94ab')

    const th1 = s.phase === 'idle' || s.phase === 'ready' ? -rad(s.p?.a1 ?? a1) : s.th1 || 0
    const th2 = s.phase === 'idle' || s.phase === 'ready' ? 0 : s.th2 || 0

    const b1x = q1x + Lpx * Math.sin(th1)
    const b1y = PIVY + Lpx * Math.cos(th1)
    const b2x = q2x + Lpx * Math.sin(th2)
    const b2y = PIVY + Lpx * Math.cos(th2)

    line(ctx, q1x, PIVY, b1x, b1y, '#444c63', 1.6)
    line(ctx, q2x, PIVY, b2x, b2y, '#444c63', 1.6)

    ball(ctx, b2x, b2y, R2, { light: '#b9c8d8', dark: '#6d8399' })
    label(ctx, '2', b2x + R2 + 4, b2y - R2 + 2, 13, '#44506b')
    ball(ctx, b1x, b1y, R1, { light: '#c9c2b4', dark: '#77705e' })
    label(ctx, '1', b1x - R1 - 12, b1y - R1 + 2, 13, '#44506b')

    ctx.fillStyle = '#5b6c8f'
    ctx.beginPath()
    ctx.arc(q1x, PIVY, 4, 0, Math.PI * 2)
    ctx.arc(q2x, PIVY, 4, 0, Math.PI * 2)
    ctx.fill()

    if (s.phase === 'post' || s.phase === 'done') {
      ctx.save()
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = 'rgba(180,83,9,0.45)'
      ctx.lineWidth = 1
      for (const px of [q1x, q2x]) {
        ctx.beginPath()
        ctx.moveTo(px, PIVY)
        ctx.lineTo(px, PIVY + Lpx + 16)
        ctx.stroke()
      }
      ctx.restore()

      const arcR = 66
      const drawArc = (px, th) => {
        const a0 = Math.PI / 2
        const a1 = Math.PI / 2 - th
        ctx.strokeStyle = '#b45309'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(px, PIVY, arcR, Math.min(a0, a1), Math.max(a0, a1))
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(px, PIVY, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = '#b45309'
        ctx.fill()
      }

      const c1 = s.rec1 !== null ? s.rec1 : deg(s.th1)
      const c2 = s.p.mode === 'elastic' ? (s.rec2 !== null ? s.rec2 : deg(s.th2)) : c1
      drawArc(q1x, s.th1)
      drawArc(q2x, s.th2)

      const rayLen = Lpx + 24
      ctx.save()
      ctx.setLineDash([7, 4])
      ctx.strokeStyle = '#b45309'
      ctx.lineWidth = 2
      for (const [px, c] of [
        [q1x, c1],
        [q2x, c2],
      ]) {
        const rr = rad(c)
        ctx.beginPath()
        ctx.moveTo(px, PIVY)
        ctx.lineTo(px + rayLen * Math.sin(rr), PIVY + rayLen * Math.cos(rr))
        ctx.stroke()
      }
      ctx.restore()

      if (s.p.mode === 'elastic') {
        label(ctx, `α₁' = ${fmt(c1, 1)}°`, q1x - 96, PIVY + Lpx + 8, 13, '#b45309')
        label(ctx, `α₂' = ${fmt(c2, 1)}°`, q2x + 6, PIVY + Lpx + 8, 13, '#b45309')
      } else {
        label(ctx, `α' = ${fmt(c1, 1)}°`, q1x - 80, PIVY + Lpx + 8, 13, '#b45309')
      }
    }

    label(
      ctx,
      `m₁ = ${fmt(s.p?.m1 ?? m1, 2)} кг   m₂ = ${fmt(s.p?.m2 ?? m2, 2)} кг   α₁ = ${fmt(s.p?.a1 ?? a1, 0)}°   l = ${fmt(L, 2)} м`,
      22,
      30,
      13.5,
      '#44506b'
    )
    if (s.phase === 'fly') {
      label(ctx, '⤓ шар 1 движется', 22, 52, 13, '#b45309')
    }
    if (s.post) {
      label(ctx, s.p.mode === 'elastic' ? 'упругий удар' : 'неупругий удар (шары сцепились)', 22, 52, 13, '#b45309')
    }
  }
}
