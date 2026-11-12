// Проверка: записываемое t в лаб.5 не должно зависеть от speed
const G = 9.81
const LIQ = { rho: 1250, eta: 0.85 }
const rhoS = 7860
const r = 0.002
const H_BOTTOM = 0.45
const h = 0.1

const a0 = (G * (rhoS - LIQ.rho)) / rhoS
const tau = (2 * rhoS * r * r) / (9 * LIQ.eta)
const vi = a0 * tau

// аналитическое эталонное время между метками
const yAt = (t) => vi * (t - tau * (1 - Math.exp(-t / tau)))
const bisect = (target) => {
  let lo = 0
  let hi = 100
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (yAt(mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
const tTrue = bisect(H_BOTTOM) - bisect(h)
console.log(`t_эталон (аналитика) = ${tTrue.toFixed(4)} с, v_inf = ${vi.toFixed(4)} м/с`)

// новая схема интегрирования из sim.jsx
function run(speed) {
  const s = { y: 0, v: 0, t: 0, started: false }
  const yy = (d) => s.y + vi * d + (s.v - vi) * tau * (1 - Math.exp(-d / tau))
  const adv = (d) => {
    const e = Math.exp(-d / tau)
    s.y += vi * d + (s.v - vi) * tau * (1 - e)
    s.v = vi + (s.v - vi) * e
  }
  const timeTo = (target, lim) => {
    if (yy(lim) < target) return null
    let lo = 0
    let hi = lim
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2
      if (yy(mid) < target) lo = mid
      else hi = mid
    }
    return (lo + hi) / 2
  }
  const dt = 1 / 60
  let guard = 0
  while (s.y < H_BOTTOM && guard++ < 1e6) {
    let rem = dt * speed
    while (rem > 1e-9) {
      if (!s.started) {
        const d1 = timeTo(h, rem)
        if (d1 == null) {
          adv(rem)
          break
        }
        adv(d1)
        s.started = true
        s.t = 0
        rem -= d1
      } else {
        const d2 = timeTo(H_BOTTOM, rem)
        if (d2 == null) {
          adv(rem)
          s.t += rem
          break
        }
        adv(d2)
        s.t += d2
        s.y = H_BOTTOM
        break
      }
    }
  }
  return s.t
}

for (const speed of [1, 2, 8, 20]) {
  const t = run(speed)
  console.log(`speed ×${String(speed).padEnd(2)}: t = ${t.toFixed(4)} с  (отклонение ${((t / tTrue - 1) * 100).toFixed(4)} %)`)
}

// старая схема (явный Эйлер) для сравнения
function runOld(speed) {
  const s = { y: 0, v: 0, t: 0, started: false }
  const dt = 1 / 60
  let guard = 0
  while (s.y < H_BOTTOM && guard++ < 1e5) {
    const dts = dt * speed
    const a = a0 - s.v / tau
    s.v += a * dts
    s.y += s.v * dts
    s.t += s.started ? dts : 0
    if (!s.started && s.y >= h) {
      s.started = true
      s.y = h
      s.t = 0
    }
  }
  return s.t
}
for (const speed of [1, 8, 20]) {
  console.log(`СТАРАЯ схема, speed ×${speed}: t = ${runOld(speed).toFixed(4)} с`)
}
