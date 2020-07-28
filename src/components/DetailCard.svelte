
<script>
    import { fade } from 'svelte/transition'
    import List, { Item, Text } from '@smui/list'

    import { details } from './stores.js'

    export let count = 0
    export let title = ''
    export let sum = 0
    export let free = false
    export let show = false
    export let items = []
    export let nonInteractive = false

    function clickHandler() {
        show = !show
    }

</script>

<div class="simple-card" class:show>

    <div on:click={clickHandler} class="clickable w3-row header">
        <div class="w3-col s1 w3-right-align w3-large " style="padding-right: 20px;">{count}</div>
        <div class="w3-col s9 w3-large ">
            {title}
            &nbsp;<i class="fas fa-chevron-right w3-opacity" class:show></i>
        </div>
        <span class="w3-col s2 w3-right-align w3-large ">{sum.toFixed(2)}</span>
    </div>

    
    <div class="content" class:show>
        {#if free}
            <slot></slot>
        {:else}
            <List style="padding: 7px;" {nonInteractive}>
                {#each items as item}
                    <Item style="padding: 0 6px">
                        <Text class="w3-col s1"><slot name="col-1" {item}></slot></Text>
                        <Text class="w3-col s9"><slot name="col-2" {item}></slot></Text>
                        <Text class="w3-col s2 w3-right-align"><slot name="col-3" {item}></slot></Text>
                    </Item>
                {/each}
            </List>
        {/if}
    </div>
    

</div>

<style>

    .content {
        opacity: 0;
        transition: .5s;
    }

    .content.show {
        opacity: 1;
    }

    .simple-card {
		border: 1px solid #eee;
        border-radius: 4px;
        overflow: hidden;
        height: 57px;
        transition: .3s;
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }

    .simple-card.show {
        height: inherit;
        overflow: initial;
    }

    .simple-card:hover {
        box-shadow: 2px 2px 10px 0 rgba(0, 0, 0, 0.1);
    }

    .header {
        padding: 15px 7px;
    }

    .fa-chevron-right {
        transition: .2s;
    }

    .fa-chevron-right.show {
        transform: rotate(90deg);
    }

</style>

