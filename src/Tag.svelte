<script>
    import Toggle from './Toggle.svelte'
    
    export let width = 6
    export let height = 2

</script>

<div class="w3-card w3-round" style="max-width: 850px; margin: auto; height: calc(100% - 45px);">


    <div class="dimInput" style="width: 84px; transform: translate(calc({width / 2}cm + 50% + 5px), 3cm);">
        <input type="number" class="w3-input w3-right" bind:value={height} step="0.1">
        <i class="fas fa-arrows-alt-v w3-large"></i>
    </div>

    <div class="dimInput" style="width: 90px;">
        <input type="number" class="w3-input w3-right" bind:value={width} step="0.1">
        <i class="fas fa-arrows-alt-h w3-large"></i>
    </div>

    <div id="tag" class="w3-round w3-border w3-padding" style="width: {width}cm; height: {height}cm;">
        Nom de l'article
        <br>
        <span class="w3-tiny w3-right" style="line-height: 1;">99.00</span>
    </div>

    <div class="w3-small" style="margin: auto; width: 75px; transform: translate(calc(-{width / 2}cm + 50%), 0cm);">
        <Toggle icon={'<i class="fas fa-barcode w3-large"></i>'}/>
    </div>
    
    <br><br>

</div>

<style>
    #tag {
        margin: auto;
    }

    .dimInput {
        height: 39px;
        margin: auto;
    }
    .dimInput input {
        width: 70px;
    }
    .dimInput i {
        transform: translate(0px, 9px);
    }

    input {
        border: none;
    }
</style>