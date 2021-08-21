<script lang="ts">
  import debounce from 'debounce'
  import { TextField } from 'svelte-materialify'
  import { faSearch } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  export let search = ''
  export let placeholder = 'Chercher'
  export let style = ''

  const handleSearch = debounce((event: any) => {
    search = event.target.value
  }, 200)
</script>

<TextField
  {placeholder}
  clearable
  solo
  dense
  flat
  on:change={handleSearch}
  on:input={handleSearch}
  style="max-width: 400px; {style}"
>
  <div slot="prepend">
    <IconLink icon={faSearch} size="1.1em" />
  </div>
</TextField>
