<script>
  let klass = ''
  export { klass as class }
  export let style = ''
</script>

<div class="s-card-actions {klass}" {style}>
  <slot />
</div>

<style lang="scss" src="./CardActions.scss" global>
</style>
