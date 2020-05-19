<script>
    import { tick } from 'svelte'
    import LinearProgress from '@smui/linear-progress'
    import { getAssetAndTitle } from '../routes/utils.js'

    export let href = ''
    export let pushState = false
    let progress = 0
    let fetchPromise

    function clickHandler(e){
        e.preventDefault()
        
        if (pushState) {
            window.history.pushState(null, null, href)
        }else{
            window.history.replaceState(null, null, href)
        }

        load(href)
    }

    function load(newPath) {
        console.time('asd')
        let {asset, title} = getAssetAndTitle(newPath)
        /*
        let oldScript = document.querySelector(`script[src="/assets/${asset}.js"]`)
        let script = document.createElement('script')
        document.querySelector('#app').innerHTML = ''
        script.src = `/assets/${asset}.js`
        document.head.appendChild(script)
        if (oldScript) document.head.removeChild(oldScript)
        console.timeEnd('asd')
        */
        fetchPromise = fetchScript(asset)
        placeLinearProgressOnTopLevel()
    }

    async function fetchScript(assetName) {
        progress = 0
        let res = await fetch(`/assets/${assetName}.js`)
        let reader = res.body.getReader()
        let contentLength = res.headers.get('Content-Length')
        let receivedLength = 0
        let chunks = []
        progress = 0.1
        console.time('progress')

        //Read stream
        
        while(true) {
            let {done, value} = await reader.read()
            if (done) break
            chunks.push(value)
            receivedLength += value.length
            progress = 0.1 + 0.9 * receivedLength / contentLength
            console.timeLog('progress', `Received ${receivedLength} of ${contentLength}`)
        }
        console.timeEnd('progress')

        console.time('concat')
        //Concatenate chunks and décode
        let chunksAll = new Uint8Array(receivedLength)
        let position = 0
        for(let chunk of chunks) {
            chunksAll.set(chunk, position)
            position += chunk.length
        }
        let result = new TextDecoder("utf-8").decode(chunksAll)
        console.timeEnd('concat')

        console.time('AddAtDOM')
        //Reload Asset
        document.querySelector('#app').innerHTML = ''
        let oldScript = document.querySelector('#asset')
        if (oldScript) document.head.removeChild(oldScript)
        console.timeLog('AddAtDOM')
        /*
        let script = document.createElement('script')
        script.innerHTML = result
        script.id = 'asset'
        document.head.appendChild(script)
        */
        parseScript(result)()
        console.timeEnd('AddAtDOM')
    }

    function parseScript(str) {
        return Function(str)
    }

    async function placeLinearProgressOnTopLevel() {
        await tick()
        let elem = document.getElementById('linearProgress')
        document.body.appendChild(elem)
    }

</script>

<a href={href} on:click={clickHandler}>
    <slot></slot>
</a>

{#await fetchPromise}
    <LinearProgress id="linearProgress" style="position: fixed; top: 0px;" progress={progress}/>
{/await}
