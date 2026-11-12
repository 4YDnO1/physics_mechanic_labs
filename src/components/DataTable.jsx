export default function DataTable({ columns, rows, caption, empty = 'Нет данных — выполните измерения на вкладке «Эксперимент»', minRows = 0 }) {
  if (!rows.length) return <div className="tbl-empty">{empty}</div>
  const shown = [...rows]
  while (shown.length < minRows) shown.push({})
  return (
    <div>
      <div className="tbl-wrap">
        <table className="data">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>
                  {c.label}
                  {c.unit ? <div className="small dim">{c.unit}</div> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} className={r.__sum ? 'sum' : ''}>
                {columns.map((c) => {
                  const v = r[c.key]
                  const txt =
                    v == null || v === ''
                      ? ''
                      : typeof v === 'number'
                        ? Number.isFinite(v)
                          ? c.format
                            ? c.format(v, r)
                            : fmtDef(v)
                          : ''
                        : c.format
                          ? c.format(v, r)
                          : String(v)
                  return <td key={c.key} className={c.txt ? 'txt' : ''}>{txt}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <div className="table-cap">{caption}</div> : null}
    </div>
  )
}

function fmtDef(v) {
  const a = Math.abs(v)
  if (a === 0) return '0'
  if (a >= 1000 || a < 0.001) return v.toExponential(2).replace('.', ',')
  const s = v.toFixed(a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : 4)
  return s.replace('.', ',')
}
