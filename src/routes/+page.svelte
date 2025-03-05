<script lang="ts">
	import { csvJSON, jsonCSV, type Filter } from '$lib';
	import { schedule } from '$lib/schedule';
	import { getWorkshopName } from '$lib';

	type Workshop = {
		name: string;
		url: string;
		num: number;
	};

	type WorkshopData = {
		name: string;
		data: any;
	};

	let files: any = $state();
	let workshopFiles: any = $state();
	let data: any = $state();
	let fileInput: any = $state();
	let workshopFileInput: any = $state();
	let status = $state('waiting');
	let url = $state('');
	let fileLink: any = $state();

	let workshopListSelected = $state(false);

	let maximum = $state(25);
	let minimum = $state(10);
	let numChoices = $state(7);
	let numWorkshopsA = $state(15);
	let numWorkshopsB = $state(17);
	let blocks = $state(4);
	let numA = $state(2);
	let doubleBlock = $state('A.3');

	let filterWorkshop = $state('B.3');
	let filterBlock = $state(1);

	let filters: Filter[] = $state([]);

	let downloadName = $state('schedule.json');
	let workshopsList: any[] = $state([]);

	let workshops: Workshop[] = $state([]);
	let localStorageData: WorkshopData[] = $state([]);
	let dataList: any = $state();

	function getDefaultNames() {
		let toReturn = [];
		for (let i = 1; i <= numWorkshopsA; i++) {
			toReturn.push({
				Code: `A.${i}`,
				Name: `A.${i}`
			});
		}
		for (let i = 1; i <= numWorkshopsB; i++) {
			toReturn.push({
				Code: `B.${i}`,
				Name: `B.${i}`
			});
		}
		return toReturn;
	}
	function scheduleFunc(fileReader: FileReader, fileReader2: FileReader) {
		let workshopNames;
		if (workshopListSelected) workshopNames = csvJSON(String(fileReader2.result));
		else workshopNames = getDefaultNames();
		workshopsList = workshopNames;
		let [scheduled, aWorkshops, bWorkshops] = schedule(
			csvJSON(String(fileReader.result)),
			$state.snapshot(maximum),
			$state.snapshot(numChoices),
			$state.snapshot(numWorkshopsA),
			$state.snapshot(numWorkshopsB),
			$state.snapshot(blocks),
			$state.snapshot(numA),
			$state.snapshot(blocks - numA),
			$state.snapshot(doubleBlock),
			$state.snapshot(filters),
			workshopNames ?? []
		);
		if (scheduled[0] === 'error') {
			status = 'error';
			console.log(scheduled[1]);
		} else {
			data = scheduled;
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
			let num = 0;
			for (let i = 0; i < workshopsA.length; i++) {
				const blob = new Blob([JSON.stringify(workshopsA[i])], { type: 'application/json' });
				let workshopUrl = URL.createObjectURL(blob);
				workshops.push({
					name: `A.${i + 1}`,
					url: workshopUrl,
					num
				});
				localStorageData.push({
					name: `A.${i + 1}`,
					data: workshopsA[i]
				});
				num++;
			}
			for (let i = 0; i < workshopsB.length; i++) {
				const blob = new Blob([JSON.stringify(workshopsB[i])], { type: 'application/json' });
				let workshopUrl = URL.createObjectURL(blob);
				workshops.push({
					name: `B.${i + 1}`,
					url: workshopUrl,
					num
				});
				localStorageData.push({
					name: `B.${i + 1}`,
					data: workshopsB[i]
				});
				num++;
			}
			status = 'finished';
		}
	}
	function change() {
		status = 'scheduling';
		let file = files[0];
		let fileReader = new FileReader();
		fileReader.onload = () => {
			let fileReader2 = new FileReader();
			if (workshopListSelected) {
				fileReader2.onload = () => scheduleFunc(fileReader, fileReader2);
				fileReader2.readAsText(workshopFiles[0]);
			} else scheduleFunc(fileReader, fileReader2);
		};
		fileReader.readAsText(file);
	}
	function getFields() {
		let toReturn = ['ParticipantID'];
		for (let i = 0; i < blocks; i++) {
			toReturn.push(`Block${i + 1}`);
		}
		return toReturn;
	}
	function download() {
		const blob = new Blob([jsonCSV(data, getFields())], { type: 'text/csv' });
		url = URL.createObjectURL(blob);
		downloadName = 'schedule.csv';
		fileLink.click();
	}
	function addFilter(event: Event) {
		event.preventDefault();
		for (let i = 0; i < filters.length; i++) {
			if (filters[i].workshop === filterWorkshop && filters[i].block === filterBlock) {
				return;
			}
		}
		filters.push({ workshop: filterWorkshop, block: filterBlock });
	}

	let urlList = $state('');
	let downloadNameList = $state('');

	let fileLinkList: any = $state();

	function getBlocks() {
		let toReturn = '1fr';
		for (let i = 1; i < blocks; i++) {
			toReturn = toReturn.concat(' 1fr');
		}
		return toReturn;
	}
	function getLoopNums() {
		let toReturn = [];
		for (let i = 1; i <= blocks; i++) {
			toReturn.push(i);
		}
		return toReturn;
	}
	function downloadList() {
		const blob = new Blob([JSON.stringify(dataList)], { type: 'application/json' });
		urlList = URL.createObjectURL(blob);
		downloadNameList = `${data.name}.json`;
		fileLinkList.click();
	}
</script>

<input type="file" accept=".csv" bind:files onchange={change} hidden bind:this={fileInput} />
<input
	type="file"
	accept=".csv"
	bind:files={workshopFiles}
	onchange={() => (workshopListSelected = true)}
	hidden
	bind:this={workshopFileInput}
/>

<a hidden href={url} download={downloadName} bind:this={fileLink}>Hidden</a>
<a hidden href={urlList} download={downloadNameList} bind:this={fileLinkList}>Hidden</a>

{#if status === 'scheduling'}
	<p>Please Wait...</p>
{:else if status === 'finished'}
	<button onclick={download}>Download Schedule</button><br /><br />
	{#each workshops as workshop}
		<button
			onclick={() => {
				dataList = localStorageData[workshop.num];
				status = 'list';
			}}>Workshop {workshop.name} List</button
		>
	{/each}<br /><br />
	<button onclick={() => (status = 'waiting')}>Back</button>
{:else if status === 'error'}
	<p>There was an error.</p>
{:else if status === 'list'}
	<div class="main">
		<h1>Workshop {getWorkshopName(workshopsList, numWorkshopsA, dataList.name)}</h1>

		<div class="grid" style="grid-template-columns: {getBlocks()};">
			{#each getLoopNums() as num}
				<div>
					<h2>Block {num}</h2>
					{#each dataList.data[`Block${num}`] as student}
						<input type="checkbox" /> {student}<br />
					{/each}
				</div>
			{/each}
		</div>
		<br />
        <button onclick={() => status = 'waiting'}>Back</button>
		<button onclick={downloadList}>Download List</button>
	</div>
{:else}
	<button onclick={() => fileInput.click()}>Input Spreadsheet</button><br /><br />
	<button onclick={() => workshopFileInput.click()}>List of Workshops</button>
	{#if workshopListSelected}List Selected{/if}<br /><br />
	<label>
		Maximum number of students per workshop: <input type="number" bind:value={maximum} /></label
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
	<label>Double block: <input type="text" bind:value={doubleBlock} /></label><br />
	<form onsubmit={addFilter} name="Workshop Filters">
		<label
			><strong>Stop Workshop</strong>
			<input bind:value={filterWorkshop} required type="text" />
			in block <input bind:value={filterBlock} required type="number" min={1} max={blocks} />
			<button type="submit">Stop Workshop</button></label
		>
	</form>

	{#each filters as filter, i}
		<span>{filter.workshop} is stopped in Block {filter.block}</span>
		<button onclick={() => filters.splice(i, 1)}>Remove</button><br />
	{/each}
	<hr />

	<p>Input spreadsheet columns: <strong>ParticipantID, Choice1, Choice2, Choice3...</strong></p>
	<p>Workshop Names spreadsheet columns: <strong>Code, Name</strong></p>
	<p>Input spreadsheet and Workshop Names spreadsheet must be <strong>.csv</strong> file</p>
	<p>
		<strong>Type.Number</strong> (Examples: A.1, B.11) is the format for the workshop code. Include nothing
		else.
	</p>
{/if}

{#if status !== 'list'}
	<hr />

	<p>Website made by <strong>Unlimited Stuff Ltd.</strong></p>
{/if}

<style>
	:global(:root) {
		font-family: system-ui;
	}
	:global(button) {
		cursor: pointer;
	}
	.main {
		text-align: center;
	}
	.grid {
		display: grid;
	}
</style>
