<script>
    import { onMount, onDestroy } from 'svelte' 
    import { draw, fade, fly } from 'svelte/transition'
    import { sineInOut, quintInOut } from 'svelte/easing'

    let show = false
    let showPaths = false
    let showPolygons = false
    let interval

    function rotate(node, {duration, delay}) {
        return {
            duration, delay,
            css: t => {
                const eased = sineInOut(t)
                return `transform: rotate(${-120 * (1-eased)}deg);`
            }
        }
    }

    function showLogo() {
        show = true 
        showPaths = true
        setTimeout(() => {
            showPaths = false
            showPolygons = true
        }, 600)
        setTimeout(() => {
            showPolygons = false
            show = false
        }, 1400)
    }

    onMount(() => {
        showLogo()
        interval = setInterval(showLogo, 2000)
    })

    onDestroy(() => {
        clearInterval(interval)
    })

</script>

<div class="container">
    {#if show}
        <svg viewBox='0 0 200 200' in:rotate={{delay: 200, duration: 800}}>
            {#if showPaths}
                <path d="M100,100 L200,100 L150,13.4 L50,13.4"   fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000}} out:fade/>
                <path d="M100,100 L50,13.4 L0,100 L50,186.6"     fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000}} out:fade/>
                <path d="M100,100 L50,186.6 L150,186.6 L200,100" fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000}} out:fade/>
            {/if}
            {#if showPolygons}
                <polygon points="100,100 200,100 150,13.4 50,13.4"   fill="rgb(240, 240, 240)" in:fade out:fly={{x: 25, y: -43.3, easing: quintInOut}}/>
                <polygon points="100,100 50,13.4 0,100 50,186.6"     fill="rgb(216, 216, 216)" in:fade out:fly={{x: -50, y: 0, easing: quintInOut}}/>
                <polygon points="100,100 50,186.6 150,186.6 200,100" fill="rgb(168, 168, 168)" in:fade out:fly={{x: 25, y: 43.3, easing: quintInOut}}/>
            {/if}
        </svg>
    {/if}
</div>



<style>
    .container {
        max-width: 300px;
        width: 50%;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%)
    }

    svg {
        overflow: visible;
    }

</style>