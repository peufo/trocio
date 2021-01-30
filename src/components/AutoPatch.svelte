<script>

	//TODO: Can become a simple module

	import { onMount } from 'svelte'

	import { troc } from './stores'
	import { getHeader } from './utils'
	import notify from './notify'

	export let body = {} 
	export let source = ''
	export let invalid = ''
	export let path = ''
	export let changeFlag = false
	export let trocRefresh = false

	let noticeEdit = null

	const WAIT_FOR_PATCH = 600
	let waiting
	let onModify = false
	let patchPromise
	let patchCount = 0


	onMount(() => {
		document.getElementById(source).addEventListener('input', testInput)
		document.getElementById(source).addEventListener('click', testClick)
	})
	
	let firstChangeFlag = true
	$: {
		if (!firstChangeFlag) {
			changeFlag
			change()
			changeFlag = false		
		}
		firstChangeFlag = false
	}

	function testInput(e) {
		if(!e.target.classList.contains('searchInput') && !e.target.classList.contains('searchUser')) {
			change()
		}
	}

	function testClick(e) {
		if(e.target.classList.contains('patchButton')) {
			change()
		}
	}

	function change() {
		let options = {type: 'info', title: 'Modification...', icon : 'far fa-edit', hide: false}
		if (!noticeEdit) noticeEdit = notify.info(options)
		if(invalid) noticeEdit.update({type: 'notice', title: invalid, icon: 'fas fa-exclamation'})
		else noticeEdit.update(options)

		onModify = true
		clearTimeout(waiting)
		if (!invalid) waiting = setTimeout(getPatched, WAIT_FOR_PATCH)
	}

	function getPatched() {
		onModify = false
		patchPromise = patch()
	}

	async function patch() {

		//let noticePatch = noticeEdit
		//noticeEdit = null
		noticeEdit.update({type: 'info', title: 'Sauvegarde...', icon: 'fas fa-sync-alt w3-spin', hide: false})
		patchCount++

		try {
			const res = await fetch(`/__API__${path}`, getHeader(body, 'PATCH'))
			const json = await res.json()
			patchCount--
			if (json.success) {
				if (patchCount == 0 && !onModify) {
					if (trocRefresh) troc.refresh(json.message)
					console.log({noticeEdit})
					noticeEdit.update({type: 'success', title: 'Sauvegardé', icon: 'fas fa-check', hide: true})
					noticeEdit.on('pnotify:afterClose', () => noticeEdit = null)
				}
				//noticePatch = null
				return 
			}else{
				noticeEdit.update({type: 'error', title: json.message, icon: 'fas fa-bug', hide: true})
				noticeEdit.on('pnotify:afterClose', () => noticeEdit = null)
				//noticePatch = null
				throw Error(json.message)
			}
		} catch(error) {
            console.trace(error)
        }
	}


</script>
