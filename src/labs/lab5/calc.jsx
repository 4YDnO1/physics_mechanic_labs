import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import Subst from '../../components/Subst.jsx'
import { fmt, mean, meanAbsDev } from '../../utils/stats.js'
import { N_OSC } from './content.jsx'

const PAIRS = [
  [0, 2],
  [2, 4],
  [4, 6],
]

export function computeStats(rows) {
  const tRows = rows.filter((r) => r.kind === 'T')
  const aRows = rows.filter((r) => r.kind === 'A')
  if (!tRows.length || !aRows.length) return {}

  const per = tRows.map((r, i) => ({ ...r, i: i + 1, T: r.t10 / N_OSC }))
  const Ts = per.map((p) => p.T)
  const TMean = mean(Ts)
  const tdev = Ts.map((v) => Math.abs(v - TMean))
  const dT = meanAbsDev(Ts)
  const dTRel = TMean ? (dT / TMean) * 100 : NaN

  const A = aRows[aRows.length - 1].A
  const deltas = PAIRS.map(([i, j]) => Math.log(A[i] / A[j]))
  const delta = mean(deltas)
  const ddev = deltas.map((v) => Math.abs(v - delta))
  const dDelta = meanAbsDev(deltas)
  const dDeltaRel = delta ? (dDelta / delta) * 100 : NaN

  const beta = delta / TMean
  const tau = 1 / beta
  const omega0 = (2 * Math.PI) / TMean
  const omega = Math.sqrt(Math.max(0, omega0 * omega0 - beta * beta))
  const Q = Math.PI / delta
  const dBetaRel = dTRel + dDeltaRel
  const dTauRel = dBetaRel
  const dQRel = dDeltaRel

  return {
    per, Ts, T: TMean, TMean, tdev, dT, dTRel,
    A, A0: A[0], deltas, delta, ddev, dDelta, dDeltaRel,
    beta, tau, omega0, omega, Q,
    dBetaRel, dTauRel, dQRel,
  }
}

export default function Lab5Calc({ rows }) {
  const st = computeStats(rows)
  const has = rows.some((r) => r.kind === 'T') && rows.some((r) => r.kind === 'A')

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
          <h4>1. Вычисление значений по опытам</h4>
          <p>
            По времени десяти колебаний каждого опыта рассчитывается период{' '}
            <Tex>{String.raw`T_i = t_{10,i}/${N_OSC}`}</Tex>.
          </p>
          <DataTable
            rows={st.per}
            columns={[
              { key: 'i', label: '№' },
              { key: 't10', label: 't₁₀', unit: 'с', format: (v) => fmt(v, 2) },
              { key: 'T', label: 'Tᵢ = t₁₀/10', unit: 'с', format: (v) => fmt(v, 4) },
            ]}
          />
          <Subst
            items={st.per.map((r) =>
              String.raw`T_{${r.i}} = \frac{t_{10,${r.i}}}{${N_OSC}} = \frac{${fmt(r.t10, 2)}}{${N_OSC}} = ${fmt(r.T, 4)}\ \text{с}`
            )}
          />

          <h4>2. Средние значения и отклонения</h4>
          <Eq>{String.raw`\bar T = \frac{1}{N}\sum_{i=1}^{N}T_i, \qquad \Delta T_i = \left|T_i - \bar T\right|`}</Eq>
          <Subst
            items={st.per.map((r, i) =>
              String.raw`\left|T_{${i + 1}} - \bar T\right| = \left|${fmt(r.T, 4)} - ${fmt(st.TMean, 4)}\right| = ${fmt(st.tdev[i], 4)}\ \text{с}`
            )}
          />
          <Eq>{String.raw`\bar T = \frac{${st.Ts.map((v) => fmt(v, 4)).join(' + ')}}{${st.Ts.length}} = ${fmt(st.TMean, 4)}\ \text{с}`}</Eq>

          <h4>3. Средняя абсолютная погрешность периода</h4>
          <Eq>{String.raw`\Delta T = \frac{1}{N}\sum_{i=1}^{N}\left|T_i - \bar T\right| = \frac{${st.tdev.map((v) => fmt(v, 4)).join(' + ')}}{${st.tdev.length}} = ${fmt(st.dT, 4)}\ \text{с}`}</Eq>

          <h4>4. Относительная погрешность периода</h4>
          <Eq>{String.raw`\delta_{\text{отн},T} = \frac{\Delta T}{\bar T}\cdot 100\% = ${fmt(st.dTRel, 2)}\%`}</Eq>

          <h4>Логарифмический декремент: значения, среднее и погрешность</h4>
          <DataTable
            rows={PAIRS.map(([i, j], k) => ({
              i: k + 1,
              pair: `A${i} / A${j}`,
              Ai: st.A[i],
              Aj: st.A[j],
              d: st.deltas[k],
              dev: st.ddev[k],
            }))}
            columns={[
              { key: 'i', label: '№' },
              { key: 'pair', label: 'Отношение', txt: true },
              { key: 'Ai', label: 'Aᵢ', unit: 'град', format: (v) => fmt(v, 2) },
              { key: 'Aj', label: 'Aⱼ', unit: 'град', format: (v) => fmt(v, 2) },
              { key: 'd', label: 'δᵢ', format: (v) => fmt(v, 4) },
              { key: 'dev', label: '|δᵢ − δ̄|', format: (v) => fmt(v, 4) },
            ]}
          />
          <Subst
            items={PAIRS.map(([i, j], k) =>
              String.raw`\delta_{${k + 1}} = \ln\frac{${fmt(st.A[i], 2)}}{${fmt(st.A[j], 2)}} = ${fmt(st.deltas[k], 4)}, \qquad \left|\delta_{${k + 1}}-\bar\delta\right| = ${fmt(st.ddev[k], 4)}`
            )}
          />
          <Eq>{String.raw`\bar\delta = \frac{${st.deltas.map((v) => fmt(v, 4)).join(' + ')}}{${st.deltas.length}} = ${fmt(st.delta, 4)}, \qquad \Delta\delta = \frac{${st.ddev.map((v) => fmt(v, 4)).join(' + ')}}{${st.ddev.length}} = ${fmt(st.dDelta, 4)}`}</Eq>
          <Eq>{String.raw`\delta_{\text{отн},\delta} = \frac{\Delta\delta}{\bar\delta}\cdot 100\% = ${fmt(st.dDeltaRel, 2)}\%`}</Eq>

          <h4>Итоговые параметры затухающих колебаний</h4>
          <DataTable
            rows={[
              { p: 'Период T', v: `${fmt(st.TMean, 4)} с`, err: `±${fmt(st.dT, 4)} с (${fmt(st.dTRel, 2)} %)` },
              { p: 'Логарифмический декремент δ̄', v: fmt(st.delta, 4), err: `±${fmt(st.dDelta, 4)} (${fmt(st.dDeltaRel, 2)} %)` },
              { p: 'Коэффициент затухания β = δ̄/T', v: `${fmt(st.beta, 4)} с⁻¹`, err: `±${fmt(st.dBetaRel, 2)} %` },
              { p: 'Время релаксации τ = 1/β', v: `${fmt(st.tau, 2)} с`, err: `±${fmt(st.dTauRel, 2)} %` },
              { p: 'Циклическая частота ω', v: `${fmt(st.omega, 3)} рад/с`, err: '—' },
              { p: 'Добротность Q ≈ π/δ̄', v: fmt(st.Q, 1), err: `±${fmt(st.dQRel, 2)} %` },
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
