<script>
  import MagicSelect from '$lib/util/MagicSelect.svelte'
</script>

<div class="pa-5 ma-5">
  <MagicSelect
    flatMode
    keepValue
    path="/users/search"
    searchKey="q"
    selectKey="provider"
    getValue2={(item) => item.mail}
  />
</div>

<style>
  div {
    border: 1px solid #ccc;
  }
</style>
