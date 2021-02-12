    
<script>
    import { onMount } from 'svelte'
    import { Row, Cell } from '@smui/data-table'
    import List, { Item, Text } from '@smui/list'

    export let rowsNumber = 5
    export let cellsWidth = [60, 60, 60]
    export let listMode = false
    export let twoLine = false
    export let meta = false

    let emptyRows = []

    onMount(() => {
        emptyRows.length = rowsNumber
    })

</script>

{#if listMode}
    {#each emptyRows as emptyRow}
        <Item>
            <Text style="width: 100%;">
                {#if twoLine}
                    <span class="ghostText primaryText" style={`width: ${(0.5 + Math.random() / 2) * 100}%;`}>&nbsp;</span>
                    <span class="ghostText secondaryText" style={`width: ${(0.5 + Math.random() / 2) * 100}%;`}>&nbsp;</span>
                {:else}
                    TODO
                {/if}
            </Text>
            {#if meta}
                <span class="ghostMeta"></span>
            {/if}
        </Item>
    {/each}
{:else}
    {#each emptyRows as emptyRow}
        <Row style="text-align: left;">
            {#each cellsWidth as cellWidth}
                <Cell style={`width: ${cellWidth}px;`}>
                    <span class="ghostText" style={`width: ${(0.5 + Math.random() / 2) * 100}%;`}>&nbsp;</span>
                </Cell>
            {/each}
        </Row>
    {/each}
{/if}

<style>
    .ghostText {
        display: block;
        position: relative;
        overflow: hidden;
        background: rgb(240, 240, 240);
        border-radius: 4px;
    }

    .ghostMeta {
        display: block;
        position: relative;
        overflow: hidden;
        background: rgb(240, 240, 240);
        width: 35px;
        height: 31.39px;
        border-radius: 100%;
    }

    .primaryText {
        margin-top: 1.2em;
    }

    .secondaryText {
        margin-top: .5em;
        height: .8em;
        opacity: .5;
    }

    .ghostText::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transform: translateX(-120%);
        background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
    }

    .ghostText::after {
        animation: waves 2s linear .5s infinite;
    }

    @keyframes waves {
        0% {
            transform: translateX(-120%);
        }
       
        100% {
            transform: translateX(120%);
        }
    }

</style>