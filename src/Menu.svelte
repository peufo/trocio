<script>
	import { fly } from 'svelte/transition'
	import { me } from './stores'
	let menuOpen = true

	$: console.log($me)

</script>


<div class="w3-row w3-theme-d1 w3-padding w3-xlarge">

	<span class="clickable" on:click="{() => menuOpen = !menuOpen}">
		TROCIO
		<i class="fa" class:fa-bars={!menuOpen} class:fa-times={menuOpen}></i>
	</span>

	<span id="trocSelected">Troc selected</span>

	<span class="w3-right">
		<i class="fa fa-user"></i>

		{$me.name}
	</span>
	
</div>	

{#if menuOpen}
<div id="sidebar"
	 transition:fly="{{x: -300}}"
	 class="w3-col m3 w3-theme-d2">
	<div class="w3-theme-d4 w3-padding w3-large">
		Mes bourses
	</div>

	<ul class="w3-ul">
		<li>Bours A</li>
		<li>Bours B</li>
		<li>Bours C</li>
	</ul>

	<br>
	<a href="users/logout">
		<div class="clickable w3-theme-d4 w3-padding w3-large">
			<i class="fa fa-arrow-left"></i>
			Quiter
		</div>		
	</a>
</div>
{/if}



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
	#sidebar {
		height: 100%;
	}
	#trocSelected {
		position: fixed;
		left: 165px;
	}
</style>