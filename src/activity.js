import Activity from './Activity.svelte'

let activity = new Activity({
    target: document.querySelector('#app'),
    props: {}
})

export default activity