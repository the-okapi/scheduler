import {
	getBlock,
	type WorkshopName,
	type Filter,
	getWorkshopName,
	parseCode,
	studentIsIn,
	getFirstAvailable,
	getFirstAvailableDoubleBlock,
	type Maximum,
	getMaximum,
	getNumAB
} from '$lib';

export function schedule(
	students: any[],
	aMaximum: number,
	bMaximum: number,
	maximums: Maximum[],
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
	const studentsWithBlocks = students;
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
		const maximum = getMaximum(filter.workshop, aMaximum, bMaximum, maximums);
		if (workshopGroup === 'A') {
			for (let j = 0; j < maximum; j++) {
				enrolledA[filter.block - 1][workshopNum].push('');
			}
		} else {
			for (let j = 0; j < maximum; j++) {
				enrolledB[filter.block - 1][workshopNum].push('');
			}
		}
	}
	try {
		for (let choiceNum = 1; choiceNum <= numChoices; choiceNum++) {
			choicesWhile: for (let h = 0; h < students.length; h++) {
				const person = studentsWithBlocks[h];
				if (person.Choice1 === undefined) {
					continue;
				}
				let [studentA, studentB] = getNumAB(person, blocks);
				if (person.Choice1 !== 'A.0') {
					const choice = parseCode(person[`Choice${choiceNum}`]);
					const maximum = getMaximum(choice, aMaximum, bMaximum, maximums);
					const [workshopGroup, wNum] = choice.split('.');
					const workshopNum = Number(wNum) - 1;
					if (workshopGroup === 'A' && studentA < numA) {
						const block = getFirstAvailable(person, blocks, choice, enrolledA, maximum);
						const firstDoubleBlock =
							getFirstAvailableDoubleBlock(person, blocks, enrolledA, maximum, choice) ?? -1;
						if (
							block !== -1 &&
							person[getBlock(block)] === '' &&
							enrolledA[block][workshopNum].length < maximum &&
							!filters.includes({ workshop: choice, block: block + 1 }) &&
							!doubleBlocks.includes(choice)
						) {
							enrolledA[block][workshopNum].push(person.Name);
							person[getBlock(block)] = getWorkshopName(workshops, numWorkshopsA, choice);
							studentA++;
						} else if (doubleBlocks.includes(choice) && studentA <= numA - 2) {
							if (
								firstDoubleBlock !== -1 &&
								enrolledA[firstDoubleBlock][workshopNum].length < maximum &&
								enrolledA[firstDoubleBlock + 1][workshopNum].length < maximum &&
								!filters.includes({ workshop: choice, block: firstDoubleBlock + 1 }) &&
								!filters.includes({ workshop: choice, block: firstDoubleBlock + 2 })
							) {
								const workshopName = getWorkshopName(workshops, numWorkshopsA, choice);
								person[`Block${firstDoubleBlock + 1}`] = workshopName;
								person[`Block${firstDoubleBlock + 2}`] = workshopName;
								studentA += 2;
								enrolledA[firstDoubleBlock][workshopNum].push(person.Name);
								enrolledA[firstDoubleBlock + 1][workshopNum].push(person.Name);
							} else if (firstDoubleBlock === -1) {
								continue choicesWhile;
							}
						}
					}
					if (workshopGroup === 'B' && studentB < numB) {
						const block = getFirstAvailable(person, blocks, choice, enrolledB, maximum);
						const firstDoubleBlock =
							getFirstAvailableDoubleBlock(person, blocks, enrolledB, maximum, choice) ?? -1;
						if (
							block !== -1 &&
							person[getBlock(block)] === '' &&
							enrolledB[block][workshopNum].length < maximum &&
							!filters.includes({ workshop: choice, block: block + 1 }) &&
							!doubleBlocks.includes(choice)
						) {
							enrolledB[block][workshopNum].push(person.Name);
							person[getBlock(block)] = getWorkshopName(workshops, numWorkshopsA, choice);
							studentB++;
						} else if (doubleBlocks.includes(choice) && studentB <= numB - 2) {
							if (
								firstDoubleBlock !== -1 &&
								enrolledB[firstDoubleBlock][workshopNum].length < maximum &&
								enrolledB[firstDoubleBlock + 1][workshopNum].length < maximum &&
								!filters.includes({ workshop: choice, block: firstDoubleBlock + 1 }) &&
								!filters.includes({ workshop: choice, block: firstDoubleBlock + 2 })
							) {
								const workshopName = getWorkshopName(workshops, numWorkshopsA, choice);
								person[`Block${firstDoubleBlock}`] = workshopName;
								person[`Block${firstDoubleBlock + 1}`] = workshopName;
								studentB += 2;
								enrolledB[firstDoubleBlock][workshopNum].push(person.Name);
								enrolledB[firstDoubleBlock + 1][workshopNum].push(person.Name);
							} else if (firstDoubleBlock === -1) {
								continue choicesWhile;
							}
						}
					}
				}
			}
		}
		for (let i = 0; i < studentsWithBlocks.length; i++) {
			const student: any = {};
			for (let j = 0; j < blocks; j++) {
				student[getBlock(j)] = studentsWithBlocks[i][getBlock(j)];
			}
			student.ParticipantID = studentsWithBlocks[i].ParticipantID;
			student.Name = studentsWithBlocks[i].Name;
			let [studentA, studentB] = getNumAB(student, blocks);
			for (let i = 0; i < blocks; i++) {
				if (studentA === numA) {
					break;
				}
				const block = getBlock(i);
				if (student[block] !== '') {
					continue;
				}
				for (let j = 0; j < numWorkshopsA; j++) {
					const workshopCode = `A.${j + 1}`;
					const maximum = getMaximum(workshopCode, aMaximum, bMaximum, maximums);
					if (
						enrolledA[i][j].length < maximum &&
						!filters.includes({ workshop: workshopCode, block: i + 1 }) &&
						!doubleBlocks.includes(workshopCode) &&
						!studentIsIn(student, blocks, workshopCode)
					) {
						const workshopName = getWorkshopName(workshops, numWorkshopsA, workshopCode);
						enrolledA[i][j].push(student.Name);
						student[block] = workshopName;
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
					const workshopCode = `B.${j + 1}`;
					const maximum = getMaximum(workshopCode, aMaximum, bMaximum, maximums);
					if (
						enrolledB[i][j].length < maximum &&
						!filters.includes({ workshop: workshopCode, block: i + 1 }) &&
						!doubleBlocks.includes(workshopCode) &&
						!studentIsIn(student, blocks, workshopCode)
					) {
						const workshopName = getWorkshopName(workshops, numWorkshopsA, workshopCode);
						enrolledB[i][j].push(student.Name);
						student[block] = workshopName;
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
