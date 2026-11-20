import { Eq, Tex } from '../../components/Tex.jsx'
import { fmt } from '../../utils/stats.js'

export const DA = 0.05
export const DT_INSTR = 0.01
export const N_OSC = 10

const DAMPED_EQ = String.raw`\ddot{x} + 2\beta\dot{x} + \omega_0^2 x = 0`

export function Theory({ version }) {
  return (
    <>
      {version === 'print' && (
        <p className="note">
          Очная методичка КНИТУ-КАИ, лабораторная работа №5: «Изучение механических затухающих
          колебаний».
        </p>
      )}
      <h3>Гармонические колебания</h3>
      <p>
        Колебаниями называются процессы, которые в той или иной степени повторяются во времени.
        Наименьший промежуток времени <Tex>{String.raw`T`}</Tex>, через который повторяются значения
        всех величин, характеризующих процесс, называется периодом колебаний. Циклическая
        (круговая) частота связана с периодом соотношением
      </p>
      <Eq n={1}>{String.raw`\omega_0 = \frac{2\pi}{T}`}</Eq>
      <p>
        Если колеблющаяся величина изменяется по синусоидальному закону, колебания называются
        гармоническими:
      </p>
      <Eq n={2}>{String.raw`x(t) = A\sin(\omega_0 t + \varphi_0)`}</Eq>
      <p>
        Здесь <Tex>{String.raw`A`}</Tex> — амплитуда (максимальное отклонение),{' '}
        <Tex>{String.raw`\omega_0 t + \varphi_0`}</Tex> — фаза колебаний. Дважды продифференцировав
        (2), получим дифференциальное уравнение гармонических колебаний:
      </p>
      <Eq n={3}>{String.raw`\ddot{x} + \omega_0^2 x = 0`}</Eq>

      <h3>Свободные затухающие колебания</h3>
      <p>
        В реальных системах всегда есть силы сопротивления. При малых скоростях силу сопротивления
        можно считать пропорциональной скорости:{' '}
        <Tex>{String.raw`F_{\text{сопр}} = -r\,v`}</Tex>, где <Tex>{String.raw`r`}</Tex> — коэффициент
        сопротивления. Для маятника это приводит к уравнению
      </p>
      <Eq n={4}>{DAMPED_EQ}</Eq>
      <p>
        где <Tex>{String.raw`\beta`}</Tex> — коэффициент затухания. При слабом затухании{' '}
        <Tex>{String.raw`(\beta < \omega_0)`}</Tex> решением уравнения (4) являются затухающие
        колебания:
      </p>
      <Eq n={5}>{String.raw`x(t) = A_0 e^{-\beta t}\cos(\omega t + \varphi_0)`}</Eq>
      <p>
        частота которых меньше собственной: <Tex>{String.raw`\omega = \sqrt{\omega_0^2 - \beta^2}`}</Tex>,
        а амплитуда убывает по экспоненциальному закону
      </p>
      <Eq n={6}>{String.raw`A(t) = A_0 e^{-\beta t}`}</Eq>

      <h3>Параметры затухания</h3>
      <p>
        Отношение амплитуды в момент <Tex>{String.raw`t`}</Tex> к амплитуде через один период{' '}
        <Tex>{String.raw`t + T`}</Tex> называется декрементом затухания:{' '}
        <Tex>{String.raw`D = A(t)/A(t+T) = e^{\beta T}`}</Tex>. Логарифмический декремент:
      </p>
      <Eq n={7}>{String.raw`\delta = \ln D = \beta T`}</Eq>
      <p>
        В работе амплитуды <Tex>{String.raw`A_0, A_1, \dots`}</Tex> снимаются через каждые полпериода,
        поэтому за один период соседние чётные амплитуды связаны соотношением{' '}
        <Tex>{String.raw`A_{2i}/A_{2i+2} = e^{\delta}`}</Tex>. По трём парам амплитуд находят три
        значения логарифмического декремента и усредняют их:
      </p>
      <Eq n={8}>{String.raw`\delta_i = \ln\frac{A_{2i-2}}{A_{2i}}, \qquad i = 1,2,3`}</Eq>
      <p>Тогда параметры затухания:</p>
      <Eq n={9}>{String.raw`\beta = \frac{\delta}{T}, \qquad \tau = \frac{1}{\beta} = \frac{T}{\delta}`}</Eq>
      <p>
        где <Tex>{String.raw`\tau`}</Tex> — время релаксации, за которое амплитуда уменьшается в{' '}
        <Tex>{String.raw`e`}</Tex> раз. Добротность колебательной системы:
      </p>
      <Eq n={10}>{String.raw`Q = \frac{\omega}{2\beta} \approx \frac{\pi}{\delta}`}</Eq>
      <p>
        С ростом затухания амплитуда быстрее убывает, период увеличивается, а добротность падает.
        Уравнение затухающих колебаний маятника с начальной фазой{' '}
        <Tex>{String.raw`\varphi_0 = 0`}</Tex> имеет вид
      </p>
      <Eq n={11}>{String.raw`x(t) = A_0 e^{-t/\tau}\cos(\omega t)`}</Eq>
    </>
  )
}

export function Procedure({ version }) {
  if (version === 'print') {
    return (
      <ol className="steps">
        <li>
          Отклонить маятник на <Tex>{String.raw`5^\circ`}</Tex>, отпустить и замерить время{' '}
          <Tex>{String.raw`t`}</Tex> <b>10 полных колебаний</b>. Опыт повторить ещё 2 раза.
        </li>
        <li>
          Период колебаний определить по среднему арифметическому времени:{' '}
          <Tex>{String.raw`T = t_{\text{ср}}/10`}</Tex>.
        </li>
        <li>
          Отклонить маятник на начальную амплитуду <Tex>{String.raw`A_0 = 5^\circ`}</Tex> и
          зафиксировать чётные амплитуды <Tex>{String.raw`A_2, A_4, A_6, A_8`}</Tex>.
        </li>
        <li>
          Провести аналогичные измерения для нечётных амплитуд{' '}
          <Tex>{String.raw`A_1, A_3, A_5, A_7, A_9`}</Tex>. Результаты занести в таблицу.
        </li>
        <li>
          Рассчитать три значения логарифмического декремента <Tex>{String.raw`\delta_1, \delta_2, \delta_3`}</Tex>,
          коэффициент затухания <Tex>{String.raw`\beta`}</Tex>, время релаксации{' '}
          <Tex>{String.raw`\tau`}</Tex> и добротность <Tex>{String.raw`Q`}</Tex>.
        </li>
        <li>
          Построить график затухающих колебаний и записать уравнение вида (11) с найденными
          параметрами.
        </li>
      </ol>
    )
  }
  return (
    <ol className="steps">
      <li>
        На вкладке «Эксперимент» выбрать режим «Период». Установить коэффициент затухания{' '}
        <Tex>{String.raw`\beta`}</Tex> и начальную амплитуду <Tex>{String.raw`A_0`}</Tex>.
      </li>
      <li>
        Нажать «Подготовить», затем «Старт». Модель отсчитает 10 полных колебаний и запишет время{' '}
        <Tex>{String.raw`t_{10}`}</Tex> в таблицу. Повторить опыт 3 раза.
      </li>
      <li>
        Переключить режим «Амплитуды», отпустить маятник с{' '}
        <Tex>{String.raw`A_0 = 5^\circ`}</Tex> и снять значения{' '}
        <Tex>{String.raw`A_0 \dots A_9`}</Tex> через каждые полпериода.
      </li>
      <li>
        На вкладке «Расчёты» получить <Tex>{String.raw`T, \delta, \beta, \tau, Q`}</Tex>,
        подстановки и уравнение затухающих колебаний.
      </li>
    </ol>
  )
}

export function Conclusions({ rows, stats }) {
  const tRows = rows.filter((r) => r.kind === 'T')
  const aRows = rows.filter((r) => r.kind === 'A')
  const ready = tRows.length > 0 && aRows.length > 0
  const s = stats || {}
  return (
    <>
      <h3>Выводы</h3>
      {!ready ? (
        <p className="tbl-empty">
          Выполните измерения периода и амплитуд на вкладке «Эксперимент», чтобы получить параметры
          затухающих колебаний.
        </p>
      ) : (
        <>
          <p>
            По результатам {tRows.length} измерений времени десяти колебаний получен период{' '}
            <Tex>{String.raw`T = ${fmt(s.T, 3)}\ \text{с}`}</Tex>. Средний логарифмический декремент
            по трём парам чётных амплитуд составляет{' '}
            <Tex>{String.raw`\delta = ${fmt(s.delta, 4)}`}</Tex>, коэффициент затухания{' '}
            <Tex>{String.raw`\beta = ${fmt(s.beta, 4)}\ \text{с}^{-1}`}</Tex>, время релаксации{' '}
            <Tex>{String.raw`\tau = ${fmt(s.tau, 2)}\ \text{с}`}</Tex>, добротность{' '}
            <Tex>{String.raw`Q = ${fmt(s.Q, 1)}`}</Tex>.
          </p>
          <Eq>{String.raw`x(t) = ${fmt(s.A0, 2)} e^{-t/${fmt(s.tau, 2)}} \cos(${fmt(s.omega, 3)}\,t)\ (\text{град})`}</Eq>
          <p>
            Амплитуда убывает по экспоненциальному закону; с увеличением затухания период
            колебаний растёт, а добротность системы уменьшается.
          </p>
        </>
      )}

      <h3>Контрольные вопросы</h3>
      <details>
        <summary>1. Какой колебательный процесс называют гармоническим?</summary>
        <div className="qa-body">
          <p>
            Гармоническими называют колебания, при которых изменяющаяся величина следует закону{' '}
            <Tex>{String.raw`x = A\sin(\omega_0 t + \varphi_0)`}</Tex>. Такие колебания описываются
            дифференциальным уравнением <Tex>{String.raw`\ddot{x} + \omega_0^2 x = 0`}</Tex>.
          </p>
        </div>
      </details>
      <details>
        <summary>2. Запишите уравнение затухающих колебаний и дайте определение коэффициента затухания.</summary>
        <div className="qa-body">
          <p>
            Уравнение имеет вид <Tex>{String.raw`\ddot{x} + 2\beta\dot{x} + \omega_0^2 x = 0`}</Tex>,
            решение — <Tex>{String.raw`x = A_0 e^{-\beta t}\cos(\omega t + \varphi_0)`}</Tex>.
            Коэффициент затухания <Tex>{String.raw`\beta`}</Tex> определяет скорость убывания
            амплитуды: <Tex>{String.raw`A(t) = A_0 e^{-\beta t}`}</Tex>.
          </p>
        </div>
      </details>
      <details>
        <summary>3. Дайте определение времени релаксации, логарифмического декремента и добротности.</summary>
        <div className="qa-body">
          <p>
            Время релаксации <Tex>{String.raw`\tau = 1/\beta`}</Tex> — время, за которое амплитуда
            уменьшается в <Tex>{String.raw`e`}</Tex> раз. Логарифмический декремент{' '}
            <Tex>{String.raw`\delta = \ln(A_k/A_{k+2}) = \beta T`}</Tex> — натуральный логарифм
            отношения амплитуд, разделённых периодом. Добротность{' '}
            <Tex>{String.raw`Q = \pi/\delta`}</Tex> — характеристика запаса энергии к потерям за
            период.
          </p>
        </div>
      </details>
      <details>
        <summary>4. Как изменяются график и параметры колебаний при увеличении затухания?</summary>
        <div className="qa-body">
          <p>
            Огибающая <Tex>{String.raw`A_0 e^{-\beta t}`}</Tex> становится круче, число колебаний
            до практически полного затухания уменьшается. Частота{' '}
            <Tex>{String.raw`\omega = \sqrt{\omega_0^2-\beta^2}`}</Tex> и добротность{' '}
            <Tex>{String.raw`Q`}</Tex> уменьшаются, а период <Tex>{String.raw`T = 2\pi/\omega`}</Tex>{' '}
            увеличивается. При <Tex>{String.raw`\beta \geq \omega_0`}</Tex> колебания прекращаются.
          </p>
        </div>
      </details>
    </>
  )
}
