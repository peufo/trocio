import Head from './Head.svelte'
import Me from './Me.svelte'

let head = new Head({
    target: document.body,
    props: {}
})

let me = new Me({
    target: document.body,
    props: {}
})

export default [head, me]