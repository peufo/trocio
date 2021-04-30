<!--

    <script lang="ts">
        import { Router } from '@roxi/routify'
        import { routes } from '../.routify/routes.js'
        import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query'
    
        const queryClient = new QueryClient()
    
    
    </script>
    
    <QueryClientProvider client={queryClient}>
        <Router {routes} />
    </QueryClientProvider>
-->


<script lang="ts">
    import { Router } from '@roxi/routify'
    import { routes } from '../.routify/routes.js'

</script>

<Router {routes} />
