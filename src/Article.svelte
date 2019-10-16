<script>

    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
    
    import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
    dayjs.extend(relativeTime)

    export let article = {}
    export let clickable = false
    export let timeKey = ''
    export let comment = ''


    function remove() {
        dispatch('remove', article)
    }

    function select() {
        dispatch('select', article)
    }

</script>

{#if timeKey && article[timeKey]}
    <i class="w3-right w3-small" style="transform: translate(0px, 6px);">
        {dayjs(article[timeKey]).fromNow()}
    </i>
    <br>
{/if}

<div class="list-element w3-padding w3-display-container" on:click={select} class:clickable class:valided={!article.isRemovable}>
    
    <div style="padding-right: 55px">
        {article.name}
    </div>

    <b class="w3-tiny w3-right" style="line-height: 1;">{!isNaN(article.price) && article.price.toFixed(2)}</b>
    <span class="w3-tiny" style="line-height: 1;">{comment}</span>

    <div class="w3-display-topright w3-padding">
        <b style="margin-top: 4px;">#</b>{!article.isCreated ? article.ref : ''}

        {#if article.isRemovable}
            <i 	class="fa fa-trash-alt clickable"
                style="margin-top: 4px;"
                on:click="{() => remove(article._id)}"></i>
        {/if}
    </div>
</div>

<style>

    .clickable {
        cursor: pointer;
    }

</style>