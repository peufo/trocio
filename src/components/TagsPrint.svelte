
<script>
    import Tag from './Tag.svelte'

    export let id = 'tagsPrint'
    export let visible = false
    export let articles = []
    export let width = 80
    export let height = 22
    export let padding = 2
    export let border = false
    export let fontSize = 16

</script>

<div class:hide={!visible}>
    <div id={id}>
        {#each articles as art}
            <Tag {...art} {width} {height} {padding} {border} {fontSize}/>
        {/each}
    </div>
</div>

<style>
    .hide {
        display: none;
    }
</style>