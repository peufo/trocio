<script>
  import { Alert, Icon } from 'svelte-materialify'
  import { mdiAlert } from '@mdi/js'
  import TrocEdit from '$lib/troc/Edit.svelte'
</script>

<Alert class="orange white-text" dismissible>
  <div slot="icon">
    <Icon path={mdiAlert} />
  </div>
  La création d'un troc est une fonctionnalité réservée aux testeurs. Contactez-nous
  si vous souhaitez participer à la beta.
</Alert>

<TrocEdit createMode />
