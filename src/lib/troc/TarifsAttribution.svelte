<script lang="ts">
  import { Table, TextField } from 'svelte-materialify'

  import IconLink from '$lib/util/IconLink.svelte'
  import { troc } from '$lib/troc/store'
  import { faSearch } from '@fortawesome/free-solid-svg-icons'

  let searchUser = ''
</script>

<Table class="simple-card">
  <thead>
    <tr>
      <th style="padding-left: 0px; max-width: 440px;">
        <TextField
          placeholder="Chercher un participant"
          clearable
          solo
          dense
          flat
          bind:value={searchUser}
          on:change={() => console.log('CHANGE')}
          on:input={() => console.log('INPUT')}
          style="max-width: 400px;"
        >
          <div slot="prepend">
            <IconLink icon={faSearch} size="1.1em" />
          </div>
        </TextField>
      </th>
      {#each $troc.tarif as tarif}
        <th class="clickable">{tarif.name}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>asdasd</td>
      <td>coche</td>
    </tr>
  </tbody>
</Table>

<style>
  .clickable:hover {
    background: var(--theme-tables-hover);
  }
</style>
