import { quintOut, cubicOut } from 'svelte/easing'
import printJS from 'print-js'
import { troc } from './stores.js'
import type { Article, ArticleLookup } from 'types'

/** @deprecated */
export function getHeader(body, verb = 'POST') {
  return {
    method: verb,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export function updateTroc(json, cb) {
  if (json.success) {
    troc.refresh(json.message)
    if (cb) cb()
  } else {
    alert(json.message)
  }
}

export function sortByUpdatedAt(a, b) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
}
export function sortByRecover(a, b) {
  return new Date(b.recover).getTime() - new Date(a.recover).getTime()
}

export function goPrint(id) {
  printJS({
    printable: id,
    type: 'html',
    targetStyles: ['*'],
  })
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
  amount: number | string,
  currency?: string
): string {
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

export const STATUTS = ['Proposé', 'Validé', 'Refusé', 'Vendu', 'Récupéré']

export function addStatutField(articles: Article | Article[]) {
  if (Array.isArray(articles)) {
    return articles.map(getStatut)
  } else {
    return getStatut(articles)
  }
}

export function getStatut(article: Article | ArticleLookup) {
  if (article.recover) return STATUTS[4]
  if (article.sold) return STATUTS[3]
  if (article.refused) return STATUTS[2]
  if (article.valided) return STATUTS[1]
  return STATUTS[0]
}

//TODO: This is a copy from ../api/models/troc (virtual)
export function addIsClosed(trocs) {
  let isArray = Array.isArray(trocs)
  trocs = isArray ? trocs : [trocs]
  trocs = trocs.map((troc) => {
    troc.isClosed =
      troc.schedule &&
      !!troc.schedule[0] &&
      new Date(troc.schedule[troc.schedule.length - 1].close).getTime() <
        new Date().getTime()
    return troc
  })
  return isArray ? trocs : trocs[0]
}

//TODO: This is a copy from ../api/controllers/troc_utils
export function getFee(art, tarif) {
  if (tarif && tarif.fee.length && art.price > 0) {
    return (art.fee = tarif.fee
      .sort((a, b) => b.price - a.price)
      .filter((f) => f.price <= art.price)[0].value)
  } else if (art.price == 0) {
    return (art.fee = 0)
  } else return art.fee || 0
}

//TODO: This is a copy from ../api/controllers/troc_utils
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

//Options for SearchTable
export const statutFiltersOptions = [
  { queryValue: '', label: 'Tous', icon: '' },
  {
    queryValue: 'proposed',
    label: 'Proposé',
    icon: '<i class="fas fa-dot-circle w3-text-light-grey"></i>',
  },
  {
    queryValue: 'valided',
    label: 'Validé',
    icon: '<i class="fas fa-dot-circle w3-text-blue"></i>',
  },
  {
    queryValue: 'refused',
    label: 'Refusé',
    icon: '<i class="fas fa-dot-circle w3-text-red"></i>',
  },
  {
    queryValue: 'sold',
    label: 'Vendu',
    icon: '<i class="fas fa-dot-circle w3-text-green"></i>',
  },
  {
    queryValue: 'recover',
    label: 'Récupéré',
    icon: '<i class="fas fa-dot-circle w3-text-orange"></i>',
  },
]

export const sortOptions = [
  { queryValue: '', label: 'Non trié', icon: '<i class="fas fa-bars"></i>' },
  {
    queryValue: '1',
    label: 'Croissant',
    icon: '<i class="fas fa-sort-amount-down-alt"></i>',
  },
  {
    queryValue: '-1',
    label: 'Décroissant',
    icon: '<i class="fas fa-sort-amount-down"></i>',
  },
]

export function getFields(added, removed) {
  let fields = [
    {
      label: '#',
      checked: true,
      typeMenu: 'search',
      dataName: 'ref',
      dataType: 'string',
      cellWidth: 50,
      disabled: true,
    },
    {
      label: 'Désignation',
      checked: true,
      typeMenu: 'search',
      dataName: 'name',
      dataType: 'string',
      cellWidth: 300,
      disabled: true,
    },
    {
      label: 'Statut',
      checked: true,
      typeMenu: 'filter',
      dataName: 'statut',
      dataType: 'string',
      cellWidth: 90,
      options: statutFiltersOptions,
    },
    {
      label: 'Création',
      checked: false,
      typeMenu: 'sort',
      dataName: 'createdAt',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Fournisseur',
      checked: true,
      typeMenu: 'user',
      dataName: 'provider.name',
      dataType: 'string',
      cellWidth: 70,
    },
    {
      label: 'Validation',
      checked: false,
      typeMenu: 'sort',
      dataName: 'valided',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Validateur',
      checked: false,
      typeMenu: 'user',
      dataName: 'validator.name',
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Vente',
      checked: false,
      typeMenu: 'sort',
      dataName: 'sold',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Récupération',
      checked: false,
      typeMenu: 'sort',
      dataName: 'recover',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Caissier',
      checked: false,
      typeMenu: 'user',
      dataName: 'seller.name',
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Client',
      checked: false,
      typeMenu: 'user',
      dataName: 'buyer.name',
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Frais',
      checked: false,
      typeMenu: 'sort',
      dataName: 'fee',
      dataType: 'number',
      cellWidth: 50,
    },
    {
      label: 'Marge',
      checked: false,
      typeMenu: 'sort',
      dataName: 'margin',
      dataType: 'number',
      cellWidth: 50,
    },
    {
      label: 'Prix',
      checked: true,
      typeMenu: 'sort',
      dataName: 'price',
      dataType: 'number',
      cellWidth: 50,
    },
  ]

  if (added) {
    fields = fields.filter((f) => added.indexOf(f.label) > -1)
  }

  if (removed) {
    fields = fields.filter((f) => removed.indexOf(f.label) == -1)
  }

  fields = fields.map((field) => {
    field.queryValue = ''
    field.queryLabel = ''
    field.queryIcon = ''
    if (field.typeMenu == 'sort') field.options = sortOptions
    if (field.typeMenu == 'user')
      field.queryIcon = '<i class="far fa-user"></i>'
    return field
  })
  return fields
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
