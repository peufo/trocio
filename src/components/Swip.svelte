<script>
	import { onMount, onDestroy } from 'svelte'
	import { spring } from 'svelte/motion'
	import { redirect, params } from '@roxi/routify'
	import Tab, { Label, Icon } from '@smui/tab'
	import TabBar from '@smui/tab-bar'
	import { Swiper } from 'swiper'
	import 'swiper/swiper.scss';

	export let tabId = 'no-id'
	export let query = 'tab'
	export let tabs = []
	export let activeIndex = 0

	export let maxWidthToShowLabel = 700
	let offsetWidth

	let swiperElem
	export let swiper

	let offsetHeight = []
	$: offsetWidth && offsetHeight && swiper && swiper.update()

	onMount(() => {
		swiper = new Swiper(swiperElem, {
			on: {
				init: desableFocus,
				slideChange: swiper => {
					activeIndex = swiper.activeIndex
					$redirect(location.pathname, {...$params, [query]: tabs[activeIndex].ref})
					desableFocus()
				}
			},
			initialSlide: activeIndex,
			autoHeight: true,
			simulateTouch: false
		})
		
	})

	function desableFocus() {
		swiperElem.querySelectorAll('.swiper-slide').forEach((slide, i) => {
			if (i !== activeIndex) slide.querySelectorAll('input, button').forEach(input => input.setAttribute('tabindex', '-1'))
			else slide.querySelectorAll('input, button').forEach(input => input.removeAttribute('tabindex'))
		})
	}

</script>

<div bind:offsetWidth>

	<TabBar
		{tabs}
		{activeIndex}
		let:tab
		id={tabId}
		on:MDCTabBar:activated={e => swiper.slideTo(e.detail.index)}
		style="border-bottom: 1px #eee solid">
		<Tab {tab} >
			<Icon class={tab.icon}></Icon>
			{#if offsetWidth > maxWidthToShowLabel}
				<Label>{tab.label}</Label>
			{/if}
		</Tab>
	</TabBar>

	<div class="swiper-container" bind:this={swiperElem}>
		<div class="swiper-wrapper" >
			{#each tabs as tab, i}
				<div class="swiper-slide" bind:offsetHeight={offsetHeight[i]}>
					<slot {tab}></slot>
				</div>
			{/each}
		</div>
	</div>
	
</div>


<style>

	.swiper-wrapper {
		box-sizing: border-box;
	}

</style>

