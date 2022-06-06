<script lang="ts">
  import { onMount } from 'svelte'
  import { TextField } from 'svelte-materialify'
  import { debounce } from 'debounce'
  import { faSearch } from '@fortawesome/free-solid-svg-icons'
  import Litepicker from 'litepicker'
  import dayjs from 'dayjs'

  import { query } from '$lib/troc/store'
  import IconLink from '$lib/util/IconLink.svelte'

  const initialStart = dayjs().format('YYYY-MM-DD')
  const initialEnd = dayjs().add(2, 'month').format('YYYY-MM-DD')
  let startElement: HTMLInputElement
  let endElement: HTMLInputElement
  let picker: Litepicker

  let search = ''
  let start = initialStart
  let end = initialEnd

  $: if (isChanged()) $query = { ...$query, search, start, end }

  onMount(() => {
    initTimePicker()
    start = initialStart
    end = initialEnd
    return () => {
      picker?.destroy()
    }
  })

  function isChanged(): boolean {
    const conditions = [
      $query.search !== search,
      $query.start !== start,
      $query.end !== end,
    ]
    return conditions.filter(Boolean).length > 0
  }

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
          start = dayjs(date1.dateInstance).format('YYYY-MM-DD')
          end = dayjs(date2.dateInstance).format('YYYY-MM-DD')
        })
      },
    })
  }

  const handleSearch = debounce((event: any) => {
    search = event.target.value
  }, 300)
</script>

<TextField
  clearable
  placeholder="Recherche"
  solo
  flat
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
