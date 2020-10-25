<script>
    import Button from '@smui/button'
    import Switch from '@smui/switch'
    import FormField from '@smui/form-field'
    import Textfield from '@smui/textfield'
    import Icon from '@smui/textfield/icon/index'

    import TagsPrint from './TagsPrint.svelte'
    import { goPrint } from './utils'
    import Tag from './Tag.svelte'
    import AutoPatch from './AutoPatch.svelte'
    import notify from './notify.js'

    export let width = 90
    export let height = 29
    export let padding = 2
    export let fontSize = 16
    export let border = true

    let articles = [
        {name: 'Article test A', ref: '123', price: 99},
        {name: 'Article test B qui a une désignation un peu longue', ref: '231', price: 45},
        {name: 'Art C', ref: '321', price: 900}
    ]

    $: if (!width) width = 1
    $: if (!height) height = 1
    $: if (!padding) padding = 0

</script>

<div class="w3-card w3-round" style="max-width: 850px; margin: auto; height: calc(100% - 45px);">

    <br>

    <div class="w3-row">
    
        <div class="w3-col m4 w3-center">
            
            <br>

            <div class="w3-row">

                <div class="w3-col s6">
                    <Textfield
                        withLeadingIcon
                        bind:value={width}
                        label="Largeur"
                        dense
                        input$min="10"
                        input$max="200"
                        type="number">
                        <Icon class="material-icons" style="transform: rotate(90deg);">height</Icon>
                    </Textfield>

                    <br><br>

                    <Textfield
                        withLeadingIcon
                        bind:value={height}
                        label="Hauteur"
                        dense
                        input$min="10"
                        input$max="200"
                        type="number">
                        <Icon class="material-icons">height</Icon>
                    </Textfield>
                </div>

                <div class="w3-col s6">
                    <Textfield
                        withLeadingIcon
                        bind:value={padding}
                        label="Marge"
                        dense
                        input$min="0"
                        input$max="20"
                        type="number">
                        <Icon class="material-icons">settings_overscan</Icon>
                    </Textfield>

                    <br><br>

                    <Textfield
                        withLeadingIcon
                        bind:value={fontSize}
                        label="Taille text"
                        dense
                        input$min="6"
                        input$max="50"
                        type="number">
                        <Icon class="material-icons">format_size</Icon>
                    </Textfield>            
                </div>
            
            </div>



            <br><br>

            <FormField align="end">
                <Switch bind:checked={border}/>
                <span slot="label">Afficher les bords</span>
            </FormField>

            <br><br>

            <FormField align="end" on:click={() => notify.info({title: 'En développement', text: `L'utilisation des codes barres est en cours de développement.`})}>
                <Switch checked={false} disabled/>
                <span slot="label">Utiliser les codes barres</span>
            </FormField>

            <br><br>

            <div>
                <Button
                on:click="{() => goPrint('testPrint')}"
                variant="outlined">
                    tester
                </Button>
            </div> 

        </div>

        <div class="w3-col m8">
            <div style="{`width: ${width}mm`}; margin: auto;">
                <TagsPrint id="testPrint" visible {articles} {width} {height} {padding} {border} {fontSize}/>
            </div>      
        </div>
    
    </div>

    <br>

</div>

