<script lang="ts">
	import { csvJSON } from '$lib';
	import { schedule } from '$lib/schedule';

	let files: any = $state();
	let data = $state('');
	let fileInput: any = $state();
	let status = $state('waiting');
	let url = $state('');
	let fileLink: any = $state();

	let maximum = $state(25);
	let minimum = $state(10);
	let numChoices = $state(7);
	let numWorkshopsA = $state(15);
	let numWorkshopsB = $state(15);
	let blocks = $state(4);
	let numA = $state(2);
	let numB = $state(2);

	async function change() {
		status = 'scheduling';
		let file = files[0];
		let fileReader = new FileReader();
		fileReader.onload = () => {
			data = JSON.stringify(
				schedule(
					csvJSON(String(fileReader.result)),
					maximum,
					minimum,
					numChoices,
					numWorkshopsA,
					numWorkshopsB,
					blocks,
					numA,
					numB
				)
			);
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
{:else if status === 'finished'}
	<button onclick={download}>Download File (.json)</button>
{:else}
	<button onclick={uploadFile}>Input Spreadsheet (.csv)</button><br /><br />
	<label
		>Maximum number of students per workshop: <input type="number" bind:value={maximum} /></label
	><br />
	<label
		>Minimum number of students per workshop: <input type="number" bind:value={minimum} /></label
	><br />
	<label
		>Number of choices per student in input spreadsheet: <input
			type="number"
			bind:value={numChoices}
		/></label
	><br />
	<label>Number of A workshops: <input type="number" bind:value={numWorkshopsA} /></label><br />
	<label>Number of B workshops: <input type="number" bind:value={numWorkshopsB} /></label><br />
	<label>Number of A workshops per student: <input type="number" bind:value={numA} /></label><br />
	<label>Numbee of blocks: <input type="number" bind:value={blocks} /></label>
{/if}

<p>Website made by <strong>Unlimited Stuff Ltd.</strong></p>
