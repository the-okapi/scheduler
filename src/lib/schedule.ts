import { getBlock } from '$lib';

export function schedule(students: any[]) {
	//, workshops: any) {
	let schedule: any[] = [];
	let enrolledA: number[][] = [[], [], [], []]; //workshops.a.length);
	for (let i = 0; i < 15; i++) {
		enrolledA[0].push(0);
		enrolledA[1].push(0);
		enrolledA[2].push(0);
		enrolledA[3].push(0);
	}
	let enrolledB: number[][] = [[], [], [], []]; //workshops.b.length);
	for (let i = 0; i < 17; i++) {
		enrolledB[0].push(0);
		enrolledB[1].push(0);
		enrolledB[2].push(0);
		enrolledB[3].push(0);
	}
	for (let h = 0; h < students.length; h++) {
		const person = students[h];
		const choices = [
			person.Choice1,
			person.Choice2,
			person.Choice3,
			person.Choice4,
			person.Choice5,
			person.Choice6,
			person.Choice7
		];
		let student: any = {
			ParticipantID: h + 1,
			Block1: '',
			Block2: '',
			Block3: '',
			Block4: ''
		};
		let studentA = 0;
		let studentB = 0;
		for (let i = 0; i < choices.length; i++) {
			let choice = choices[i];
			let [workshopGroup, wNum] = choice.split('');
			let workshopNum = Number(wNum);
			if (workshopGroup === 'A' && studentA < 2) {
				let block = studentA + studentB;
				if (enrolledA[block][workshopNum] < 25) {
					//workshops.a[workshopNum].maximum) {
					enrolledA[block][workshopNum]++;
					student[getBlock(block)] = choice;
					studentA++;
				} else {
					continue;
				}
			}
			if (workshopGroup === 'B' && studentB < 2) {
				let block = studentA + studentB;
				if (enrolledB[block][workshopNum] < 25) {
					//workshops.b[workshopNum].maximum) {
					enrolledB[block][workshopNum]++;
					student[getBlock(studentA + studentB)] = choice;
					studentB++;
				}
			}
		}
		let i = 0;
		if (studentA < 2) {
			while (studentA < 2) {
				let block = getBlock(i);
				if (student[block] === '') {
					for (let j = 0; j < enrolledA.length; j++) {
						if (enrolledA[i][j] < 25) {
							//workshops.a[j].maximum) {
							enrolledA[i][j]++;
							student[block] = 'A' + j;
							studentA++;
							break;
						}
					}
				}
				if (i > 4) {
					break;
				}
				i++;
			}
		}
		i = 0;
		if (studentB < 2) {
			while (studentB < 2) {
				let block = getBlock(i);
				if (student[block] === '') {
					for (let j = 0; j < enrolledB.length; j++) {
						if (enrolledB[i][j] < 25) {
							//workshops.b[j].maximum) {
							enrolledB[i][j]++;
							student[block] = 'B' + j;
							studentB++;
							break;
						}
					}
				}
				if (i > 4) {
					break;
				}
				i++;
			}
		}
		schedule.push(student);
	}
	return schedule;
}
