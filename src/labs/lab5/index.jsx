import { useState } from 'react'
import LabShell from '../../components/LabShell.jsx'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

const VERSIONS = [
  {
    key: 'web',
    label: 'Веб-вариант',
    hint: 'Плотности в кг/м³; погрешности отдельно по каждому материалу шарика.',
  },
  {
    key: 'print',
    label: 'Печатный (методичка)',
    hint: 'Плотности в кг/м³ и г/см³; коэффициент вязкости вычисляется по каждому опыту.',
  },
]

export default function Lab5() {
  const [rows, setRows] = useState([])
  const [version, setVersion] = useState('web')
  const addRow = (r) => setRows((prev) => [...prev, r])
  const stats = computeStats(rows, version)

  const changeVersion = (v) => {
    if (v === version) return
    setRows([])
    setVersion(v)
  }

  return (
    <LabShell
      number={5}
      accent="#db2777"
      title="Определение коэффициента вязкости жидкости методом Стокса"
      goal="экспериментальное определение коэффициента вязкости двух жидкостей по измерению скорости равномерного падения шариков."
      equipment="виртуальная установка: два сосуда с жидкостями (ρж1 = 1250 кг/м³, ρж2 = 900 кг/м³), набор металлических шариков (сталь, чугун, медь, латунь, алюминий, свинец, олово, цинк) радиусом 1–3 мм, секундомер (встроен в модель)."
      progress={{ done: rows.length, total: 12 }}
      versions={VERSIONS}
      version={version}
      onVersion={changeVersion}
      theory={<Theory version={version} />}
      procedure={<Procedure version={version} />}
      practice={<Sim key={version} version={version} rows={rows} onResult={addRow} onClear={() => setRows([])} />}
      calculations={<Calc version={version} rows={rows} />}
      conclusions={<Conclusions version={version} rows={rows} stats={stats.byLiq} />}
    />
  )
}
