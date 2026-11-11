import { useState } from 'react'
import Lab1 from './labs/lab1/index.jsx'
import Lab2 from './labs/lab2/index.jsx'
import Lab3 from './labs/lab3/index.jsx'
import Lab4 from './labs/lab4/index.jsx'
import Lab5 from './labs/lab5/index.jsx'

const LABS = [
  {
    id: 1,
    accent: '#2563eb',
    title: 'Определение момента инерции маховика методом вращения',
    goal: 'определить момент инерции маховика по измерениям времени падения груза и чисел оборотов при его падении и последующем выбеге.',
    Page: Lab1,
  },
  {
    id: 2,
    accent: '#0d9488',
    title: 'Проверка закона сохранения импульса',
    goal: 'проверить закон сохранения импульса на примере абсолютно упругого и абсолютно неупругого удара шаров.',
    Page: Lab2,
  },
  {
    id: 3,
    accent: '#d97706',
    title: 'Изучение законов вращательного движения твёрдого тела',
    goal: 'проверка зависимости углового ускорения от момента силы при постоянном моменте инерции (маятник Обербека).',
    Page: Lab3,
  },
  {
    id: 4,
    accent: '#7c3aed',
    title: 'Определение ускорения свободного падения',
    goal: 'изучение динамики поступательного движения твёрдого тела и определение ускорения свободного падения на машине Атвуда.',
    Page: Lab4,
  },
  {
    id: 5,
    accent: '#db2777',
    title: 'Определение коэффициента внутреннего трения жидкостей',
    goal: 'определение коэффициентов внутреннего трения (вязкости) двух жидкостей методом Стокса.',
    Page: Lab5,
  },
]

export default function App() {
  const [current, setCurrent] = useState(null)
  const lab = LABS.find((l) => l.id === current)

  return (
    <>
      <header className="app-header">
        <div className="h-top">
          <div className="h-logo">Φ</div>
          <div>
            <h1>Лабораторные работы по механике</h1>
            <div className="h-sub">Виртуальный лабораторный практикум · 5 работ · теория, эксперимент, расчёты, выводы</div>
          </div>
          {lab && (
            <button className="back-btn" onClick={() => setCurrent(null)}>
              ← К списку работ
            </button>
          )}
        </div>
      </header>
      <main className="page">
        {lab ? (
          <lab.Page onExit={() => setCurrent(null)} />
        ) : (
          <>
            <div className="intro-note">
              Выберите лабораторную работу. Каждая работа включает: сведения и цель, теоретическую
              часть с формулами, порядок выполнения, виртуальную экспериментальную установку с
              таблицей результатов, расчётную часть с вычислением погрешностей, а также выводы и
              ответы на контрольные вопросы с преобразованиями формул.
            </div>
            <div className="catalog">
              {LABS.map((l) => (
                <div key={l.id} className="lab-card" onClick={() => setCurrent(l.id)}>
                  <div className="lc-top">
                    <div className="lab-badge" style={{ background: l.accent }}>
                      {l.id}
                    </div>
                    <h3>{l.title}</h3>
                  </div>
                  <div className="lc-goal">
                    <b>Цель:</b> {l.goal}
                  </div>
                  <div className="lc-open">Открыть работу →</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <footer className="footer">
        Виртуальный лабораторный практикум по разделу «Механика» · веб-версия · {new Date().getFullYear()}
      </footer>
    </>
  )
}
