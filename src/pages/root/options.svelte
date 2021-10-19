<script lang="ts">
  import { onMount } from 'svelte'
  import { Table } from 'svelte-materialify'

  onMount(getOptions)

  let options: { name: string; value: string }[] = []

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

<div class="mt-8" style="width: 800px; margin: auto;">
  <h6>Options globals</h6>

  <Table>
    <thead>
      <tr>
        <td>Name</td>
        <td>Value</td>
      </tr>
    </thead>
    <tbody>
      {#each options as option}
        <tr>
          <td>{option.name}</td>
          <td>{option.value}</td>
        </tr>
      {/each}
    </tbody>
  </Table>
</div>
