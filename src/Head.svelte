<script>
    import { slide, fade } from 'svelte/transition'
    import { me, troc } from './stores'
    import Login from './Login.svelte'
    import EditForm from './EditForm.svelte'

	export let openCreate = false
	export let openUserOption = false

</script>

<header class="w3-row w3-padding w3-border-bottom" >

	<a href="/" class="clickable w3-xlarge">
		<img src="favicon.ico" alt="logo Trocio" height="35" style="transform: translate(0px, -2px);">
		TROCIO<span class="w3-tiny" style="color: red;">alpha</span>
	</a>

	<span id="trocSelected" class="w3-large">
	{#if $troc}
		{$troc.name ? $troc.name : ''}
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

				{#if !$me.name}
					<Login on:close="{() => openUserOption = false}"/>
				{/if}

			</div>
		{/if}
	</div>

</header>

<div id="fond"
	 on:click="{() => openUserOption = false}"
	 class:w3-hide={!openUserOption}>
</div>


<!-- Create troc modal -->
{#if openCreate}
	<div class="w3-modal" transition:fade>
		<div class="w3-modal-content w3-padding w3-center w3-round">
			<i on:click="{() => openCreate = false}" class="fa fa-times w3-xlarge w3-right w3-padding"></i>
			<EditForm createMode on:create="{() => openCreate = false}"/>
		</div>
	</div>
{/if}

<style>
    .w3-modal {
		display: block;
	}

	#userOption ul li div i {
		margin-top: 5px;
	}

	#fond {
		position: absolute;
		left: 0px;
		top: 0px;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, .3);
		z-index: 10;
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
</style>