export type Filter = {
	workshop: string;
	block: number;
};

export function csvJSON(csv: any) {
	const lines = csv.split('\n');

	const result = [];
	const headers = lines[0].trim().split(',');

	for (let i = 1; i < lines.length; i++) {
		const obj: any = {};
		const currentline = lines[i].trim().split(',');

		for (let j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentline[j];
		}

		result.push(obj);
	}
	return result;
}

export function jsonCSV(json: any, fields: string[]) {
	let toReturn = fields[0];
	for (let i = 1; i < fields.length; i++) {
		toReturn += ',' + fields[i];
	}
	toReturn += '\n';
	for (let i = 0; i < json.length; i++) {
		let toAdd = json[i][fields[0]];
		for (let j = 1; j < fields.length; j++) {
			toAdd += ',' + json[i][fields[j]];
		}
		toReturn += toAdd + '\n';
	}
	return toReturn;
}

export function getBlock(block: number) {
	return 'Block' + (block + 1);
}
