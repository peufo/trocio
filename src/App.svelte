<script lang="ts">
  import { Router } from '@roxi/routify'
  import { routes } from '../.routify/routes.js'
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query'
  import { parse, stringify, IParseOptions, IStringifyOptions } from 'qs'

  const queryHandler = {
    parse: (str: string, options: IParseOptions) =>
      parse(str, { ignoreQueryPrefix: true, ...options }),
    stringify: (str: string, options: IStringifyOptions) =>
      stringify(str, { addQueryPrefix: true, ...options }),
  }

  const queryClient = new QueryClient()
</script>

<QueryClientProvider client={queryClient}>
  <Router {routes} config={{ queryHandler }} />
</QueryClientProvider>
