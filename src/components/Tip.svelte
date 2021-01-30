<script>
    import { createEventDispatcher } from 'svelte'
    import { slide } from 'svelte/transition'
    import { redirect, params } from '@roxi/routify'

    export let title = ''
    export let open = false
    export let query = null
    export let value = null

    const dispatch = createEventDispatcher()

    $: open = $params[query] === value

    function clickHandler() {
        $redirect(location.pathname, {...$params, [query]: value})
    }

</script>

<section class="simple-card" class:clickable={!open} on:click={clickHandler}>
    <span class="title">{title}</span>
   
    {#if open}
        <div transition:slide|local>
            <slot></slot>
        </div>
    {/if}
    
</section>

<style>
    section {
        padding: .5em;
        margin-bottom: .5em;
        background: #fff;
    }
</style>
