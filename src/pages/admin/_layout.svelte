<script>
    import { fly } from 'svelte/transition'

    import Tips from 'Tips.svelte'
    import { troc } from 'stores.js'

    export let scoped
    
    let tipsOpen = false

</script>

<Tips bind:open={tipsOpen} headHeight={scoped.headHeight}/>

<main class:tipsOpen>
    <slot></slot>
</main>

{#if $troc && $troc.is_try}
    <div transition:fly={{y: 40, delay: 500, duration: 800}} class="try-bannear">
        <b>Troc d'entrainement</b>
    </div>
{/if}

<style>

    main {
        transition: margin .4s ease;
        height: 100%;
    }

    main.tipsOpen {
        margin-left: 400px;
    }

</style>
