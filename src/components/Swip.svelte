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

	export let maxWidthToShowLabel = 700
	let offsetWidth

	let swiperElem
	let swiper

	let offsetHeight = []
	$: offsetHeight && swiper && swiper.update()

	onMount(() => {
		swiper = new Swiper(swiperElem, {
			on: {
				init: desableFocus,
				slideChange: swiper => {
					index = swiper.activeIndex
					tabActived = tabs[index]
					console.log('Swip onMount slideChange redirect', $params)
					$redirect(location.pathname, {...$params, tab: tabActived.href})
				}
			},
			initialSlide: index,
			autoHeight: true
		})

	})


	function activeTab(newIndex) {
		index = newIndex
		tabActived = tabs[index]
		swiper.slideTo(index)
		console.log('Active Tab redirect')
		$redirect(location.pathname, {...$params, tab: tabActived.href})
		desableFocus()
	}

	function desableFocus() {
		swiperElem.querySelectorAll('.swiper-slide').forEach((slide, i) => {
			if (i !== index) slide.querySelectorAll('input, button').forEach(input => input.setAttribute('tabindex', '-1'))
			else slide.querySelectorAll('input, button').forEach(input => input.removeAttribute('tabindex'))
		})
	}

</script>

<div bind:offsetWidth>
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

	<div class="swiper-container" bind:this={swiperElem}>
		<div class="swiper-wrapper">
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

