<script>
    import { slide } from 'svelte/transition'
    import List, { Item, Graphic, Text} from '@smui/list'
    import MenuSurface, { Anchor } from '@smui/menu-surface'
	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
    import 'dayjs/locale/fr'
    dayjs.locale('fr')
    dayjs.extend(relativeTime)
    
    import { convertDMS } from './utils.js'
    
    export let troc = {}
    export let nameDisplay = false

    let scheduleOpen = false

    let scheduleMenu
    let scheduleAnchor

    function openSchedule() {
        scheduleMenu.setOpen(true)
    }

</script>

{#if nameDisplay}
    <h3>{troc.name}</h3>
{/if}

<p>{troc.description}</p>

<List>

    {#if troc.societyweb && troc.society}
        <a href={`https://${troc.societyweb}`} target="_blank" title="Accéder au site internet de l'organisateur">
            <Item>
                <Graphic class="fas fa-user-tie"></Graphic>
                <Text>{troc.society}</Text>
            </Item>
        </a>
    {:else if troc.society}
        <Item>
            <Graphic class="fas fa-user-tie"></Graphic>
            <Text>{troc.society}</Text>
        </Item>
    {/if}

    <a href={`https://www.google.ch/maps/place/${convertDMS(troc.location)}`} target="_blank" title="Ouvrir dans Google Map">
        <Item>
            <Graphic class="fas fa-map-marker-alt"></Graphic>
            <Text>{troc.address}</Text>
        </Item>
    </a>
        <div>
            <Item on:click={() => scheduleOpen = !scheduleOpen} title="{scheduleOpen ? 'Cacher': 'Afficher'} l'horaire">
                <Graphic class="far fa-calendar-alt"></Graphic>
                <Text>
                    {dayjs(troc.schedule && troc.schedule[0] && troc.schedule[0].open).fromNow()}
                </Text>

            </Item>
            
            {#if scheduleOpen && troc.schedule}
                <div class="schedule" transition:slide|local>
                    {#each troc.schedule as day}
                        
                        {dayjs(day.open).format('dddd DD.MM.YY [d]e H[h]mm à ')}
                        {dayjs(day.close).format('H[h]mm')}
                        <br>
                    {/each}
                </div>
            {/if}

            <!--
            <MenuSurface bind:this={scheduleMenu} anchorCorner="TOP_RIGHT">
                <div style="marin: 1em;">
                    <List nonInteractive>
                        {#if !!troc.schedule}
                        {#each troc.schedule as day}
                            <Item>
                                {dayjs(day.open).format('dddd DD.MM.YY [d]e H[h]mm à ')}
                                {dayjs(day.close).format('H[h]mm')}
                            </Item>
                        {/each}
                        {/if}
                    </List>
                </div>
            </MenuSurface>
            -->
        </div>
    
</List>

<style>
    .schedule {
        text-align: right;
        padding: 1em;
    }
</style>
