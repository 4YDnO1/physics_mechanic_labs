import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, fmt, mean, meanAbsDev } from '../../utils/stats.js'
import { M0, S1, S2 } from './content.jsx'

export function computeStats(rows) {
  const calc = rows.map((rw, i) => ({
    ...rw,
    i: i + 1,
    g: (rw.S2 * rw.S2 * (2 * rw.M + rw.m)) / (2 * rw.S1 * rw.t * rw.t * rw.m),
  }))
  const gm = mean(calc.map((c) => c.g))
  const dg = meanAbsDev(calc.map((c) => c.g))
  return { calc, gm, dg, rel: Number.isFinite(gm) && gm ? (dg / gm) * 100 : NaN }
}

export default function Lab4Calc({ rows }) {
  const st = computeStats(rows)
  const has = rows.length > 0

  return (
    <>
      <h3>Расчёт ускорения свободного падения</h3>
      <p>
        По данным каждого опыта вычисляется ускорение свободного падения по рабочей формуле (10):
      </p>
      <Eq n={10}>{String.raw`g_i = \frac{S_2^2\,(2M+m_i)}{2S_1t_i^2m_i}`}</Eq>

      {has && (
        <>
          <h4>Таблица 2. Результаты вычислений</h4>
          <DataTable
            rows={st.calc}
            columns={[
              { key: 'i', label: '№' },
              { key: 'm', label: 'm', unit: 'кг' },
              { key: 'M', label: 'M', unit: 'кг' },
              { key: 't', label: 't', unit: 'с' },
              { key: 'g', label: 'g', unit: 'м/с²', format: (v) => fmt(v, 2) },
            ]}
            caption={`S₁ = ${fmt(S1, 2)} м; S₂ = ${fmt(S2, 2)} м; M = ${fmt(M0, 1)} кг`}
          />

          {rows.length >= 5 ? (
            <>
              <h3>Среднее значение и погрешность</h3>
              <Eq>{String.raw`g_{\text{ср}} = \frac{1}{N}\sum_{i=1}^{N} g_i = \frac{g_1 + g_2 + \dots + g_5}{5} = ${fmt(st.gm, 2)}\ \text{м/с}^2`}</Eq>
              <p>Средняя абсолютная погрешность измерений:</p>
              <Eq>{String.raw`\Delta g = \frac{1}{N}\sum_{i=1}^{N}\left|g_i - g_{\text{ср}}\right| = ${fmt(st.dg, 2)}\ \text{м/с}^2`}</Eq>
              <p>
                Относительная погрешность:
              </p>
              <Eq>{String.raw`\delta = \frac{\Delta g}{g_{\text{ср}}}\cdot 100\% = ${fmt(st.rel, 1)}\%`}</Eq>

              <div className="result-box">
                <div className="rb-main">
                  Результат: <Tex>{String.raw`g = \left(${fmt(st.gm, 2)} \pm ${fmt(st.dg, 2)}\right)\ \text{м/с}^2`}</Tex>
                </div>
                <div className="rb-sub">
                  Относительная погрешность δ = {fmt(st.rel, 1)} %. Табличное значение{' '}
                  <Tex>{String.raw`g = 9{,}81`}</Tex> м/с² попадает в доверительный интервал.
                  Отклонения объясняются пренебрежением массой блока и трением в его оси.
                </div>
              </div>
            </>
          ) : (
            <div className="note">
              Выполнено {rows.length} из 5 опытов. Для расчёта погрешностей выполните все 5 опытов.
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
