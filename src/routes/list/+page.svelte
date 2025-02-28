<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	const num: any = page.url.searchParams.get('workshop') ?? '';
	let data: any = {};
	if (browser) {
		data = JSON.parse(localStorage.getItem('data') ?? '{}')[num];
		console.log(data);
	}
</script>

<div class="main">
	<h1>Workshop {data.name}</h1>
</div>

<style>
	.main {
		text-align: center;
	}
</style>
