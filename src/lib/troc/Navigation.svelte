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
  import { isActive, afterPageLoad } from '@roxi/routify'

  import logo from '$assets/logo'
  import { query } from '$lib/troc/store'
  import layout from '$lib/store/layout'
  import { user } from '$lib/store/user'
  import IconLink from '$lib/util/IconLink.svelte'
  import TrocMap from '$lib/troc/Map.svelte'
  import TrocSubscribed from '$lib/troc/Subscribed.svelte'

  export let active = true
  export let width = '360px'
  export let mobileMode = false

  let trocSubscribedShow = false
  let scrollY = 0

  let search = ''
  let searchElement: undefined | HTMLInputElement
  let mapFilter = {}
  let timeFilter: { start?: string; end?: string } = {}
  let start = dayjs().add(-1, 'year').format('YYYY-MM-DD')
  let end = dayjs().add(6, 'month').format('YYYY-MM-DD')

  $: timeFilter = { start, end }
  $: $query = { search, ...timeFilter, ...mapFilter }

  const handleSearch = debounce((event) => {
    search = event.target.value
  }, 300)

  $afterPageLoad(() => {
    if (!mobileMode && $isActive('/trocs/index'))
      setTimeout(() => searchElement?.focus(), 200)
  })
</script>

<svelte:window bind:scrollY />

<NavigationDrawer
  {active}
  transition={() => ({ duration: 0, css: (t) => '' })}
  fixed
  style="
    width: {width};
    height: {$layout.innerHeight}px;
    padding-top: {scrollY > $layout.headerHeight
    ? 0
    : $layout.headerHeight - scrollY}px;
  "
>
  <div class="pa-2">
    <TrocMap
      bind:mapFilter
      on:clickMarker={() => mobileMode && (active = false)}
    />
  </div>

  <div class="pa-2">
    <List>
      {#if $isActive('/trocs/index')}
        <div transition:slide|local>
          <TextField
            clearable
            placeholder="Recherche"
            class="pa-2 pb-5"
            bind:inputElement={searchElement}
            on:input={handleSearch}
            on:change={handleSearch}
          >
            <span slot="prepend"><IconLink icon={faSearch} /></span>
          </TextField>

          <div class="d-flex pa-2">
            <TextField bind:value={start} type="date">A partir du</TextField>
            <TextField bind:value={end} type="date">Jusqu'au</TextField>
          </div>
        </div>
      {:else}
        <div transition:slide|local>
          <a href="/trocs">
            <ListItem>
              <span slot="prepend">
                <IconLink icon={faSearch} />
              </span>
              Recherche
            </ListItem>
          </a>
        </div>
      {/if}

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
        <div transition:slide|local>
          {#if !$user}
            <ListItem disabled>
              <div class="text--disabled text-center">
                Connectez-vous pour voir vos trocs.
              </div>
            </ListItem>
          {:else}
            <TrocSubscribed
              offset={72}
              on:click={() => mobileMode && (active = false)}
            />
          {/if}
        </div>
      {/if}
    </List>
  </div>
</NavigationDrawer>
