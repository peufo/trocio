<script lang="ts">
  import Peer from '$lib/lab/Peer.svelte'
</script>

<div class="pa-4">
  <h5>Test peerjs</h5>

  <div class="container">
    <div>
      <Peer name="Alice" />
    </div>
    <div>
      <Peer name="Bob" />
    </div>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>
