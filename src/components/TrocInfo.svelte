<script>
    import List, { Item, Graphic, Text } from '@smui/list'
    import MenuSurface, { Anchor } from '@smui/menu-surface'
	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
    import 'dayjs/locale/fr'
    dayjs.locale('fr')
    dayjs.extend(relativeTime)
    
    import { convertDMS } from './utils.js'
    
    export let troc = {}
    export let societyDisplay = false

    let scheduleMenu
    let scheduleAnchor

    function openSchedule() {
        scheduleMenu.setOpen(true)
    }

</script>


<div class="w3-padding">

    {#if societyDisplay}
        <h3>{troc.name}</h3>
    {/if}

    <p>{troc.description}</p>
    
    <List>

        {#if troc.societyweb}
            <a href={`https://${troc.societyweb}`} title="Accéder au site internet de l'organisateur">
                <Item>
                    <Graphic class="fas fa-user-tie"></Graphic>
                    <Text>{troc.society}</Text>
                </Item>
            </a>
        {:else}
            <Item>
                <Graphic class="fas fa-user-tie"></Graphic>
                <Text>{troc.society}</Text>
            </Item>
        {/if}

        <a href={`https://www.google.ch/maps/place/${convertDMS(troc.location)}`} title="Ouvrir dans Google Map">
            <Item>
                <Graphic class="fas fa-map-marker-alt"></Graphic>
                <Text>{troc.address}</Text>
            </Item>
        </a>
        <div>
            <Item on:click={openSchedule} title="Afficher l'horaire">
                <Graphic class="far fa-calendar-alt"></Graphic>
                <Text>{dayjs(troc.schedule && troc.schedule[0].open).fromNow()}</Text>
            </Item>
            <MenuSurface bind:this={scheduleMenu} anchorCorner="BOTTOM_LEFT">
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
        </div>
    </List>

</div>




<!--
<div class="w3-col m4 w3-center">
    <div class="w3-small w3-padding">
        <span class="w3-round">
            <i class="far fa-clock"></i>
            {dayjs(troc.schedule[0].open).fromNow()}
        </span>

        <ul class="w3-ul w3-tiny w3-margin-top">
        {#each troc.schedule as day}
            <li>
                {dayjs(day.open).format('ddd. DD.MM.YY [d]e H[h]mm à ')}
                {dayjs(day.close).format('H[h]mm')}
            </li>
        {/each}
        </ul>
        
    </div>
</div>
-->

