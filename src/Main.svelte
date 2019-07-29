<script>
	import { fly, slide, fade } from 'svelte/transition'
	import { me, troc } from './stores'
	import EditForm from './EditForm.svelte'
	import Work from './Work.svelte'
	import Admin from './Admin.svelte'
	import Resume from './Resume.svelte'
	import Trocs from './Trocs.svelte'
	import Login from './Login.svelte'

	let vue = 'EXPLORE'
	let menuOpen = false
	let openCreate = false
	let openUserOption = false

	//Pour test
	//troc.find('5d1cfa69aa6e871ce0b44fbe')
	//$: console.log($me)
	//$: console.log($tro  c)	

	function selectTroc(e, myTroc) {

		let admin = e.target.className.indexOf('fa-cog ') > -1
		let cashier = e.target.className.indexOf('fa-cash-register ') > -1
		if (admin) vue = 'ADMIN'
		else if (cashier) vue = 'WORK'
		else vue = 'RESUME'

		troc.find(myTroc._id)
	}

</script>


<header class="w3-row w3-padding w3-border-bottom" >

	<span class="clickable w3-xlarge" on:click="{() => menuOpen = !menuOpen}">
		TROCIO
		<i class="fa" class:fa-bars={!menuOpen} class:fa-times={menuOpen}></i>
	</span>

	<span id="trocSelected" class="w3-large">
	{#if $troc}
		{$troc.name ? $troc.name : ''}
		{vue == 'WORK' ? ' - Caisse' : ''}
		{vue == 'ADMIN' ? ' - Configuration' : ''}
	{/if}
	</span>


	<div id="userButton"
		class="w3-padding w3-border w3-round w3-right" 
		class:w3-button={!openUserOption} on:click="{() => openUserOption = true}">

		{@html $me.name ? `<i class="far fa-user"></i> ${$me.name}` : `Login`}
		
		{#if openUserOption}
			<div id="userOption" transition:slide class="w3-border w3-round">
				
				{#if $me.name}
					<h3 class="w3-center"><i class="far fa-user"></i> {$me.name}</h3>
					<ul class="w3-ul">
						<li>
							<a href="users/logout">
								<div class="w3-padding">
									<i class="fa fa-arrow-left"></i> Logout
								</div>		
							</a>
						</li>
					</ul>
				{/if}

				{#if !$me.name}
					<Login on:close="{() => openUserOption = false}"/>
				{/if}

			</div>
		{/if}
	</div>

</header>


<!-- Create troc modal -->
{#if openCreate}
	<div class="w3-modal" transition:fade>
		<div class="w3-modal-content w3-padding w3-center w3-round">
			<i on:click="{() => openCreate = false}" class="fa fa-times w3-xlarge w3-right w3-padding"></i>
			<EditForm createMode on:create="{() => openCreate = false}"/>
		</div>
	</div>
{/if}





<div id="vue" class="w3-row" on:click="{() => {menuOpen = false; openUserOption = false}}">

	{#if menuOpen && false} <!-- PLANQUER !!! -->
		<div id="sidebar" transition:fly="{{x: -300}}" class="w3-theme-d2">
			{#if $me.trocs}
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

			<div on:click="{() => openCreate = true}"
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

	
	<div class="w3-col" class:blur={openUserOption}>
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
		height: calc(100% - 58px);
		overflow-y: auto;
	}

	.w3-modal {
		display: block;
	}

	#userButton {
		position: relative;
		overflow: visible;
	}

	#userOption {
		position: absolute;
		z-index: 1000;
		right: -1px;
		top: -1px;
		width: 400px;
		background: #fff;
		box-shadow: 0px 0px 6px rgba(200, 200, 200, 0.8);
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
		transition: all 1s;
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

	.fa-times {
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.fa-times:hover {
		color: red;
		transform: scale(1.2);
	}

</style>