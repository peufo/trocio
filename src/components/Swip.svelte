<script>
	
	import { redirect, params } from '@sveltech/routify'
	import { onMount, onDestroy } from 'svelte'
	import { spring } from 'svelte/motion'
	import Tab, { Label, Icon } from '@smui/tab'
	import TabBar from '@smui/tab-bar'

	export let tabId = 'no-id'
	export let tabs = []
	export let tabActived
	export let index = tabs.indexOf(tabActived)
	export let trackMouse = false
	export let maxWidthToShowLabel = 700

	let container
	let offsetWidth
	let offsetHeight = []
	let swip = spring(0, {stiffness: .15, damping: 1})

	let swipPosition = null
	let swipPositionInitial = null
	let velocityX = 0	//average of velocitys.x
	let velocityY = 0	//average of velocitys.y
	let initialClientX = null
	let handleMove 		//instance of function

	$: if (container) container.style.height = offsetHeight[index] + 'px'
	$: if (container) container.scrollLeft = $swip

	onMount(() => {
		container.addEventListener('touchstart', handleStart)	
		document.addEventListener('touchend', handleEnd)
		if (trackMouse) {
			container.addEventListener('mousedown', handleStart)
			document.addEventListener('mouseup', handleEnd)
		}
		if (tabActived) {
			swip.stiffness = 1
			swip.set(index * offsetWidth)
		}
	})

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			if (container) container.removeEventListener('touchstart', handleStart)	
			document.removeEventListener('touchend', handleEnd)
			if (trackMouse) {
				container.removeEventListener('mousedown', handleStart)
				document.removeEventListener('mouseup', handleEnd)
			}
		}
	})

	function activeTab(newIndex) {

		if (newIndex !== null) index = newIndex
		tabActived = tabs[index]
		$redirect(location.pathname, {...$params, tab: tabActived.href})

		swip.stiffness = .15
		swip.set(index * offsetWidth)

	}

	function handleStart(e) {
		swipPositionInitial = container.scrollLeft
		initialClientX = e.clientX || e.touches[0].clientX
		handleMove = handleMoveBuilder(e)
		if (e.type === 'mousedown') {
			container.addEventListener('mousemove', handleMove)
		}else if (e.type === 'touchstart') {
			container.addEventListener('touchmove', handleMove)
		}
	}

	function handleMoveBuilder(e) {
		let swipActived = false
		const VELOCITYS_SIZE = 3	//Size of buffer of touch velocity
		let velocitys = []
		const COUNT_MAX = 10 		//Number of events before desabled swip
		let count = 0
		let lastClientX = null
		let lastClientY = null

		return function computeChange(e) {
			let clientX = e.clientX || e.touches[0].clientX
			let clientY = e.clientY || e.touches[0].clientY

			if (!swipActived) {
				count++
				let x = clientX - lastClientX
				let y = clientY - lastClientY
				if (lastClientX !== null) velocitys = [{x, y}, ...velocitys.slice(0, VELOCITYS_SIZE)]
				lastClientX = clientX
				lastClientY = clientY
				velocityX = velocitys.length ? velocitys.map(v => v.x).reduce((acc, cur) => acc + cur) / velocitys.length : 0
				velocityY = velocitys.length ? velocitys.map(v => v.y).reduce((acc, cur) => acc + cur) / velocitys.length : 0
			}
			
			if (swipActived || Math.abs(velocityX) > Math.abs(velocityY)) {//Swip
				swipActived = true
				e.preventDefault() //Disabled swip touch
				swipPosition = swipPositionInitial - (clientX - initialClientX)
				swip.stiffness = 1
				swip.set(swipPosition, 0)
			}

			if (count >= COUNT_MAX) {
				container.removeEventListener('mousemove', handleMove)
				container.removeEventListener('touchmove', handleMove)
				handleMove = null
			}

		}

	}

	function handleEnd(e) {
		
		if (swipPosition !== null && swipPositionInitial != swipPosition) {

			if(Math.abs(velocityX) > 8) {
				//dynamic handler
				if (velocityX > 0) index--
				else index++
				
			}else {
				//Static handler
				let width = getContainerWidth()
				index = Math.floor((swipPosition + width / 2) / width)
			}

			if (index < 0) index = 0
			if (index >= tabs.length) index = tabs.length - 1
			activeTab(index)
		}


		swipPosition = null
		swipPositionInitial = null
		velocityX = 0
		velocityY = 0
		initialClientX = null

		if (handleMove) {
			container.removeEventListener('mousemove', handleMove)
			container.removeEventListener('touchmove', handleMove)
			handleMove = null
		}
	}

</script>

<div class="simple-card" bind:offsetWidth>
	<TabBar {tabs} let:tab id={tabId}
		active={tabActived}
		on:MDCTabBar:activated={e => activeTab(e.detail.index)}
		style="border-bottom: 1px #eee solid">
		<Tab {tab} >
			<Icon class={tab.icon}></Icon>
			{#if offsetWidth > maxWidthToShowLabel}
				<Label>{tab.label}</Label>
			{/if}
		</Tab>
	</TabBar>

	<div bind:this={container} class="container">
		{#each tabs as tab, i}
			<div class="item">
				<div bind:this={tab.dom} bind:offsetHeight={offsetHeight[i]}>
					<slot {tab}></slot>
				</div>
			</div>
		{/each}
	</div>
</div>


<style>
	.container {
		width: 100%!important;
		overflow: hidden;
		display: flex;
		/*transition: .3s all ease-out;*/
		outline: none;
	}

	.item {
		width: 100%!important;
		flex: 1 0 auto;	
	}

</style>

