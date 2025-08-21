import { Student, get } from "./bai1";
import { Student as Bai2Student, get as getBai2 } from "./bai2";
import { Car, getCarDetails } from "./bai3";
import { Rectangle } from "./bai4";
import { BankAccount } from "./bai5";
console.log(get(new Student("200Lab", 20)));
console.log(getBai2(new Bai2Student("200Lab", 20, "A")));
console.log(getCarDetails(new Car("Toyota", "Corolla", 2020)));
console.log(new Rectangle(5, 10).area());
console.log(new Rectangle(5, 10).perimeter());
var account = new BankAccount("123456", "John Doe", 1000);
console.log(account.getBalance());
console.log(account.deposit(500));
console.log(account.withdraw(200));


