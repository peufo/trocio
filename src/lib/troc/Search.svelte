<script lang="ts">
  import { onMount } from 'svelte'
  import { TextField } from 'svelte-materialify'
  import { debounce } from 'debounce'
  import { faSearch } from '@fortawesome/free-solid-svg-icons'
  import Litepicker from 'litepicker'
  import 'litepicker/dist/plugins/mobilefriendly'
  import dayjs from 'dayjs'

  import { queryTrocsParams } from '$lib/troc/store'
  import IconLink from '$lib/util/IconLink.svelte'

  // TODO: -2 year juste for dev
  const initialStart = dayjs().add(-2, 'year').format('YYYY-MM-DD')
  const initialEnd = dayjs().add(1, 'month').format('YYYY-MM-DD')
  let searchElement: HTMLInputElement
  let startElement: HTMLInputElement
  let endElement: HTMLInputElement
  let picker: Litepicker

  onMount(() => {
    initTimePicker()
    queryTrocsParams.update((query) => ({
      start: initialStart,
      end: initialEnd,
      ...query,
    }))
    return () => {
      picker?.destroy()
    }
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
      numberOfColumns: 2,
      numberOfMonths: 2,
      lang: navigator.language,
      plugins: ['mobilefriendly'],
      setup: (picker) => {
        picker.on('selected', (date1, date2) => {
          queryTrocsParams.update((query) => ({
            ...query,
            start: dayjs(date1.dateInstance).format('YYYY-MM-DD'),
            end: dayjs(date2.dateInstance).format('YYYY-MM-DD'),
          }))
        })
      },
    })
  }

  const handleSearch = debounce((event: any) => {
    queryTrocsParams.update((query) => ({
      ...query,
      search: event.target.value,
    }))
    if (event.type === 'change') searchElement.blur()
  }, 300)
</script>

<TextField
  clearable
  placeholder="Recherche"
  solo
  flat
  value={$queryTrocsParams.search || ''}
  bind:inputElement={searchElement}
  on:input={handleSearch}
  on:change={handleSearch}
>
  <span slot="prepend"><IconLink icon={faSearch} /></span>
</TextField>

<div class="d-flex pa-2" style="gap: 15px;">
  <TextField
    value={$queryTrocsParams.start || initialStart}
    bind:inputElement={startElement}
  >
    A partir du
  </TextField>
  <TextField
    value={$queryTrocsParams.end || initialEnd}
    bind:inputElement={endElement}
  >
    Jusqu'au
  </TextField>
</div>
