<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { url, params, goto } from '@roxi/routify'
  import debounce from 'debounce'
  import { TextField } from '$material'
  import { faSearch } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'

  let klass = ''
  export { klass as class }
  export let style = ''
  export let search = ''
  export let placeholder = 'Chercher'
  export let icon = faSearch
  export let debounceTime = 200
  export let inputElement: HTMLInputElement | undefined = undefined

  // bind with url query
  export let searchKey = ''
  export const dispatch = createEventDispatcher()

  let initialSearch = ''

  onMount(() => {
    /** Read initial search value if searchKey is provided */
    if (!searchKey) return
    initialSearch = $params[searchKey] || ''
  })

  const handleSearch = debounce((event: any) => {
    search = event.target.value
    dispatch('search', search) // debounced event

    /** Update url if searchKey is provided */
    if (!searchKey) return
    const query = $params
    if (!search) delete query[searchKey]
    else query[searchKey] = search
    $goto($url(), query)
  }, debounceTime)
</script>

<TextField
  bind:inputElement
  value={initialSearch}
  {placeholder}
  on:keydown
  on:focus
  on:blur
  on:change={handleSearch}
  on:input={handleSearch}
  type="search"
  class={klass}
  style="max-width: 400px; {style}"
  color="secondary"
  {...$$restProps}
>
  <div slot="prepend">
    <IconLink {icon} size="1.1em" />
  </div>
  <slot />
</TextField>
