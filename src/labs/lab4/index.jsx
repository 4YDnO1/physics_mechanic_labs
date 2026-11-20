import LabShell from '../../components/LabShell.jsx'
import { useLabState } from '../../utils/persist.js'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

const VERSIONS = [
  {
    key: 'web',
    label: 'Веб-вариант (дист. №5)',
    hint: 'Плотности в кг/м³; погрешности отдельно по каждому материалу шарика.',
  },
  {
    key: 'print',
    label: 'Печатный (очн. №4)',
    hint: 'Плотности в кг/м³ и г/см³; коэффициент вязкости вычисляется по каждому опыту.',
  },
]

export default function Lab5() {
  const { rows, version, addRow, clearRows, changeVersion } = useLabState('lab4', VERSIONS)
  const stats = computeStats(rows, version)

  return (
    <LabShell
      number={4}
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
      practice={<Sim key={version} version={version} rows={rows} onResult={addRow} onClear={clearRows} />}
      calculations={<Calc version={version} rows={rows} />}
      conclusions={<Conclusions version={version} rows={rows} stats={stats.byLiq} />}
    />
  )
}
