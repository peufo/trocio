<script lang="ts">
    import printJS from 'print-js'
    import type { TagInterface, Article } from 'types'
    import Tag from './Tag.svelte'
    import { tick } from 'svelte'

    export let visible = false
    export let articles: Partial<Article>[] = []
    export let currency = ''
    export let tag: TagInterface = {
        width: 80,
        height: 22,
        padding: 2,
        fontSize: 16,
        border: false,
        useTagPrinter: false,
        useScanner: false,
    }
    export async function print(_articles?: Partial<Article>[]) {
        if (_articles) {
            articles = _articles
            await tick()
        }
        await Promise.all(tags.filter(Boolean).map((tag) => tag.refresh()))
        const options: printJS.Configuration = {
            printable,
            type: 'html',
            targetStyles: ['*'],
            font_size: undefined,
        }

        printJS(options)
    }

    let printable: HTMLDivElement
    let tags: Tag[] = []
</script>

<div class:hide={!visible}>
    <div
        bind:this={printable}
        class:d-flex={!tag.useTagPrinter}
        class:flex-wrap={!tag.useTagPrinter}
    >
        {#each articles as article, index}
            <Tag bind:this={tags[index]} {article} {tag} {currency} />
        {/each}
    </div>
</div>

<style>
    .hide {
        display: none;
    }
</style>
