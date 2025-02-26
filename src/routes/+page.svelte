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
	let numWorkshopsB = $state(17);
	let blocks = $state(4);
	let numA = $state(2);
	let numB = $state(2);
	let doubleBlock = $state('A.3');

	async function change() {
		status = 'scheduling';
		let file = files[0];
		let fileReader = new FileReader();
		fileReader.onload = () => {
			let scheduled = schedule(
				csvJSON(String(fileReader.result)),
				maximum,
				minimum,
				numChoices,
				numWorkshopsA,
				numWorkshopsB,
				blocks,
				numA,
				numB,
				doubleBlock
			);
			if (scheduled[0] === 'error') {
				status = 'error';
			} else {
				data = JSON.stringify(scheduled);
				status = 'finished';
			}
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
{:else if status === 'error'}
	<p>There was an error.</p>
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
	<label>Number of blocks: <input type="number" bind:value={blocks} /></label><br />
	<label>Double block: <input type="text" bind:value={doubleBlock} /></label>

	<hr />

	<p>Input spreadsheet columns: ParticipantID, Choice1, Choice2, Choice3...</p>
	<p>Input spreadsheet must be .CSV file</p>
	<p>Workshop name uses '.' and letter is capital (A.1 instead of a1)</p>
{/if}

<hr />

<p>Website made by <strong>Unlimited Stuff Ltd.</strong></p>
