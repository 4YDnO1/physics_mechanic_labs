import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

export default function Lab3() {
  const [rows, setRows] = useState([])
  const addRow = (r) => setRows((prev) => [...prev, r])
  const stats = computeStats(rows)

  return (
    <LabShell
      number={3}
      accent="#d97706"
      title="Изучение законов вращательного движения твёрдого тела"
      goal="проверка зависимости углового ускорения от момента силы при постоянном моменте инерции (маятник Обербека)."
      equipment="виртуальная установка «Маятник Обербека»: крестовина из четырёх стержней с грузами K массой M, закрепляемыми на расстоянии R от оси; шкив радиусом r, нить, перекинутая через блок, груз массой m; миллисекундомер и счётчик оборотов (встроены в модель)."
      progress={{ done: rows.length, total: 5 }}
      theory={<Theory />}
      procedure={<Procedure />}
      practice={<Sim rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc rows={rows} />}
      conclusions={<Conclusions rows={rows} stats={stats} />}
    />
  )
}
