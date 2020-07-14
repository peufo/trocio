
<script>
    import { onMount } from 'svelte' 
    import { draw, fade } from 'svelte/transition'

    let rotate = false
    onMount(() => {
        setTimeout(() => rotate = true, 400)
    })

</script>

<div class="container">
    <svg viewBox='0 0 200 200' class:rotate>

        <path d="M100,100 L200,100 L150,13.4 L50,13.4 "   fill="white"  stroke="rgb(100, 100, 100)" in:draw={{duration: 1000}}/>
        <polygon points="100,100 200,100 150,13.4 50,13.4" fill="rgb(240, 240, 240)" in:fade={{delay: 600}}/>


        <path d="M100,100 L50,13.4 L0,100 L50,186.6 "   fill="white"  stroke="rgb(100, 100, 100)" in:draw={{duration: 1000}}/>
        <polygon points="100,100 50,13.4 0,100 50,186.6" fill="rgb(216, 216, 216)" in:fade={{delay: 600}}/>

        <path d="M100,100 L50,186.6 L150,186.6 L200,100 "   fill="white" stroke="rgb(100, 100, 100)" in:draw={{duration: 1000}}/>
        <polygon points="100,100 50,186.6 150,186.6 200,100" fill="rgb(168, 168, 168)" in:fade={{delay: 600}}/>

    </svg>
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
        transition: all .6s ease;
        transform: rotate(-120deg);
    }
    
    svg.rotate {
        transform: rotate(0deg);
    }
</style>