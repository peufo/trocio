import Cashier from './Cashier.svelte'

let cashier = new Cashier({
    target: document.querySelector('#app'),
    props: {}
})

export default cashier