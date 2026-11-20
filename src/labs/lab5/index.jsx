import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

const VERSIONS = [
  {
    key: 'web',
    label: 'Веб-вариант',
    hint: 'Виртуальный маятник: измерение времени 10 колебаний и амплитуд A₀…A₉.',
  },
  {
    key: 'print',
    label: 'Печатный (очн. №5)',
    hint: 'Очная методичка: A₀ = 5°, 10 колебаний, три значения логарифмического декремента.',
  },
]

export default function Lab5() {
  const [rows, setRows] = useState([])
  const [version, setVersion] = useState('web')
  const addRow = (r) => setRows((prev) => [...prev, { ...r, i: prev.length + 1 }])
  const stats = computeStats(rows)

  const changeVersion = (v) => {
    if (v === version) return
    setRows([])
    setVersion(v)
  }

  const periodCount = rows.filter((r) => r.kind === 'T').length
  const ampCount = rows.filter((r) => r.kind === 'A').length
  const done = Math.min(periodCount, 3) + Math.min(ampCount, 1)

  return (
    <LabShell
      number={5}
      accent="#ea580c"
      title="Изучение механических затухающих колебаний"
      goal="изучить процесс свободных затухающих колебаний при малых потерях энергии на примере механического маятника; определить период, логарифмический декремент, коэффициент затухания, время релаксации и добротность."
      equipment="виртуальный физический маятник: стержень с диском-грузом на цилиндрическом шарнире, угловая шкала, секундомер (встроены в модель)."
      progress={{ done, total: 4 }}
      versions={VERSIONS}
      version={version}
      onVersion={changeVersion}
      theory={<Theory version={version} />}
      procedure={<Procedure version={version} />}
      practice={<Sim key={version} version={version} rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc rows={rows} />}
      conclusions={<Conclusions rows={rows} stats={stats} />}
    />
  )
}
