import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, fmt, mean, meanAbsDev } from '../../utils/stats.js'
import { LIQUIDS } from './content.jsx'

export function computeStats(rows) {
  const calc = rows.map((rw, i) => ({
    ...rw,
    i: i + 1,
    eta: (2 * rw.r * rw.r * G * (rw.rhoS - rw.rhoL) * rw.t) / (9 * rw.l),
  }))
  const byLiq = {}
  for (const liq of [1, 2]) {
    const sub = calc.filter((c) => c.vessel === liq)
    const etaM = mean(sub.map((c) => c.eta))
    const dEta = meanAbsDev(sub.map((c) => c.eta))
    byLiq[liq] = { sub, etaM, dEta, rel: Number.isFinite(etaM) && etaM ? (dEta / etaM) * 100 : NaN }
  }
  return { calc, byLiq }
}

function LiqCalc({ liq }) {
  const { sub, etaM, dEta, rel } = liq
  if (sub.length === 0) {
    return (
      <>
        <h3>Жидкость №{liq.n}</h3>
        <div className="tbl-empty">
          Нет данных для жидкости №{liq.n}. Выполните 5 опытов в соответствующем сосуде.
        </div>
      </>
    )
  }
  return (
    <>
      <h3>Жидкость №{liq.n} (ρж = {fmt(liq.rho, 0)} кг/м³)</h3>
      <DataTable
        rows={sub}
        columns={[
          { key: 'i', label: '№' },
          { key: 'rhoS', label: 'ρш', unit: 'кг/м³', format: (v) => fmt(v, 0) },
          { key: 'rhoL', label: 'ρж', unit: 'кг/м³', format: (v) => fmt(v, 0) },
          { key: 'r', label: 'r', unit: 'м' },
          { key: 'l', label: 'l', unit: 'м' },
          { key: 't', label: 't', unit: 'с' },
          { key: 'eta', label: 'η', unit: 'Па·с', format: (v) => fmt(v, 3) },
        ]}
        caption={`Расчёт по формуле (10): η = 2r²g(ρш − ρж)t / (9l)`}
      />
      {sub.length >= 5 ? (
        <>
          <p>
            Среднее значение коэффициента вязкости и средняя абсолютная погрешность:
          </p>
          <Eq>{String.raw`\eta_{\text{ср}} = ${fmt(etaM, 3)}\ \text{Па·с}, \qquad \Delta\eta = ${fmt(dEta, 3)}\ \text{Па·с}, \qquad \delta = ${fmt(rel, 1)}\%`}</Eq>
          <div className="result-box">
            <div className="rb-main">
              Результат: <Tex>{String.raw`\eta = \left(${fmt(etaM, 3)} \pm ${fmt(dEta, 3)}\right)\ \text{Па·с}`}</Tex>
            </div>
            <div className="rb-sub">Относительная погрешность δ = {fmt(rel, 1)} %.</div>
          </div>
        </>
      ) : (
        <div className="note">
          Выполнено {sub.length} из 5 опытов для жидкости №{liq.n}.
        </div>
      )}
    </>
  )
}

export default function Lab5Calc({ rows }) {
  const st = computeStats(rows)
  const has = rows.length > 0

  return (
    <>
      <h3>Расчёт коэффициента вязкости</h3>
      <p>
        По данным каждого опыта вычисляется коэффициент вязкости по рабочей формуле (10) —
        подстановкой <Tex>{String.raw`\nu = l/t`}</Tex> в формулу (9):
      </p>
      <Eq n={10}>{String.raw`\eta_i = \frac{2r^2g(\rho_{\text{ш}} - \rho_{\text{ж}})\,t_i}{9l}`}</Eq>
      <p>
        Здесь <Tex>{String.raw`r`}</Tex> — радиус шарика, <Tex>{String.raw`g = 9{,}81`}</Tex> м/с²,{' '}
        <Tex>{String.raw`\rho_{\text{ш}}`}</Tex> и <Tex>{String.raw`\rho_{\text{ж}}`}</Tex> —
        плотности материала шарика и жидкости, <Tex>{String.raw`t`}</Tex> — время прохождения
        расстояния <Tex>{String.raw`l`}</Tex> между метками.
      </p>

      {has ? (
        <div className="two-tables">
          <LiqCalc liq={{ n: 2, ...st.byLiq[2], rho: LIQUIDS[1].rho }} />
          <LiqCalc liq={{ n: 1, ...st.byLiq[1], rho: LIQUIDS[0].rho }} />
        </div>
      ) : (
        <div className="tbl-empty">Нет данных для расчёта. Выполните измерения на вкладке «Эксперимент».</div>
      )}
    </>
  )
}
