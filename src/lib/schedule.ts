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
			ParticipantID: person.ParticipantID
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
				for (let k = 0; k < enrolledA[i].length; i++) {
					if (enrolledA[i][k].length > minimum) {
						while (enrolledA[i][j].length < minimum && enrolledA[i][k].length > minimum) {
							let student = enrolledA[i][k].pop();
							enrolledA[i][j].push(student);
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
				for (let k = 0; k < enrolledB[i].length; i++) {
					if (enrolledB[i][k].length > minimum) {
						while (enrolledB[i][j].length < minimum && enrolledB[i][k].length > minimum) {
							let student = enrolledB[i][k].pop();
							enrolledB[i][j].push(student);
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
	return schedule;
}
