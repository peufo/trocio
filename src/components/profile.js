import Profile from './Profile.svelte'

let profile = new Profile({
    target: document.querySelector('#app'),
    props: {}
})

export default profile