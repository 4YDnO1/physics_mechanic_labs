export function Slider({ label, value, onChange, min, max, step = 0.01, unit = '', digits = 2 }) {
  return (
    <div className="ctrl-row">
      <label>
        {label}
        {unit ? <span className="dim">, {unit}</span> : null}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
      <span className="val">{(+value).toFixed(digits).replace('.', ',')}</span>
    </div>
  )
}

export function Num({ label, value, onChange, min, max, step = 0.001, unit = '', digits = 3 }) {
  return (
    <div className="ctrl-row">
      <label>
        {label}
        {unit ? <span className="dim">, {unit}</span> : null}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
      <span className="val">{(+value).toFixed(digits).replace('.', ',')}</span>
    </div>
  )
}

export function Select({ label, value, onChange, options }) {
  return (
    <div className="ctrl-row">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Radio({ options, value, onChange }) {
  return (
    <div className="radio-row">
      {options.map((o) => (
        <button
          key={o.value}
          className={'radio-pill' + (o.value === value ? ' on' : '')}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Btn({ onClick, disabled, variant = '', children }) {
  return (
    <button className={'btn ' + variant} onClick={onClick} disabled={disabled} type="button">
      {children}
    </button>
  )
}

export function Readout({ label, value, unit, hl }) {
  return (
    <div className={'readout' + (hl ? ' hl' : '')}>
      {label}
      <b>
        {value}
        {unit ? <span className="small"> {unit}</span> : null}
      </b>
    </div>
  )
}
