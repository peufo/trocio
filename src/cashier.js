import Head from './Head.svelte'
import Cashier from './Cashier.svelte'

let head = new Head({
    target: document.body,
    props: {}
})

let cashier = new Cashier({
    target: document.body,
    props: {}
})

export default [head, cashier]