import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

export default function Lab2() {
  const [rows, setRows] = useState([])
  const addRow = (r) => setRows((prev) => [...prev, r])
  const stats = computeStats(rows)
  const done = Math.min(
    5,
    rows.filter((r) => r.mode === 'elastic').length
  ) + Math.min(5, rows.filter((r) => r.mode === 'inelastic').length)

  return (
    <LabShell
      number={2}
      accent="#0d9488"
      title="Проверка закона сохранения импульса"
      goal="проверить закон сохранения импульса на примере абсолютно упругого и абсолютно неупругого удара шаров."
      equipment="виртуальная установка «Удар шаров»: два маятника равной длины l = 0,5 м с шарами масс m₁ и m₂, электромагнит для удержания первого шара в отклонённом положении, шкала углов."
      progress={{ done, total: 10 }}
      theory={<Theory />}
      procedure={<Procedure />}
      practice={<Sim rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc rows={rows} />}
      conclusions={<Conclusions rows={rows} stats={stats} />}
    />
  )
}
