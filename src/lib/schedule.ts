import {
	getBlock,
	type WorkshopName,
	type Filter,
	getWorkshopName,
	parseCode,
	studentIsIn,
	getFirstAvailable,
	getFirstAvailableDoubleBlock
} from '$lib';

export function schedule(
	students: any[],
	maximum: number,
	numChoices: number,
	numWorkshopsA: number,
	numWorkshopsB: number,
	blocks: number,
	numA: number,
	numB: number,
	doubleBlocks: string[],
	filters: Filter[],
	workshops: WorkshopName[]
) {
	let schedule: any[] = [];
	const enrolledA: string[][][] = [];
	for (let i = 0; i < blocks; i++) {
		enrolledA.push([]);
	}
	for (let i = 0; i < numWorkshopsA; i++) {
		for (let j = 0; j < enrolledA.length; j++) {
			enrolledA[j].push([]);
		}
	}
	const enrolledB: string[][][] = [];
	for (let i = 0; i < blocks; i++) {
		enrolledB.push([]);
	}
	for (let i = 0; i < numWorkshopsB; i++) {
		for (let j = 0; j < enrolledB.length; j++) {
			enrolledB[j].push([]);
		}
	}
	for (let i = 0; i < filters.length; i++) {
		const filter = filters[i];
		const [workshopGroup, wNum] = filter.workshop.split('.');
		const workshopNum = Number(wNum) - 1;
		for (let j = 0; j < maximum; j++) {
			if (workshopGroup === 'A') {
				enrolledA[filter.block - 1][workshopNum].push('');
			} else {
				enrolledB[filter.block - 1][workshopNum].push('');
			}
		}
	}
	try {
		for (let h = 0; h < students.length; h++) {
			const person = students[h];
			if (person.Choice1 === undefined) {
				continue;
			}
			const choices = [];
			for (let i = 0; i < numChoices; i++) {
				choices.push(person[`Choice${i + 1}`]);
			}
			const student: any = {
				ParticipantID: person.ParticipantID
			};
			for (let i = 0; i < blocks; i++) {
				student[getBlock(i)] = '';
			}
			let studentA = 0;
			let studentB = 0;
			choicesWhile: for (let j = 0; j < choices.length; j++) {
				const choice = parseCode(choices[j]);
				const [workshopGroup, wNum] = choice.split('.');
				const workshopNum = Number(wNum) - 1;
				if (workshopGroup === 'A' && studentA < numA) {
					const block = getFirstAvailable(student, blocks);
					if (
						enrolledA[block][workshopNum].length < maximum &&
						!filters.includes({ workshop: choice, block })
					) {
						if (!doubleBlocks.includes(choice)) {
							enrolledA[block][workshopNum].push(student.ParticipantID);
							student[getBlock(block)] = getWorkshopName(workshops, numWorkshopsA, choice);
							studentA++;
							choices.splice(j, 1);
						} else {
							const workshopName = getWorkshopName(workshops, numWorkshopsA, choice);
							const firstDoubleBlock = getFirstAvailableDoubleBlock(student, blocks) ?? -1;
							if (firstDoubleBlock === -1) {
								j++;
								continue choicesWhile;
							}
							student[`Block${firstDoubleBlock}`] = workshopName;
							student[`Block${firstDoubleBlock + 1}`] = workshopName;
							studentA += 2;
							enrolledA[firstDoubleBlock][workshopNum].push(student.ParticipantID);
							enrolledA[firstDoubleBlock + 1][workshopNum].push(student.ParticipantID);
							choices.splice(j, 1);
						}
					} else {
						j++;
					}
				}
				if (workshopGroup === 'B' && studentB < numB) {
					const block = getFirstAvailable(student, blocks);
					if (
						enrolledB[block][workshopNum].length < maximum &&
						!filters.includes({ workshop: choice, block: block + 1 })
					) {
						if (!doubleBlocks.includes(choice)) {
							enrolledB[block][workshopNum].push(student.ParticipantID);
							student[getBlock(block)] = getWorkshopName(workshops, numWorkshopsA, choice);
							studentB++;
							choices.splice(j, 1);
						} else {
							const workshopName = getWorkshopName(workshops, numWorkshopsA, choice);
							const firstDoubleBlock = getFirstAvailableDoubleBlock(student, blocks) ?? -1;
							if (firstDoubleBlock === -1) {
								j++;
								continue choicesWhile;
							}
							student[`Block${firstDoubleBlock}`] = workshopName;
							student[`Block${firstDoubleBlock + 1}`] = workshopName;
							studentB += 2;
							enrolledB[block][workshopNum].push(student.ParticipantID);
							enrolledB[block + 1][workshopNum].push(student.ParticipantID);
							choices.splice(j, 1);
						}
					} else {
						j++;
					}
				}
			}
			for (let i = 0; i < blocks; i++) {
				if (studentA === numA) {
					break;
				}
				const block = getBlock(i);
				if (student[block] !== '') {
					continue;
				}
				for (let j = 0; j < numWorkshopsA; j++) {
					if (
						enrolledA[i][j].length < maximum &&
						!filters.includes({ workshop: `A.${j + 1}`, block: i + 1 }) &&
						!doubleBlocks.includes(`A.${j + 1}`) &&
						!studentIsIn(student, blocks, `A.${j + 1}`)
					) {
						enrolledA[i][j].push(student.ParticipantID);
						student[block] = `A.${j + 1}`;
						studentA++;
						break;
					}
				}
			}
			for (let i = 0; i < blocks; i++) {
				if (studentB === numB) {
					break;
				}
				const block = getBlock(i);
				if (student[block] !== '') {
					continue;
				}
				for (let j = 0; j < numWorkshopsB; j++) {
					if (
						enrolledB[i][j].length < maximum &&
						!filters.includes({ workshop: `B.${j + 1}`, block: i + 1 }) &&
						!doubleBlocks.includes(`B.${j + 1}`) &&
						!studentIsIn(student, blocks, `B.${j + 1}`)
					) {
						enrolledB[i][j].push(student.ParticipantID);
						student[block] = `B.${j + 1}`;
						studentB++;
						break;
					}
				}
			}
			schedule.push(student);
		}
	} catch (error: any) {
		schedule = ['error', error];
	}
	return [schedule, enrolledA, enrolledB];
}
