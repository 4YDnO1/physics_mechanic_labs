import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import Subst from '../../components/Subst.jsx'
import { fmt, mean } from '../../utils/stats.js'
import { DH, DR, DT_INSTR } from './content.jsx'

const T_ALPHA = { 2: 12.706, 3: 4.303, 4: 3.182, 5: 2.776, 6: 2.571, 7: 2.447, 8: 2.365, 9: 2.306, 10: 2.262 }

export function computeStats(rows) {
  if (!rows.length) return {}
  const ts = rows.map((r) => r.t)
  const n = ts.length
  const tMean = mean(ts)
  const dev = ts.map((t) => t - tMean)
  const sq = dev.map((d) => d * d)
  const sumSq = sq.reduce((s, x) => s + x, 0)
  const sn = n > 1 ? Math.sqrt(sumSq / (n * (n - 1))) : NaN
  const tAlpha = T_ALPHA[n] ?? 2.776
  const dtSl = tAlpha * sn
  const dt = dtSl + DT_INSTR
  const dtRel = (dt / tMean) * 100

  const h = rows[0].h
  const R = rows[0].R
  const a = (2 * h) / (tMean * tMean)
  const v = (2 * h) / tMean
  const w = v / R
  const eps = a / R
  const at = a
  const an = (v * v) / R
  const a0 = Math.sqrt(at * at + an * an)

  const dhRel = (DH / h) * 100
  const dRRel = (DR / R) * 100
  const daRel = dhRel + 2 * dtRel
  const dvRel = dhRel + dtRel
  const dwRel = dvRel + dRRel
  const depsRel = daRel + dRRel
  const datRel = daRel
  const danRel = 2 * dvRel + dRRel
  const da0 = Math.sqrt((at * ((datRel / 100) * at)) ** 2 + (an * ((danRel / 100) * an)) ** 2) / a0
  const da0Rel = (da0 / a0) * 100

  return {
    n, tMean, dev, sq, sumSq, sn, tAlpha, dtSl, dt, dtRel,
    h, R, a, v, w, eps, at, an, a0,
    dhRel, dRRel, daRel, dvRel, dwRel, depsRel, datRel, danRel, da0Rel,
    da: (daRel / 100) * a,
    dv: (dvRel / 100) * v,
    dw: (dwRel / 100) * w,
    deps: (depsRel / 100) * eps,
    dat: (datRel / 100) * at,
    dan: (danRel / 100) * an,
    da0,
  }
}

export default function Lab6Calc({ rows }) {
  const st = computeStats(rows)
  const has = rows.length > 0

  const t1 = rows.map((r, i) => ({
    i: i + 1,
    t: r.t,
    dev: st.dev[i],
    sq: st.sq[i],
  }))
  if (has) t1.push({ i: '', t: '', dev: 'Σ', sq: st.sumSq, __sum: true })

  const chars = has
    ? [
        { name: 'Ускорение', sym: 'a', val: st.a, rel: st.daRel, abs: st.da, unit: 'м/с²', d: 3 },
        { name: 'Скорость', sym: 'v', val: st.v, rel: st.dvRel, abs: st.dv, unit: 'м/с', d: 2 },
        { name: 'Угловая скорость', sym: 'ω', val: st.w, rel: st.dwRel, abs: st.dw, unit: 'рад/с', d: 2 },
        { name: 'Угловое ускорение', sym: 'ε', val: st.eps, rel: st.depsRel, abs: st.deps, unit: 'рад/с²', d: 2 },
        { name: 'Тангенц. ускорение', sym: 'a_τ', val: st.at, rel: st.datRel, abs: st.dat, unit: 'м/с²', d: 3 },
        { name: 'Нормальное ускорение', sym: 'a_n', val: st.an, rel: st.danRel, abs: st.dan, unit: 'м/с²', d: 2 },
        { name: 'Полное ускорение', sym: 'a_0', val: st.a0, rel: st.da0Rel, abs: st.da0, unit: 'м/с²', d: 2 },
      ]
    : []

  return (
    <>
      <h3>Обработка результатов измерений</h3>
      {!has && (
        <div className="tbl-empty">Нет данных для расчёта. Выполните измерения на вкладке «Эксперимент».</div>
      )}

      {has && (
        <>
          <h4>Таблица 1. Обработка времени падения</h4>
          <DataTable
            rows={t1}
            columns={[
              { key: 'i', label: '№' },
              { key: 't', label: 't', unit: 'с', format: (v) => fmt(v, 3) },
              { key: 'dev', label: 'Δt = t − t̄', unit: 'с', format: (v) => fmt(v, 3) },
              { key: 'sq', label: '(Δt)²', unit: 'с²', format: (v) => fmt(v, 5) },
            ]}
            caption="Среднее время t̄ и сумма квадратов отклонений"
          />
          <p>Среднее арифметическое значение времени:</p>
          <Eq>{String.raw`\bar t = \frac{${rows.map((r) => fmt(r.t, 3)).join(' + ')}}{${st.n}} = ${fmt(st.tMean, 3)}\ \text{с}`}</Eq>
          <p>Среднеквадратичная ошибка среднего арифметического:</p>
          <Eq>{String.raw`s_n = \sqrt{\frac{\sum(\Delta t_i)^2}{n(n-1)}} = \sqrt{\frac{${fmt(st.sumSq, 5)}}{${st.n}\cdot(${st.n}-1)}} = ${fmt(st.sn, 5)}\ \text{с}`}</Eq>

          <h4>Таблица 2. Коэффициент Стьюдента и случайная погрешность</h4>
          <DataTable
            rows={[
              { p: 'n (число измерений)', v: String(st.n) },
              { p: 'α (доверительная вероятность)', v: '0,95' },
              { p: 'tα (коэффициент Стьюдента)', v: fmt(st.tAlpha, 3) },
              { p: 'Δt_сл = tα · sₙ', v: `${fmt(st.dtSl, 5)} с` },
              { p: 'Δt_приб (погрешность секундомера)', v: `${fmt(DT_INSTR, 3)} с` },
              { p: 'Δt = Δt_сл + Δt_приб', v: `${fmt(st.dt, 5)} с` },
            ]}
            columns={[
              { key: 'p', label: 'Величина', txt: true },
              { key: 'v', label: 'Значение', txt: true },
            ]}
          />
          <p>Полная абсолютная и относительная погрешность времени:</p>
          <Eq>{String.raw`\Delta t = ${fmt(st.dtSl, 4)} + ${fmt(DT_INSTR, 3)} = ${fmt(st.dt, 4)}\ \text{с}, \qquad \delta_t = \frac{\Delta t}{\bar t}\cdot 100\% = ${fmt(st.dtRel, 2)}\%`}</Eq>
          <Eq>{String.raw`t = (${fmt(st.tMean, 3)} \pm ${fmt(st.dt, 4)})\ \text{с}`}</Eq>

          <h4>Подстановка значений по опытам</h4>
          <Subst
            items={rows.map((r, i) =>
              String.raw`t_{${i + 1}} = ${fmt(r.t, 3)}\ \text{с};\qquad \Delta t_{${i + 1}} = ${fmt(r.t, 3)} - ${fmt(st.tMean, 3)} = ${fmt(st.dev[i], 3)}\ \text{с};\qquad (\Delta t_{${i + 1}})^2 = ${fmt(st.sq[i], 5)}\ \text{с}^2`
            )}
          />

          <h3>Кинематические характеристики движения</h3>
          <p>
            По среднему времени <Tex>{String.raw`\bar t`}</Tex> при <Tex>{String.raw`h = ${fmt(st.h, 2)}`}</Tex>{' '}
            м и <Tex>{String.raw`R = ${fmt(st.R, 2)}`}</Tex> м вычисляются характеристики по
            формулам (2)–(7):
          </p>
          <Eq>{String.raw`a = \frac{2h}{\bar t^2} = ${fmt(st.a, 3)}\ \text{м/с}^2,\qquad v = \frac{2h}{\bar t} = ${fmt(st.v, 2)}\ \text{м/с}`}</Eq>
          <Eq>{String.raw`\omega = \frac{v}{R} = ${fmt(st.w, 2)}\ \text{рад/с},\qquad \varepsilon = \frac{a}{R} = ${fmt(st.eps, 2)}\ \text{рад/с}^2`}</Eq>
          <Eq>{String.raw`a_{\tau} = a = ${fmt(st.at, 3)}\ \text{м/с}^2,\qquad a_n = \frac{v^2}{R} = ${fmt(st.an, 2)}\ \text{м/с}^2,\qquad a_0 = \sqrt{a_{\tau}^2 + a_n^2} = ${fmt(st.a0, 2)}\ \text{м/с}^2`}</Eq>

          <h4>Таблица 3. Погрешности кинематических характеристик</h4>
          <p>
            Относительные погрешности высоты и радиуса:{' '}
            <Tex>{String.raw`\delta_h = ${fmt(st.dhRel, 3)}\%`}</Tex>,{' '}
            <Tex>{String.raw`\delta_R = ${fmt(st.dRRel, 3)}\%`}</Tex>. Относительные и абсолютные
            погрешности характеристик (формулы 14–17):
          </p>
          <DataTable
            rows={chars}
            columns={[
              { key: 'name', label: 'Величина', txt: true },
              { key: 'sym', label: 'Обозначение', txt: true },
              { key: 'val', label: 'Значение', format: (v, row) => fmt(v, row.d) },
              { key: 'unit', label: 'Ед.', txt: true },
              { key: 'rel', label: 'δ', unit: '%', format: (v) => fmt(v, 2) },
              { key: 'abs', label: 'Δ', format: (v, row) => fmt(v, row.d) },
            ]}
          />

          <div className="result-box">
            <div className="rb-main">
              Окончательные результаты:
            </div>
            <div className="rb-sub">
              <Tex>{String.raw`a = (${fmt(st.a, 3)} \pm ${fmt(st.da, 3)})\ \text{м/с}^2`}</Tex>,{' '}
              <Tex>{String.raw`v = (${fmt(st.v, 2)} \pm ${fmt(st.dv, 2)})\ \text{м/с}`}</Tex>,{' '}
              <Tex>{String.raw`\omega = (${fmt(st.w, 2)} \pm ${fmt(st.dw, 2)})\ \text{рад/с}`}</Tex>,{' '}
              <Tex>{String.raw`\varepsilon = (${fmt(st.eps, 2)} \pm ${fmt(st.deps, 2)})\ \text{рад/с}^2`}</Tex>.
              Движение груза равноускоренное; нормальное ускорение точки обода{' '}
              <Tex>{String.raw`a_n = ${fmt(st.an, 2)}`}</Tex> м/с² растёт с увеличением скорости.
            </div>
          </div>
        </>
      )}
    </>
  )
}
