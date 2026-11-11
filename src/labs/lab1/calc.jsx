import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, fmt, mean, meanAbsDev } from '../../utils/stats.js'

export function computeStats(rows) {
  const Js = rows.map((r) => (r.m * r.r ** 2 * r.n2 * (G * r.t ** 2 - 2 * r.h)) / (2 * r.h * (r.n1 + r.n2)))
  const Jm = mean(Js)
  const dJ = meanAbsDev(Js)
  return { Jm, dJ, rel: Number.isFinite(Jm) && Jm !== 0 ? (dJ / Jm) * 100 : NaN }
}

export default function Lab1Calc({ rows }) {
  const calc = rows.map((r, idx) => ({
    ...r,
    i: idx + 1,
    J: (r.m * r.r ** 2 * r.n2 * (G * r.t ** 2 - 2 * r.h)) / (2 * r.h * (r.n1 + r.n2)),
  }))
  const st = computeStats(rows)
  const has = rows.length > 0

  return (
    <>
      <h3>Расчёт момента инерции маховика</h3>
      <p>
        По данным каждого опыта вычисляется момент инерции маховика по рабочей формуле (13),
        полученной из закона сохранения энергии (см. вкладку «Теория»):
      </p>
      <Eq n={13}>{String.raw`J_i = \frac{m_i r^2 n_{2i}\,(g t_i^2 - 2h)}{2h\,(n_{1i}+n_{2i})}`}</Eq>
      <p>
        где <Tex>{String.raw`g = 9{,}81`}</Tex> м/с² — ускорение свободного падения;{' '}
        <Tex>{String.raw`m_i`}</Tex> — масса груза; <Tex>{String.raw`r`}</Tex> — радиус шкива;{' '}
        <Tex>{String.raw`h`}</Tex> — высота падения груза; <Tex>{String.raw`t_i`}</Tex> — время
        падения; <Tex>{String.raw`n_{1i},\ n_{2i}`}</Tex> — числа оборотов маховика при падении
        груза и до полной остановки.
      </p>

      {has && (
        <>
          <h4>Таблица 2. Вычисление момента инерции</h4>
          <DataTable
            rows={calc}
            columns={[
              { key: 'i', label: '№' },
              { key: 'm', label: 'm', unit: 'кг' },
              { key: 't', label: 't', unit: 'с' },
              { key: 'n1', label: 'n₁', unit: 'об' },
              { key: 'n2', label: 'n₂', unit: 'об' },
              { key: 'J', label: 'J', unit: 'кг·м²', format: (v) => fmt(v, 4) },
            ]}
            caption={`Радиус шкива r = ${fmt(rows[0].r, 2)} м, высота падения h = ${fmt(rows[0].h, 2)} м`}
          />

          <h3>Расчёт погрешностей</h3>
          <p>Среднее значение момента инерции:</p>
          <Eq>{String.raw`J_{\text{ср}} = \frac{1}{N}\sum_{i=1}^{N} J_i = ${fmt(st.Jm, 4)}\ \text{кг·м}^2`}</Eq>
          <p>
            Абсолютная погрешность — средняя абсолютная ошибка измерений (отклонение результатов
            отдельных опытов от среднего):
          </p>
          <Eq>{String.raw`\Delta J = \frac{1}{N}\sum_{i=1}^{N}\left|J_i - J_{\text{ср}}\right| = ${fmt(st.dJ, 4)}\ \text{кг·м}^2`}</Eq>
          <p>Относительная погрешность:</p>
          <Eq>{String.raw`\delta_J = \frac{\Delta J}{J_{\text{ср}}}\cdot 100\% = ${fmt(st.rel, 1)}\%`}</Eq>

          <div className="result-box">
            <div className="rb-main">
              Результат: <Tex>{String.raw`J = \left(${fmt(st.Jm, 4)} \pm ${fmt(st.dJ, 4)}\right)\ \text{кг·м}^2`}</Tex>
            </div>
            <div className="rb-sub">
              Относительная погрешность измерений: <b>δ = {fmt(st.rel, 1)} %</b>. Истинное значение
              лежит в интервале <Tex>{String.raw`J_{\text{ср}} - \Delta J \le J \le J_{\text{ср}} + \Delta J`}</Tex> с
              вероятностью, близкой к единице.
            </div>
          </div>
        </>
      )}
      {!has && (
        <div className="tbl-empty">
          Нет данных для расчёта. Выполните измерения на вкладке «Эксперимент».
        </div>
      )}
    </>
  )
}
