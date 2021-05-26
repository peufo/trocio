<script lang="ts">
  import { slide } from 'svelte/transition'
  import {
    NavigationDrawer,
    ListItem,
    TextField,
    Icon,
    List,
  } from 'svelte-materialify'
  import {
    faSearch,
    faChevronDown,
    faPlus,
  } from '@fortawesome/free-solid-svg-icons'
  import dayjs from 'dayjs'
  import debounce from 'debounce'

  import logo from '$assets/logo'
  import { query } from '$lib/troc/store'
  import layout from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'
  import TrocMap from '$lib/troc/Map.svelte'
  import TrocSubscribed from '$lib/troc/Subscribed.svelte'

  export let active = true
  export let width = '360px'

  let trocSubscribedShow = true
  let scrollY = 0

  let search = ''
  let mapFilter = {}
  let timeFilter: { start?: string; end?: string } = {}
  // TODO: remove timeFilterChecked ?
  let timeFilterChecked = true
  let start = dayjs().add(-1, 'year').format('YYYY-MM-DD')
  let end = dayjs().add(6, 'month').format('YYYY-MM-DD')

  $: timeFilter = timeFilterChecked ? { start, end } : {}
  $: $query = { search, ...timeFilter, ...mapFilter }

  const handleSearch = debounce((event) => {
    search = event.target.value
  }, 300)
</script>

<svelte:window bind:scrollY />

<NavigationDrawer
  {active}
  fixed
  style="
    width: {width};
    height: {$layout.innerHeight}px;
    padding-top: {scrollY > $layout.headerHeight
    ? 0
    : $layout.headerHeight - scrollY}px;
  "
>
  <TextField
    clearable
    placeholder="Recherche"
    class="pa-2 mb-3 mt-3"
    on:input={handleSearch}
    on:change={handleSearch}
  >
    <span slot="prepend">
      <IconLink icon={faSearch} />
    </span>
  </TextField>

  <!--
    <Switch bind:checked={timeFilterChecked} color="grey" class="pt-3 pl-3 pr-3">
      Filtrer sur une période
    </Switch>
  -->
  <div class="d-flex pa-2">
    <TextField bind:value={start} type="date">A partir du</TextField>
    <TextField bind:value={end} type="date">Jusqu'au</TextField>
  </div>

  <div class="pa-2">
    <TrocMap bind:mapFilter />
  </div>

  <div class="pa-2">
    <List style="d-flex flex-row">
      <a href="/trocs/create">
        <ListItem>
          <span slot="prepend"><IconLink icon={faPlus} /></span>
          Organiser un troc
        </ListItem>
      </a>

      <ListItem on:click={() => (trocSubscribedShow = !trocSubscribedShow)}>
        <span slot="prepend">
          <Icon {...logo} />
        </span>
        Mes trocs
        <span slot="append">
          <IconLink
            icon={faChevronDown}
            rotate={trocSubscribedShow ? 0 : -90}
          />
        </span>
      </ListItem>

      {#if trocSubscribedShow}
        <div transition:slide|locale>
          <TrocSubscribed offset={72} />
        </div>
      {/if}
    </List>
  </div>
</NavigationDrawer>
