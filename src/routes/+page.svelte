<script lang="ts">
	import { csvJSON } from '$lib';
	import { schedule } from '$lib/schedule';

	let files: any = $state();
	let data = $state('');
	let fileInput: any = $state();
	let status = $state('waiting');
	let url = $state('');
	let fileLink: any = $state();

	async function change() {
		status = 'scheduling';
		let file = files[0];
		let fileReader = new FileReader();
		fileReader.onload = () => {
			data = JSON.stringify(schedule(csvJSON(String(fileReader.result))));
			status = 'finished';
		};
		fileReader.readAsText(file);
	}
	function uploadFile() {
		fileInput.click();
	}
	function download() {
		const blob = new Blob([data], { type: 'application/json' });
		url = URL.createObjectURL(blob);
		fileLink.click();
	}
</script>

<input type="file" accept=".csv" bind:files onchange={change} hidden bind:this={fileInput} />

<a hidden href={url} download="schedule.json" bind:this={fileLink}>Hidden</a>

{#if status === 'scheduling'}
	<p>Please Wait...</p>
{:else if status === 'waiting'}
	<button onclick={uploadFile}>File Input</button>
{:else if status === 'finished'}
	<button onclick={download}>Download File</button>
{/if}
