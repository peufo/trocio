<script>
    import { onMount, onDestroy } from 'svelte' 
    import { draw, fade, fly } from 'svelte/transition'
    import { sineOut, quintInOut, quadInOut, quadIn, quadOut } from 'svelte/easing'

    let show = false
    let showPaths = false
    let showPathsCenter = false
    let showPolygons = false
    let showPolygonsInt = false
    let interval

    function rotate(node, {duration, delay}) {
        return {
            duration, delay,
            css: t => {
                return `transform: rotate(${(t-0.5) * 240}deg);`
            }
        }
    }

    function showLogo() {
        show = true 
        showPathsCenter = true
        showPaths = false
        showPolygons = false

        setTimeout(() => showPaths          = true,     500)
        setTimeout(() => showPolygons       = true,     1000)
        setTimeout(() => showPathsCenter    = false,    1000)
        setTimeout(() => showPaths          = false,    1000)
        setTimeout(() => showPolygons       = false,    1400)
        setTimeout(() => showPolygonsInt    = true,     1400)
        setTimeout(() => showPolygonsInt    = false,    1400)
        setTimeout(() => show               = false,    2400)

    }

    onMount(() => {
        showLogo()
        interval = setInterval(showLogo, 2800)
    })

    onDestroy(() => {
        clearInterval(interval)
    })

</script>

<div class="container">
    {#if show}
        <svg viewBox='0 0 200 200' in:rotate={{delay: 0, duration: 2800}}>

            {#if showPathsCenter}
                <!--
                <path d="M100,100 L200,100"  fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadIn}} out:fade/>
                <path d="M100,100 L50,13.4"  fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadIn}} out:fade/>
                <path d="M100,100 L50,186.6" fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadIn}} out:fade/>
                -->
                <path d="M200,100 L100,100"  fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadInOut}} out:fade|local/>
                <path d="M50,13.4 L100,100"  fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadInOut}} out:fade|local/>
                <path d="M50,186.6 L100,100" fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadInOut}} out:fade|local/>
                <path d="M200,100 L150,13.4 L50,13.4"   fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadInOut}} out:fade|local/>
                <path d="M50,13.4 L0,100 L50,186.6"     fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadInOut}} out:fade|local/>
                <path d="M50,186.6 L150,186.6 L200,100" fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000, easing: quadInOut}} out:fade|local/>
            {/if}

            {#if showPolygonsInt}
                <polygon points="100,100 0,100 50,186.6 150,186.6 "  fill="rgb(240, 2j40, 240)" out:fly|local={{x: -12.5, y: 21.65, duration: 800, easing: quadInOut}}/>
                <polygon points="100,100 150,13.4 200,100 150,186.6" fill="rgb(216, 216, 216)" out:fly|local={{x: 25, y: 0,    duration: 800, easing: quadInOut}}/>
                <polygon points="100,100 150,13.4 50,13.4 0,100"     fill="rgb(168, 168, 168)" out:fly|local={{x: -12.5, y: -21.65,  duration: 800, easing: quadInOut}}/>
            
                <polygon points="100,100 200,100 150,13.4 50,13.4"   fill="white" out:fly|local={{x: 25, y: -43.3, duration: 1000, easing: quadInOut, opacity: .8}}/>
                <polygon points="100,100 50,13.4 0,100 50,186.6"     fill="white" out:fly|local={{x: -50, y: 0,    duration: 1000, easing: quadInOut, opacity: .8}}/>
                <polygon points="100,100 50,186.6 150,186.6 200,100" fill="white" out:fly|local={{x: 25, y: 43.3,  duration: 1000, easing: quadInOut, opacity: .8}}/>
            
            {/if}

            {#if showPolygons}
                <polygon points="100,100 200,100 150,13.4 50,13.4"   fill="rgb(240, 240, 240)" in:fade out:fly|local={{x: 25, y: -43.3, duration: 1000, easing: quadInOut}}/>
                <polygon points="100,100 50,13.4 0,100 50,186.6"     fill="rgb(216, 216, 216)" in:fade out:fly|local={{x: -50, y: 0,    duration: 1000, easing: quadInOut}}/>
                <polygon points="100,100 50,186.6 150,186.6 200,100" fill="rgb(168, 168, 168)" in:fade out:fly|local={{x: 25, y: 43.3,  duration: 1000, easing: quadInOut}}/>
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