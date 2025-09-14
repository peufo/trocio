<script>
  import { goto } from "$app/navigation";

  import Profile from "$lib/user/Profile.svelte";
  import { user } from "$lib/user/store";
  import { onMount } from "svelte";

  onMount(() => {
    if (!$user) {
      goto("/login?callback=/profile");
    }
  });
</script>

<Profile />
