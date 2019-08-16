import Trocs from './Trocs.svelte'
import Head from './Head.svelte'

let head = new Head({
    target: document.body,
    props: {}
})

let trocs = new Trocs({
    target: document.body,
    props: {}
})

export default [head, trocs]