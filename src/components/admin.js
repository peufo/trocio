import Admin from './Admin.svelte'

let admin = new Admin({
    target: document.querySelector('#app'),
    props: {}
})

export default admin