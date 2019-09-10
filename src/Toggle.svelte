<script>
    export let value = false
    export let icon = ''

</script>

<div id="cadre_exterieur">
    <div id="cadre" on:click="{() => value = !value}" on:click>
        <div id="boule" class:active={value}></div>
    </div> 
    {#if icon.length}
        <div id="icon">{@html icon}</div>
    {/if}
</div>


<style>
    #cadre, #icon {
        display: inline-block;
    }

    #cadre {
        cursor: pointer;
        position: relative;
        display: inline-block;
        margin: 11px 4px 6px 4px;
        background: #ddd;
        border-radius: .5em;
        height: 1em;
        width: 2em;
    }

    #boule {
        position: absolute;
        left: -2px;
        top: -2px;
        height: calc(1em + 4px);
        width: calc(1em + 4px);
        background: #aaa;
        border-radius: 50%;
        transition: all .2s;
    }

    #icon {
        transform: translate(0px, -6px);
    }

    .active {
        background: #3EA6FF !important;
        transform: translate(1em);
    }

</style>
