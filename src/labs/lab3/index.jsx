import LabShell from '../../components/LabShell.jsx'
import { useLabState } from '../../utils/persist.js'
import { Theory, Procedure, Conclusions } from './content.jsx'
import Sim from './sim.jsx'
import Calc, { computeStats } from './calc.jsx'

const VERSIONS = [
  {
    key: 'web',
    label: 'Веб-вариант (дист. №2)',
    hint: 'Произвольные массы и начальный угол; скорости через sin(α/2).',
  },
  {
    key: 'print',
    label: 'Печатный (очн. №3)',
    hint: 'Шары из набора 112 г и 40 г (равные или разные), угол α₁ = 10°; проверка импульса и энергии по углам.',
  },
]

export default function Lab2() {
  const { rows, version, addRow, clearRows, changeVersion } = useLabState('lab3', VERSIONS)
  const stats = computeStats(rows, version)
  const done =
    Math.min(5, rows.filter((r) => r.mode === 'elastic').length) +
    Math.min(5, rows.filter((r) => r.mode === 'inelastic').length)

  return (
    <LabShell
      number={3}
      accent="#0d9488"
      title="Проверка закона сохранения импульса"
      goal="проверить закон сохранения импульса на примере абсолютно упругого и абсолютно неупругого удара шаров."
      equipment="виртуальная установка «Удар шаров»: два маятника равной длины l = 0,5 м с шарами масс m₁ и m₂, электромагнит для удержания первого шара в отклонённом положении, шкала углов."
      progress={{ done, total: 10 }}
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
