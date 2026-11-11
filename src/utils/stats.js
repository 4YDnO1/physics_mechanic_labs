export const G = 9.81

export const mean = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : NaN)

export const meanAbsDev = (arr) => {
  const m = mean(arr)
  return mean(arr.map((x) => Math.abs(x - m)))
}

export const fmt = (x, d = 3) => (Number.isFinite(x) ? (+x).toFixed(d) : '—')

export const fmtExp = (x, d = 2) =>
  Number.isFinite(x)
    ? x === 0
      ? '0'
      : x.toExponential(d).replace('e', '·10^').replace(/·10\^([\-\+])(\d+)/, '·10^$1$2')
    : '—'

export const rnd = (a, b) => a + Math.random() * (b - a)

export const noisePct = (pct) => 1 + (Math.random() * 2 - 1) * pct
