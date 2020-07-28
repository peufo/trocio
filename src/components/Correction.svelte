<script>
    
    import { addStatutField, statutFiltersOptions, sortOptions } from './utils.js'
    import SearchTable from './SearchTable.svelte'
    import ArticleDialog from './ArticleDialog.svelte'


    export let user = {}
    export let troc = ''

    let articleDialog
    let articles = []
    let article = {}

    //TODO: replace with getFields

    let fields = [
        {label: '#',            checked: true,  typeMenu: 'search', dataName: 'ref',        dataType: 'string', cellWidth: 50,  disabled: true},
        {label: 'Désignation',  checked: true,  typeMenu: 'search', dataName: 'name',       dataType: 'string', cellWidth: 300, disabled: true},
        {label: 'Statut',       checked: true,  typeMenu: 'filter', dataName: 'statut',        dataType: 'string', cellWidth: 90,  options: statutFiltersOptions},
        {label: 'Création',     checked: false, typeMenu: 'sort',   dataName: 'createdAt',     dataType: 'date',   cellWidth: 170},
        {label: 'Fournisseur',  checked: true,  typeMenu: 'user',   dataName: 'provider.name', dataType: 'string', cellWidth: 70},
        {label: 'Validation',   checked: false, typeMenu: 'sort',   dataName: 'valided',       dataType: 'date',   cellWidth: 170},
        {label: 'Validateur',   checked: false, typeMenu: 'user',   dataName: 'validator.name',dataType: 'string', cellWidth: 50},
        {label: 'Vente',        checked: false, typeMenu: 'sort',   dataName: 'sold',          dataType: 'date',   cellWidth: 170},
        {label: 'Récupération', checked: false, typeMenu: 'sort',   dataName: 'recover',       dataType: 'date',   cellWidth: 170},
        {label: 'Caissier',     checked: false, typeMenu: 'user',   dataName: 'seller.name',   dataType: 'string', cellWidth: 50},
        {label: 'Client',       checked: false, typeMenu: 'user',   dataName: 'buyer.name',    dataType: 'string', cellWidth: 50},
        {label: 'Prix',         checked: true,  typeMenu: 'sort',   dataName: 'price',         dataType: 'number', cellWidth: 150},
        {label: 'Frais',        checked: false, typeMenu: 'sort',   dataName: 'fee',           dataType: 'number', cellWidth: 50},
        {label: 'Marge',        checked: false, typeMenu: 'sort',   dataName: 'margin',        dataType: 'number', cellWidth: 50},
    ]
    fields = fields.map(field => {
        field.queryValue = ''
        field.queryLabel = ''
        field.queryIcon = ''
        if (field.typeMenu == 'sort') field.options = sortOptions
        if (field.typeMenu == 'user') field.queryIcon = '<i class="far fa-user"></i>'
        return field
    })

    function selectArticle(e) {
        article = e.detail
        setTimeout(articleDialog.open, 0)
    }

    function articlePatched(e) {
        let index = articles.map(i => i._id).indexOf(article._id)
        articles[index] = addStatutField([e.detail])[0]
    }

</script>

<SearchTable title="Articles" {troc} {fields} on:select={selectArticle} bind:items={articles}/>

<ArticleDialog {user} {article} bind:dialog={articleDialog} on:patched={articlePatched}/>
