import { quintOut, cubicOut } from 'svelte/easing'
import type { Article, ArticleLookup, ArticleState } from 'types'

/** @deprecated */
export function getHeader(body, verb = 'POST') {
  return {
    method: verb,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export function sortByUpdatedAt(a, b) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
}
export function sortByRecover(a, b) {
  return new Date(b.recover).getTime() - new Date(a.recover).getTime()
}

/*
export function formatPrice(e) {
	let val = e.target.value.match(/\d+([,\.]\d{0,2})?/)
	if (val) {
		val = val[0].replace(',', '.')
	}else{
		val = ''
	} 

	console.log('Format price:', val, Number(val).toFixed(2))
	e.target.value = Number(val).toFixed(2)
	return 
}
*/
export function formatPrice(node) {
  function format(fixed = false) {
    let val = node.value.match(/\d+([,\.]\d{0,2})?/)
    if (val) {
      val = val[0].replace(',', '.')
    } else {
      val = ''
    }

    if (Number(val) === 0) node.value = ''
    else node.value = fixed ? Number(val).toFixed(2) : val
    return val
  }

  node.setAttribute('type', 'text')
  node.setAttribute('placeholder', '0.00')
  node.style.textAlign = 'right'

  format(true)
  node.addEventListener('input', () => format(false))
  node.addEventListener('blur', () => format(true))

  return {
    destroy() {
      node.removeEventListener('input', () => format(false))
      node.removeEventListener('blur', () => format(true))
    },
  }
}

export function renderAmount(
  amount?: number | string,
  currency?: string
): string {
  if (amount === undefined) return '-'
  amount = +amount
  if (isNaN(amount)) return '-'

  return amount.toLocaleString(
    undefined,
    currency
      ? {
          style: 'currency',
          currency,
        }
      : {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }
  )
}

export function getState(article: Article | ArticleLookup): ArticleState {
  if (article.recover) return 'recover'
  if (article.sold) return 'sold'
  if (article.refused) return 'refused'
  if (article.valided) return 'valided'
  return 'proposed'
}

export const STATE_LABEL: Record<ArticleState, string> = {
  proposed: 'Proposé',
  valided: 'Validé',
  refused: 'Refusé',
  sold: 'Vendu',
  recover: 'Récupéré',
}

export function getStateLabel(article: Article | ArticleLookup): string {
  return STATE_LABEL[getState(article)]
}

//TODO: This is a copy from ../api/controllers/article_utils
/** @deprecated */
export function getFee(art, tarif) {
  if (tarif && tarif.fee.length && art.price > 0) {
    return (art.fee = tarif.fee
      .sort((a, b) => b.price - a.price)
      .filter((f) => f.price <= art.price)[0].value)
  } else if (art.price == 0) {
    return (art.fee = 0)
  } else return art.fee || 0
}

//TODO: This is a copy from ../api/controllers/article_utils
/** @deprecated */
export function getMargin(art, tarif) {
  if (tarif && art.price) {
    return (art.margin = tarif.margin * art.price)
  } else {
    return (art.margin = 0)
  }
}

// SVELTE Transition
export const crossfadeConfig = {
  duration: (d) => Math.sqrt(d * 200),
  fallback(node, params) {
    const style = getComputedStyle(node)
    const transform = style.transform === 'none' ? '' : style.transform
    return {
      duration: 600,
      easing: quintOut,
      css: (t) => `
				transform: ${transform} scale(${t});
				opacity: ${t}
			`,
    }
  },
}

export function slidH(
  node,
  { delay = 0, duration = 400, easing: easing$1 = cubicOut }
) {
  const style = getComputedStyle(node)
  const opacity = +style.opacity
  const width = parseFloat(style.width)
  const padding_left = parseFloat(style.paddingLeft)
  const padding_right = parseFloat(style.paddingRight)
  const margin_left = parseFloat(style.marginLeft)
  const margin_right = parseFloat(style.marginRight)
  const border_left_width = parseFloat(style.borderLeftWidth)
  const border_right_width = parseFloat(style.borderRightWidth)
  return {
    delay,
    duration,
    easing: easing$1,
    css: (t) =>
      `overflow: hidden;` +
      `opacity: ${Math.min(t * 20, 1) * opacity};` +
      `width: ${t * width}px;` +
      `padding-left: ${t * padding_left}px;` +
      `padding-right: ${t * padding_right}px;` +
      `margin-left: ${t * margin_left}px;` +
      `margin-right: ${t * margin_right}px;` +
      `border-left-width: ${t * border_left_width}px;` +
      `border-right-width: ${t * border_right_width}px;`,
  }
}

function toDegreesMinutesAndSeconds(coordinate) {
  let absolute = Math.abs(coordinate)
  let degrees = Math.floor(absolute)
  let minutesNotTruncated = (absolute - degrees) * 60
  let minutes = Math.floor(minutesNotTruncated)
  let seconds = Math.floor((minutesNotTruncated - minutes) * 60)

  return degrees + '°' + minutes + "'" + seconds + '"'
}

export function convertDMS(lat, lng) {
  if (typeof lat === 'object') ({ lat, lng } = lat)
  let latitude = toDegreesMinutesAndSeconds(lat)
  let latitudeCardinal = lat >= 0 ? 'N' : 'S'

  let longitude = toDegreesMinutesAndSeconds(lng)
  let longitudeCardinal = lng >= 0 ? 'E' : 'W'

  return latitude + latitudeCardinal + ' ' + longitude + longitudeCardinal
}

export function syntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2)
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = 'number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key'
        } else {
          cls = 'string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean'
      } else if (/null/.test(match)) {
        cls = 'null'
      }
      return '<span class="' + cls + '">' + match + '</span>'
    }
  )
}
