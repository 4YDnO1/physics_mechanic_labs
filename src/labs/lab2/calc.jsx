import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import Subst from '../../components/Subst.jsx'
import { G, fmt, mean, meanAbsDev } from '../../utils/stats.js'

export function Jof(r, version) {
  if (version === 'print') {
    return r.m * r.r ** 2 * ((G * r.t ** 2 * r.h1) / (r.h * (r.h + r.h1)) - 1)
  }
  return (r.m * r.r ** 2 * r.n2 * (G * r.t ** 2 - 2 * r.h)) / (2 * r.h * (r.n1 + r.n2))
}

export function computeStats(rows, version) {
  const Js = rows.map((r) => Jof(r, version))
  const Jm = mean(Js)
  const dJ = meanAbsDev(Js)
  return { Jm, dJ, rel: Number.isFinite(Jm) && Jm !== 0 ? (dJ / Jm) * 100 : NaN }
}

export default function Lab1Calc({ version, rows }) {
  const isPrint = version === 'print'
  const calc = rows.map((r, idx) => ({ ...r, i: idx + 1, J: Jof(r, version) }))
  const st = computeStats(rows, version)
  const has = rows.length > 0

  const columns = isPrint
    ? [
        { key: 'i', label: '№' },
        { key: 'm', label: 'm', unit: 'кг' },
        { key: 'r', label: 'r', unit: 'м' },
        { key: 'h', label: 'h', unit: 'м' },
        { key: 'h1', label: 'h₁', unit: 'м' },
        { key: 't', label: 't', unit: 'с' },
        { key: 'J', label: 'J', unit: 'кг·м²', format: (v) => fmt(v, 4) },
      ]
    : [
        { key: 'i', label: '№' },
        { key: 'm', label: 'm', unit: 'кг' },
        { key: 'r', label: 'r', unit: 'м' },
        { key: 'h', label: 'h', unit: 'м' },
        { key: 't', label: 't', unit: 'с' },
        { key: 'n1', label: 'n₁', unit: 'об' },
        { key: 'n2', label: 'n₂', unit: 'об' },
        { key: 'J', label: 'J', unit: 'кг·м²', format: (v) => fmt(v, 4) },
      ]

  return (
    <>
      <h3>Расчёт момента инерции маховика</h3>
      {isPrint ? (
        <>
          <p>
            По данным каждого опыта вычисляется момент инерции маховика по рабочей формуле (12),
            полученной из закона сохранения энергии (см. вкладку «Теория»):
          </p>
          <Eq n={12}>{String.raw`J_i = m_i r^2\left(\frac{g\,t_i^2\,h_{1i}}{h\,(h + h_{1i})} - 1\right)`}</Eq>
          <p>
            где <Tex>{String.raw`g = 9{,}81`}</Tex> м/с² — ускорение свободного падения;{' '}
            <Tex>{String.raw`m_i`}</Tex> — масса груза; <Tex>{String.raw`r`}</Tex> — радиус шкива;{' '}
            <Tex>{String.raw`h`}</Tex> — высота падения груза; <Tex>{String.raw`t_i`}</Tex> — время
            падения; <Tex>{String.raw`h_{1i}`}</Tex> — высота подъёма груза после падения.
          </p>
        </>
      ) : (
        <>
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
        </>
      )}

      {has && (
        <>
          <h4>Таблица 2. Вычисление момента инерции</h4>
          <DataTable
            rows={calc}
            columns={columns}
            caption="Радиус шкива r и высота падения h берутся для каждого опыта (могут отличаться)"
          />

          <h4>Подстановка значений по опытам</h4>
          <p>
            Вычисление момента инерции для каждого опыта по формуле ({isPrint ? '12' : '13'}):
          </p>
          <Subst
            items={calc.map((r, i) =>
              isPrint
                ? String.raw`J_{${i + 1}} = ${fmt(r.m, 2)}\cdot ${fmt(r.r, 2)}^2\left(\frac{9{,}81\cdot ${fmt(r.t, 2)}^2\cdot ${fmt(r.h1, 3)}}{${fmt(r.h, 2)}\cdot\left(${fmt(r.h, 2)}+${fmt(r.h1, 3)}\right)} - 1\right) = ${fmt(r.J, 4)}\ \text{кг·м}^2`
                : String.raw`J_{${i + 1}} = \frac{${fmt(r.m, 2)}\cdot ${fmt(r.r, 2)}^2\cdot ${r.n2}\cdot\left(9{,}81\cdot ${fmt(r.t, 2)}^2 - 2\cdot ${fmt(r.h, 2)}\right)}{2\cdot ${fmt(r.h, 2)}\cdot\left(${r.n1}+${r.n2}\right)} = ${fmt(r.J, 4)}\ \text{кг·м}^2`
            )}
          />

          <h3>Расчёт погрешностей</h3>
          <p>Среднее значение момента инерции:</p>
          <Eq>{String.raw`J_{\text{ср}} = \frac{1}{N}\sum_{i=1}^{N} J_i = \frac{${calc.map((r) => fmt(r.J, 4)).join(' + ')}}{${calc.length}} = ${fmt(st.Jm, 4)}\ \text{кг·м}^2`}</Eq>
          <p>Отклонения результатов отдельных опытов от среднего:</p>
          <Subst
            items={calc.map((r, i) =>
              String.raw`\left|J_{${i + 1}} - J_{\text{ср}}\right| = \left|${fmt(r.J, 4)} - ${fmt(st.Jm, 4)}\right| = ${fmt(Math.abs(r.J - st.Jm), 4)}\ \text{кг·м}^2`
            )}
          />
          <p>Абсолютная погрешность — средняя абсолютная ошибка измерений:</p>
          <Eq>{String.raw`\Delta J = \frac{1}{N}\sum_{i=1}^{N}\left|J_i - J_{\text{ср}}\right| = \frac{${calc.map((r) => fmt(Math.abs(r.J - st.Jm), 4)).join(' + ')}}{${calc.length}} = ${fmt(st.dJ, 4)}\ \text{кг·м}^2`}</Eq>
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
