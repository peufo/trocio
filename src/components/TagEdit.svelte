<script>
    import Toggle from './Toggle.svelte'
    import TagsPrint from './TagsPrint.svelte'
    import { goPrint } from './utils'
    import Tag from './Tag.svelte'
    import Button from '@smui/button'
    import AutoPatch from './AutoPatch.svelte'

    export let width = 90
    export let height = 29
    export let padding = 2
    export let border = true

    let articles = [
        {name: 'Article test A', ref: '123', price: 99},
        {name: 'Article test B qui a une désignation un peu longue', ref: '231', price: 45},
        {name: 'Art C', ref: '321', price: 900}
    ]


</script>

<div class="w3-card w3-round" style="max-width: 850px; margin: auto; height: calc(100% - 45px);">

    <br>

    <div class="flex">
        <div class="dimInput">
            <i class="fas fa-arrows-alt-v w3-large"></i>
            <input type="number" class="w3-input w3-right" bind:value={height} min="1">
        </div>

        <div class="dimInput">
            <i class="fas fa-arrows-alt-h w3-large"></i>
            <input type="number" class="w3-input w3-right" bind:value={width} min="1">
        </div>

        <div class="dimInput">
            <i class="fas fa-compress-arrows-alt"></i>
            <input type="number" class="w3-input w3-right" bind:value={padding} min="0">
        </div>

        <div class="dimInput">
            <Toggle patchButton bind:value={border} icon={`<i class="far fa-square w3-large"></i>`}/>
        </div>
    </div>

    <br><br>
    <div style="{`width: ${width}mm`}; margin: auto;">
        <TagsPrint id="testPrint" visible articles={articles} width={width} height={height} padding={padding} border={border}/>
    </div>
    
    <br>

    <div style="{`width: ${width}mm`}; margin: auto;">
        <Button
        on:click="{() => goPrint('testPrint')}"
        class="w3-right"
        variant="outlined">
            tester
        </Button>
    </div>

    <br><br><br>

</div>

<style>


    .flex {
        display: flex;
    }

    .dimInput {
        margin: auto;
        width: 100px;
    }

    .dimInput input {
        width: 80px;
    }

    .dimInput i {
        transform: translate(0px, 9px);
    }

</style>