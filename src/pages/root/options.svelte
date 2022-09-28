<script lang="ts">
  import { onMount } from 'svelte'
  import { Table } from '$material'
  import EditOption from '$lib/util/EditOption.svelte'
  import type { Option } from 'types'

  onMount(getOptions)

  let options: Option[] = []

  async function getOptions() {
    try {
      let res = await fetch('/api/root/options')
      let json = await res.json()
      options = json
    } catch (error) {
      console.trace(error)
    }
  }
</script>

<div class="pt-8" style="width: 800px; margin: auto;">
  <h6>Options</h6>

  {#each options as option}
    <EditOption bind:option />
  {/each}
</div>
