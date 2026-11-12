import { useState } from 'react'

const TABS = [
  { key: 'info', label: 'Сведения о работе' },
  { key: 'theory', label: 'Теория' },
  { key: 'proc', label: 'Порядок выполнения' },
  { key: 'exp', label: 'Эксперимент' },
  { key: 'calc', label: 'Расчёты' },
  { key: 'concl', label: 'Выводы и вопросы' },
]

export default function LabShell({
  number,
  accent,
  title,
  goal,
  equipment,
  progress,
  versions,
  version,
  onVersion,
  theory,
  procedure,
  practice,
  calculations,
  conclusions,
}) {
  const [tab, setTab] = useState('info')
  const done = progress && progress.done >= progress.total
  const activeVersion = versions && versions.find((v) => v.key === version)
  return (
    <div style={{ ['--acc']: accent }}>
      <div className="lab-head">
        <div className="lh-row">
          <div className="lab-badge" style={{ background: accent }}>
            {number}
          </div>
          <h2>
            Лабораторная работа №{number}. {title}
          </h2>
          {progress ? (
            <div style={{ minWidth: 170 }}>
              <div className="small dim">
                Выполнено опытов: {progress.done} / {progress.total}
              </div>
              <progress className="progress" max={progress.total} value={progress.done} />
            </div>
          ) : null}
        </div>
        <div className="lh-goal">
          <b>Цель работы:</b> {goal}
        </div>
        {versions ? (
          <div className="version-bar">
            <span className="vb-label">Вариант выполнения:</span>
            <div className="vb-seg" role="tablist">
              {versions.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  className={'vb-btn' + (v.key === version ? ' on' : '')}
                  onClick={() => onVersion(v.key)}
                >
                  {v.label}
                </button>
              ))}
            </div>
            {activeVersion?.hint ? <span className="vb-hint">{activeVersion.hint}</span> : null}
          </div>
        ) : null}
      </div>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            className={'tab' + (tab === t.key ? ' active' : '')}
            onClick={() => setTab(t.key)}
          >
            <span className="tab-n">{i + 1}</span>
            {t.label}
            {t.key === 'calc' && done ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <div className="panel">
        {tab === 'info' && (
          <div className="doc">
            <h3>Сведения о работе</h3>
            <p className="lead">
              <b>Лабораторная работа №{number}.</b> {title}.
            </p>
            <p>
              <b>Цель работы:</b> {goal}
            </p>
            {equipment ? (
              <p>
                <b>Используемая установка (виртуальный аналог):</b> {equipment}
              </p>
            ) : null}
            <div className="note">
              Работа выполняется в программном (виртуальном) виде. Перемещайтесь по вкладкам в
              порядке их нумерации: <b>Теория → Порядок выполнения → Эксперимент → Расчёты → Выводы и
              вопросы</b>. Все измерения снимаются с модели установки, как на реальном стенде.
            </div>
          </div>
        )}
        {tab === 'theory' && <div className="doc">{theory}</div>}
        {tab === 'proc' && (
          <div className="doc">
            <h3>Порядок выполнения работы</h3>
            {procedure}
          </div>
        )}
        {tab === 'exp' && practice}
        {tab === 'calc' && <div className="doc">{calculations}</div>}
        {tab === 'concl' && <div className="doc">{conclusions}</div>}
      </div>
    </div>
  )
}
