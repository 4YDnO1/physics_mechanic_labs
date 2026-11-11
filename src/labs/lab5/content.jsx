import { Eq, Tex } from '../../components/Tex.jsx'
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

export function Theory() {
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
    </>
  )
}

export function Procedure() {
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
        Выполнить основной опыт: <b>«Бросить шарик»</b> — шарик проходит расстояние{' '}
        <Tex>{String.raw`l = 0{,}45 - h`}</Tex> между метками; время <Tex>{String.raw`t`}</Tex>{' '}
        измеряется автоматически, строка результатов добавляется в таблицу выбранного сосуда.
      </li>
      <li>Повторить опыт ещё 4 раза (можно менять материал и радиус шарика).</li>
      <li>Повторить пункты 3–5 для второго сосуда.</li>
      <li>
        Перейти на вкладку «Расчёты»: по формуле (10) вычислить <Tex>{String.raw`\eta`}</Tex> для
        каждой жидкости, затем средние значения и погрешности; записать{' '}
        <Tex>{String.raw`\eta = \eta_{\text{ср}} \pm \Delta\eta`}</Tex> для каждой жидкости.
      </li>
    </ol>
  )
}

function VesselConclusion({ rows, stats, liq }) {
  const sub = rows.filter((rw) => rw.vessel === liq)
  if (sub.length < 5) {
    return (
      <div className="note">
        Жидкость №{liq}: выполнено {sub.length} из 5 опытов.
      </div>
    )
  }
  const st = stats[liq]
  return (
    <div className="conclusion-text">
      <p>
        Для жидкости №{liq} (плотность <Tex>{String.raw`\rho_{\text{ж}} = ${fmt(sub[0].rhoL, 0)}`}</Tex>{' '}
        кг/м³) по результатам 5 опытов среднее значение коэффициента вязкости составило{' '}
        <Tex>{String.raw`\eta_{\text{ср}} = ${fmt(st.etaM, 3)}`}</Tex> Па·с, средняя абсолютная
        погрешность <Tex>{String.raw`\Delta\eta = ${fmt(st.dEta, 3)}`}</Tex> Па·с (относительная
        погрешность <Tex>{String.raw`\delta = ${fmt(st.rel, 1)}\%`}</Tex>):
      </p>
      <Eq>{String.raw`\eta = \left(${fmt(st.etaM, 3)} \pm ${fmt(st.dEta, 3)}\right)\ \text{Па·с}`}</Eq>
    </div>
  )
}

export function Conclusions({ rows, stats }) {
  const has = rows.length > 0
  const anyDone = [1, 2].some((liq) => rows.filter((rw) => rw.vessel === liq).length >= 5)
  return (
    <>
      <h3>Вывод</h3>
      {has ? (
        anyDone ? (
          <>
            <VesselConclusion rows={rows} stats={stats} liq={2} />
            <VesselConclusion rows={rows} stats={stats} liq={1} />
            <p className="small dim">
              Сравнение: вязкость жидкости №2 заметно ниже вязкости жидкости №1 — сила внутреннего
              трения в ней при прочих равных условиях меньше.
            </p>
          </>
        ) : (
          <div className="note">Для формирования вывода выполните по 5 опытов в каждом сосуде.</div>
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
