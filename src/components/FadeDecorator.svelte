<script>
    import { fade } from 'svelte/transition'
</script>

<div in:fade>
    <slot />
</div>