import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../src/App.jsx'
import Lab1 from '../src/labs/lab1/index.jsx'
import Lab2 from '../src/labs/lab2/index.jsx'
import Lab3 from '../src/labs/lab3/index.jsx'
import Lab4 from '../src/labs/lab4/index.jsx'
import Lab5 from '../src/labs/lab5/index.jsx'
import Lab6 from '../src/labs/lab6/index.jsx'
import Lab7 from '../src/labs/lab7/index.jsx'
import { Theory as T1, Procedure as P1, Conclusions as C1 } from '../src/labs/lab1/content.jsx'
import { Theory as T2, Procedure as P2, Conclusions as C2 } from '../src/labs/lab2/content.jsx'
import { Theory as T3, Procedure as P3, Conclusions as C3 } from '../src/labs/lab3/content.jsx'
import { Theory as T4, Procedure as P4, Conclusions as C4 } from '../src/labs/lab4/content.jsx'
import { Theory as T5, Procedure as P5, Conclusions as C5 } from '../src/labs/lab5/content.jsx'
import { Theory as T6, Procedure as P6, Conclusions as C6 } from '../src/labs/lab6/content.jsx'
import { Theory as T7, Procedure as P7, Conclusions as C7 } from '../src/labs/lab7/content.jsx'
import Calc1, { computeStats as cs1 } from '../src/labs/lab1/calc.jsx'
import Calc2, { computeStats as cs2 } from '../src/labs/lab2/calc.jsx'
import Calc3, { computeStats as cs3 } from '../src/labs/lab3/calc.jsx'
import Calc4, { computeStats as cs4 } from '../src/labs/lab4/calc.jsx'
import Calc5, { computeStats as cs5 } from '../src/labs/lab5/calc.jsx'
import Calc6, { computeStats as cs6 } from '../src/labs/lab6/calc.jsx'
import Calc7, { computeStats as cs7 } from '../src/labs/lab7/calc.jsx'

const n = (cnt, o) => Array.from({ length: o ? cnt : 5 }, () => ({ ...(o ?? cnt) }))

const rows1 = [
  { R: 0.05, h: 1.5, t: 3.83 },
  { R: 0.05, h: 1.5, t: 3.86 },
  { R: 0.05, h: 1.5, t: 3.84 },
  { R: 0.05, h: 1.5, t: 3.85 },
  { R: 0.05, h: 1.5, t: 3.85 },
]
const rows2 = n({ m: 0.1, t: 9.5, n1: 4.2, n2: 7.8, r: 0.04, h: 1.0 })
const rows2p = n({ m: 0.1, t: 6.45, h1: 0.735, r: 0.04, h: 1.0 })
const rows3 = [
  ...n({ mode: 'elastic', m1: 0.2, m2: 0.3, a1: 30, a1p: 5, a2p: 15 }),
  ...n({ mode: 'inelastic', m1: 0.2, m2: 0.3, a1: 30, ap: 12 }),
]
const rows3p = [
  ...n({ mode: 'elastic', m1: 0.112, m2: 0.112, a1: 10, a1p: 0, a2p: 10 }),
  ...n({ mode: 'elastic', m1: 0.112, m2: 0.04, a1: 10, a1p: 4.7, a2p: 14.7 }),
  ...n({ mode: 'inelastic', m1: 0.112, m2: 0.04, a1: 10, ap: 7.4 }),
]
const rows4 = [
  ...n(3, { vessel: 1, name: 'Сталь', rhoS: 7860, rhoL: 1250, r: 0.002, h: 0.1, l: 0.35, t: 5.1 }),
  ...n(3, { vessel: 1, name: 'Медь', rhoS: 8930, rhoL: 1250, r: 0.002, h: 0.1, l: 0.35, t: 5.1 }),
  ...n(3, { vessel: 2, name: 'Сталь', rhoS: 7860, rhoL: 900, r: 0.002, h: 0.1, l: 0.35, t: 5.1 }),
  ...n(3, { vessel: 2, name: 'Свинец', rhoS: 11340, rhoL: 900, r: 0.002, h: 0.1, l: 0.35, t: 5.1 }),
]
const rows5 = [
  ...n(3, { kind: 'T', t10: 18.24, A0: 5 }),
  { kind: 'A', A: [5, 4.5, 4.05, 3.64, 3.27, 2.94, 2.64, 2.38, 2.14, 1.92] },
]
const rows6 = n({ m: 0.01, M: 0.2, S1: 0.3, S2: 0.5, t: 1.32 })
const rows6p = n({ m: 0.01, M: 0.2, S: 0.3, t: 0.79 })
const rows7 = n({ m: 0.1, t: 4.5, r: 0.03, R: 0.1, h: 1.0, Jz: 0.0244 })

const checks = [
  ['App (каталог)', <App />],
  ['Лаб1 страница', <Lab1 />],
  ['Лаб2 страница', <Lab2 />],
  ['Лаб3 страница', <Lab3 />],
  ['Лаб4 страница', <Lab4 />],
  ['Лаб5 страница', <Lab5 />],
  ['Лаб6 страница', <Lab6 />],
  ['Лаб7 страница', <Lab7 />],
  ['Лаб1 теория+порядок', <><T1 /><P1 /></>],
  ['Лаб1 теория+порядок (печатн.)', <><T1 version="print" /><P1 version="print" /></>],
  ['Лаб2 теория+порядок', <><T2 /><P2 /></>],
  ['Лаб2 теория+порядок (печатн.)', <><T2 version="print" /><P2 version="print" /></>],
  ['Лаб3 теория+порядок', <><T3 /><P3 /></>],
  ['Лаб3 теория+порядок (печатн.)', <><T3 version="print" /><P3 version="print" /></>],
  ['Лаб4 теория+порядок', <><T4 /><P4 /></>],
  ['Лаб4 теория+порядок (печатн.)', <><T4 version="print" /><P4 version="print" /></>],
  ['Лаб5 теория+порядок', <><T5 /><P5 /></>],
  ['Лаб5 теория+порядок (печатн.)', <><T5 version="print" /><P5 version="print" /></>],
  ['Лаб6 теория+порядок', <><T6 /><P6 /></>],
  ['Лаб6 теория+порядок (печатн.)', <><T6 version="print" /><P6 version="print" /></>],
  ['Лаб7 теория+порядок', <><T7 /><P7 /></>],
  ['Лаб1 расчёты', <Calc1 rows={rows1} />],
  ['Лаб2 расчёты', <Calc2 rows={rows2} />],
  ['Лаб2 расчёты (печатн.)', <Calc2 version="print" rows={rows2p} />],
  ['Лаб3 расчёты', <Calc3 rows={rows3} />],
  ['Лаб3 расчёты (печатн.)', <Calc3 version="print" rows={rows3p} />],
  ['Лаб4 расчёты', <Calc4 rows={rows4} />],
  ['Лаб4 расчёты (печатн.)', <Calc4 version="print" rows={rows4} />],
  ['Лаб5 расчёты', <Calc5 rows={rows5} />],
  ['Лаб6 расчёты', <Calc6 rows={rows6} />],
  ['Лаб6 расчёты (печатн.)', <Calc6 version="print" rows={rows6p} />],
  ['Лаб7 расчёты', <Calc7 rows={rows7} />],
  ['Лаб1 выводы', <C1 rows={rows1} stats={cs1(rows1)} />],
  ['Лаб2 выводы', <C2 rows={rows2} stats={cs2(rows2)} />],
  ['Лаб2 выводы (печатн.)', <C2 version="print" rows={rows2p} stats={cs2(rows2p, 'print')} />],
  ['Лаб3 выводы', <C3 rows={rows3} stats={cs3(rows3)} />],
  ['Лаб3 выводы (печатн.)', <C3 version="print" rows={rows3p} stats={cs3(rows3p, 'print')} />],
  ['Лаб4 выводы', <C4 rows={rows4} stats={cs4(rows4).byLiq} />],
  ['Лаб4 выводы (печатн.)', <C4 version="print" rows={rows4} stats={cs4(rows4, 'print').byLiq} />],
  ['Лаб5 выводы', <C5 rows={rows5} stats={cs5(rows5)} />],
  ['Лаб6 выводы', <C6 rows={rows6} stats={cs6(rows6)} />],
  ['Лаб6 выводы (печатн.)', <C6 version="print" rows={rows6p} stats={cs6(rows6p, 'print')} />],
  ['Лаб7 выводы', <C7 rows={rows7} stats={cs7(rows7)} />],
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
