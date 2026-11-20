import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import Subst from '../../components/Subst.jsx'
import { fmt, mean } from '../../utils/stats.js'
import { DA, DT_INSTR, N_OSC } from './content.jsx'

const T_ALPHA = { 2: 12.706, 3: 4.303, 4: 3.182, 5: 2.776, 6: 2.571, 7: 2.447, 8: 2.365, 9: 2.306, 10: 2.262 }
const PAIRS = [
  [0, 2],
  [2, 4],
  [4, 6],
]

export function computeStats(rows) {
  const tRows = rows.filter((r) => r.kind === 'T')
  const aRows = rows.filter((r) => r.kind === 'A')
  if (!tRows.length || !aRows.length) return {}

  const t10s = tRows.map((r) => r.t10)
  const n = t10s.length
  const tMean = mean(t10s)
  const dev = t10s.map((t) => t - tMean)
  const sq = dev.map((d) => d * d)
  const sumSq = sq.reduce((s, x) => s + x, 0)
  const sn = n > 1 ? Math.sqrt(sumSq / (n * (n - 1))) : NaN
  const tAlpha = T_ALPHA[n] ?? 4.303
  const dtSl = tAlpha * sn
  const dt = dtSl + DT_INSTR
  const T = tMean / N_OSC
  const dT = dt / N_OSC
  const dTRel = (dT / T) * 100

  const A = aRows[aRows.length - 1].A
  const deltas = PAIRS.map(([i, j]) => Math.log(A[i] / A[j]))
  const delta = mean(deltas)
  const Aavg = mean(PAIRS.flatMap(([i, j]) => [A[i], A[j]]))
  const dDeltaRel = ((Math.SQRT2 * DA) / (Aavg * Math.max(delta, 1e-6))) * 100
  const dDelta = (dDeltaRel / 100) * delta

  const beta = delta / T
  const tau = 1 / beta
  const omega0 = (2 * Math.PI) / T
  const omega = Math.sqrt(Math.max(0, omega0 * omega0 - beta * beta))
  const Q = Math.PI / delta
  const dBetaRel = dTRel + dDeltaRel
  const dTauRel = dBetaRel
  const dQRel = dDeltaRel

  return {
    n, t10s, tMean, dev, sq, sumSq, sn, tAlpha, dtSl, dt, T, dT, dTRel,
    A, A0: A[0], deltas, delta, dDelta, dDeltaRel,
    beta, tau, omega0, omega, Q,
    dBetaRel, dTauRel, dQRel,
  }
}

export default function Lab5Calc({ rows }) {
  const st = computeStats(rows)
  const has = rows.some((r) => r.kind === 'T') && rows.some((r) => r.kind === 'A')

  const t1 = has
    ? st.t10s.map((v, i) => ({ i: i + 1, t10: v, dev: st.dev[i], sq: st.sq[i] }))
    : []
  if (has) t1.push({ i: '', t10: '', dev: 'Σ', sq: st.sumSq, __sum: true })

  const ampRow = has ? { ...st.A.reduce((acc, v, i) => ({ ...acc, [i]: v }), {}) } : null

  const decRows = has
    ? PAIRS.map(([i, j], k) => ({ i: k + 1, pair: `A${i} / A${j}`, Ai: st.A[i], Aj: st.A[j], d: st.deltas[k] }))
    : []

  return (
    <>
      <h3>Обработка результатов измерений</h3>
      {!has && (
        <div className="tbl-empty">
          Нет данных для расчёта. Выполните измерения периода и амплитуд на вкладке «Эксперимент».
        </div>
      )}

      {has && (
        <>
          <h4>Таблица 1. Обработка времени десяти колебаний</h4>
          <DataTable
            rows={t1}
            columns={[
              { key: 'i', label: '№' },
              { key: 't10', label: 't₁₀', unit: 'с', format: (v) => fmt(v, 2) },
              { key: 'dev', label: 'Δt₁₀', unit: 'с', format: (v) => fmt(v, 3) },
              { key: 'sq', label: '(Δt₁₀)²', unit: 'с²', format: (v) => fmt(v, 5) },
            ]}
          />
          <p>Среднее время десяти колебаний и период:</p>
          <Subst
            items={[
              String.raw`\bar t_{10} = \frac{${st.t10s.map((v) => fmt(v, 2)).join(' + ')}}{${st.n}} = ${fmt(st.tMean, 3)}\ \text{с}`,
              String.raw`T = \frac{\bar t_{10}}{${N_OSC}} = \frac{${fmt(st.tMean, 3)}}{${N_OSC}} = ${fmt(st.T, 3)}\ \text{с}`,
            ]}
          />
          <p>
            Случайная погрешность времени: <Tex>{String.raw`s_n = ${fmt(st.sn, 5)}\ \text{с}`}</Tex>,{' '}
            <Tex>{String.raw`\Delta t_{\text{сл}} = ${fmt(st.tAlpha, 3)}\cdot s_n = ${fmt(st.dtSl, 5)}\ \text{с}`}</Tex>.
            Полная погрешность <Tex>{String.raw`\Delta t_{10} = ${fmt(st.dt, 5)}\ \text{с}`}</Tex>,
            поэтому <Tex>{String.raw`\Delta T = ${fmt(st.dT, 5)}\ \text{с}`}</Tex> (
            <Tex>{String.raw`\delta_T = ${fmt(st.dTRel, 2)}\%`}</Tex>).
          </p>

          <h4>Таблица 2. Измеренные амплитуды</h4>
          <DataTable
            rows={ampRow ? [ampRow] : []}
            columns={Array.from({ length: 10 }, (_, i) => ({
              key: String(i),
              label: `A${i}`,
              unit: 'град',
              format: (v) => fmt(v, 2),
            }))}
            caption="Амплитуды снимаются через каждые полпериода"
          />

          <h4>Таблица 3. Логарифмический декремент затухания</h4>
          <DataTable
            rows={decRows}
            columns={[
              { key: 'i', label: '№' },
              { key: 'pair', label: 'Отношение', txt: true },
              { key: 'Ai', label: 'Aᵢ', unit: 'град', format: (v) => fmt(v, 2) },
              { key: 'Aj', label: 'Aⱼ', unit: 'град', format: (v) => fmt(v, 2) },
              { key: 'd', label: 'δᵢ', format: (v) => fmt(v, 4) },
            ]}
          />
          <Subst
            items={[
              String.raw`\delta_1 = \ln\frac{${fmt(st.A[0], 2)}}{${fmt(st.A[2], 2)}} = ${fmt(st.deltas[0], 4)}`,
              String.raw`\delta_2 = \ln\frac{${fmt(st.A[2], 2)}}{${fmt(st.A[4], 2)}} = ${fmt(st.deltas[1], 4)}`,
              String.raw`\delta_3 = \ln\frac{${fmt(st.A[4], 2)}}{${fmt(st.A[6], 2)}} = ${fmt(st.deltas[2], 4)}`,
              String.raw`\delta = \frac{\delta_1+\delta_2+\delta_3}{3} = ${fmt(st.delta, 4)}, \qquad \Delta\delta = ${fmt(st.dDelta, 4)}`,
            ]}
          />

          <h4>Таблица 4. Параметры затухающих колебаний</h4>
          <DataTable
            rows={[
              { p: 'Период T', v: `${fmt(st.T, 3)} с`, err: `±${fmt(st.dT, 3)} с (${fmt(st.dTRel, 2)} %)` },
              { p: 'Логарифмический декремент δ', v: fmt(st.delta, 4), err: `±${fmt(st.dDelta, 4)} (${fmt(st.dDeltaRel, 2)} %)` },
              { p: 'Коэффициент затухания β = δ/T', v: `${fmt(st.beta, 4)} с⁻¹`, err: `±${fmt(st.dBetaRel, 2)} %` },
              { p: 'Время релаксации τ = 1/β', v: `${fmt(st.tau, 2)} с`, err: `±${fmt(st.dTauRel, 2)} %` },
              { p: 'Циклическая частота ω', v: `${fmt(st.omega, 3)} рад/с`, err: '—' },
              { p: 'Добротность Q ≈ π/δ', v: fmt(st.Q, 1), err: `±${fmt(st.dQRel, 2)} %` },
            ]}
            columns={[
              { key: 'p', label: 'Величина', txt: true },
              { key: 'v', label: 'Значение', txt: true },
              { key: 'err', label: 'Погрешность', txt: true },
            ]}
          />
          <p>Уравнение затухающих колебаний маятника:</p>
          <Eq>{String.raw`x(t) = ${fmt(st.A0, 2)} e^{-t/${fmt(st.tau, 2)}} \cos(${fmt(st.omega, 3)}\,t)\ (\text{град})`}</Eq>
        </>
      )}
    </>
  )
}
