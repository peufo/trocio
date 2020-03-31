    
<script>
    import { onMount } from 'svelte'
    import { Row, Cell } from '@smui/data-table'

    export let rowsNumber = 4
    export let cellsWidth = [60, 60, 60]

    let emptyRows = []

    onMount(() => {
        emptyRows.length = rowsNumber - 1
    })

</script>

{#each emptyRows as emptyRow}
    <Row style="text-align: left;">
        {#each cellsWidth as cellWidth}
            <Cell style={`width: ${cellWidth}px;`}>
                <div class="ghostText" style={`width: ${(0.5 + Math.random() / 2) * 100}%;`}>&nbsp;</div>
            </Cell>
        {/each}
    </Row>
{/each}

<style>
    .ghostText {
        background: rgb(240, 240, 240);
        border-radius: 4px;
    }
</style>