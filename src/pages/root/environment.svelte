<script lang="ts">
  import { onMount } from 'svelte'
  import { Table } from 'svelte-materialify/src'

  onMount(getEnvs)

  let options: { name: string; value: string }[] = []

  async function getEnvs() {
    try {
      let res = await fetch('/api/root/envs')
      let json = await res.json()
      options = json
    } catch (error) {
      console.trace(error)
    }
  }
</script>

<div class="pt-8" style="width: 800px; margin: auto;">
  <h6>Variables d'environment</h6>

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
