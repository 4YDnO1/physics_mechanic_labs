import { Eq, Tex } from '../../components/Tex.jsx'
import DataTable from '../../components/DataTable.jsx'
import { fmt } from '../../utils/stats.js'

export const LIQUIDS = [
  { name: 'Жидкость №1', rho: 1250, eta: 0.85 },
  { name: 'Жидкость №2', rho: 900, eta: 0.3 },
]
export const H_BOTTOM = 0.45

export const BALLS = [
  { name: 'Сталь', rho: 7860, color: '#9aa7bb' },
  { name: 'Чугун', rho: 7200, color: '#6d6a66' },
  { name: 'Медь', rho: 8930, color: '#c47a45' },
  { name: 'Латунь', rho: 8500, color: '#c9a24a' },
  { name: 'Алюминий', rho: 2700, color: '#c4ccd8' },
  { name: 'Свинец', rho: 11340, color: '#8a8f9c' },
  { name: 'Олово', rho: 7290, color: '#b6bcc8' },
  { name: 'Цинк', rho: 7130, color: '#9fa9b5' },
]

export function Theory({ version = 'web' }) {
  const isPrint = version === 'print'
  return (
    <>
      <h3>Содержание работы</h3>
      <p>
        При движении тел в жидкости между слоями возникают силы внутреннего трения. Если жидкость
        движется послойно, то сила внутреннего трения <Tex>{String.raw`f`}</Tex> пропорциональна
        площади соприкосновения <Tex>{String.raw`S`}</Tex> слоёв жидкости и градиенту скорости{' '}
        <Tex>{String.raw`dv/dx`}</Tex>:
      </p>
      <Eq n={2}>{String.raw`f = \eta S \frac{dv}{dx}`}</Eq>
      <p>
        Здесь <Tex>{String.raw`\eta`}</Tex> — коэффициент пропорциональности, называемый
        коэффициентом вязкости (внутреннего трения) жидкости. Из (2):
      </p>
      <Eq n={3}>{String.raw`\eta = \frac{f}{S\,dv/dx}`}</Eq>
      <p>
        Единицей вязкости в СИ является паскаль-секунда (<Tex>{String.raw`1\ \text{Па·с}`}</Tex>).
        При движении тела в вязкой жидкости оно увлекает за собой прилегающие слои; слои жидкости
        испытывают сдвиг, и через поверхность тела в жидкость передаётся импульс. Количество
        движения (импульс), переносимое в единицу времени через поверхность слоя площадью{' '}
        <Tex>{String.raw`S`}</Tex>:
      </p>
      <Eq n={4}>{String.raw`dk = \eta S \frac{dv}{dx}\,d\tau`}</Eq>
      <p>
        Отсюда виден физический смысл <Tex>{String.raw`\eta`}</Tex>: коэффициент вязкости
        численно равен потоку импульса через единицу площади при градиенте скорости, равном
        единице.
      </p>
      <p>
        Малые тела в вязкой жидкости при малых скоростях движутся, как показал Стокс, с силой
        сопротивления
      </p>
      <Eq n={6}>{String.raw`F = 6\pi\eta r \nu`}</Eq>
      <p>
        где <Tex>{String.raw`r`}</Tex> — радиус тела (шарика), <Tex>{String.raw`\nu`}</Tex> —
        скорость его движения. На шарик в жидкости действуют: сила тяжести{' '}
        <Tex>{String.raw`P_1 = \rho_{\text{ш}}Vg`}</Tex> и выталкивающая сила Архимеда{' '}
        <Tex>{String.raw`P_2 = \rho_{\text{ж}}Vg`}</Tex>, где <Tex>{String.raw`\rho_{\text{ш}}`}</Tex>{' '}
        и <Tex>{String.raw`\rho_{\text{ж}}`}</Tex> — плотности шарика и жидкости,{' '}
        <Tex>{String.raw`V`}</Tex> — объём шарика. Уравнение движения:
      </p>
      <Eq n={7}>{String.raw`P_1 - P_2 - F = ma`}</Eq>
      <p>
        С ростом скорости сила сопротивления растёт, ускорение уменьшается; при{' '}
        <Tex>{String.raw`a = 0`}</Tex> движение становится равномерным:
      </p>
      <Eq n={8}>{String.raw`\rho_{\text{ш}}Vg - \rho_{\text{ж}}Vg - 6\pi\eta r \nu = 0`}</Eq>
      <p>Отсюда, с учётом <Tex>{String.raw`V = \frac{4}{3}\pi r^3`}</Tex>:</p>
      <Eq n={9}>{String.raw`\eta = \frac{2r^2g(\rho_{\text{ш}} - \rho_{\text{ж}})}{9\nu}`}</Eq>
      <p>
        Скорость равномерного движения <Tex>{String.raw`\nu`}</Tex> определяется по времени{' '}
        <Tex>{String.raw`t`}</Tex> прохождения шариком расстояния <Tex>{String.raw`l`}</Tex> между
        метками: <Tex>{String.raw`\nu = l/t`}</Tex>. Тогда рабочая формула принимает вид:
      </p>
      <Eq n={10}>{String.raw`\eta = \frac{2r^2g(\rho_{\text{ш}} - \rho_{\text{ж}})\,t}{9l}`}</Eq>

      {isPrint && (
        <>
          <h3>Единицы измерения плотности</h3>
          <p>
            В расчётах плотности удобно выражать как в кг/м³, так и в г/см³. Соотношение единиц:
          </p>
          <Eq n={11}>{String.raw`1\ \text{г/см}^3 = 1000\ \text{кг/м}^3, \qquad \rho\,[\text{кг/м}^3] = 1000\,\rho\,[\text{г/см}^3]`}</Eq>
          <p>Плотности материалов шариков, используемых в работе:</p>
          <DataTable
            rows={BALLS.map((b) => ({ name: b.name, kg: b.rho, g: b.rho / 1000 }))}
            columns={[
              { key: 'name', label: 'Материал', txt: true },
              { key: 'kg', label: 'ρ, кг/м³', format: (v) => fmt(v, 0) },
              { key: 'g', label: 'ρ, г/см³', format: (v) => fmt(v, 2) },
            ]}
            caption="Плотности материалов шариков"
          />
          <p>Плотности жидкостей:</p>
          <DataTable
            rows={LIQUIDS.map((l, i) => ({ name: l.name, kg: l.rho, g: l.rho / 1000 }))}
            columns={[
              { key: 'name', label: 'Жидкость', txt: true },
              { key: 'kg', label: 'ρ, кг/м³', format: (v) => fmt(v, 0) },
              { key: 'g', label: 'ρ, г/см³', format: (v) => fmt(v, 2) },
            ]}
            caption="Плотности жидкостей"
          />
        </>
      )}
    </>
  )
}

export function Procedure({ version = 'web' }) {
  const isPrint = version === 'print'
  return (
    <ol className="steps">
      <li>
        Перейти на вкладку «Эксперимент». В установке два сосуда с разными жидкостями (в левом
        сосуде — жидкость №1, в правом — жидкость №2); для каждого сосуда задано положение верхней
        метки <Tex>{String.raw`h`}</Tex>, нижняя метка (0,45 м от поверхности) общая. Вверху слева
        отображаются текущие значения ускорения <Tex>{String.raw`a`}</Tex> шарика и время{' '}
        <Tex>{String.raw`t`}</Tex>.
      </li>
      <li>Выбрать сосуд для опыта (переключатель «Сосуд»).</li>
      <li>
        <b>Предварительный опыт:</b> задать материал и радиус шарика, нажать <b>«Бросить шарик»</b>;
        наблюдая за изменением <Tex>{String.raw`a`}</Tex>, зафиксировать глубину, на которой
        ускорение обращается в ноль (начало равномерного движения), и передвинуть верхнюю метку
        <Tex>{String.raw`h`}</Tex> выбранного сосуда в эту точку ползунком.
      </li>
      <li>
        Выбрать <b>материал шарика №1</b> и радиус, выполнить основной опыт: <b>«Бросить шарик»</b>{' '}
        — шарик проходит расстояние <Tex>{String.raw`l = 0{,}45 - h`}</Tex> между метками; время{' '}
        <Tex>{String.raw`t`}</Tex> измеряется автоматически, строка результатов добавляется в
        таблицу выбранного сосуда. Повторить опыт ещё минимум <b>2 раза</b> с тем же материалом
        (всего не менее <b>3 опытов</b>).
      </li>
      <li>
        Выбрать <b>материал шарика №2</b> (например, другую плотность; радиус можно также изменить)
        и выполнить с ним ещё минимум <b>3 опыта</b> в этом же сосуде.
      </li>
      <li>Повторить пункты 3–5 для второго сосуда (второй жидкости).</li>
      <li>
        Перейти на вкладку «Расчёты»: по формуле (10) вычислить <Tex>{String.raw`\eta`}</Tex> для
        каждого опыта. Для каждой жидкости найти среднее значение{' '}
        <Tex>{String.raw`\eta_{\text{ср}}`}</Tex> и погрешность{' '}
        <Tex>{String.raw`\Delta\eta`}</Tex> <b>отдельно по каждому материалу шарика</b>; записать{' '}
        <Tex>{String.raw`\eta = \eta_{\text{ср}} \pm \Delta\eta`}</Tex> для каждой серии опытов.
        {isPrint && (
          <>
            {' '}Плотности записывать как в кг/м³, так и в г/см³ (1 г/см³ = 1000 кг/м³); значение{' '}
            <Tex>{String.raw`\eta`}</Tex> рассчитывается по каждому опыту.
          </>
        )}
      </li>
    </ol>
  )
}

function VesselConclusion({ rows, stats, liq }) {
  const groups = stats[liq].groups
  const done = groups.filter((g) => g.n >= 3).length >= 2
  const sub = rows.filter((rw) => rw.vessel === liq)
  if (!done) {
    const mats = groups.map((g) => `«${g.name}» — ${g.n}`).join(', ')
    return (
      <div className="note">
        Жидкость №{liq}: выполнено {sub.length} опытов ({mats || 'материалы не заданы'}).
        Требуется минимум два материала шарика не менее чем по 3 опыта каждый.
      </div>
    )
  }
  return (
    <div className="conclusion-text">
      <p>
        Для жидкости №{liq} (плотность{' '}
        <Tex>{String.raw`\rho_{\text{ж}} = ${fmt(sub[0].rhoL, 0)}`}</Tex> кг/м³) опыты выполнены с
        шариками разных материалов. Средние значения коэффициента вязкости и погрешности,
        рассчитанные <b>отдельно для каждого материала шарика</b>:
      </p>
      {groups.map((g) =>
        g.n >= 3 ? (
          <Eq key={g.name}>
            {String.raw`\eta_{\text{${g.name}}} = \left(${fmt(g.etaM, 3)} \pm ${fmt(g.dEta, 3)}\right)\ \text{Па·с}, \qquad \delta = ${fmt(g.rel, 1)}\% \quad (${g.n}\ \text{опыта, } \rho_{\text{ш}} = ${fmt(g.rhoS, 0)}\ \text{кг/м}^3)`}
          </Eq>
        ) : (
          <p key={g.name} className="small dim">
            Шарик «{g.name}»: выполнено {g.n} опыта из 3 — серия не учтена в выводе.
          </p>
        )
      )}
      <p>
        Значения вязкости, полученные по разным шарикам, совпадают в пределах погрешностей: вязкость
        является характеристикой <b>жидкости</b> и не зависит от материала шарика (материал влияет
        лишь на скорость равномерного падения).
      </p>
    </div>
  )
}

export function Conclusions({ rows, stats, version = 'web' }) {
  const isPrint = version === 'print'
  const has = rows.length > 0
  const anyDone = [1, 2].some(
    (liq) => stats[liq].groups.filter((g) => g.n >= 3).length >= 2
  )
  return (
    <>
      <h3>Вывод</h3>
      {has ? (
        anyDone ? (
          <>
            <VesselConclusion rows={rows} stats={stats} liq={2} />
            <VesselConclusion rows={rows} stats={stats} liq={1} />
            {isPrint && (
              <p>
                Значения <Tex>{String.raw`\eta`}</Tex> вычислены по каждому опыту; плотности шариков
                и жидкостей приведены в кг/м³ и г/см³. Совпадение результатов, полученных с шариками
                разных материалов, подтверждает, что вязкость является характеристикой жидкости.
              </p>
            )}
            <p className="small dim">
              Сравнение: вязкость жидкости №2 заметно ниже вязкости жидкости №1 — сила внутреннего
              трения в ней при прочих равных условиях меньше.
            </p>
          </>
        ) : (
          <div className="note">
            Для формирования вывода выполните в каждом сосуде минимум по два материала шарика — не
            менее 3 опытов с каждым.
          </div>
        )
      ) : (
        <div className="tbl-empty">Выполните измерения на вкладке «Эксперимент» — вывод будет сформирован автоматически.</div>
      )}

      <h3>Контрольные вопросы</h3>
      <div className="qa">
        <details>
          <summary>1. Какие силы действуют на шарик, падающий в вязкой жидкости?</summary>
          <div className="qa-body">
            <p>
              На шарик действуют три силы: сила тяжести{' '}
              <Tex>{String.raw`P_1 = \rho_{\text{ш}}Vg`}</Tex>, направленная вниз;
              выталкивающая сила Архимеда <Tex>{String.raw`P_2 = \rho_{\text{ж}}Vg`}</Tex>,
              направленная вверх; и сила сопротивления Стокса{' '}
              <Tex>{String.raw`F = 6\pi\eta r\nu`}</Tex>, направленная против движения.
            </p>
          </div>
        </details>
        <details>
          <summary>2. Запишите уравнение движения шарика и условие равномерного движения</summary>
          <div className="qa-body">
            <p>
              Уравнение движения (второй закон Ньютона):{' '}
              <Tex>{String.raw`P_1 - P_2 - F = ma`}</Tex>, т.е.{' '}
              <Tex>{String.raw`\rho_{\text{ш}}Vg - \rho_{\text{ж}}Vg - 6\pi\eta r\nu = ma`}</Tex>.
              Равномерное движение начинается при <Tex>{String.raw`a = 0`}</Tex>:
            </p>
            <Eq>{String.raw`\rho_{\text{ш}}Vg - \rho_{\text{ж}}Vg - 6\pi\eta r\nu = 0`}</Eq>
            <p>
              Сила тяжести уравновешивается суммой силы Архимеда и силы сопротивления; скорость
              при этом максимальна и постоянна.
            </p>
          </div>
        </details>
        <details>
          <summary>3. Выведите формулу (10) из условия равномерного движения шарика</summary>
          <div className="qa-body">
            <p>
              Из равенства (8) выразим вязкость: <Tex>{String.raw`6\pi\eta r\nu = (\rho_{\text{ш}}-\rho_{\text{ж}})Vg`}</Tex>,{' '}
              <Tex>{String.raw`\eta = \dfrac{(\rho_{\text{ш}}-\rho_{\text{ж}})Vg}{6\pi r\nu}`}</Tex>. Подставив
              объём шарика <Tex>{String.raw`V = \frac{4}{3}\pi r^3`}</Tex>:
            </p>
            <Eq>{String.raw`\eta = \frac{(\rho_{\text{ш}}-\rho_{\text{ж}})\,\frac{4}{3}\pi r^3 g}{6\pi r\nu} = \frac{2r^2g(\rho_{\text{ш}}-\rho_{\text{ж}})}{9\nu}`}</Eq>
            <p>
              Заменив скорость равномерного движения <Tex>{String.raw`\nu = l/t`}</Tex>, получаем
              рабочую формулу (10): <Tex>{String.raw`\eta = \dfrac{2r^2g(\rho_{\text{ш}}-\rho_{\text{ж}})\,t}{9l}`}</Tex>.
            </p>
          </div>
        </details>
        <details>
          <summary>4. Каков физический смысл коэффициента вязкости и его размерность?</summary>
          <div className="qa-body">
            <p>
              Коэффициент вязкости <Tex>{String.raw`\eta`}</Tex> — коэффициент пропорциональности
              между силой внутреннего трения <Tex>{String.raw`f = \eta S\,dv/dx`}</Tex> и
              произведением площади слоя на градиент скорости. Физический смысл:{' '}
              <Tex>{String.raw`\eta`}</Tex> численно равен потоку импульса через единичную площадь
              при градиенте скорости, равном единице, т.е. характеризует перенос импульса между
              слоями. Размерность в СИ — <Tex>{String.raw`\text{Па·с} = \text{кг/(м·с)}`}</Tex>.
            </p>
          </div>
        </details>
      </div>

      <h3>Преобразование формул (вывод рабочей формулы)</h3>
      <div className="qa">
        <details open>
          <summary>Вывод формулы (10)</summary>
          <div className="qa-body">
            <p>
              <b>Шаг 1.</b> Условие равномерного движения шарика (а = 0) из (7):
            </p>
            <Eq>{String.raw`\rho_{\text{ш}}Vg - \rho_{\text{ж}}Vg - 6\pi\eta r\nu = 0 \qquad (8)`}</Eq>
            <p>
              <b>Шаг 2.</b> Выразим <Tex>{String.raw`\eta`}</Tex> и подставим{' '}
              <Tex>{String.raw`V = \frac{4}{3}\pi r^3`}</Tex>:
            </p>
            <Eq>{String.raw`\eta = \frac{(\rho_{\text{ш}}-\rho_{\text{ж}})Vg}{6\pi r\nu} = \frac{(\rho_{\text{ш}}-\rho_{\text{ж}})\,\frac{4}{3}\pi r^3 g}{6\pi r\nu} = \frac{2r^2g(\rho_{\text{ш}}-\rho_{\text{ж}})}{9\nu} \qquad (9)`}</Eq>
            <p>
              <b>Шаг 3.</b> Скорость равномерного движения найдём по времени прохождения
              расстояния <Tex>{String.raw`l`}</Tex> между метками: <Tex>{String.raw`\nu = \dfrac{l}{t}`}</Tex>.
              Подстановка в (9) даёт рабочую формулу:
            </p>
            <Eq n={10}>{String.raw`\eta = \frac{2r^2g(\rho_{\text{ш}}-\rho_{\text{ж}})\,t}{9l}`}</Eq>
          </div>
        </details>
      </div>
    </>
  )
}
