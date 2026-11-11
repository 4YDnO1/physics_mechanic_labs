import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

export default function Lab4() {
  const [rows, setRows] = useState([])
  const addRow = (r) => setRows((prev) => [...prev, r])
  const stats = computeStats(rows)

  return (
    <LabShell
      number={4}
      accent="#7c3aed"
      title="Изучение законов динамики поступательного движения тел с помощью машины Атвуда"
      goal="экспериментальная проверка законов равноускоренного и равномерного движения и определение ускорения свободного падения."
      equipment="виртуальная установка «Машина Атвуда»: блок с нитью, два груза массой M = 0,2 кг, перегрузок массой m, уловитель перегрузка (отметка S₁ = 0,3 м), участок равномерного движения S₂ = 0,5 м, миллисекундомер (встроен в модель)."
      progress={{ done: rows.length, total: 5 }}
      theory={<Theory />}
      procedure={<Procedure />}
      practice={<Sim rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc rows={rows} />}
      conclusions={<Conclusions rows={rows} stats={stats} />}
    />
  )
}
