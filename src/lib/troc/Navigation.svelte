<script lang="ts">
  import { onDestroy } from 'svelte'
  import { slide } from 'svelte/transition'
  import {
    TextField,
    List,
    ListItem,
    Divider,
    Subheader,
    Button,
  } from 'svelte-materialify'
  import Litepicker from 'litepicker'
  import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons'
  import dayjs from 'dayjs'
  import debounce from 'debounce'
  import { isActive, afterPageLoad } from '@roxi/routify'

  import { query } from '$lib/troc/store'
  import layout from '$lib/store/layout'
  import { user } from '$lib/user/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import NavigationDrawer from '$lib/util/NavigationDrawer.svelte'
  import TrocMap from '$lib/troc/Map.svelte'
  import UserSubscribes from '$lib/troc/UserSubscribes.svelte'

  export let active = true
  export let width = '360px'
  export let mobileMode = false

  let scrollY = 0

  let search = ''
  let searchElement: undefined | HTMLInputElement
  let mapFilter = {}
  let timeFilter: { start?: string; end?: string } = {}
  const initialStart = dayjs().format('YYYY-MM-DD')
  const initialEnd = dayjs().add(2, 'month').format('YYYY-MM-DD')
  let startElement: HTMLInputElement
  let endElement: HTMLInputElement
  let picker: Litepicker

  $afterPageLoad(() => {
    if (!mobileMode && $isActive('/trocs/index'))
      setTimeout(() => searchElement?.focus(), 200)
    if ($isActive('/trocs/index')) {
      timeFilter = { start: initialStart, end: initialEnd }
      initTimePicker()
    }
  })

  onDestroy(() => {
    picker?.destroy()
  })

  function initTimePicker() {
    picker?.destroy()
    picker = new Litepicker({
      element: startElement,
      elementEnd: endElement,
      // Nécéssaire pour traquer le theme
      parentEl: document.querySelector<HTMLDivElement>('#app .s-app'),
      singleMode: false,
      allowRepick: true,
      lang: navigator.language,
      numberOfMonths: 3,
      numberOfColumns: 3,
      setup: (picker) => {
        picker.on('selected', (date1, date2) => {
          timeFilter = {
            start: dayjs(date1.dateInstance).format('YYYY-MM-DD'),
            end: dayjs(date2.dateInstance).format('YYYY-MM-DD'),
          }
        })
      },
    })
  }

  $: $query = { search, ...timeFilter, ...mapFilter }

  const handleSearch = debounce((event: any) => {
    search = event.target.value
  }, 300)
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

  <List nav>
    {#if $isActive('/trocs/index')}
      <div transition:slide|local class="border">
        <TextField
          clearable
          placeholder="Recherche"
          solo
          flat
          bind:inputElement={searchElement}
          on:input={handleSearch}
          on:change={handleSearch}
        >
          <span slot="prepend"><IconLink icon={faSearch} /></span>
        </TextField>

        <div class="d-flex pa-2" style="gap: 15px;">
          <TextField value={initialStart} bind:inputElement={startElement}>
            A partir du
          </TextField>
          <TextField value={initialEnd} bind:inputElement={endElement}>
            Jusqu'au
          </TextField>
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

    <div class="pt-4 pb-3 d-flex justify-space-between">
      <h6>Mes trocs</h6>
      <a href="{!$user ? '/login?callback=' : ''}/trocs/create">
        <Button>
          <IconLink icon={faPlus} class="mr-2" opacity />
          Organiser
        </Button>
      </a>
    </div>

    {#if !$user}
      <ListItem disabled>
        <div class="text--disabled text-center">
          Connectez-vous pour voir vos trocs.
        </div>
      </ListItem>
    {:else}
      <UserSubscribes
        offset={22}
        on:click={() => mobileMode && (active = false)}
      />
    {/if}
  </List>
</NavigationDrawer>

<style>
  .border {
    border: solid 1px var(--theme-text-fields-border);
    border-radius: 5px;
  }
</style>
