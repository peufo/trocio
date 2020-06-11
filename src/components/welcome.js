import Welcome from './Welcome.svelte'

let welcome = new Welcome({
    target: document.querySelector('#app'),
    props: {}
})

export default welcome