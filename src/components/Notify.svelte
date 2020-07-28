<script context="module">

    //TODO: use just one element notify

   

</script>

<script>
    import { onMount, onDestroy } from 'svelte'
    import { fly } from 'svelte/transition'

    export let notifyContainer
    export let display = false
    export let message = ''
    export let icon = ''
    let notifyElement

    let timeOutA, timeOutB
    export function notify(messageArg, iconArg, duration = 2000) {
        if (timeOutA) clearTimeout(timeOutA)
        if (timeOutB) clearTimeout(timeOutB)
        display = true
        message = messageArg
        icon = iconArg
        timeOutA = setTimeout(() => {
            display = false
        }, duration - 200)
        timeOutB = setTimeout(() => {
            message = ''
            icon = ''
        }, duration + 200) 
    }
    
    function notifyBuilder() {
        function notify(messageArg, iconArg, duration = 2000) {
            let timeOutA, timeOutB
            return () => {
                console.log({timeOutA})
                if (timeOutA) clearTimeout(timeOutA)
                if (timeOutB) clearTimeout(timeOutB)

                display = true
                message = messageArg
                icon = iconArg
                timeOutA = setTimeout(() => {
                    display = false
                }, duration - 200)
                timeOutB = setTimeout(() => {
                    message = ''
                    icon = ''
                }, duration + 200) 
                console.log({timeOutA})
            }
        }
    }

    onMount(() => {
        //Place la notification à la racine
    	if (!notifyContainer) notifyContainer = document.getElementsByTagName('body')[0]
		notifyElement = document.getElementById('notify')
        notifyContainer.appendChild(notifyElement)
    })

    onDestroy(() => {
        //if (notifyContainer && notifyElement) notifyContainer.removeChild(notifyElement)
    })

</script>

<div id="notify">
	{#if display}
		<div class="notify-card w3-card w3-padding w3-round" style="min-width: 190px;" transition:fly={{x: -100}}>
            {#if message}
                {#if icon}
                    <i class="{icon}"></i>
                {/if}
			    &nbsp;{message}
            {:else}
                <slot/>
            {/if}
		</div>
	{/if}
</div>

<style>
	#notify {
		position: fixed;
		bottom: 10px;
    	left: 10px;
        z-index: 8;
	}

	.notify-card {
		background: white;
		text-transform: uppercase;
	}

</style>