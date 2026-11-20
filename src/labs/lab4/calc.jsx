import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import Subst from '../../components/Subst.jsx'
import { G, fmt, mean, meanAbsDev } from '../../utils/stats.js'
import { LIQUIDS } from './content.jsx'

export function computeStats(rows, version = 'web') {
  const calc = rows.map((rw, i) => ({
    ...rw,
    i: i + 1,
    eta: (2 * rw.r * rw.r * G * (rw.rhoS - rw.rhoL) * rw.t) / (9 * rw.l),
  }))
  const byLiq = {}
  for (const liq of [1, 2]) {
    const sub = calc.filter((c) => c.vessel === liq)
    const names = [...new Set(sub.map((c) => c.name))]
    const groups = names.map((name) => {
      const g = sub.filter((c) => c.name === name)
      const etaM = mean(g.map((c) => c.eta))
      const dEta = meanAbsDev(g.map((c) => c.eta))
      return {
        name,
        rhoS: g[0].rhoS,
        rows: g,
        n: g.length,
        etaM,
        dEta,
        rel: Number.isFinite(etaM) && etaM ? (dEta / etaM) * 100 : NaN,
      }
    })
    byLiq[liq] = { sub, groups }
  }
  return { calc, byLiq }
}

function GroupResult({ g }) {
  if (g.n < 3) {
    return (
      <div className="note" key={g.name}>
        Шарик «{g.name}» (ρш = {fmt(g.rhoS, 0)} кг/м³): выполнено {g.n} опыта из 3 — для расчёта
        погрешностей нужно минимум 3 опыта с этим материалом.
      </div>
    )
  }
  return (
    <div className="result-box" key={g.name}>
      <div className="rb-main">
        Шарик «{g.name}» (ρш = {fmt(g.rhoS, 0)} кг/м³):{' '}
        <Tex>{String.raw`\eta = \left(${fmt(g.etaM, 3)} \pm ${fmt(g.dEta, 3)}\right)\ \text{Па·с}`}</Tex>
      </div>
      <div className="rb-sub">
        По {g.n} опытам: <Tex>{String.raw`\eta_{\text{ср}} = ${fmt(g.etaM, 3)}`}</Tex> Па·с;{' '}
        <Tex>{String.raw`\Delta\eta = ${fmt(g.dEta, 3)}`}</Tex> Па·с; относительная погрешность δ ={' '}
        {fmt(g.rel, 1)} %.
      </div>
      <Eq>{String.raw`\eta_{\text{ср}} = \frac{1}{N}\sum_{i=1}^{N}\eta_i = \frac{${g.rows.map((r) => fmt(r.eta, 3)).join(' + ')}}{${g.n}} = ${fmt(g.etaM, 3)}\ \text{Па·с}`}</Eq>
      <p className="small dim">Отклонения опытов серии от среднего:</p>
      <Subst
        items={g.rows.map((r, i) =>
          String.raw`\left|\eta_{${i + 1}} - \eta_{\text{ср}}\right| = \left|${fmt(r.eta, 3)} - ${fmt(g.etaM, 3)}\right| = ${fmt(Math.abs(r.eta - g.etaM), 3)}\ \text{Па·с}`
        )}
      />
      <Eq>{String.raw`\Delta\eta = \frac{1}{N}\sum_{i=1}^{N}\left|\eta_i - \eta_{\text{ср}}\right| = \frac{${g.rows.map((r) => fmt(Math.abs(r.eta - g.etaM), 3)).join(' + ')}}{${g.n}} = ${fmt(g.dEta, 3)}\ \text{Па·с}`}</Eq>
    </div>
  )
}

function LiqCalc({ liq, version = 'web' }) {
  const { sub, groups } = liq
  const isPrint = version === 'print'
  if (sub.length === 0) {
    return (
      <>
        <h3>Таблица {liq.n}. Жидкость №{liq.n}</h3>
        <div className="tbl-empty">
          Нет данных для жидкости №{liq.n}. Выполните измерения в соответствующем сосуде.
        </div>
      </>
    )
  }
  return (
    <>
      <h3>Таблица {liq.n}. Жидкость №{liq.n} (ρж = {fmt(liq.rho, 0)} кг/м³)</h3>
      <DataTable
        rows={sub.map((r, i) => ({ ...r, i: i + 1, rhoSg: r.rhoS / 1000, rhoLg: r.rhoL / 1000 }))}
        columns={
          isPrint
            ? [
                { key: 'i', label: '№' },
                { key: 'name', label: 'Шарик', txt: true },
                { key: 'rhoS', label: 'ρш', unit: 'кг/м³', format: (v) => fmt(v, 0) },
                { key: 'rhoSg', label: 'ρш', unit: 'г/см³', format: (v) => fmt(v, 2) },
                { key: 'rhoL', label: 'ρж', unit: 'кг/м³', format: (v) => fmt(v, 0) },
                { key: 'rhoLg', label: 'ρж', unit: 'г/см³', format: (v) => fmt(v, 2) },
                { key: 'r', label: 'r', unit: 'м' },
                { key: 'l', label: 'l', unit: 'м' },
                { key: 't', label: 't', unit: 'с' },
                { key: 'eta', label: 'η', unit: 'Па·с', format: (v) => fmt(v, 3) },
              ]
            : [
                { key: 'i', label: '№' },
                { key: 'name', label: 'Шарик', txt: true },
                { key: 'rhoS', label: 'ρш', unit: 'кг/м³', format: (v) => fmt(v, 0) },
                { key: 'rhoL', label: 'ρж', unit: 'кг/м³', format: (v) => fmt(v, 0) },
                { key: 'r', label: 'r', unit: 'м' },
                { key: 'l', label: 'l', unit: 'м' },
                { key: 't', label: 't', unit: 'с' },
                { key: 'eta', label: 'η', unit: 'Па·с', format: (v) => fmt(v, 3) },
              ]
        }
        caption={`Расчёт по формуле (10): η = 2r²g(ρш − ρж)t / (9l)`}
      />
      <h4>Подстановка значений по опытам</h4>
      <Subst
        items={sub.map((r, i) =>
          String.raw`\eta_{${i + 1}} = \frac{2r^2g(\rho_{\text{ш}} - \rho_{\text{ж}})\,t_{${i + 1}}}{9l} = \frac{2\cdot ${fmt(r.r, 3)}^2\cdot 9{,}81\cdot(${fmt(r.rhoS, 0)} - ${fmt(r.rhoL, 0)})\cdot ${fmt(r.t, 2)}}{9\cdot ${fmt(r.l, 2)}} = ${fmt(r.eta, 3)}\ \text{Па·с}`
        )}
      />
      <p>
        Средние значения и погрешности вычисляются <b>отдельно для каждого материала шарика</b>{' '}
        (серии из не менее чем 3 опытов):
      </p>
      <Eq>{String.raw`\eta_{\text{ср}} = \frac{1}{N}\sum_{i=1}^{N}\eta_i, \qquad \Delta\eta = \frac{1}{N}\sum_{i=1}^{N}\left|\eta_i - \eta_{\text{ср}}\right|`}</Eq>
      {groups.map((g) => (
        <GroupResult g={g} key={g.name} />
      ))}
      {groups.length >= 2 && (
        <p className="small dim">
          Сравнение серий с разными шариками: значения <Tex>{String.raw`\eta`}</Tex> в пределах
          погрешностей совпадают — вязкость определяется свойствами жидкости, а не материалом
          шарика.
        </p>
      )}
    </>
  )
}

export default function Lab5Calc({ rows, version = 'web' }) {
  const st = computeStats(rows, version)
  const has = rows.length > 0
  const isPrint = version === 'print'

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
        расстояния <Tex>{String.raw`l`}</Tex> между метками. Для каждой жидкости выполняются серии
        опытов минимум с двумя материалами шариков — погрешности рассчитываются для каждой серии
        отдельно.
        {isPrint && (
          <>
            {' '}В таблицах плотности приведены в кг/м³ и г/см³ (1 г/см³ = 1000 кг/м³), а значение{' '}
            <Tex>{String.raw`\eta`}</Tex> вычислено по каждому опыту.
          </>
        )}
      </p>

      {has ? (
        <>
          <LiqCalc version={version} liq={{ n: 1, ...st.byLiq[1], rho: LIQUIDS[0].rho }} />
          <LiqCalc version={version} liq={{ n: 2, ...st.byLiq[2], rho: LIQUIDS[1].rho }} />
        </>
      ) : (
        <div className="tbl-empty">Нет данных для расчёта. Выполните измерения на вкладке «Эксперимент».</div>
      )}
    </>
  )
}
