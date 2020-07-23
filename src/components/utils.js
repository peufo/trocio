//import printJS from 'print-js'
import { troc } from './stores'
import { quintOut, cubicOut } from 'svelte/easing'
import { element } from 'svelte/internal'

export function getHeader(body, verb = 'POST') {
	return {
		method: verb,
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(body)
	}
}

export function updateTroc(json, cb) {
	if (json.success) {
		troc.refresh(json.message)
		if (cb) cb()
	}else{
		alert(json.message)
	}
}

export function sortByUpdatedAt(a, b) {
	return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
}

export function goPrint(id) {
	console.log('TODO: printJS(id)')
	/* TODO: WINDOW is not defined !!!!
	printJS({
		printable: id,
		type: 'html',
		targetStyles: ['*']
	})
	*/
}

export function formatPrice(e) {
	let val = e.target.value.match(/\d+([,\.]\d{0,2})?/)
	if (val) {
		val = val[0].replace(',', '.')
	}else{
		val = ''
	} 
	e.target.value = val
}

export function addStatutField(articles, context = 'organisator') {
	return articles.map(art => {
		art.statut = 'Proposé'
		if (art.valided) art.statut = 'Validé'
		if (art.refused) art.statut = 'Refusé'
		if (art.sold) art.statut = 'Vendu'
		if (art.recover) art.statut = context == 'organisator' ? 'Rendu' : 'Récupéré'
		return art
	})	
}

// SVELTE Transition
export const crossfadeConfig = {
	duration: d => Math.sqrt(d * 200),
	fallback(node, params) {
		const style = getComputedStyle(node)
		const transform = style.transform === 'none' ? '' : style.transform
		return {
			duration: 600,
			easing: quintOut,
			css: t => `
				transform: ${transform} scale(${t});
				opacity: ${t}
			`
		}
	}
}

export function slidH(node, { delay = 0, duration = 400, easing: easing$1 = cubicOut }) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const width = parseFloat(style.width);
    const padding_left = parseFloat(style.paddingLeft);
    const padding_right = parseFloat(style.paddingRight);
    const margin_left = parseFloat(style.marginLeft);
    const margin_right = parseFloat(style.marginRight);
    const border_left_width = parseFloat(style.borderLeftWidth);
    const border_right_width = parseFloat(style.borderRightWidth);
    return {
        delay,
        duration,
        easing: easing$1,
        css: t => `overflow: hidden;` +
            `opacity: ${Math.min(t * 20, 1) * opacity};` +
            `width: ${t * width}px;` +
            `padding-left: ${t * padding_left}px;` +
            `padding-right: ${t * padding_right}px;` +
            `margin-left: ${t * margin_left}px;` +
            `margin-right: ${t * margin_right}px;` +
            `border-left-width: ${t * border_left_width}px;` +
            `border-right-width: ${t * border_right_width}px;`
    };
}

function toDegreesMinutesAndSeconds(coordinate) {
    let absolute = Math.abs(coordinate)
    let degrees = Math.floor(absolute)
    let minutesNotTruncated = (absolute - degrees) * 60
    let minutes = Math.floor(minutesNotTruncated)
    let seconds = Math.floor((minutesNotTruncated - minutes) * 60)

    return degrees + "°" + minutes + "'" + seconds + '"'
}

export function convertDMS(lat, lng) {
	if (typeof lat === 'object') ({lat, lng} = lat)
    let latitude = toDegreesMinutesAndSeconds(lat)
    let latitudeCardinal = lat >= 0 ? "N" : "S"

    let longitude = toDegreesMinutesAndSeconds(lng)
    let longitudeCardinal = lng >= 0 ? "E" : "W"

    return latitude + latitudeCardinal + " " + longitude + longitudeCardinal
}

export async function getDetail(troc, user) {

	console.log('Get detail', {troc, user})

    let providedRequest  = fetch(`/articles?user_provider=${user}&troc=${troc}&include_without_name=true`).then(res => res.json())
    let purchasesRequest = fetch(`/articles?user_buyer=${user}&troc=${troc}`).then(res => res.json())
    let givbacksRequest  = fetch(`/articles?user_giveback.user=${user}&troc=${troc}`).then(res => res.json())
    let paymentsRequest  = fetch(`/payments?user=${user}&troc=${troc}`).then(res => res.json())
    let tarifRequest     = fetch(`/trocs/tarif?user=${user}&troc=${troc}`).then(res => res.json())
    let traderRequest    = fetch(`/trocs/trader?user=${user}&troc=${troc}`).then(res => res.json())

    let [
        {data: provided,  dataMatchCount: providedCount},
        {data: purchases, dataMatchCount: purchasesCount},
        {data: givebacks, dataMatchCount: givebacksCount},
        payments,
        tarif,
        {prefix: traderPrefix}
    ] = await Promise.all([providedRequest, purchasesRequest, givbacksRequest, paymentsRequest, tarifRequest, traderRequest])

	//Compute values
	//TODO: Deplacer coté serveur ?
	let buySum = purchases.length ? -purchases.map(a => a.price).reduce((acc, cur) => acc + cur) : 0
	let paySum = payments.length  ?  payments.map(a => a.amount).reduce((acc, cur) => acc + cur) : 0
	let soldSum = 0
	let feeSum = 0
	if (provided.length) {
		let arr = provided.filter(a => a.sold).map(a => a.price)
		soldSum = arr.length ? arr.reduce((acc, cur) => acc + cur) : 0

		arr = provided.filter(a => a.valided).map(a => a.fee)
		feeSum = arr.length ? -arr.reduce((acc, cur) => acc + cur) : 0

		arr = provided.filter(a => a.sold).map(a => a.margin)
		feeSum -= arr.length ? arr.reduce((acc, cur) => acc + cur) : 0
	}
	let balance = Math.round((buySum + paySum + soldSum + feeSum) * 100) / 100

	return {
		provided, providedCount,
		purchases, purchasesCount,
		givebacks, givebacksCount,
		payments,
		tarif,
		traderPrefix,
		buySum, paySum, soldSum, feeSum, balance
	 }
}