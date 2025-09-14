<script>
  let klass = "";
  export { klass as class };
  export let style = "";
</script>

<div class="s-card-title {klass}" {style}>
  <slot />
</div>

<style lang="scss" src="./CardTitle.scss" global>
</style>
