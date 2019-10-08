<script>
    import { slide, fade } from 'svelte/transition'
    import { me, troc } from './stores'
    import Login from './Login.svelte'
	import Button from '@smui/button'
	import Dialog from '@smui/dialog'

	let dialogLogin

</script>

<header class="w3-row w3-padding w3-border-bottom" >

	<div class="w3-col s4">
		<a href="/" class="clickable w3-xlarge">
			<img src="favicon.ico" alt="logo Trocio" height="35" style="transform: translate(0px, -2px);">
			TROCIO<span class="w3-tiny" style="color: red;">alpha</span>
		</a>
	</div>

	<div class="w3-col s4 w3-center">
		<div id="trocSelected" class="w3-xlarge">
			{#if document.location.pathname == '/me'}
				Mon compte
			{:else if $troc}
				{$troc._id ? $troc.name : ''}
			{/if}
		</div>
	</div>


	{#if $me._id}
		<Button
		variant="outlined"
		color="secondary"
		class="w3-right w3-padding"
		href="/me"
		>
			<i class="far fa-user w3-large"></i>&nbsp;{$me.name}
		</Button>
	{:else}
		<Button
		variant="outlined"
		color="secondary"
		class="w3-right w3-padding"
		on:click="{() => dialogLogin.open()}"
		>
			Login
		</Button>

		<Dialog
		bind:this={dialogLogin}>
			<Login/>
		</Dialog>

	{/if}


	<!--
	<div id="userButton"
		class="w3-padding w3-border w3-round w3-right" 
		class:w3-button={!openUserOption} on:click="{() => openUserOption = true}">

		{@html $me._id ? `<i class="far fa-user"></i> ${$me.name}` : `Login`}
		
		{#if openUserOption}
			<div id="userOption" transition:slide class="w3-border w3-round">
				
				{#if $me._id}
					<h3 class="w3-center"><i class="far fa-user"></i> {$me.name}</h3>
					<ul class="w3-ul w3-center">
						<li>
							<div class="underline-div" on:click|stopPropagation="{() => {openCreate = true; openUserOption = false;}}">
								<i class="far fa-plus-square w3-left" style="margin-left: 2px;"></i>
								<span class="underline-span">Créer mon troc</span>
							</div>
						</li>
						<li>
							<div class="underline-div">
								<i class="far fa-eye w3-left"></i>
								<span class="underline-span">Voir mes trocs</span>
							</div>
						</li>
						<li>
							<a href="users/logout">
								<div class="underline-div">
									<i class="fa fa-arrow-left w3-left" style="margin-left: 2px;"></i>
									<span class="underline-span">Logout</span>
								</div>		
							</a>
						</li>
					</ul>
				{/if}

				{#if !$me._id}
					<Login on:close="{() => openUserOption = false}"/>
				{/if}

			</div>
		{/if}
	</div>

	-->

</header>

<!--
	<div id="fond"
		on:click="{() => openUserOption = false}"
		class:w3-hide={!openUserOption}>
	</div>
-->



<style>

</style>