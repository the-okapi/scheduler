import { getBlock } from '$lib';

export function schedule(
	students: any[],
	maximum: number,
	minimum: number,
	numChoices: number,
	numWorkshopsA: number,
	numWorkshopsB: number,
	blocks: number,
	numA: number,
	numB: number,
	doubleBlock: string
) {
	let schedule: any[] = [];
	try {
		let enrolledA: string[][][] = [];
		for (let i = 0; i < blocks; i++) {
			enrolledA.push([]);
		}
		for (let i = 0; i < numWorkshopsA; i++) {
			for (let j = 0; j < enrolledA.length; j++) {
				enrolledA[j].push([]);
			}
		}
		let enrolledB: string[][][] = [];
		for (let i = 0; i < blocks; i++) {
			enrolledB.push([]);
		}
		for (let i = 0; i < numWorkshopsB; i++) {
			for (let j = 0; j < enrolledB.length; j++) {
				enrolledB[j].push([]);
			}
		}
		for (let h = 0; h < students.length; h++) {
			const person = students[h];
			if (person.Choice1 === undefined) {
				continue;
			}
			let choices = [];
			for (let i = 0; i < numChoices; i++) {
				choices.push(person[`Choice${i + 1}`]);
			}
			let student: any = {
				ParticipantID: person.ParticipantID
			};
			for (let i = 0; i < blocks; i++) {
				student[getBlock(i)] = '';
			}
			let studentA = 0;
			let studentB = 0;
			for (let i = 0; i < choices.length; i++) {
				let choice = choices[i];
				let [workshopGroup, wNum] = choice.split('.');
				let workshopNum = Number(wNum) - 1;
				if (workshopGroup === 'A' && studentA < numA) {
					let block = studentA + studentB;
					if (enrolledA[block][workshopNum].length < maximum) {
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
									let oldWorkshop = student[getBlock(block - 1)];
									let [oldWorkshopGroup, oldWorkshopNum] = oldWorkshop.split('.');
									student[getBlock(block + 2)] = oldWorkshop;
									if (oldWorkshopGroup === 'A') {
										let oldWorkshopIndex = enrolledA[block - 1][oldWorkshopNum].findIndex(
											(a) => a === student.ParticipantID
										);
										enrolledA[block - 1][oldWorkshopNum].splice(oldWorkshopIndex, 1);
										enrolledA[block + 2][oldWorkshopNum].push(student.ParticipantID);
									} else {
										let oldWorkshopIndex = enrolledB[block - 1][oldWorkshopNum].findIndex(
											(a) => a === student.ParticipantID
										);
										enrolledB[block - 1][oldWorkshopNum].splice(oldWorkshopIndex, 1);
										enrolledB[block + 2][oldWorkshopNum].push(student.ParticipantID);
									}
									enrolledA[block][workshopNum].push(student.ParticipantID);
									enrolledA[block + 1][workshopNum].push(student.ParticipantID);
									student[getBlock(block)] = choice;
									student[getBlock(block + 1)] = choice;
									studentA += 2;
								}
							}
						}
					} else {
						continue;
					}
				}
				if (workshopGroup === 'B' && studentB < numB) {
					let block = studentA + studentB;
					console.log(enrolledA[block], workshopNum);
					if (enrolledB[block][workshopNum].length < maximum) {
						if (choice !== doubleBlock) {
							enrolledB[block][workshopNum].push(student.ParticipantID);
							student[getBlock(studentA + studentB)] = choice;
							studentB++;
						} else {
							if (studentB <= numB - 2) {
								if (studentA + (studentB % 2) === 1) {
									let oldWorkshop = student[getBlock(block - 1)];
									let [oldWorkshopGroup, oldWorkshopNum] = oldWorkshop.split('.');
									student[getBlock(block + 2)] = oldWorkshop;
									if (oldWorkshopGroup === 'A') {
										let oldWorkshopIndex = enrolledA[block - 1][oldWorkshopNum].findIndex(
											(a) => a === student.ParticipantID
										);
										enrolledA[block - 1][oldWorkshopNum].splice(oldWorkshopIndex, 1);
										enrolledA[block + 2][oldWorkshopNum].push(student.ParticipantID);
									} else {
										let oldWorkshopIndex = enrolledB[block - 1][oldWorkshopNum].findIndex(
											(a) => a === student.ParticipantID
										);
										enrolledB[block - 1][oldWorkshopNum].splice(oldWorkshopIndex, 1);
										enrolledB[block + 2][oldWorkshopNum].push(student.ParticipantID);
									}
								}
								enrolledB[block][workshopNum].push(student.ParticipantID);
								enrolledB[block + 1][workshopNum].push(student.ParticipantID);
								student[getBlock(block)] = choice;
								student[getBlock(block + 1)] = choice;
								studentB += 2;
							}
						}
					}
				}
			}
			let i = 0;
			if (studentA < numA) {
				while (studentA < numA) {
					let block = getBlock(i);
					if (student[block] === '') {
						for (let j = 0; j < enrolledA.length; j++) {
							if (enrolledA[i][j].length < maximum) {
								enrolledA[i][j].push(student.ParticipantID);
								student[block] = `A${j + 1}`;
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
					let block = getBlock(i);
					if (student[block] === '') {
						for (let j = 0; j < enrolledB.length; j++) {
							if (enrolledB[i][j].length < maximum) {
								enrolledB[i][j].push(student.ParticipantID);
								student[block] = `B${j + 1}`;
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
		for (let i = 0; i < enrolledA.length; i++) {
			for (let j = 0; j < enrolledA[i].length; j++) {
				if (enrolledA[i][j].length < minimum) {
					for (let k = 0; k < enrolledA[i].length; k++) {
						if (enrolledA[i][k].length > minimum) {
							while (enrolledA[i][j].length < minimum && enrolledA[i][k].length > minimum) {
								let student = enrolledA[i][k].pop();
								enrolledA[i][j].push(student ?? '0');
								students[students.findIndex((a) => a.ParticipantID === student)][getBlock(i)] =
									`A${j + 1}`;
							}
							if (enrolledA[i][j].length >= minimum) {
								break;
							}
						}
					}
				}
			}
		}
		for (let i = 0; i < enrolledB.length; i++) {
			for (let j = 0; j < enrolledB[i].length; j++) {
				if (enrolledB[i][j].length < minimum) {
					for (let k = 0; k < enrolledB[i].length; k++) {
						if (enrolledB[i][k].length > minimum) {
							while (enrolledB[i][j].length < minimum && enrolledB[i][k].length > minimum) {
								let student = enrolledB[i][k].pop();
								enrolledB[i][j].push(student ?? '0');
								students[students.findIndex((b) => b.ParticipantID === student)][getBlock(i)] =
									`B${j + 1}`;
							}
							if (enrolledB[i][j].length >= minimum) {
								break;
							}
						}
					}
				}
			}
		}
	} catch (_) {
		schedule = ['error'];
	}
	return schedule;
}
