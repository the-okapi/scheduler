<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { getWorkshopName } from '$lib';

	const num: any = page.url.searchParams.get('workshop') ?? '';

	let numBlocks = 0;

	let numWorkshopsA = $state(0);

	let waiting = $state(true);
	let url = $state('');
	let downloadName = $state('');

	let fileLink: any = $state();

	let data: any = $state({});
	let workshops: any[] = $state([]);

	if (browser) {
		data = JSON.parse(localStorage.getItem('data') ?? '[]')[num];
		workshops = JSON.parse(localStorage.getItem('workshops') ?? '');
		numBlocks = Number(localStorage.getItem('blocks') ?? '0');
		numWorkshopsA = Number(localStorage.getItem('numWorkshopsA'));
		waiting = false;
	}
	function getBlocks() {
		let toReturn = '1fr';
		for (let i = 1; i < numBlocks; i++) {
			toReturn = toReturn.concat(' 1fr');
		}
		return toReturn;
	}
	function getLoopNums() {
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
		<h1>Workshop {getWorkshopName(workshops, numWorkshopsA, data.name)}</h1>

		<div class="grid" style="grid-template-columns: {getBlocks()};">
			{#each getLoopNums() as num}
				<div>
					<h2>Block {num}</h2>
					{#each data.data[`Block${num}`] as student}
						<input type="checkbox" /> {student}<br />
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
