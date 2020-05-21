<script context="module">

    let activeLink //reference a link that is loading
    let links = []

    addEventListener('popstate', e => {
        let linkIndex = links.map(l => l.pathname).indexOf(location.pathname)
        if (linkIndex > -1) {
            links[linkIndex].load()
        }else{
            console.error('invalid link')
        }
    })    

</script>

<script>
    import { tick, onMount, onDestroy } from 'svelte'
    import { fade } from 'svelte/transition'
    import LinearProgress from '@smui/linear-progress'
    import { getAssetAndTitle } from '../routes/utils.js'

    export let href = ''
    export let replaceState = false
    let progress = 0
    let fetchPromise
    let link
    let abortController

    onMount(() => {
        links = [...links, link]
        link.abort = () => {abortController.abort()}
        link.load = load
    })

    function clickHandler(e){
        e.preventDefault()
        if (replaceState) {
            window.history.replaceState(null, null, href)
        }else{
            window.history.pushState(null, null, href)
        }
        load()
    }

    function load(newPath = href) {
        if (activeLink !== link && activeLink) activeLink.abort()
        if (activeLink !== link) {
            activeLink = link
            let {asset, title} = getAssetAndTitle(newPath)
            fetchPromise = fetchScript(asset).then(() => activeLink = undefined)
            placeLinearProgressOnTopLevel()
        }
    }

    async function fetchScript(assetName) {
        startProgression()
        abortController = new AbortController()
        let signal = abortController.signal
        let res = await fetch(`/assets/${assetName}.js`, {signal})
        let reader = res.body.getReader()
        let contentLength = res.headers.get('Content-Length')
        let receivedLength = 0
        let chunks = []

        //Read stream
        while(true) {
            let {done, value} = await reader.read()
            if (done) break
            chunks.push(value)
            receivedLength += value.length
            progress = 0.2 + 0.8 * receivedLength / contentLength
        }

        //Concatenate chunks and decode
        let chunksAll = new Uint8Array(receivedLength)
        let position = 0
        for(let chunk of chunks) {
            chunksAll.set(chunk, position)
            position += chunk.length
        }
        let result = new TextDecoder("utf-8").decode(chunksAll)

        //Reload Asset
        document.querySelector('#app').innerHTML = ''
        let oldScript = document.querySelector('#asset')
        if (oldScript) document.head.removeChild(oldScript)

        //Dangerous ?
        Function(result)()
    }

    async function placeLinearProgressOnTopLevel() {
        await tick()
        let elem = document.getElementById('linearProgress')
        document.body.appendChild(elem)
    }

    /**
     * Lance la barre de chargement jusqu'à 0.2
     */
    async function startProgression(){
        progress = 0
        let step = 50
        let rtt = window.navigator.connection.rtt || step
        let timer = setInterval(() => {
            progress += 0.2 / (rtt / step)
            if (progress >= 0.2) {
                progress = 0.2
                clearInterval(timer)
            }
        }, step)
    }

</script>

<a href={href} on:click={clickHandler} bind:this={link}>
    <slot></slot>
</a>

{#await fetchPromise}
    <div id="linearProgress" transition:fade style="position: fixed; top: 0px; width: 100%;">
        <LinearProgress {progress}/>
    </div>
{/await}
