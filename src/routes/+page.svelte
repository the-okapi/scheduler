<script lang="ts">
	import { csvJSON } from '$lib';
	import { schedule } from '$lib/schedule';

	type Workshop = {
		name: string;
		url: string;
	};

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

	let downloadName = $state('schedule.json');

	let workshops: Workshop[] = $state([]);

	async function change() {
		status = 'scheduling';
		let file = files[0];
		let fileReader = new FileReader();
		fileReader.onload = () => {
			let [scheduled, aWorkshops, bWorkshops] = schedule(
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
				let workshopsA: any = [];
				let workshopsB: any = [];
				for (let i = 0; i < numWorkshopsA; i++) {
					workshopsA.push({});
				}
				for (let i = 0; i < numWorkshopsB; i++) {
					workshopsB.push({});
				}
				for (let i = 0; i < blocks; i++) {
					for (let j = 0; j < numWorkshopsA; j++) {
						workshopsA[j][`Block${i + 1}`] = aWorkshops[i][j];
					}
					for (let j = 0; j < numWorkshopsB; j++) {
						workshopsB[j][`Block${i + 1}`] = bWorkshops[i][j];
					}
				}
				for (let i = 0; i < workshopsA.length; i++) {
					const blob = new Blob([JSON.stringify(workshopsA[i])], { type: 'application/json' });
					let workshopUrl = URL.createObjectURL(blob);
					workshops.push({
						name: `A.${i + 1}`,
						url: workshopUrl
					});
				}
				for (let i = 0; i < workshopsB.length; i++) {
					const blob = new Blob([JSON.stringify(workshopsB[i])], { type: 'application/json' });
					let workshopUrl = URL.createObjectURL(blob);
					workshops.push({
						name: `B.${i + 1}`,
						url: workshopUrl
					});
				}
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
		downloadName = 'schedule.json';
		fileLink.click();
	}
	function downloadLink(link: string, name: string) {
		url = link;
		downloadName = `${name}.json`;
		fileLink.click();
	}
</script>

<input type="file" accept=".csv" bind:files onchange={change} hidden bind:this={fileInput} />

<a hidden href={url} download={downloadName} bind:this={fileLink}>Hidden</a>

{#if status === 'scheduling'}
	<p>Please Wait...</p>
{:else if status === 'finished'}
	<button onclick={download}>Download Schedule</button><br /><br />
	{#each workshops as workshop}
		<button onclick={() => downloadLink(workshop.url, workshop.name)}
			>Download Workshop {workshop.name} List</button
		>
	{/each}
{:else if status === 'error'}
	<p>There was an error.</p>
{:else}
	<button onclick={uploadFile}>Input Spreadsheet</button><br /><br />
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

<style>
	:root {
		font-family: system-ui, sans-serif;
	}
</style>
