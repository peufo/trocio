<script>
    import { fade } from 'svelte/transition'
</script>

<div in:fade style="height: 100%;">
    <slot />
</div>