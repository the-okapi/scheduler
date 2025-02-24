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
	numB: number
) {
	let schedule: any[] = [];
	let enrolledA: any[] = [];
	for (let i = 0; i < blocks; i++) {
		enrolledA.push([]);
	}
	for (let i = 0; i < numWorkshopsA; i++) {
		for (let j = 0; j < enrolledA.length; j++) {
			enrolledA[j].push([]);
		}
	}
	let enrolledB: any[] = [];
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
		let choices = [];
		for (let i = 0; i < numChoices; i++) {
			choices.push(person[`Choice${i + 1}`]);
		}
		let student: any = {
			ParticipantID: h + 1
		};
		for (let i = 0; i < blocks; i++) {
			student[getBlock(i)] = '';
		}
		let studentA = 0;
		let studentB = 0;
		for (let i = 0; i < choices.length; i++) {
			let choice = choices[i];
			let [workshopGroup, wNum] = choice.split('');
			let workshopNum = Number(wNum);
			if (workshopGroup === 'A' && studentA < numA) {
				let block = studentA + studentB;
				if (enrolledA[block][workshopNum].length < maximum) {
					enrolledA[block][workshopNum].push(student.ParticipantID);
					student[getBlock(block)] = choice;
					studentA++;
				} else {
					continue;
				}
			}
			if (workshopGroup === 'B' && studentB < numB) {
				let block = studentA + studentB;
				if (enrolledB[block][workshopNum].length < maximum) {
					enrolledB[block][workshopNum].push(student.ParticipantID);
					student[getBlock(studentA + studentB)] = choice;
					studentB++;
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
							student[block] = 'A' + j;
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
							student[block] = 'B' + j;
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
	return schedule;
}
