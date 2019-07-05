
function isPositiveNumber(num) {
	return typeof num === 'number' && num === num && num > 0;
}

const casinoArr = []; //array with all casino

class User {
	constructor(name, money) {
		if (isPositiveNumber(money)) {
			this.name = name;
			this.money = money;
		} else {
			console.error(`Please check method argument`);
		}
	}
	play(casinoName, moneyToPlay) {
		if (isPositiveNumber(moneyToPlay)) {
			const selectedCasino = casinoArr.find(el => el._casino._name === casinoName);
			if (Object.keys(selectedCasino._casino).length !== 0) {
				if (this.money >= moneyToPlay) {
					const randomMachineIndex = Math.floor(Math.random() * selectedCasino._casino.getMachineCount());
					if (selectedCasino._casino._machineArray[randomMachineIndex]._totalSum >= moneyToPlay * 3) {
						this.money += selectedCasino._casino._machineArray[randomMachineIndex].playGame(moneyToPlay);
					} else {
						console.error(`This casino machine is almost empty. Please try again`);
					}
				} else {
					console.error(`You haven't enough money to play. Your sum is ${this.money}`);
				}
			}
		} else {
			console.error(`Please enter positive number.`)
		}
	}
}

class SuperAdmin extends User {
	constructor(name, money) {
		super(name, money);
	}
	createCasino(casinoName) {
		if (casinoArr.some(el => el._casino._name === casinoName)) {
			console.error(`Casino ${casinoName} is already exist`);
		} else {
			casinoArr.push({ 
				_adminName: this.name,
				_casino: new Casino(casinoName) 
			});
			console.log(`Casino has created seccessfully`);
		}
	}
	createMachine(casinoName, startSum) {
		const selectedCasino = casinoArr.find(el => el._casino._name === casinoName);
		if (selectedCasino !== undefined) {
			const adminName = selectedCasino._adminName;
			if (Object.keys(selectedCasino).length !== 0 && adminName === this.name && this.money - startSum >= 0) {
				this.money -= startSum;
				const machine = new GameMachine(startSum);
				selectedCasino._casino._machineArray.push(machine);

				console.log(`Machine with start sum ${startSum} successfully created in casino "${casinoName}"`);
			}
		} else {
			if (selectedCasino === undefined) {
			 console.error(`You should create casino firstly`);
			} else if ( this.money - startSum < 0) {
				console.error(`You haven't enough money for machine criation. You sum is ${this.money}, needed sum is ${startSum}`);
			} else if (adminName !== this.name) {
				console.error(`This casino has another admin. You couldn't make any changes`);
			} else {
				console.error(`Casino with name ${casinoName} doesn't exist`);
			}
		}
	}
	takeMoneyFromCasino(casinoName, sum) {
		const selectedCasino = casinoArr.find(el => el._casino._name === casinoName);
		const adminName = selectedCasino._adminName;
		if (Object.keys(selectedCasino._casino).length !== 0 && adminName === this.name) {
			if (selectedCasino._casino.getMoney() >= sum) {
				let neededSum = 0;
				selectedCasino._casino._machineArray.sort((a, b) => b._totalSum - a._totalSum);
				for (let i = 0; i < selectedCasino._casino.getMachineCount(); i++ ){
					if (neededSum !== sum) {
						if (sum - neededSum > selectedCasino._casino._machineArray[i]._totalSum) {
							neededSum += selectedCasino._casino._machineArray[i]._totalSum;
							selectedCasino._casino._machineArray[i]._totalSum = 0;
						} else {
							selectedCasino._casino._machineArray[i].takeMoney(sum - neededSum);
							neededSum += (sum - neededSum);
						}
					}
				}
				this.money += neededSum;
				
				console.log(`You successfully take ${sum} from "${casinoName}"`);
			} else {
				console.error(`Amount is bigger then total sum from all casino machines`);
			}
		}
		if (Object.keys(selectedCasino._casino).length === 0) {
			console.error(`Casino with name ${casinoName} doesn't exist`);
		} else if (adminName !== this.name) {
			console.error(`This casino has another admin. You couldn't make any changes`);
		}
	}
	putMoneyToMachine(casinoName, number, sum) {
		const selectedCasino = casinoArr.find(el => el._casino._name === casinoName);
		const adminName = selectedCasino._adminName;
		if (Object.keys(selectedCasino._casino).length !== 0 && adminName === this.name) {
			if (number > 0 && number <= selectedCasino._casino.getMachineCount()) {
				selectedCasino._casino._machineArray[number - 1]._totalSum += sum;
				
				console.log(`${sum} is added to the Machine ${number} in casino "${casinoName}"`);
			} else {
				console.error(`Machine with number ${number} doesn't exist`);
			}
		}
		if (Object.keys(selectedCasino._casino).length === 0) {
			console.error(`Casino with name ${casinoName} doesn't exist`);
		} else if (adminName !== this.name) {
			console.error(`This casino has another admin. You couldn't make any changes`);
		}
	}
	deleteMachine(casinoName, number) {
		const selectedCasino = casinoArr.find(el => el._casino._name === casinoName);
		const adminName = selectedCasino._adminName;
		if (Object.keys(selectedCasino._casino).length !== 0 && adminName === this.name) {
			if (number > 0 && number <= selectedCasino._casino.getMachineCount()) {
				const moneyFromMachine = selectedCasino._casino._machineArray[number - 1]._totalSum;
				selectedCasino._casino._machineArray.splice((number - 1), 1);
				selectedCasino._casino._machineArray.forEach(el => el.putMoney(moneyFromMachine / selectedCasino._casino.getMachineCount()));

				console.log(`Machine with number ${number} successfully deleted. Amount is shared between rest of machines`);
			} else {
				console.error(`Machine with number ${number} doesn't exist`);
			}
		}
		if (Object.keys(selectedCasino._casino).length === 0) {
			console.error(`Casino with name ${casinoName} doesn't exist`);
		} else if (adminName !== this.name) {
			console.error(`This casino has another admin. You couldn't make any changes`);
		}
	}
}

class Casino {
	constructor(name) {
		this._name = name;
		this._machineArray = [];
	}
	getMoney() {
		return this._machineArray.reduce((sum, el) => sum += el._totalSum, 0);
	}
	getMachineCount() {
		return this._machineArray.length;
	}
}

class GameMachine {
	constructor(startSum) {
		if (isPositiveNumber(startSum)) {
			this._totalSum = startSum;
		} else {
			console.error(`Please check method argument`)
		}
	}
	get getMoney() {
		return this._totalSum;
	}
	takeMoney(sum) {
		this._totalSum -= sum;

		return sum;
	}
	putMoney(sum) {
		this._totalSum += sum;
	}
	playGame(sum) {
		const randomNumber = Math.floor(Math.random() * (1000 - 100) + 100);
		const uniqNumber = [...new Set(String(randomNumber))];
		if (uniqNumber.length === 2) {
			const prize = sum * 2;
			this.takeMoney(prize);
			console.log(`Combination is ${randomNumber}. You won ${prize}`);

			return prize;
		} else if (uniqNumber.length === 1) {
			const prize = sum * 3;
			this.takeMoney(prize);
			console.log(`Combination is ${randomNumber}. You won ${prize}`);

			return prize;
		} else {
			this.putMoney(sum);
			console.log(`Combination is ${randomNumber}. You didn't win.`);

			return sum * (-1);
		}
	}
}

//comands for checking

const adminUser1 = new SuperAdmin('Bob', 1000000); // create instance of SuperAdmin class
adminUser1.createMachine('BobCasino', 30000); // will show error that casino should be created before machine
adminUser1.createCasino('BobCasino'); // create new casino with admin 'Bob'
adminUser1.createCasino('BobCasino'); // will show error becouse casino with such name is already exist
adminUser1.createMachine('BobCasino', 30000); // create game machine in 'BobCasino' with start amount 300000
adminUser1.createMachine('BobCasino', 100000); // create another game machine in 'BobCasino' with start amount 100000
const adminUser2 = new SuperAdmin('Jack', 200000); // create another instance of SuperAdmin class
adminUser2.createCasino('JackCasino'); // create new casino with admin 'Jack'
adminUser2.createMachine('JackCasino', 3000); // create game machine in 'JackCasino' with start amount 30000
adminUser2.createMachine('JackCasino', 100000); // create another game machine in 'JackCasino' with start amount 100000
adminUser2.createMachine('JackCasino', 100000) // show error that admit haven't enougth money for game machine
adminUser2.createMachine('JackCasino', 97000) // create another game machine in 'JackCasino' with start amount 97000

adminUser1.createMachine('JackCasino', 30000); // admin can create machines only in own casino(system will show error)
adminUser1.takeMoneyFromCasino('BobCasino', 80000) // take money from 'BobCasino's machines

adminUser2.putMoneyToMachine('JackCasino', 2, 100000) // put 100000 to the 2nd machines in 'JackCasino'
adminUser2.deleteMachine('JackCasino', 1) /* delete 1st machines in 'JackCasino' and share it's amount between 
rest of machines in this casino*/

const gamer = new User('Ira', 1000); // create visitor with name 'Ira' and 1000 amount of money
gamer.play('BobCasino', 100) // play with random game machine in 'BobCasino'
gamer.play('JackCasino', 2000) // user haven't enough money to play game