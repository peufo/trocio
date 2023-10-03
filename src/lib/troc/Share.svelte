<script lang="ts">
  import { Button } from '$material'
  import { fly } from 'svelte/transition'
  import notify from '$lib/notify'

  import IconLink from '$lib/util/IconLink.svelte'
  import { faFacebook, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
  import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
  import { faBullhorn, faLink } from '@fortawesome/free-solid-svg-icons'

  let klass = ''
  export { klass as class }

  export let troc: { _id: string; name: string }
  export let label = 'Partager'
  export let open = false

  $: url = `https://${document.location.host}/trocs/${troc._id}`

  function copyLink() {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        notify.success({ title: 'URL du troc copié', text: url })
      })
      .catch((error) => {
        notify.error(error)
      })
  }

  function handleClick(event: Event) {
    // event.stopPropagation()
    event.preventDefault()
    open = true
  }
</script>

{#if !open}
  <Button depressed on:click={handleClick} class={klass}>
    {label}
    <IconLink
      icon={faBullhorn}
      target="_blank"
      opacity
      size="18px"
      class="ml-3"
    />
  </Button>
{:else}
  <div class="mr-2" in:fly|local={{ x: 20 }}>
    <IconLink
      icon={faEnvelope}
      href="mailto:?subject={troc.name}&body={url}"
      opacity
    />
    <IconLink
      icon={faWhatsapp}
      target="_blank"
      href="https://api.whatsapp.com/send/?phone&text={url}"
      opacity
    />
    <IconLink
      icon={faFacebook}
      target="_blank"
      href="https://www.facebook.com/dialog/share?app_id=512391820023592&href={url}&display=popup"
      opacity
    />
    <IconLink icon={faLink} on:click={copyLink} opacity clickable />
  </div>
{/if}
