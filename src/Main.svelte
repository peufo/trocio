<script>
	import { fly, slide, fade } from 'svelte/transition'
	import { me, troc } from './stores'
	import EditForm from './EditForm.svelte'
	import Work from './Work.svelte'
	import Admin from './Admin.svelte'
	import Resume from './Resume.svelte'
	import Trocs from './Trocs.svelte'
	import { getHeader, updateTroc } from './utils'


	let vue = ''
	let menuOpen = false
	let openCreate = true

	//Pour test
	//troc.find('5d1cfa69aa6e871ce0b44fbe')
	//$: console.log($me)
	//$: console.log($troc)	

	function selectTroc(e, myTroc) {

		let admin = e.target.className.indexOf('fa-cog ') > -1
		let cashier = e.target.className.indexOf('fa-cash-register ') > -1
		if (admin) vue = 'ADMIN'
		else if (cashier) vue = 'WORK'
		else vue = 'RESUME'

		troc.find(myTroc._id)
	}

	function closeCreate(e) {
		if (e.target.className.indexOf('w3-modal ') > -1) {
			openCreate = false
		}
	}

	function create(e) {
		fetch(`/trocs`, getHeader(e.detail))
		.then(res => res.json())
		.then(json => updateTroc(json, () => openCreate = false))
	}



</script>


<div class="w3-row w3-theme-d1 w3-padding w3-xlarge">

	<span class="clickable" on:click="{() => menuOpen = !menuOpen}">
		TROCIO
		<i class="fa" class:fa-bars={!menuOpen} class:fa-times={menuOpen}></i>
	</span>

	<span id="trocSelected">
	{#if $troc}
		{$troc.name ? $troc.name : ''}
		{vue == 'WORK' ? ' - Caisse' : ''}
		{vue == 'ADMIN' ? ' - Configuration' : ''}
	{/if}
	</span>

	<span class="w3-right">
		<i class="fa fa-user"></i> {$me.name}
	</span>
	
</div>


<!-- Create troc modal -->
{#if openCreate}
<div class="w3-modal" on:click={closeCreate} transition:fade>
	<div class="w3-modal-content w3-padding w3-center w3-round">
		<h1>Création d'un nouveau troc</h1>
		<EditForm createMode on:create={create}/>
	</div>
</div>
{/if}


<div id="vue" class="w3-row" on:click="{() => menuOpen = false}">

	{#if menuOpen && $me.trocs}
		<div id="sidebar" transition:fly="{{x: -300}}" class="w3-theme-d2">
			{#if $me.trocs.length}
				<div class="w3-theme-d4 w3-padding w3-large">Mes trocs</div>
				<ul id="trocs" class="w3-ul">
				{#each $me.trocs as myTroc}
					<li class="clickable"
						class:w3-theme-d3="{$troc._id == myTroc._id}"
						on:click="{(e) => selectTroc(e, myTroc)}">
						{myTroc.name}
						{#if myTroc.cashier}
							<i class="fas fa-cash-register w3-right w3-xlarge"></i>
						{/if}
						{#if myTroc.admin}
							<i class="fas fa-cash-register w3-right w3-xlarge"></i>
							<i class="fa fa-cog w3-right w3-xlarge"></i>	
						{/if}
					</li>
				{/each}
				</ul>
			{/if}

			<div on:click="{() => vue = 'EXPLORE'}"
				class="clickable w3-theme-d4 w3-padding w3-large">
				<i class="fa fa-search"></i> Trouver un troc
			</div>

			<div on:click="{() => {openCreate = true; menuOpen = false;}}"
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

	<div class="w3-col" class:blur={menuOpen}>
		{#if vue === 'WORK'}
			<Work/>
		{:else if vue === 'ADMIN'}
			<Admin/>			
		{:else if vue === 'RESUME'}
			<Resume/>
		{:else if vue === 'EXPLORE'}
			<Trocs/>
		{/if}
	</div>

</div>


<svelte:head>
	<style>
		html, body {height: 100%;}
		#waitLoaded { display: none; }
		::-webkit-scrollbar { width: 10px; }
		::-webkit-scrollbar-track { background: #f1f1f1; }
		::-webkit-scrollbar-thumb { background: #888; }
		::-webkit-scrollbar-thumb:hover { background: #555; }
	</style>
</svelte:head>

<style>
	a {
		text-decoration: none;
	}
	.clickable {
		cursor: pointer;
	}
	.clickable:hover {
		
	}
	#vue {
		height: calc(100% - 52px);
		overflow-y: auto;
	}

	.w3-modal {
		display: block;
	}

	#sidebar {
		height: 100%;
		width: 300px;
		position: fixed;
		z-index: 100;
		border-right: 1px grey solid;
		box-shadow: 2px 2px 4px grey;
	}
	#sidebar ul {
		height: calc(100% - 288px);
		overflow-y: auto;

	}

	#trocSelected {
		position: fixed;
		left: 165px;
	}

	.blur {
		filter: blur(2px);
	}

	#trocs .fa-cog {
		margin-right: 10px;
	}

	#trocs i {
		display: inline-block;
		transform: scale(0);
		transition: all 0.2s ease;
	}

	#trocs li:hover i {
		transform: scale(1);
	}

	#trocs li:hover i:hover {
		transform: scale(1.2);
	}

</style>