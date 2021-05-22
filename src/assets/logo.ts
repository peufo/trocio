interface Dot {
  x: number
  y: number
}

/**
 * return a path of a line with weight and border-radius
 *
 * @param from start of line
 * @param to end of line
 */
function line(from: Dot, to: Dot) {
  const W = 100
  const X = to.x - from.x
  const Y = to.y - from.y
  const H = (X ** 2 + Y ** 2) ** 0.5
  const WX = Math.round(((Y * W) / H / 2) * 1000) / 1000
  const WY = Math.round(((X * W) / H / 2) * 1000) / 1000
  let d = `M${from.x + WX} ${from.y - WY} `
  d += `c${1.25 * -WY} ${1.25 * -WX} `
  d += `${-2 * WX - 1.25 * WY} ${2 * WY - 1.25 * WX} `
  d += `${-2 * WX} ${2 * WY} `
  d += `L${to.x - WX} ${to.y + WY} `
  d += `c${1.25 * WY} ${1.25 * WX} `
  d += `${2 * WX + 1.25 * WY} ${-2 * WY + 1.25 * WX} `
  d += `${2 * WX} ${-2 * WY} `
  d += 'z'
  return d
}

const center = { x: 500, y: 500 }
const angles = [0, 60, 120, 180, 240, 300]
const RAYON = 400
const dots = angles.map((angle) => {
  const radians = (angle / 360) * Math.PI * 2
  let x = center.x + Math.cos(radians) * RAYON
  let y = center.y - Math.sin(radians) * RAYON
  return {
    x: Math.round(x * 1000) / 1000,
    y: Math.round(y * 1000) / 1000,
  }
})

const lines = [
  line(center, dots[0]),
  line(center, dots[2]),
  line(center, dots[4]),
  line(dots[0], dots[1]),
  line(dots[1], dots[2]),
  line(dots[2], dots[3]),
  line(dots[3], dots[4]),
  line(dots[4], dots[5]),
  line(dots[5], dots[0]),
]

const path = lines.join('')

const viewWidth = 1000
const viewHeight = 1000
export default { path, viewWidth, viewHeight }
