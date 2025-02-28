<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	const num: any = page.url.searchParams.get('workshop') ?? '';
	const numBlocks: number = Number(page.url.searchParams.get('blocks')) ?? 0;

	let waiting = $state(true);
	let url = $state('');
	let downloadName = $state('');

	let fileLink: any = $state();

	let data: any = $state({});
	if (browser) {
		data = JSON.parse(localStorage.getItem('data') ?? '[]')[num];
		waiting = false;
	}
	function blocks() {
		let toReturn = '1fr';
		for (let i = 1; i < numBlocks; i++) {
			toReturn = toReturn.concat(' 1fr');
		}
		return toReturn;
	}
	function loopNums() {
		let toReturn = [];
		for (let i = 1; i <= numBlocks; i++) {
			toReturn.push(i);
		}
		return toReturn;
	}
	function download() {
		const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
		url = URL.createObjectURL(blob);
		downloadName = `${data.name}.json`;
		fileLink.click();
	}
</script>

<a href={url} download={downloadName} bind:this={fileLink} hidden>Hidden</a>

{#if waiting}
	<p>Please Wait...</p>
{:else}
	<div class="main">
		<h1>Workshop {data.name}</h1>

		<div class="grid" style="grid-template-columns: {blocks()};">
			{#each loopNums() as num}
				<div>
					<h2>Block {num}</h2>
					{#each data.data[`Block${num}`] as student}
						{student}<br />
					{/each}
				</div>
			{/each}
		</div>

		<button onclick={download}>Download List</button>
	</div>
{/if}

<style>
	.main {
		text-align: center;
	}
	.grid {
		display: grid;
	}
</style>
