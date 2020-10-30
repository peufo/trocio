<script>
    import { slide } from 'svelte/transition'
    import { params } from '@sveltech/routify'
    export let title = ''
    export let open = false
    export let query = null
    export let value = null

    $: open = $params[query] === value

</script>

<section class="simple-card clickable" on:click={() => open = !open }>
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
