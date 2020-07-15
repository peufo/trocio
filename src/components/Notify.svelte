<script>
    import { onMount } from 'svelte'
    import { fly } from 'svelte/transition'

    export let notifyContainer
    export let display = false

    onMount(() => {
        //Place la notification à la racine
    	if (!notifyContainer) notifyContainer = document.getElementsByTagName('body')[0]
		let notify = document.getElementById('notify')
        notifyContainer.appendChild(notify)
    })

</script>

<div id="notify">
	{#if display}
		<div class="notify-card w3-card w3-padding w3-round" style="min-width: 190px;" transition:fly={{x: -100}}>
            <slot/>
		</div>
	{/if}
</div>

<style>
	#notify {
		position: fixed;
		bottom: 10px;
    	left: 10px;
	}

	.notify-card {
		background: white;
		text-transform: uppercase;
	}

</style>