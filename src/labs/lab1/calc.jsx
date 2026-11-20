import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import Subst from '../../components/Subst.jsx'
import { fmt, mean, meanAbsDev } from '../../utils/stats.js'

const KEYS = [
  { key: 'a', sym: 'a', name: 'Ускорение', unit: 'м/с²', d: 3 },
  { key: 'v', sym: 'v', name: 'Скорость', unit: 'м/с', d: 2 },
  { key: 'w', sym: 'ω', name: 'Угловая скорость', unit: 'рад/с', d: 2 },
  { key: 'eps', sym: 'ε', name: 'Угловое ускорение', unit: 'рад/с²', d: 2 },
  { key: 'at', sym: 'aτ', name: 'Тангенц. ускорение', unit: 'м/с²', d: 3 },
  { key: 'an', sym: 'an', name: 'Нормальное ускорение', unit: 'м/с²', d: 2 },
  { key: 'a0', sym: 'a0', name: 'Полное ускорение', unit: 'м/с²', d: 2 },
]

export function computeStats(rows) {
  if (!rows.length) return {}

  const calc = rows.map((r, i) => {
    const a = (2 * r.h) / (r.t * r.t)
    const v = (2 * r.h) / r.t
    const w = v / r.R
    const eps = a / r.R
    const at = a
    const an = (v * v) / r.R
    const a0 = Math.sqrt(at * at + an * an)
    return { ...r, i: i + 1, a, v, w, eps, at, an, a0 }
  })

  const chars = {}
  for (const k of KEYS) {
    const vals = calc.map((c) => c[k.key])
    const avg = mean(vals)
    const dev = vals.map((v) => Math.abs(v - avg))
    chars[k.key] = {
      avg,
      dev,
      devSum: dev.reduce((s, x) => s + x, 0),
      d: meanAbsDev(vals),
      rel: Number.isFinite(avg) && avg !== 0 ? (meanAbsDev(vals) / avg) * 100 : NaN,
    }
  }

  const ts = rows.map((r) => r.t)
  const tMean = mean(ts)
  const tDev = ts.map((t) => Math.abs(t - tMean))
  const dT = meanAbsDev(ts)
  const dtRel = tMean ? (dT / tMean) * 100 : NaN

  const out = {
    calc, chars, keys: KEYS, tMean, tDev, dT, dtRel,
    h: calc[0].h, R: calc[0].R,
  }
  for (const k of KEYS) {
    out[k.key] = chars[k.key].avg
    out[`d${k.key.charAt(0).toUpperCase()}${k.key.slice(1)}`] = chars[k.key].d
    out[`${k.key}Rel`] = chars[k.key].rel
  }
  out.da = chars.a.d
  out.dv = chars.v.d
  out.dw = chars.w.d
  out.deps = chars.eps.d
  out.dat = chars.at.d
  out.dan = chars.an.d
  out.da0 = chars.a0.d
  return out
}

export default function Lab6Calc({ rows }) {
  const st = computeStats(rows)
  const has = rows.length > 0

  const charRows = has
    ? KEYS.map((k) => ({
        name: k.name,
        sym: k.sym,
        unit: k.unit,
        val: st.chars[k.key].avg,
        devSum: st.chars[k.key].devSum,
        d: st.chars[k.key].d,
        rel: st.chars[k.key].rel,
        dnum: k.d,
      }))
    : []

  return (
    <>
      <h3>Обработка результатов измерений</h3>
      {!has && (
        <div className="tbl-empty">Нет данных для расчёта. Выполните измерения на вкладке «Эксперимент».</div>
      )}

      {has && (
        <>
          <h4>1. Вычисление значений по опытам</h4>
          <p>
            Для каждого опыта по формулам (2)–(7) рассчитываются кинематические характеристики.
            Значения <Tex>{String.raw`h`}</Tex> и <Tex>{String.raw`R`}</Tex> берутся из
            соответствующего опыта.
          </p>
          <DataTable
            rows={st.calc}
            columns={[
              { key: 'i', label: '№' },
              { key: 't', label: 't', unit: 'с', format: (v) => fmt(v, 3) },
              { key: 'h', label: 'h', unit: 'м' },
              { key: 'R', label: 'R', unit: 'м' },
              { key: 'a', label: 'a', unit: 'м/с²', format: (v) => fmt(v, 3) },
              { key: 'v', label: 'v', unit: 'м/с', format: (v) => fmt(v, 2) },
              { key: 'w', label: 'ω', unit: 'рад/с', format: (v) => fmt(v, 2) },
              { key: 'eps', label: 'ε', unit: 'рад/с²', format: (v) => fmt(v, 2) },
              { key: 'an', label: 'aₙ', unit: 'м/с²', format: (v) => fmt(v, 2) },
              { key: 'a0', label: 'a₀', unit: 'м/с²', format: (v) => fmt(v, 2) },
            ]}
          />
          <p>Подстановка значений по опытам:</p>
          <Subst
            items={st.calc.map((r) =>
              String.raw`\begin{aligned}
a_{${r.i}} &= \frac{2h}{t_{${r.i}}^2} = ${fmt(r.a, 3)}\ \text{м/с}^2 && v_{${r.i}} = \frac{2h}{t_{${r.i}}} = ${fmt(r.v, 2)}\ \text{м/с}\\
\omega_{${r.i}} &= \frac{v_{${r.i}}}{R} = ${fmt(r.w, 2)}\ \text{рад/с} && \varepsilon_{${r.i}} = \frac{a_{${r.i}}}{R} = ${fmt(r.eps, 2)}\ \text{рад/с}^2\\
a_{\tau ${r.i}} &= a_{${r.i}} = ${fmt(r.at, 3)}\ \text{м/с}^2 && a_{n${r.i}} = \frac{v_{${r.i}}^2}{R} = ${fmt(r.an, 2)}\ \text{м/с}^2\\
a_{0${r.i}} &= \sqrt{a_{\tau ${r.i}}^2 + a_{n${r.i}}^2} = ${fmt(r.a0, 2)}\ \text{м/с}^2
\end{aligned}`
            )}
          />

          <h4>2. Средние значения и отклонения</h4>
          <Eq>{String.raw`\bar x = \frac{1}{N}\sum_{i=1}^{N} x_i, \qquad \Delta x_i = \left|x_i - \bar x\right|`}</Eq>
          <p>
            Среднее время падения: <Tex>{String.raw`\bar t = ${fmt(st.tMean, 3)}\ \text{с}`}</Tex>,
            средняя абсолютная погрешность времени{' '}
            <Tex>{String.raw`\Delta t = ${fmt(st.dT, 4)}\ \text{с}`}</Tex>. Отклонения времени по
            опытам:
          </p>
          <Subst
            items={st.calc.map((r, i) =>
              String.raw`\left|t_{${i + 1}} - \bar t\right| = \left|${fmt(r.t, 3)} - ${fmt(st.tMean, 3)}\right| = ${fmt(st.tDev[i], 3)}\ \text{с}`
            )}
          />
          <p>Отклонения кинематических характеристик от средних значений:</p>
          <Subst
            items={st.calc.map((r) =>
              String.raw`\begin{aligned}
\left|a_{${r.i}}-\bar a\right| &= ${fmt(st.chars.a.dev[r.i - 1], 3)} && \left|v_{${r.i}}-\bar v\right| &= ${fmt(st.chars.v.dev[r.i - 1], 2)}\\
\left|\omega_{${r.i}}-\bar\omega\right| &= ${fmt(st.chars.w.dev[r.i - 1], 2)} && \left|\varepsilon_{${r.i}}-\bar\varepsilon\right| &= ${fmt(st.chars.eps.dev[r.i - 1], 2)}\\
\left|a_{\tau ${r.i}}-\bar a_\tau\right| &= ${fmt(st.chars.at.dev[r.i - 1], 3)} && \left|a_{n${r.i}}-\bar a_n\right| &= ${fmt(st.chars.an.dev[r.i - 1], 2)}\\
\left|a_{0${r.i}}-\bar a_0\right| &= ${fmt(st.chars.a0.dev[r.i - 1], 2)}
\end{aligned}`
            )}
          />

          <h4>3. Средняя абсолютная погрешность</h4>
          <Eq>{String.raw`\Delta x = \frac{1}{N}\sum_{i=1}^{N}\left|x_i - \bar x\right|`}</Eq>
          <p>
            Средние абсолютные погрешности всех характеристик приведены в таблице (столбец Δ):
          </p>

          <h4>4. Относительная погрешность</h4>
          <Eq>{String.raw`\delta_x = \frac{\Delta x}{\bar x}\cdot 100\%`}</Eq>
          <DataTable
            rows={charRows}
            columns={[
              { key: 'name', label: 'Величина', txt: true },
              { key: 'sym', label: 'Обозначение', txt: true },
              { key: 'val', label: 'Среднее', format: (v, row) => fmt(v, row.dnum) },
              { key: 'devSum', label: 'Σ|откл.|', format: (v, row) => fmt(v, row.dnum) },
              { key: 'd', label: 'Δ', format: (v, row) => fmt(v, row.dnum) },
              { key: 'rel', label: 'δ, %', format: (v) => fmt(v, 2) },
              { key: 'unit', label: 'Ед.', txt: true },
            ]}
          />

          <div className="result-box">
            <div className="rb-main">Окончательные результаты:</div>
            <div className="rb-sub">
              <Tex>{String.raw`a = (${fmt(st.a, 3)} \pm ${fmt(st.da, 3)})\ \text{м/с}^2`}</Tex>,{' '}
              <Tex>{String.raw`v = (${fmt(st.v, 2)} \pm ${fmt(st.dv, 2)})\ \text{м/с}`}</Tex>,{' '}
              <Tex>{String.raw`\omega = (${fmt(st.w, 2)} \pm ${fmt(st.dw, 2)})\ \text{рад/с}`}</Tex>,{' '}
              <Tex>{String.raw`\varepsilon = (${fmt(st.eps, 2)} \pm ${fmt(st.deps, 2)})\ \text{рад/с}^2`}</Tex>.{' '}
              <Tex>{String.raw`a_0 = (${fmt(st.a0, 2)} \pm ${fmt(st.da0, 2)})\ \text{м/с}^2`}</Tex>.
              Относительная погрешность времени <Tex>{String.raw`\delta_t = ${fmt(st.dtRel, 2)}\%`}</Tex>.
              Движение груза равноускоренное; нормальное ускорение точки обода растёт с увеличением
              скорости.
            </div>
          </div>
        </>
      )}
    </>
  )
}
