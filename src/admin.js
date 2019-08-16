import Head from './Head.svelte'
import Admin from './Admin.svelte'

let head = new Head({
    target: document.body,
    props: {}
})

let admin = new Admin({
    target: document.body,
    props: {}
})

export default [head, admin]