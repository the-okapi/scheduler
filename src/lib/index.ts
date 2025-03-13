export type Filter = {
	workshop: string;
	block: number;
};

export type WorkshopName = {
	Code: string;
	Name: string;
};

export function csvJSON(csv: string) {
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

export function getWorkshopName(workshops: WorkshopName[], numA: number, code: string) {
	const [group, n] = code.split('.');
	const num = Number(n);
	if (group === 'A') {
		return workshops[num - 1].Name;
	} else {
		return workshops[numA + num - 1].Name;
	}
}

export function parseCode(code: string) {
	if (code[2] === '0') {
		const split = code.split('');
		split.splice(2, 1);
		return split.join('');
	} else {
		return code;
	}
}

export function studentIsIn(student: any, blocks: number, code: string) {
	for (let i = 1; i <= blocks; i++) {
		if (student[`Block${i}`] === code) {
			return true;
		}
	}
	return false;
}

export function getFirstAvailable(
	student: any,
	blocks: number,
	choice: string,
	enrolled: string[][][],
	maximum: number
) {
	const split = choice.split('.');
	const workshopNum = Number(split[1]) - 1;
	for (let i = blocks - 1; i >= 0; i--) {
		if (student[`Block${i + 1}`] === '' && enrolled[i][workshopNum].length < maximum) {
			return i;
		}
	}
	return 0;
}

export function getFirstAvailableDoubleBlock(
	student: any,
	blocks: number,
	enrolled: string[][][],
	maximum: number,
	choice: string
) {
	const split = choice.split('.');
	const workshopNum = Number(split[1]) - 1;
	for (let i = 0; i < blocks; i++) {
		if (i % 2 === 1 || i + 1 === blocks) {
			continue;
		}
		if (
			student[`Block${i + 1}`] === '' &&
			student[`Block${i + 2}`] === '' &&
			enrolled[i][workshopNum].length < maximum
		) {
			return i;
		}
		return -1;
	}
}
