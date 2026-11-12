import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

const VERSIONS = [
  {
    key: 'web',
    label: 'Веб-вариант',
    hint: 'Момент инерции по числам оборотов n₁, n₂ (свободный выбег маховика).',
  },
  {
    key: 'print',
    label: 'Печатный (методичка)',
    hint: 'Момент инерции по высоте подъёма груза h₁ (методичка КНИТУ-КАИ).',
  },
]

export default function Lab1() {
  const [rows, setRows] = useState([])
  const [version, setVersion] = useState('web')
  const addRow = (r) => setRows((prev) => [...prev, { ...r, i: prev.length + 1 }])
  const stats = computeStats(rows, version)

  const changeVersion = (v) => {
    if (v === version) return
    setRows([])
    setVersion(v)
  }

  return (
    <LabShell
      number={1}
      accent="#2563eb"
      title="Определение момента инерции маховика методом вращения"
      goal="определить момент инерции маховика."
      equipment="виртуальная установка «Маховик»: маховик А, насаженный на вал с шарикоподшипниками, шкив В радиусом r, нить с грузом массы m, миллисекундомер и счётчик оборотов (встроены в модель)."
      progress={{ done: rows.length, total: 5 }}
      versions={VERSIONS}
      version={version}
      onVersion={changeVersion}
      theory={<Theory version={version} />}
      procedure={<Procedure version={version} />}
      practice={<Sim version={version} rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc version={version} rows={rows} />}
      conclusions={<Conclusions version={version} rows={rows} stats={stats} />}
    />
  )
}
