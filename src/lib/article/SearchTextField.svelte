<script>
  import { debounce } from 'debounce'
  import { TextField } from 'svelte-materialify'
  import IconLink from '$lib/util/IconLink.svelte'
  import { faSearch } from '@fortawesome/free-solid-svg-icons'

  let klass = ''
  export { klass as class }
  export let style = ''
  export let search = ''

  $: console.log(search)

  const handleSearch = debounce((event) => {
    search = event.target.value
  }, 300)
</script>

<TextField
  on:input={handleSearch}
  on:change={handleSearch}
  bind:value={search}
  clearable
  placeholder="Chercher un article"
  class="mt-3 mb-1 ml-1 {klass}"
  style="max-width: 200px; {style}"
>
  <div slot="prepend">
    <IconLink icon={faSearch} />
  </div>
</TextField>
