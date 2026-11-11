import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

export default function Lab1() {
  const [rows, setRows] = useState([])
  const addRow = (r) => setRows((prev) => [...prev, { ...r, i: prev.length + 1 }])
  const stats = computeStats(rows)

  return (
    <LabShell
      number={1}
      accent="#2563eb"
      title="Определение момента инерции маховика методом вращения"
      goal="определить момент инерции маховика."
      equipment="виртуальная установка «Маховик»: маховик А, насаженный на вал с шарикоподшипниками, шкив В радиусом r, нить с грузом массы m, миллисекундомер и счётчик оборотов (встроены в модель)."
      progress={{ done: rows.length, total: 5 }}
      theory={<Theory />}
      procedure={<Procedure />}
      practice={<Sim rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc rows={rows} />}
      conclusions={<Conclusions rows={rows} stats={stats} />}
    />
  )
}
