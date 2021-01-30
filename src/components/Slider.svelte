<script>
    import { onMount } from 'svelte'
    import { spring } from 'svelte/motion'

    export let h = 22
    export let w = 300
    export let valueA = 20
    export let valueB = 50
    export let min = 0
    export let max = 100
    export let cadreExt = false
    export let cadreInt = true
    export let rangeMin = 10

    $: console.log(valueA, valueB)

    let r = h / 2
    
    let limit = [r, w - r]
    let rangeVal = max - min
    let rangePos = limit[1] - limit[0]
    let rangeMinPos = getPos(rangeMin) - limit[0]
    
    let selectorA = getSelector(valueA)
    let selectorB = getSelector(valueB)
    let radiusA = getRadius(r)
    let radiusB = getRadius(r)

    let mousedown = {}

    function getSelector(value) {
        return spring(getPos(value), {
            stiffness: 0.3,
            damping: 0.4
        })
    }

    function getRadius() {
        return spring(r, {
            stiffness: 0.1,
            damping: 0.2
        })
    }

    document.addEventListener('touchmove', e => {
        move(e.touches[0].clientX)
    })

    document.addEventListener('mousemove', e => {
        move(e.clientX)
    })

    function move(clientX) {

        if (mousedown.index) {
            let {index, xA, xB} = mousedown
            let newA = clientX - xA
            let newB = clientX - xB   

            if (index == 'A') {
                //Limite
                if (newA < limit[0]) $selectorA = limit[0]
                else if (newA > limit[1] - rangeMinPos) $selectorA = limit[1] - rangeMinPos
                else $selectorA = newA

                //RangeMin
                if ($selectorA + rangeMinPos > $selectorB) {
                    $selectorB = $selectorA + rangeMinPos
                    valueB = getValue($selectorB)
                }

                valueA = getValue($selectorA)

            }else if(index == 'B'){
                //Limite
                if (newB < limit[0] + rangeMinPos) $selectorB = limit[0] + rangeMinPos
                else if (newB > limit[1]) $selectorB = limit[1]
                else $selectorB = newB

                //RangeMin
                if ($selectorB - rangeMinPos < $selectorA ) {
                    $selectorA = $selectorB - rangeMinPos
                    valueA = getValue($selectorA)
                }

                valueB = getValue($selectorB)

            }else if(index == 'C'){
                
                if (limit[0] <= newA && newB <= limit[1]) {
                    $selectorA = newA
                    $selectorB = newB
                }else if (newA < limit[0]) {
                    $selectorA = limit[0]
                    $selectorB = newB + (limit[0] - newA)
                }else if (newB > limit[1]) {
                    $selectorB = limit[1]
                    $selectorA = newA - (newB - limit[1])
                }
                valueA = getValue($selectorA)
                valueB = getValue($selectorB)
            }
        }
    }

    document.addEventListener('mouseup', () => {
        $radiusA = r - 1
        $radiusB = r - 1
        mousedown = {}
    })

    document.addEventListener('touchend', () => {
        $radiusA = r - 1
        $radiusB = r - 1
        mousedown = {}
    })

    function getValue(pos) {
        return min + ((pos - limit[0]) / rangePos) * rangeVal
    }

    function getPos(value) {
        return limit[0] + (value / rangeVal) * rangePos
    }

    function clickHandler(e) {
        let slider = document.getElementById('slider')
        let { top, left } = getOffset(slider)
        left = e.clientX - left
        if ($selectorA < left && left < $selectorB) return

        if (Math.abs(left - $selectorA) < Math.abs(left - $selectorB)) {
            if (limit[0] <= left && left <= limit[1] - rangeMinPos) {
                $selectorA = left
            }else if (left < limit[0]) {
                $selectorA = limit[0]
            }else{
                $selectorA = limit[1] - rangeMinPos
            }
            valueA = getValue($selectorA)
        }else{
            if (limit[0] + rangeMinPos <= left && left <= limit[1]) {
                $selectorB = left
            }else if (left < limit[0]) {
                $selectorB = limit[0] + rangeMinPos
            }else{
                $selectorB = limit[1]
            }         
            valueB = getValue($selectorB)
        }
    }

    function getOffset(element){
        var bound = element.getBoundingClientRect()
        var html = document.documentElement
        return {
            top: bound.top + window.pageYOffset - html.clientTop,
            left: bound.left + window.pageXOffset - html.clientLeft
        }
    }

</script>


<svg id="slider" height={h} width={w} on:click={clickHandler}>

    {#if cadreExt}<!-- Cadre exterieur-->
        <rect   x="1" y="1"
                rx={r} ry={r}
                height={h - 2} width={w - 2}/>
    {/if}

    {#if cadreInt}<!-- Cadre interieur-->
        <rect   x={r - 4}  y={r - 4}
                rx="4" ry="4"
                height="8" width={w - 2 * r + 8}/>
    {/if}

    <!-- Range -->
    <line   on:mousedown="{e => {mousedown = {index: 'C', xA: e.clientX - $selectorA, xB: e.clientX - $selectorB}; $radiusA = $radiusB = r - 4 }}"
            on:touchstart="{e => {mousedown = {index: 'C', xA: e.touches[0].clientX - $selectorA, xB: e.touches[0].clientX - $selectorB}; $radiusA = $radiusB = r - 4 }}"
            x1={$selectorA} y1={r} x2={$selectorB} y2={r}/>

    <!-- Selector A -->
    <circle on:mousedown="{e => {mousedown = {index: 'A', xA: e.clientX - $selectorA}; $radiusA = r - 4}}"
            on:touchstart="{e => {mousedown = {index: 'A', xA: e.touches[0].clientX - $selectorA}; $radiusA = r - 4}}"
            cx={$selectorA} cy={r} r={$radiusA}/>

    <!-- Selector B -->
    <circle on:mousedown="{e => {mousedown = {index: 'B', xB: e.clientX - $selectorB}; $radiusB = r - 4}}"
            on:touchstart="{e => {mousedown = {index: 'B', xB: e.touches[0].clientX - $selectorB}; $radiusB = r - 4}}"
            cx={$selectorB} cy={r} r={$radiusB}/>

</svg>

<style>
    #slider {
        cursor: pointer;
    }

    rect {
        stroke: #666;
        stroke-width: 2;
        fill: #fff;
    }

    circle {
        fill: #666;
    }

    line {
        stroke: #ccc;
        stroke-width: 8px;
    }

</style>