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
    export let printable = false

    function remove() {
        dispatch('remove', article)
    }

    function select() {
        if (clickable) dispatch('select', article)
    }

    function print() {
        dispatch('print', article)
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
        {@html article.name.length ? article.name : `<span style="color: red;">Pas de désignation !</span>`}
    </div>

    <b class="w3-tiny w3-right" style="line-height: 1;">{!isNaN(article.price) && Number(article.price).toFixed(2)}</b>
    <span class="w3-tiny" style="line-height: 1;">{comment}</span>

    <div class="ref w3-display-topright w3-padding" class:withAction={article.isRemovable || printable}>
        <b style="margin-top: 4px;">#</b>{article.ref}
    </div>

    {#if article.isRemovable}
        <div class="action w3-display-topright w3-padding">
            <i 	class="far fa-trash-alt clickable" style="margin-top: 4px;" on:click="{() => remove(article._id)}"></i>
        </div>
    {:else if printable}
        <div class="action w3-display-topright w3-padding">
            <i 	class="fa fa-print clickable" style="margin-top: 4px;" on:click={print}></i>
        </div>
    {/if}

    {#if article.refused}
        <div class="w3-display-middle">
            <span class="w3-red w3-padding-small w3-round w3-opacity">Refusé</span>
        </div>
    {/if}

</div>

<style>

    .clickable {
        cursor: pointer;
    }

    .clickable.fa:hover {
        transform: scale(1.2);
    }
    .fa {
        transition: all .2s ease;
    }

    .ref {
        transition: all .2s ease;
        opacity: 1;
    }
    .list-element:hover .ref.withAction {
        opacity: 0;
    }

    .action {
        transition: all .2s ease;
        transform: translate(40px, 0px);
    }
    .list-element:hover .action {
        transform: translate(0px, 0px);
    }

</style>