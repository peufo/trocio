<script>
	
	import { onMount, onDestroy } from 'svelte'
	import { spring } from 'svelte/motion'
	import Tab, { Label, Icon } from '@smui/tab'
	import TabBar from '@smui/tab-bar'

	export let tabs = []
	export let tabActived
	export let baseUrl = ''
	console.log('baseUrl', baseUrl)
	export let trackMouse = false
	export let maxWidthToShowLabel = 700
	let windowInnerWidth

	let container
	
	let swip = spring(0, {stiffness: .15, damping: 1})

	$: if(container) container.scrollLeft = $swip

	let swipPosition = null
	let swipPositionInitial = null
	let velocityX = 0	//average of velocitys.x
	let velocityY = 0	//average of velocitys.y
	let initialClientX = null

	let handleMove 		//instance of function

	onMount(() => {
		window.onresize = windowOnResize
		windowInnerWidth = window.innerWidth
		container.addEventListener('touchstart', handleStart)	
		document.addEventListener('touchend', handleEnd)
		if (trackMouse) {
			container.addEventListener('mousedown', handleStart)
			document.addEventListener('mouseup', handleEnd)
		}
		if (tabActived) activeTab(tabs.indexOf(tabActived), true)
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

	function windowOnResize(e) {
		activeTab(undefined, true)
		windowInnerWidth = window.innerWidth
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
			let index = tabs.indexOf(tabActived)

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

	function activeTab(index, snap = false) {
		if (typeof index == 'undefined') index = tabs.indexOf(tabActived)
		else tabActived = tabs[index]
		history.replaceState('', '', `${baseUrl}/${tabActived.href}${location.search}`)
		resizeContainerHeight()
		swipTo(index, snap)
	}

	function swipTo(index, snap = false) {
		let width = getContainerWidth()
		swip.stiffness = snap ? 1 : .15
		swip.set(index * width)
	}

	function getContainerWidth() {
		let { width } = container.getBoundingClientRect()
		let { borderLeftWidth, borderRightWidth } = window.getComputedStyle(container)
		borderLeftWidth = Number(borderLeftWidth.replace('px', ''))
		borderRightWidth = Number(borderRightWidth.replace('px', ''))
		let innerWidth = width - borderLeftWidth - borderRightWidth
		return innerWidth
	}

	function resizeContainerHeight() {
		let { borderTopWidth, borderBottomWidth } = window.getComputedStyle(container)
		borderTopWidth = Number(borderTopWidth.replace('px', ''))
		borderBottomWidth = Number(borderBottomWidth.replace('px', ''))
		container.style.height = tabActived.dom.offsetHeight + borderTopWidth + borderBottomWidth + 'px'
		return
	}

</script>


<TabBar {tabs} let:tab active={tabActived} on:MDCTabBar:activated={e => activeTab(e.detail.index)}>
	<Tab {tab} >
		<Icon class={tab.icon}></Icon>
		{#if windowInnerWidth > maxWidthToShowLabel}
			<Label>{tab.label}</Label>
		{/if}
	</Tab>
</TabBar>

<div bind:this={container} class="container">
	{#each tabs as tab}
		<div class="item">
			<div bind:this={tab.dom}>
				<slot {tab}></slot>
			</div>
		</div>
	{/each}
</div>

<style type="text/css">
	.container {
		width: 100%!important;
		overflow: hidden;
		display: flex;
		box-sizing: border-box;
		transition: 500ms all ease-out;
	}

	.item {
		width: 100%!important;
		text-align: center;
		flex: 1 0 auto;
		
	}

</style>

