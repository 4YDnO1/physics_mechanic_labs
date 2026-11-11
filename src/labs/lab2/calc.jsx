import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import { G, fmt, mean } from '../../utils/stats.js'
import { L } from './content.jsx'

const K = 2 * Math.sqrt(G * L)
const sin2 = (degAngle) => Math.sin((degAngle * Math.PI) / 180 / 2)

export function computeStats(rows) {
  const calc = rows.map((r) => {
    const v1 = K * sin2(r.a1)
    if (r.mode === 'elastic') {
      const u1 = Math.sign(r.a1p || 1) * K * sin2(Math.abs(r.a1p))
      const u2 = K * sin2(r.a2p)
      const pb = r.m1 * v1
      const pa = r.m1 * u1 + r.m2 * u2
      return { ...r, v1, u1, u2, pb, pa, dp: Math.abs(pa - pb) / pb * 100 }
    }
    const u = K * sin2(r.ap)
    const pb = r.m1 * v1
    const pa = (r.m1 + r.m2) * u
    return { ...r, v1, u, pb, pa, dp: Math.abs(pa - pb) / pb * 100 }
  })
  const elast = calc.filter((c) => c.mode === 'elastic')
  const inel = calc.filter((c) => c.mode === 'inelastic')
  return {
    calc,
    elast: { n: elast.length, davg: mean(elast.map((e) => e.dp)) },
    inel: { n: inel.length, davg: mean(inel.map((e) => e.dp)) },
  }
}

export default function Lab2Calc({ rows }) {
  const st = computeStats(rows)
  const elast = st.calc.filter((c) => c.mode === 'elastic')
  const inel = st.calc.filter((c) => c.mode === 'inelastic')

  return (
    <>
      <h3>Проверка закона сохранения импульса</h3>
      <p>
        Скорости шаров до и после удара определяются по углам отклонения из формулы (13). При{' '}
        <Tex>{String.raw`l = ${fmt(L, 2)}`}</Tex> м множитель{' '}
        <Tex>{String.raw`2\sqrt{gl} = ${fmt(K, 2)}`}</Tex> м/с, поэтому:
      </p>
      <Eq>{String.raw`v_1 = 2\sqrt{gl}\,\sin\frac{\alpha_1}{2},\qquad u_1 = \pm 2\sqrt{gl}\,\sin\frac{|\alpha_1'|}{2},\qquad u_2 = 2\sqrt{gl}\,\sin\frac{\alpha_2'}{2}`}</Eq>
      <p>
        Знак <Tex>{String.raw`u_1`}</Tex> определяется направлением движения первого шара после
        удара (если <Tex>{String.raw`m_1 < m_2`}</Tex>, шар отскакивает назад — угол{' '}
        <Tex>{String.raw`\alpha_1' < 0`}</Tex>). Импульс системы до удара и после удара:
      </p>
      <Eq>{String.raw`p_{\text{до}} = m_1 v_1, \qquad p_{\text{после}} = m_1 u_1 + m_2 u_2 \ \ \text{(упругий)}, \qquad p_{\text{после}} = (m_1+m_2)u\ \ \text{(неупругий)}`}</Eq>
      <p>Относительное отклонение импульса в каждом опыте:</p>
      <Eq>{String.raw`\Delta p = \frac{|p_{\text{после}} - p_{\text{до}}|}{p_{\text{до}}}\cdot 100\%`}</Eq>

      {elast.length > 0 && (
        <>
          <h4>Таблица 3. Абсолютно упругий удар</h4>
          <DataTable
            rows={elast.map((r, i) => ({ ...r, i: i + 1 }))}
            columns={[
              { key: 'i', label: '№' },
              { key: 'a1', label: 'α₁', unit: '°' },
              { key: 'a1p', label: "α₁'", unit: '°' },
              { key: 'a2p', label: "α₂'", unit: '°' },
              { key: 'm1', label: 'm₁', unit: 'кг' },
              { key: 'm2', label: 'm₂', unit: 'кг' },
              { key: 'v1', label: 'v₁', unit: 'м/с', format: (v) => fmt(v, 2) },
              { key: 'u1', label: 'u₁', unit: 'м/с', format: (v) => fmt(v, 2) },
              { key: 'u2', label: 'u₂', unit: 'м/с', format: (v) => fmt(v, 2) },
              { key: 'pb', label: 'p до', unit: 'кг·м/с', format: (v) => fmt(v, 3) },
              { key: 'pa', label: 'p после', unit: 'кг·м/с', format: (v) => fmt(v, 3) },
              { key: 'dp', label: 'Δp', unit: '%', format: (v) => fmt(v, 1) },
            ]}
          />
          <p className="small dim">
            Среднее отклонение импульса при упругом ударе: <b>{fmt(st.elast.davg, 1)} %</b>.
          </p>
        </>
      )}

      {inel.length > 0 && (
        <>
          <h4>Таблица 4. Абсолютно неупругий удар</h4>
          <DataTable
            rows={inel.map((r, i) => ({ ...r, i: i + 1 }))}
            columns={[
              { key: 'i', label: '№' },
              { key: 'a1', label: 'α₁', unit: '°' },
              { key: 'ap', label: "α'", unit: '°' },
              { key: 'm1', label: 'm₁', unit: 'кг' },
              { key: 'm2', label: 'm₂', unit: 'кг' },
              { key: 'v1', label: 'v₁', unit: 'м/с', format: (v) => fmt(v, 2) },
              { key: 'u', label: 'u', unit: 'м/с', format: (v) => fmt(v, 2) },
              { key: 'pb', label: 'p до', unit: 'кг·м/с', format: (v) => fmt(v, 3) },
              { key: 'pa', label: 'p после', unit: 'кг·м/с', format: (v) => fmt(v, 3) },
              { key: 'dp', label: 'Δp', unit: '%', format: (v) => fmt(v, 1) },
            ]}
          />
          <p className="small dim">
            Среднее отклонение импульса при неупругом ударе: <b>{fmt(st.inel.davg, 1)} %</b>.
          </p>
        </>
      )}

      {(elast.length > 0 || inel.length > 0) && (
        <>
          <h4>Сравнение с теорией</h4>
          <p>
            По формулам (10) и (5) вычисляются теоретические углы отклонения после удара и
            сравниваются с измеренными:
          </p>
          <Eq>{String.raw`\sin\frac{\alpha_{1,\text{теор}}}{2} = \frac{m_1-m_2}{m_1+m_2}\sin\frac{\alpha_1}{2},\qquad \sin\frac{\alpha_{2,\text{теор}}}{2} = \frac{2m_1}{m_1+m_2}\sin\frac{\alpha_1}{2},\qquad \sin\frac{\alpha_{\text{теор}}}{2} = \frac{m_1}{m_1+m_2}\sin\frac{\alpha_1}{2}`}</Eq>
          <DataTable
            rows={st.calc.map((r, i) => {
              const s1 = sin2(r.a1)
              const at1 = r.mode === 'elastic' ? 2 * Math.asin(((r.m1 - r.m2) / (r.m1 + r.m2)) * s1) * 180 / Math.PI : null
              const at2 = r.mode === 'elastic' ? 2 * Math.asin((2 * r.m1 / (r.m1 + r.m2)) * s1) * 180 / Math.PI : null
              const at = r.mode === 'inelastic' ? 2 * Math.asin((r.m1 / (r.m1 + r.m2)) * s1) * 180 / Math.PI : null
              return {
                i: i + 1,
                mode: r.mode === 'elastic' ? 'упругий' : 'неупругий',
                meas: r.mode === 'elastic' ? `${fmt(r.a1p, 1)} / ${fmt(r.a2p, 1)}` : fmt(r.ap, 1),
                theor: r.mode === 'elastic' ? `${fmt(at1, 1)} / ${fmt(at2, 1)}` : fmt(at, 1),
              }
            })}
            columns={[
              { key: 'i', label: '№' },
              { key: 'mode', label: 'Вид удара', txt: true },
              { key: 'meas', label: "α' измеренные", unit: '°' },
              { key: 'theor', label: "α' теоретические", unit: '°' },
            ]}
            caption="Измеренные углы (α₁' / α₂' или α') против теоретических"
          />
        </>
      )}

      {rows.length === 0 && (
        <div className="tbl-empty">Нет данных для расчёта. Выполните измерения на вкладке «Эксперимент».</div>
      )}

      {rows.length > 0 && (
        <div className="result-box">
          <div className="rb-main">Закон сохранения импульса выполняется</div>
          <div className="rb-sub">
            {st.elast.n > 0 && <>Упругий удар: среднее отклонение Δp = {fmt(st.elast.davg, 1)} % ({st.elast.n} опытов). </>}
            {st.inel.n > 0 && <>Неупругий удар: среднее отклонение Δp = {fmt(st.inel.davg, 1)} % ({st.inel.n} опытов).</>}
          </div>
        </div>
      )}
    </>
  )
}
