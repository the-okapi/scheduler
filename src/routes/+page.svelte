<script lang="ts">
	import { csvJSON } from '$lib';

	let files: any = $state();
	let text = $state('');
	let fileInput: any = $state();
    let scheduling = $state(false);

	async function change() {
        scheduling = true;
		let file = files[0];
		let fileReader = new FileReader();
		fileReader.onload = () => {
			text = JSON.stringify(csvJSON(String(fileReader.result)));
		};
		fileReader.readAsText(file);
	}
	function onclick() {
		fileInput.click();
	}
</script>

<input type="file" accept=".csv" bind:files onchange={change} hidden bind:this={fileInput} />

{#if scheduling}
    <p>Please Wait...</p>
{:else}
    <button {onclick}>File Input</button>
{/if}
