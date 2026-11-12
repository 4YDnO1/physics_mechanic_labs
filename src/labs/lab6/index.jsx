import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

export default function Lab6() {
  const [rows, setRows] = useState([])
  const addRow = (r) => setRows((prev) => [...prev, { ...r, i: prev.length + 1 }])
  const stats = computeStats(rows)

  return (
    <LabShell
      number={6}
      accent="#16a34a"
      title="Определение кинематических параметров равнопеременного движения груза"
      goal="определить кинематические характеристики (ускорение, скорость, угловую скорость и угловое ускорение) равнопеременного движения груза и оценить их погрешности."
      equipment="виртуальная установка: маховик (блок) на оси со шкивом радиуса R, нить с грузом, измерительная линейка (высота h), секундомер и штангенциркуль (встроены в модель)."
      progress={{ done: rows.length, total: 5 }}
      theory={<Theory />}
      procedure={<Procedure />}
      practice={<Sim rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc rows={rows} />}
      conclusions={<Conclusions rows={rows} stats={stats} />}
    />
  )
}
