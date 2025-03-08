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
	let listFiles: any = $state();

	let data: any = $state();
	let fileInput: any = $state();
	let listFileInput: any = $state();

	let workshopFileInput: any = $state();
	let status = $state('waiting');
	let url = $state('');
	let fileLink: any = $state();

	let inputFileLink: any = $state();
	let namesFileLink: any = $state();
	let listFileLink: any = $state();

	const inputBlob = new Blob(
		['ParticipantID,Choice1,Choice2,Choice3,Choice4,Choice5,Choice6,Choice7'],
		{ type: 'text/csv' }
	);
	const inputUrl = URL.createObjectURL(inputBlob);

	const namesBlob = new Blob(['Code,Name'], { type: 'text/csv' });
	const namesUrl = URL.createObjectURL(namesBlob);

	const listBlob = new Blob(['Block,ParticipantID'], { type: 'text/csv' });
	const listUrl = URL.createObjectURL(listBlob);

	let workshopListSelected = $state(false);

	let maximum = $state(25);
	let numChoices = $state(14);
	let numWorkshopsA = $state(17);
	let numWorkshopsB = $state(15);
	let blocks = $state(4);
	let numA = $state(2);
	let doubleBlock = $state('A.3');

	let filterWorkshop = $state('B.3');
	let filterBlock = $state(1);

	let filters: Filter[] = $state([]);

	let downloadName = $state('schedule.json');
	let workshopsList: any[] = $state(getDefaultNames());

	let workshopsAList: Workshop[] = $state([]);
	let workshopsBList: Workshop[] = $state([]);
	let localStorageData: WorkshopData[] = $state([]);
	let dataList: any = $state();

	let customList = $state(false);

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
		let workshopNames = getDefaultNames();
		if (workshopListSelected) workshopNames = csvJSON(String(fileReader2.result));
		workshopsList = workshopNames;
		const doubleBlockSnapshot = $state.snapshot(doubleBlock);
		let [scheduled, aWorkshops, bWorkshops] = schedule(
			csvJSON(String(fileReader.result)),
			$state.snapshot(maximum),
			$state.snapshot(numChoices),
			$state.snapshot(numWorkshopsA),
			$state.snapshot(numWorkshopsB),
			$state.snapshot(blocks),
			$state.snapshot(numA),
			$state.snapshot(blocks - numA),
			doubleBlockSnapshot.includes(' ') ? doubleBlockSnapshot.split(' ') : [doubleBlockSnapshot],
			$state.snapshot(filters),
			workshopNames ?? []
		);
		if (scheduled[0] === 'error') {
			status = 'error';
			console.error(scheduled[1]);
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
				workshopsAList.push({
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
				workshopsBList.push({
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
			const blob = new Blob([jsonCSV(data, getFields())], { type: 'text/csv' });
			url = URL.createObjectURL(blob);
			downloadName = 'schedule.csv';
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
	function changeList() {
		status = 'scheduling';
		try {
			const nameParts = listFiles[0].name.split('.');
			const name = nameParts[0] + '.' + nameParts[1];
			let fileReader = new FileReader();
			fileReader.onload = () => {
				dataList = toJSONList(String(fileReader.result), name);
				const blob = new Blob([fileReader.result ?? ''], { type: 'test/csv' });
				urlList = URL.createObjectURL(blob);
				downloadNameList = `${name}.csv`;
				customList = true;
				status = 'list';
			};
			fileReader.readAsText(listFiles[0]);
		} catch (error) {
			console.error(error);
			status = 'error';
		}
	}
	function getFields() {
		let toReturn = ['ParticipantID'];
		for (let i = 0; i < blocks; i++) {
			toReturn.push(`Block${i + 1}`);
		}
		return toReturn;
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
	function getCSVList(dataRaw: any) {
		let data;
		if (typeof dataRaw === 'string') data = JSON.parse(dataRaw);
		else data = dataRaw;
		let toReturn = [];
		for (let i = 1; i <= blocks; i++) {
			const block = data.data[`Block${i}`];
			for (let j = 0; j < block.length; j++) {
				toReturn.push({
					Block: i,
					ParticipantID: block[j]
				});
			}
		}
		return jsonCSV(toReturn, ['Block', 'ParticipantID']);
	}
	function toJSONList(data: string, name: string) {
		let toReturn: any = {};
		let json = csvJSON(data);
		for (let i = 0; i < json.length; i++) {
			if (toReturn[`Block${json[i].Block}`] === undefined) {
				toReturn[`Block${json[i].Block}`] = [];
			}
			toReturn[`Block${json[i].Block}`].push(json[i].ParticipantID);
		}
		return { name, data: toReturn };
	}
	function list(num: number, name: string) {
		customList = false;
		dataList = localStorageData[num];
		const blob = new Blob([getCSVList(dataList)], { type: 'test/csv' });
		urlList = URL.createObjectURL(blob);
		downloadNameList = `${name}.csv`;
		status = 'list';
	}
	function back() {
		fileInput.value = null;
		listFileInput.value = null;
		status = 'waiting';
	}
	function backList() {
		if (customList) back();
		else status = 'finished';
	}
</script>

<input type="file" accept=".csv" bind:files onchange={change} hidden bind:this={fileInput} />
<input
	type="file"
	accept=".csv"
	bind:files={listFiles}
	onchange={changeList}
	hidden
	bind:this={listFileInput}
/>
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
<a hidden href={inputUrl} download="input.csv" bind:this={inputFileLink}>Hidden</a>
<a hidden href={namesUrl} download="names.csv" bind:this={namesFileLink}>Hidden</a>
<a hidden href={listUrl} download="list.csv" bind:this={listFileLink}>Hidden</a>

{#if status === 'scheduling'}
	<p>Please Wait...</p>
{:else if status === 'finished'}
	<button onclick={() => fileLink.click()}>Download Schedule</button><br /><br />
	{#each workshopsAList as workshop}
		<button onclick={() => list(workshop.num, workshop.name)}>Workshop {workshop.name} List</button>
	{/each}<br /><br />
	{#each workshopsBList as workshop}
		<button onclick={() => list(workshop.num, workshop.name)}>Workshop {workshop.name} List</button>
	{/each}<br /><br />
	<button onclick={back}>Back</button>
{:else if status === 'error'}
	<p>There was an error.</p>
{:else if status === 'list'}
	<div class="main">
		<h2>Workshop {getWorkshopName(workshopsList, numWorkshopsA, dataList.name)}</h2>

		<div class="grid" style="grid-template-columns: {getBlocks()};">
			{#each getLoopNums() as num}
				<div>
					<h2>Block {num}</h2>
					{#each dataList.data[`Block${num}`] as student}
						{#if student !== ''}
							<input type="checkbox" /> {student}<br />
						{/if}
					{/each}
				</div>
			{/each}
		</div>
		<br />
		<button onclick={backList}>Back</button>
		<button onclick={() => fileLinkList.click()}>Download List</button>
	</div>
{:else}
	<button onclick={() => fileInput.click()}>Input Spreadsheet</button><button
		onclick={() => inputFileLink.click()}>Download Example</button
	><br /><br />
	<button onclick={() => workshopFileInput.click()}>List of Workshops</button>
	{#if workshopListSelected}{workshopFiles[0].name}{/if}<button
		onclick={() => namesFileLink.click()}>Download Example</button
	><br /><br />
	<button onclick={() => listFileInput.click()}>Custom List</button><button
		onclick={() => listFileLink.click()}>Download Example</button
	><br /><br />
	<label>
		Maximum number of students per workshop: <input type="number" bind:value={maximum} /></label
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
	<label>Double blocks (separated by space): <input type="text" bind:value={doubleBlock} /></label
	><br />
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
	:root {
		--font: system-ui;
		font-family: var(--font);
	}
	.main {
		text-align: center;
	}
	.grid {
		display: grid;
	}
	button {
		background-color: gainsboro;
		color: black;
		border: none;
		border-radius: 1.5vh;
		font-family: system-ui;
		padding: 1.5vh 1vw;
		font-size: 0.9em;
		cursor: pointer;
		margin: 0.25vh 0.5vw;
		font-family: var(--font);
		text-decoration: none;
	}
	input {
		width: fit-content;
		text-decoration: none;
		color: black;
		border: 1px solid lightgray;
		border-radius: 1.5vh;
		font-family: var(--font);
		padding: 1.5vh 1vw;
		font-size: 0.9em;
		margin: 0.25vh 0.5vw;
		cursor: text;
	}
	input[type='checkbox'] {
		cursor: pointer;
	}
	button:hover {
		background-color: lightgray;
	}
</style>
