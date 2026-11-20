import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

const VERSIONS = [
  {
    key: 'web',
    label: 'Веб-вариант',
    hint: 'Кинематические характеристики по времени падения груза с высоты h.',
  },
  {
    key: 'print',
    label: 'Печатный (очн. №1)',
    hint: 'Очная методичка КНИТУ-КАИ: обработка прямых и косвенных измерений, 3 контрольных вопроса.',
  },
]

export default function Lab6() {
  const [rows, setRows] = useState([])
  const [version, setVersion] = useState('web')
  const addRow = (r) => setRows((prev) => [...prev, { ...r, i: prev.length + 1 }])
  const stats = computeStats(rows)

  const changeVersion = (v) => {
    if (v === version) return
    setRows([])
    setVersion(v)
  }

  return (
    <LabShell
      number={6}
      accent="#16a34a"
      title="Определение кинематических параметров равнопеременного движения груза"
      goal="определить кинематические характеристики (ускорение, скорость, угловую скорость и угловое ускорение) равнопеременного движения груза и оценить их погрешности."
      equipment="виртуальная установка: маховик (блок) на оси со шкивом радиуса R, нить с грузом, измерительная линейка (высота h), секундомер и штангенциркуль (встроены в модель)."
      progress={{ done: rows.length, total: 5 }}
      versions={VERSIONS}
      version={version}
      onVersion={changeVersion}
      theory={<Theory version={version} />}
      procedure={<Procedure version={version} />}
      practice={<Sim key={version} rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc rows={rows} />}
      conclusions={<Conclusions version={version} rows={rows} stats={stats} />}
    />
  )
}
