import printJS from 'print-js'
import { troc } from './stores'
import { quintOut } from 'svelte/easing'
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

/**
 * Compute and return fee value
 * @param {{price: Number}} art 
 * @param {{fee: [{price, value}]}} tarif 
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
 * 
 * @param {*} art 
 * @param {*} tarif 
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
	printJS({
		printable: id,
		type: 'html',
		targetStyles: ['*']
	})
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