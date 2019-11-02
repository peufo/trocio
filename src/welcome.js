import Head from './Head.svelte'
import Welcome from './Welcome.svelte'

let head = new Head({
    target: document.body,
    props: {}
})

let welcome = new Welcome({
    target: document.body,
    props: {}
})

export default [head, welcome]