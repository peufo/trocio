<script>
    export let value = false

</script>

<div id="cadre" on:click="{() => value = !value}" on:click>
    <div id="boule" class:active={value}></div>
</div>

<style>
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

    .active {
        background: #3EA6FF !important;
        transform: translate(1em);
    }

</style>
