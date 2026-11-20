import LabShell from '../../components/LabShell.jsx'
import { useLabState } from '../../utils/persist.js'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

const VERSIONS = [
  {
    key: 'web',
    label: 'Веб-вариант (дист. №1)',
    hint: 'Момент инерции по числам оборотов n₁, n₂ (свободный выбег маховика).',
  },
  {
    key: 'print',
    label: 'Печатный (очн. №2)',
    hint: 'Момент инерции по высоте подъёма груза h₁ (методичка КНИТУ-КАИ).',
  },
]

export default function Lab1() {
  const { rows, version, addRow, clearRows, changeVersion } = useLabState('lab2', VERSIONS, {
    indexed: true,
  })
  const stats = computeStats(rows, version)

  return (
    <LabShell
      number={2}
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
      practice={<Sim version={version} rows={rows} onResult={addRow} onClear={clearRows} />}
      calculations={<Calc version={version} rows={rows} />}
      conclusions={<Conclusions version={version} rows={rows} stats={stats} />}
    />
  )
}
