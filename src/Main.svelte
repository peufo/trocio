<script>
	import { fly, slide } from 'svelte/transition'
	import { me, troc } from './stores'
	import Work from './Work.svelte'
	import Admin from './Admin.svelte'
	import Create from './Create.svelte'


	let menuOpen = true
	let openCreate = false

	let vue = 'ADMIN'

	$: console.log($me)
	$: console.log(vue)

	function selectTroc(e, myTroc) {
		$troc = myTroc
		let admin = e.target.className.indexOf('fa-cog ') > -1
		if (admin) vue = 'ADMIN'
		else vue = 'WORK'
	}


</script>


<div class="w3-row w3-theme-d1 w3-padding w3-xlarge">

	<span class="clickable" on:click="{() => menuOpen = !menuOpen}">
		TROCIO
		<i class="fa" class:fa-bars={!menuOpen} class:fa-times={menuOpen}></i>
	</span>

	<span id="trocSelected">{$troc.name ? $troc.name : ''}</span>

	<span class="w3-right">
		<i class="fa fa-user"></i> {$me.name}
	</span>
	
</div>

<Create open={openCreate}/>

<div id="vue" class="w3-row">

	{#if menuOpen && $me.trocs}
		<div id="sidebar" in:fly="{{x: -300}}" class="w3-col m2 w3-theme-d2">
			{#if $me.trocs.length}
				<div class="w3-theme-d4 w3-padding w3-large">Mes trocs</div>
				<ul id="trocs" class="w3-ul">
				{#each $me.trocs as myTroc}
					<li in:slide
						class="clickable"
						class:w3-theme-d3="{$troc == myTroc.troc}"
						on:click="{(e) => selectTroc(e, myTroc.troc)}">
						{myTroc.troc.name}
						<span  class="w3-right w3-xlarge">
							<i class="fas fa-cash-register"></i>
							<i class="fa fa-cog"></i>							
						</span>
					</li>
				{/each}
				</ul>
			{/if}

			<div class="clickable w3-theme-d4 w3-padding w3-large ">
				<i class="fa fa-search"></i> Trouver un troc
			</div>

			<div on:click="{() => {openCreate = false; openCreate = true}}"
				class="clickable w3-theme-d4 w3-padding w3-large">
				<i class="fa fa-plus"></i> Créer votre troc
			</div>

			<br>
			<a href="/welcome#info" target="_blank">
				<div class="w3-theme-d5 w3-padding w3-large">
					<i class="fa fa-question"></i> Info
				</div>
			</a>

			<a href="users/logout">
				<div class="w3-theme-d5 w3-padding w3-large">
					<i class="fa fa-arrow-left"></i> Quitter
				</div>		
			</a>
		</div>
	{/if}

	<div class="w3-col" class:m10={menuOpen}>
		{#if vue == 'WORK'}
			<Work/>
		{:else if vue == 'ADMIN'}
			<Admin/>
		{/if}
	</div>

</div>


<svelte:head>
	<script src="https://kit.fontawesome.com/4eb68e6a9e.js"></script>
	<style>html, body {height: 100%;}</style>
</svelte:head>

<style>
	a {
		text-decoration: none;
	}
	.clickable {
		cursor: pointer;
	}
	.clickable:hover {
		color: black;
	}
	#vue {
		height: calc(100% - 52px)
	}
	#sidebar {
		height: 100%;
	}
	#trocSelected {
		position: fixed;
		left: 165px;
	}

	#trocs i {
		display: none;
	}

	#trocs li:hover i {
		display: inline-block;
	}

	#trocs i:hover {
		transform: scale(1.2);
	}

</style>