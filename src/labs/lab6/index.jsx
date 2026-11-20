import LabShell from '../../components/LabShell.jsx'
import { useLabState } from '../../utils/persist.js'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

const VERSIONS = [
  {
    key: 'web',
    label: 'Веб-вариант (дист. №4)',
    hint: 'Ускорение по двум участкам: S₁ и S₂; рабочая формула (10).',
  },
  {
    key: 'print',
    label: 'Печатный (очн. №6)',
    hint: 'Ускорение по пути S за время t; рабочая формула (5).',
  },
]

export default function Lab4() {
  const { rows, version, addRow, clearRows, changeVersion } = useLabState('lab6', VERSIONS)
  const stats = computeStats(rows, version)

  return (
    <LabShell
      number={6}
      accent="#7c3aed"
      title="Изучение законов динамики поступательного движения тел с помощью машины Атвуда"
      goal="экспериментальная проверка законов равноускоренного и равномерного движения и определение ускорения свободного падения."
      equipment="виртуальная установка «Машина Атвуда»: блок с нитью, два груза массой M = 0,2 кг, перегрузок массой m, уловитель перегрузка (отметка S₁ = 0,3 м), участок равномерного движения S₂ = 0,5 м, миллисекундомер (встроен в модель)."
      progress={{ done: rows.length, total: 5 }}
      versions={VERSIONS}
      version={version}
      onVersion={changeVersion}
      theory={<Theory version={version} />}
      procedure={<Procedure version={version} />}
      practice={<Sim key={version} version={version} rows={rows} onResult={addRow} onClear={clearRows} />}
      calculations={<Calc version={version} rows={rows} />}
      conclusions={<Conclusions version={version} rows={rows} stats={stats} />}
    />
  )
}
