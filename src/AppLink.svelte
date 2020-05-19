<script context="module">
    addEventListener('popstate', e => {
        load(document.location.pathname)
    })
    addEventListener('fetch', e => {
        console.log('FETCH', e)
    })

</script>

<script>
    import { onMount } from 'svelte'
    import { getAssetAndTitle } from '../routes/utils.js'

    export let href = ''
    export let pushState = false

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
        let {asset, title} = getAssetAndTitle(newPath)
        let oldScript = document.querySelector(`script[src="/assets/${asset}.js"]`)
        let script = document.createElement('script')
        document.querySelector('#app').innerHTML = ''
        script.src = `/assets/${asset}.js`
        document.head.appendChild(script)
        if (oldScript) document.head.removeChild(oldScript)
    }

</script>

<a href={href} on:click={clickHandler}>
    <slot></slot>
</a>