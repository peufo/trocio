import Head from './Head.svelte'

let head = new Head({
    target: document.body,
    anchor: document.querySelector('#app'),
    props: {}
})

export default head