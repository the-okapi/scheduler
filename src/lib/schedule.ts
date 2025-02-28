import { getBlock } from '$lib';
import { type Filter } from '$lib';

export function schedule(
	students: any[],
	maximum: number,
	numChoices: number,
	numWorkshopsA: number,
	numWorkshopsB: number,
	blocks: number,
	numA: number,
	numB: number,
	doubleBlock: string,
	filters: Filter[]
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
		console.log(filters[i]);
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
			for (let i = 0; i < choices.length; i++) {
				const choice = choices[i];
				const choiceSplit = choice.split('.');
				const workshopGroup = choiceSplit[0];
				const wNum = choiceSplit[1];
				const workshopNum = Number(wNum) - 1;
				if (workshopGroup === 'A' && studentA < numA) {
					const block = studentA + studentB;
					if (
						enrolledA[block][workshopNum].length < maximum &&
						!filters.includes({ workshop: choice, block: block + 1 })
					) {
						if (choice !== doubleBlock) {
							enrolledA[block][workshopNum].push(student.ParticipantID);
							student[getBlock(block)] = choice;
							studentA++;
						} else {
							if (studentA <= numA - 2) {
								if (studentA + (studentB % 2) === 0) {
									enrolledA[block][workshopNum].push(student.ParticipantID);
									enrolledA[block + 1][workshopNum].push(student.ParticipantID);
									student[getBlock(block)] = choice;
									student[getBlock(block + 1)] = choice;
									studentA += 2;
								} else {
									const oldWorkshop = student[getBlock(block - 1)];
									const [oldWorkshopGroup, oldWNum] = oldWorkshop.split('.');
									const oldWorkshopNum = Number(oldWNum) - 1;
									student[getBlock(block + 1)] = oldWorkshop;
									if (oldWorkshopGroup === 'A') {
										const oldWorkshopIndex = enrolledA[block - 1][oldWorkshopNum].findIndex(
											(a) => a === student.ParticipantID
										);
										enrolledA[block - 1][oldWorkshopNum].splice(oldWorkshopIndex, 1);
										enrolledA[block + 1][oldWorkshopNum].push(student.ParticipantID);
									} else {
										const oldWorkshopIndex = enrolledB[block - 1][oldWorkshopNum].findIndex(
											(a) => a === student.ParticipantID
										);
										enrolledB[block - 1][oldWorkshopNum].splice(oldWorkshopIndex, 1);
										enrolledB[block + 1][oldWorkshopNum].push(student.ParticipantID);
									}
									enrolledA[block][workshopNum].push(student.ParticipantID);
									enrolledA[block - 1][workshopNum].push(student.ParticipantID);
									student[getBlock(block)] = choice;
									student[getBlock(block - 1)] = choice;
									studentA += 2;
								}
							}
						}
					} else {
						continue;
					}
				}
				if (workshopGroup === 'B' && studentB < numB) {
					const block = studentA + studentB;
					if (
						enrolledB[block][workshopNum].length < maximum &&
						!filters.includes({ workshop: choice, block: block + 1 })
					) {
						if (choice !== doubleBlock) {
							enrolledB[block][workshopNum].push(student.ParticipantID);
							student[getBlock(studentA + studentB)] = choice;
							studentB++;
						} else {
							if (studentB <= numB - 2) {
								if (studentA + (studentB % 2) === 1) {
									const oldWorkshop = student[getBlock(block - 1)];
									const [oldWorkshopGroup, oldWNum] = oldWorkshop.split('.');
									const oldWorkshopNum = Number(oldWNum) - 1;
									student[getBlock(block + 2)] = oldWorkshop;
									if (oldWorkshopGroup === 'A') {
										const oldWorkshopIndex = enrolledA[block - 1][oldWorkshopNum].findIndex(
											(a) => a === student.ParticipantID
										);
										enrolledA[block - 1][oldWorkshopNum].splice(oldWorkshopIndex, 1);
										enrolledA[block + 1][oldWorkshopNum].push(student.ParticipantID);
									} else {
										const oldWorkshopIndex = enrolledB[block - 1][oldWorkshopNum].findIndex(
											(a) => a === student.ParticipantID
										);
										enrolledB[block - 1][oldWorkshopNum].splice(oldWorkshopIndex, 1);
										enrolledB[block + 1][oldWorkshopNum].push(student.ParticipantID);
									}
								}
								enrolledB[block][workshopNum].push(student.ParticipantID);
								enrolledB[block - 1][workshopNum].push(student.ParticipantID);
								student[getBlock(block)] = choice;
								student[getBlock(block - 1)] = choice;
								studentB += 2;
							}
						}
					}
				}
			}
			let i = 0;
			if (studentA < numA) {
				while (studentA < numA) {
					const block = getBlock(i);
					if (student[block] === '') {
						for (let j = 0; j < enrolledA.length; j++) {
							if (
								enrolledA[i][j].length < maximum &&
								!filters.includes({ workshop: `A.${j + 1}`, block: i + 1 })
							) {
								enrolledA[i][j].push(student.ParticipantID);
								student[block] = `A.${j + 1}`;
								studentA++;
								break;
							}
						}
					}
					if (i > blocks) {
						break;
					}
					i++;
				}
			}
			i = 0;
			if (studentB < numB) {
				while (studentB < numB) {
					const block = getBlock(i);
					if (student[block] === '') {
						for (let j = 0; j < enrolledB.length; j++) {
							if (
								enrolledB[i][j].length < maximum &&
								!filters.includes({ workshop: `A.${j + 1}`, block: i + 1 })
							) {
								enrolledB[i][j].push(student.ParticipantID);
								student[block] = `B.${j + 1}`;
								studentB++;
								break;
							}
						}
					}
					if (i > blocks) {
						break;
					}
					i++;
				}
			}
			schedule.push(student);
		}
	} catch {
		schedule = ['error'];
	}
	return [schedule, enrolledA, enrolledB];
}
