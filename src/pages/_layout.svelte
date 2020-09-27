
<script>
	import Head from 'Head.svelte'
	import FadeDecorator from 'FadeDecorator.svelte'

</script>

<Head/>

<div id="main-content">

	<slot decorator={FadeDecorator} />

</div>

