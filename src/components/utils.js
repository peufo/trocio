//import printJS from 'print-js'
import { troc } from './stores'
import { quintOut, cubicOut } from 'svelte/easing'
import { element } from 'svelte/internal'

/**
 * Define header for fetch
 * @param {Object} body Body of request
 * @param {String} verb Verbe of equest
 */

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

/**
 * Compute and return fee value
 * @param {{price: Number}} art 
 * @param {{fee: [{price: Number, value: Number}]}} tarif 
 * @returns {Number} fee
 */

export function getFee(art, tarif) {
	if (tarif && tarif.fee.length && art.price > 0) {
		return art.fee = tarif.fee.sort((a, b) => b.price - a.price).filter(f => f.price <= art.price)[0].value 
	}else if (art.price == 0) {
		return art.fee = 0
	}else return art.fee || 0
}

/**
 * Compute and return margin value
 * @param {{price: Number}} art 
 * @param {{fee: [{price: Number, value: Number}]}} tarif 
 * @returns {Number} margin
 */
export function getMargin(art, tarif) {
	if (tarif && art.price) {
		return art.margin = tarif.margin * art.price
	}else{
		return art.margin = 0
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

    let providedRequest  = this.fetch(`/articles?user_provider=${user}&troc=${troc}`).then(res => res.json())
    let purchasesRequest = this.fetch(`/articles?user_buyer=${user}&troc=${troc}`).then(res => res.json())
    let givbacksRequest  = this.fetch(`/articles?user_giveback.user=${user}&troc=${troc}`).then(res => res.json())
    let paymentsRequest  = this.fetch(`/payments?user=${user}&troc=${troc}`).then(res => res.json())
    let tarifRequest     = this.fetch(`/trocs/${troc}/tarif/${user}`,  {credentials: 'include'}).then(res => res.json())
    let traderRequest    = this.fetch(`/trocs/${troc}/trader/${user}`, {credentials: 'include'}).then(res => res.json())

    let [
        {data: provided,  dataMatchCount: providedCount},
        {data: purchases, dataMatchCount: purchasesCount},
        {data: givebacks, dataMatchCount: givebacksCount},
        payments,
        tarif,
        {prefix: traderPrefix}
    ] = await Promise.all([providedRequest, purchasesRequest, givbacksRequest, paymentsRequest, tarifRequest, traderRequest])
    
    return { trocId: troc, userId: user && user._id, provided, purchases, givebacks, payments, tarif, traderPrefix }
}