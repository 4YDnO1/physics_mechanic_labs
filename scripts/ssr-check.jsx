import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../src/App.jsx'
import Lab1 from '../src/labs/lab1/index.jsx'
import Lab2 from '../src/labs/lab2/index.jsx'
import Lab3 from '../src/labs/lab3/index.jsx'
import Lab4 from '../src/labs/lab4/index.jsx'
import Lab5 from '../src/labs/lab5/index.jsx'
import { Theory as T1, Procedure as P1, Conclusions as C1 } from '../src/labs/lab1/content.jsx'
import { Theory as T2, Procedure as P2, Conclusions as C2 } from '../src/labs/lab2/content.jsx'
import { Theory as T3, Procedure as P3, Conclusions as C3 } from '../src/labs/lab3/content.jsx'
import { Theory as T4, Procedure as P4, Conclusions as C4 } from '../src/labs/lab4/content.jsx'
import { Theory as T5, Procedure as P5, Conclusions as C5 } from '../src/labs/lab5/content.jsx'
import Calc1, { computeStats as cs1 } from '../src/labs/lab1/calc.jsx'
import Calc2, { computeStats as cs2 } from '../src/labs/lab2/calc.jsx'
import Calc3, { computeStats as cs3 } from '../src/labs/lab3/calc.jsx'
import Calc4, { computeStats as cs4 } from '../src/labs/lab4/calc.jsx'
import Calc5, { computeStats as cs5 } from '../src/labs/lab5/calc.jsx'

const n = (cnt, o) => Array.from({ length: o ? cnt : 5 }, () => ({ ...(o ?? cnt) }))

const rows1 = n({ m: 0.1, t: 9.5, n1: 4.2, n2: 7.8, r: 0.04, h: 1.0 })
const rows2 = [
  ...n({ mode: 'elastic', m1: 0.2, m2: 0.3, a1: 30, a1p: 5, a2p: 15 }),
  ...n({ mode: 'inelastic', m1: 0.2, m2: 0.3, a1: 30, ap: 12 }),
]
const rows3 = n({ m: 0.1, t: 4.5, r: 0.03, R: 0.1, h: 1.0, Jz: 0.0244 })
const rows4 = n({ m: 0.01, M: 0.2, S1: 0.3, S2: 0.5, t: 1.32 })
const rows5 = [
  ...n(3, { vessel: 1, name: 'Сталь', rhoS: 7860, rhoL: 1250, r: 0.002, h: 0.1, l: 0.35, t: 5.1 }),
  ...n(3, { vessel: 1, name: 'Медь', rhoS: 8930, rhoL: 1250, r: 0.002, h: 0.1, l: 0.35, t: 5.1 }),
  ...n(3, { vessel: 2, name: 'Сталь', rhoS: 7860, rhoL: 900, r: 0.002, h: 0.1, l: 0.35, t: 5.1 }),
  ...n(3, { vessel: 2, name: 'Свинец', rhoS: 11340, rhoL: 900, r: 0.002, h: 0.1, l: 0.35, t: 5.1 }),
]

const checks = [
  ['App (каталог)', <App />],
  ['Лаб1 страница', <Lab1 />],
  ['Лаб2 страница', <Lab2 />],
  ['Лаб3 страница', <Lab3 />],
  ['Лаб4 страница', <Lab4 />],
  ['Лаб5 страница', <Lab5 />],
  ['Лаб1 теория+порядок', <><T1 /><P1 /></>],
  ['Лаб2 теория+порядок', <><T2 /><P2 /></>],
  ['Лаб3 теория+порядок', <><T3 /><P3 /></>],
  ['Лаб4 теория+порядок', <><T4 /><P4 /></>],
  ['Лаб5 теория+порядок', <><T5 /><P5 /></>],
  ['Лаб1 расчёты', <Calc1 rows={rows1} />],
  ['Лаб2 расчёты', <Calc2 rows={rows2} />],
  ['Лаб3 расчёты', <Calc3 rows={rows3} />],
  ['Лаб4 расчёты', <Calc4 rows={rows4} />],
  ['Лаб5 расчёты', <Calc5 rows={rows5} />],
  ['Лаб1 выводы', <C1 rows={rows1} stats={cs1(rows1)} />],
  ['Лаб2 выводы', <C2 rows={rows2} stats={cs2(rows2)} />],
  ['Лаб3 выводы', <C3 rows={rows3} stats={cs3(rows3)} />],
  ['Лаб4 выводы', <C4 rows={rows4} stats={cs4(rows4)} />],
  ['Лаб5 выводы', <C5 rows={rows5} stats={cs5(rows5).byLiq} />],
]

export function run() {
  let failed = 0
  for (const [name, el] of checks) {
    try {
      const html = renderToString(el)
      const errors = (html.match(/katex-error/g) || []).length
      if (errors > 0) {
        failed++
        console.log(`FAIL ${name}: ${errors} katex-error`)
      } else {
        console.log(`OK   ${name} (${html.length} симв.)`)
      }
    } catch (e) {
      failed++
      console.log(`ERR  ${name}: ${e.message}`)
    }
  }
  console.log(failed === 0 ? '\nSSR-проверка пройдена' : `\nПровалено проверок: ${failed}`)
  process.exitCode = failed === 0 ? 0 : 1
}
