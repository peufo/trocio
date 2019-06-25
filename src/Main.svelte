<script>
	import { fly, slide } from 'svelte/transition'
	import { me, troc } from './stores'
	import Work from './Work.svelte'
	import Admin from './Admin.svelte'
	import Create from './Create.svelte'


	let vue = ''
	let menuOpen = true
	let openCreate = false


	function selectTroc(e, myTroc) {

		fetch(`/trocs/${myTroc._id}`).then(res => res.json()).then(json => $troc = json)
		
		let admin = e.target.className.indexOf('fa-cog ') > -1
		let cashier = e.target.className.indexOf('fa-cash-register ') > -1
		if (admin) vue = 'ADMIN'
		else if (cashier) vue = 'WORK'
		else vue = 'RESUME'
	}

	$: console.log($me)
	$: console.log($troc)

</script>


<div class="w3-row w3-theme-d1 w3-padding w3-xlarge">

	<span class="clickable" on:click="{() => menuOpen = !menuOpen}">
		TROCIO
		<i class="fa" class:fa-bars={!menuOpen} class:fa-times={menuOpen}></i>
	</span>

	<span id="trocSelected">
	{$troc.name ? $troc.name : ''}
	{#if $troc.name}
		{vue == 'WORK' ? ' - Caisse' : ''}
		{vue == 'ADMIN' ? ' - Configuration' : ''}
	{/if}
	</span>

	<span class="w3-right">
		<i class="fa fa-user"></i> {$me.name}
	</span>
	
</div>

<Create open={openCreate}/>

<div id="vue" class="w3-row" on:click="{() => menuOpen = false}">

	{#if menuOpen && $me.trocs}
		<div id="sidebar" transition:fly="{{x: -300}}" class="w3-theme-d2">
			{#if $me.trocs.length}
				<div class="w3-theme-d4 w3-padding w3-large">Mes trocs</div>
				<ul id="trocs" class="w3-ul">
				{#each $me.trocs as myTroc}
					<li class="clickable"
						class:w3-theme-d3="{$troc == myTroc.troc}"
						on:click="{(e) => selectTroc(e, myTroc.troc)}">
						{myTroc.troc.name}
						<i class="fas fa-cash-register w3-right w3-xlarge"></i>
						<i class="fa fa-cog w3-right w3-xlarge"></i>							
					</li>
				{/each}
				</ul>
			{/if}

			<div on:click="{() => vue = 'EXPLORE'}"
				class="clickable w3-theme-d4 w3-padding w3-large">
				<i class="fa fa-search"></i> Trouver un troc
			</div>

			<div on:click="{() => {openCreate = false; menuOpen = false; openCreate = true}}"
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

	<div class="w3-col" class:flou={menuOpen}>
		{#if vue == 'WORK'}
			<Work/>
		{:else if vue == 'ADMIN'}
			<Admin/>
		{:else if vue == 'RESUME'}
			RESUME
		{:else if vue == 'EXPLORE'}
			TODO: Lien externe vers la vue exploration
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
		width: 300px;
		position: fixed;
		z-index: 100;
		box-shadow: 5px 2px 5px grey;
	}
	#trocSelected {
		position: fixed;
		left: 165px;
	}

	.flou {
		filter: blur(2px);
	}


	#trocs .fa-cog {
		margin-right: 10px;
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