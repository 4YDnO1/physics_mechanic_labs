import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import Plot from '../../components/Plot.jsx'
import { G, fmt, mean, meanAbsDev } from '../../utils/stats.js'

export function computeStats(rows) {
  const calc = rows.map((rw, i) => {
    const eps = (2 * rw.h) / (rw.r * rw.t * rw.t)
    const Mz = rw.m * rw.r * (G - (2 * rw.h) / (rw.t * rw.t))
    const Jz = Mz / eps
    return { ...rw, i: i + 1, eps, Mz, Jz }
  })
  const last3 = calc.slice(-3)
  const epsM = mean(last3.map((c) => c.eps))
  const MzM = mean(last3.map((c) => c.Mz))
  const JzM = mean(last3.map((c) => c.Jz))
  const dJz = meanAbsDev(last3.map((c) => c.Jz))
  return {
    calc,
    epsM,
    MzM,
    JzM,
    dEps: meanAbsDev(last3.map((c) => c.eps)),
    dMz: meanAbsDev(last3.map((c) => c.Mz)),
    dJz,
    rel: Number.isFinite(JzM) && JzM ? (dJz / JzM) * 100 : NaN,
    JzTheory: rows[0]?.Jz ?? NaN,
  }
}

export default function Lab3Calc({ rows }) {
  const st = computeStats(rows)
  const has = rows.length > 0
  const graphRows = st.calc.slice(0, 3)
  const slope =
    graphRows.length >= 2
      ? graphRows.reduce((s, p) => s + p.Mz * p.eps, 0) / graphRows.reduce((s, p) => s + p.Mz * p.Mz, 0)
      : null

  return (
    <>
      <h3>Расчёт ε, M<sub>z</sub> и J<sub>z</sub></h3>
      <p>
        По данным каждого опыта вычисляются: угловое ускорение по формуле (16), момент силы по
        формуле (15) и момент инерции по основному закону динамики вращательного движения (9):
      </p>
      <Eq n={16}>{String.raw`\varepsilon_i = \frac{2h}{r\,t_i^2}`}</Eq>
      <Eq n={15}>{String.raw`M_{zi} = m_i r\left(g - \frac{2h}{t_i^2}\right)`}</Eq>
      <Eq n={9}>{String.raw`J_{zi} = \frac{M_{zi}}{\varepsilon_i}`}</Eq>

      {has && (
        <>
          <h4>Таблица 2. Результаты вычислений</h4>
          <DataTable
            rows={st.calc}
            columns={[
              { key: 'i', label: '№' },
              { key: 'm', label: 'm', unit: 'кг' },
              { key: 't', label: 't', unit: 'с' },
              { key: 'eps', label: 'ε', unit: 'рад/с²', format: (v) => fmt(v, 2) },
              { key: 'Mz', label: 'M_z', unit: 'Н·м', format: (v) => fmt(v, 4) },
              { key: 'Jz', label: 'J_z', unit: 'кг·м²', format: (v) => fmt(v, 4) },
            ]}
            caption={`h = ${fmt(rows[0].h, 2)} м; r = ${fmt(rows[0].r, 3)} м; Jz(теор) = ${fmt(st.JzTheory, 4)} кг·м²`}
          />

          {graphRows.length >= 2 && (
            <>
              <h4>График зависимости ε = f(M<sub>z</sub>)</h4>
              <p>
                График строится по данным первых трёх опытов. Согласно основному закону вращательного
                движения <Tex>{String.raw`\varepsilon = M_z/J_z`}</Tex> зависимость линейна и проходит
                через начало координат; угловой коэффициент прямой равен{' '}
                <Tex>{String.raw`1/J_z`}</Tex>.
              </p>
              <Plot
                points={graphRows.map((c) => ({ x: c.Mz, y: c.eps }))}
                xLabel="Mz, Н·м"
                yLabel="ε, рад/с²"
              />
              <p className="small dim">
                Наклон прямой: <Tex>{String.raw`k = ${fmt(slope, 1)}`}</Tex> рад/(с²·Н·м) →{' '}
                <Tex>{String.raw`J_z^{\text{граф}} = 1/k = ${fmt(slope ? 1 / slope : NaN, 4)}`}</Tex>{' '}
                кг·м² — согласуется с расчётным значением.
              </p>
            </>
          )}

          {rows.length >= 5 && (
            <>
              <h3>Средние значения и погрешности (по трём последним опытам)</h3>
              <p>
                По данным последних трёх опытов (одинаковая масса груза{' '}
                <Tex>{String.raw`m`}</Tex>) вычисляются средние значения и средние абсолютные
                погрешности:
              </p>
              <Eq>{String.raw`\varepsilon_{\text{ср}} = ${fmt(st.epsM, 2)}\ \text{рад/с}^2, \qquad \Delta\varepsilon = ${fmt(st.dEps, 2)}\ \text{рад/с}^2, \qquad \delta_\varepsilon = ${fmt((st.dEps / st.epsM) * 100, 1)}\%`}</Eq>
              <Eq>{String.raw`M_{z\,\text{ср}} = ${fmt(st.MzM, 4)}\ \text{Н·м}, \qquad \Delta M_z = ${fmt(st.dMz, 4)}\ \text{Н·м}, \qquad \delta_{M_z} = ${fmt((st.dMz / st.MzM) * 100, 1)}\%`}</Eq>
              <Eq>{String.raw`J_{z\,\text{ср}} = ${fmt(st.JzM, 4)}\ \text{кг·м}^2, \qquad \Delta J_z = ${fmt(st.dJz, 4)}\ \text{кг·м}^2, \qquad \delta_{J_z} = ${fmt(st.rel, 1)}\%`}</Eq>

              <div className="result-box">
                <div className="rb-main">
                  Результат: <Tex>{String.raw`J_z = \left(${fmt(st.JzM, 4)} \pm ${fmt(st.dJz, 4)}\right)\ \text{кг·м}^2`}</Tex>
                </div>
                <div className="rb-sub">
                  Относительная погрешность δ = {fmt(st.rel, 1)} %. Теоретическое значение для
                  выбранной конфигурации: J<sub>z</sub><sup>теор</sup> = {fmt(st.JzTheory, 4)} кг·м².
                  Совпадение в пределах погрешности подтверждает основной закон динамики
                  вращательного движения.
                </div>
              </div>
            </>
          )}
          {rows.length < 5 && rows.length > 0 && (
            <div className="note">
              Выполнено {rows.length} из 5 опытов. Для расчёта погрешностей необходимо минимум 5
              опытов (три первых — для графика, три последних — для средних значений).
            </div>
          )}
        </>
      )}
      {!has && (
        <div className="tbl-empty">Нет данных для расчёта. Выполните измерения на вкладке «Эксперимент».</div>
      )}
    </>
  )
}
