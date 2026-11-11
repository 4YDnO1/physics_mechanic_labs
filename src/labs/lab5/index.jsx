import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

export default function Lab5() {
  const [rows, setRows] = useState([])
  const addRow = (r) => setRows((prev) => [...prev, r])
  const stats = computeStats(rows)

  return (
    <LabShell
      number={5}
      accent="#db2777"
      title="Определение коэффициента вязкости жидкости методом Стокса"
      goal="экспериментальное определение коэффициента вязкости двух жидкостей по измерению скорости равномерного падения шариков."
      equipment="виртуальная установка: два сосуда с жидкостями (ρж1 = 1250 кг/м³, ρж2 = 900 кг/м³), набор металлических шариков (сталь, чугун, медь, латунь, алюминий, свинец, олово, цинк) радиусом 1–3 мм, секундомер (встроен в модель)."
      progress={{ done: rows.length, total: 10 }}
      theory={<Theory />}
      procedure={<Procedure />}
      practice={<Sim rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc rows={rows} />}
      conclusions={<Conclusions rows={rows} stats={stats.byLiq} />}
    />
  )
}
