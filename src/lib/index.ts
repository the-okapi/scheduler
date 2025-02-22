export function csvJSON(csv: any) {
	let lines = csv.split('\n');

	let result = [];
	let headers = lines[0].trim().split(',');

	for (let i = 1; i < lines.length; i++) {
		let obj: any = {};
		let currentline = lines[i].trim().split(',');

		for (let j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentline[j];
		}

		result.push(obj);
	}
	return result;
}
