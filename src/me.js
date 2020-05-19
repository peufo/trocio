import Me from './Me.svelte'

let me = new Me({
    target: document.querySelector('#app'),
    props: {}
})

export default me