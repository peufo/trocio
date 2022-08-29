<script lang="ts">
  import { Button, Card, CardText, CardTitle } from 'svelte-materialify'
  import { faEdit } from '@fortawesome/free-solid-svg-icons'

  import { troc } from '$lib/troc/store'
  import TrocCard from '$lib/troc/Card.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
</script>

<TrocCard troc={$troc} hideAdminButton>
  <div slot="card-actions">
    <a href={`/admin/edit?trocId=${$troc._id}`}>
      <Button depressed>
        éditer la définition du troc
        <IconLink icon={faEdit} class="ml-2" size="1.2em" opacity />
      </Button>
    </a>
  </div>
</TrocCard>

<Card>
  <CardTitle>0 Participants</CardTitle>
  <CardText>
    <ul>
      <li>asd</li>
      <li>asd</li>
      <li>asd</li>
    </ul>
  </CardText>
</Card>

<Card>
  <CardTitle>42 Articles proposés</CardTitle>
  <CardText>
    <ul>
      <li>asd</li>
      <li>asd</li>
      <li>asd</li>
    </ul>
  </CardText>
</Card>
