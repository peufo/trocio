
<script>
    import Tag from './Tag.svelte'

    export let visible = false
    export let articles = []
    export let width = 80
    export let height = 22
    export let padding = 2
    export let border = false

</script>

<div class:hide={!visible}>
    <div id="tagsPrint">
        {#each articles as art}
            <Tag {...art} width={width} height={height} padding={padding} border={border}/>
        {/each}
    </div>
</div>

<style>
    .hide {
        display: none;
    }
</style>