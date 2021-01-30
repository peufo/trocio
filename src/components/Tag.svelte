<script>

    export let name = `Nom de l'article`
    export let ref = 'ref'
    export let price = 99

    export let width = 80
    export let height = 22
    export let padding = 2
    export let fontSize = 16
    export let border = false

</script>

<div class="tag" class:border style={`width: ${width}mm; height: ${height}mm; padding: ${padding}mm; font-size: ${fontSize}px;`}>

    <b>#{ref}</b>&nbsp;&nbsp;
    <span>{name}</span>

    <br><br>
    <img src="/favicon.ico" alt="Logo trocio" height="30" width="30" style={`bottom: ${padding}mm; left: ${padding}mm;`}>
    <div class="price" style={`bottom: ${padding}mm; right: ${padding}mm;`}>
        {price.toFixed(2)}
    </div>
</div>

<style>
    .tag {
        page-break-before: always;
        position: relative;
        overflow: hidden;
    }

    .tag.border {
        border: 2px solid #ccc;
        border-radius: 4px;
    }

    .tag:not(:first-child) {
        margin-top: 1mm;
    }

    .price {
        position: absolute;
        line-height: 1;
    }
    img {
        position: absolute;
    }
</style>