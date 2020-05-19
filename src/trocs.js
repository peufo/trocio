import Trocs from './Trocs.svelte'

let trocs = new Trocs({
    target: document.querySelector('#app'),
    props: {}
})

export default trocs