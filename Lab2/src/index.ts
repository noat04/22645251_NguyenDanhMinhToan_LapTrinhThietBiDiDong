import { myPromise } from "./bai1";
import { getNumber } from "./bai2";
import { getError } from "./bai3";
import { getRandomNumber } from "./bai4";
import { simulateTask } from "./bai5";
//Bài 1
myPromise.then((message) => {
    console.log(message); // Output 2s: Hello Async
});
//Bài 2
getNumber().then((number) => {
    console.log(number); // Output 1s: 10
});
//Bài 3
getError().catch((error) => {
    console.error("Caught an error:", error.message);
});
//Bài 4
getRandomNumber()
    .then((num) => {
        console.log("Generated number:", num);
    })
    .catch((error) => {
        console.error("Error generating number:", error.message);
    });
//Bai 5
simulateTask(1500).then((result) => {
    console.log(result); // Output after 1.5s: Task done
});

//Bai 6
const promise1 = simulateTask(1000).then(() => "Task 1 done");
const promise2 = simulateTask(2000).then(() => "Task 2 done");
const promise3 = simulateTask(1500).then(() => "Task 3 done");
Promise.all([promise1, promise2, promise3]).then((results) => {
    console.log("All tasks completed:", results);
});

//Bai 7
Promise.race([promise1, promise2, promise3]).then((firstResult) => {
    console.log("First task completed:", firstResult);
});

//Bai 8
import { promiseChain } from "./bai8";
promiseChain.then((finalResult) => {
    console.log("Final result of promise chain:", finalResult); // Output: 13
});

//Bai 9
import { filterEvenNumbers } from "./bai9";
const numbers = [1, 2, 3, 4, 5, 6];
filterEvenNumbers(numbers).then((evenNumbers) => {
    console.log("Even numbers:", evenNumbers); // Output sau 1s: [2, 4, 6]
});

//Bai 10
myPromise.then((message) => {
    console.log(message); // Output 2s: Hello Async
}).catch((error) => {
    console.error("Error:", error)
}).finally(() => {
    console.log("Done")
});

//Bai 11
import { asyncFunction } from "./bai11";
asyncFunction().then((message) => {
    console.log(message); // Output after 2s: Hello Async
}
).catch((error) => {
    console.error("Error:", error);
});

//Bai 12
import { simulateTask as asyncSimulateTask } from "./bai12";
asyncSimulateTask(2000).then((result) => {
    console.log(result); // Output after 2s: Task done
}
).catch((error) => {
    console.error("Error:", error);
});

//Bai 13
import { filterEvenNumbers as asyncFilterEvenNumbers } from "./bai9";
async function runTask() {
    try {
        const evenNumbers = await asyncFilterEvenNumbers([10, 15, 20, 25, 30]);
        console.log("Even numbers:", evenNumbers); // Output after 1s: [10, 20, 30]
    } catch (error) {
        console.error("Error:", error);
    }
}
runTask();

//Bai 14
//waits 1 second, then returns 2, then squares it, then cubes it
import { promiseChain as asyncPromiseChain } from "./bai14";
asyncPromiseChain.then((result) => {
    console.log("Final result of promise chain:", result); // Output: 8
});

//Bai 15
//Call multiple async functions sequentially using await.
async function sequentialTasks() {
    try {
        const result1 = await asyncSimulateTask(1000);
        console.log(result1); // Output after 1s: Task done

        const evenNumbers = await asyncFilterEvenNumbers([3, 6, 9, 12, 15]);
        console.log("Even numbers:", evenNumbers); // Output after 1s: [6, 12]

        const finalResult = await asyncPromiseChain;
        console.log("Final result of promise chain:", finalResult); // Output: 8
    } catch (error) {
        console.error("Error:", error);
    }
}

sequentialTasks();

//Bai 16
async function parallelTasks() {
    try {
        const task1 = asyncSimulateTask(2000);
        const task2 = asyncFilterEvenNumbers([2, 4, 6, 8, 10]);
        const task3 = asyncPromiseChain;

        const [result1, evenNumbers, finalResult] = await Promise.all([task1, task2, task3]);

        console.log(result1); // Output after 2s: Task done
        console.log("Even numbers:", evenNumbers); // Output after 1s: [2, 4, 6, 8, 10]
        console.log("Final result of promise chain:", finalResult); // Output: 8
    } catch (error) {
        console.error("Error:", error);
    }
}
parallelTasks();

//Bai 17
//Use for await...of to iterate over an array of Promises.
async function iteratePromises() {
    const promises = [
        asyncSimulateTask(1000),
        asyncFilterEvenNumbers([1, 2, 3, 4, 5]),
        asyncPromiseChain
    ];

    try {
        for await (const result of promises) {
            console.log("Result:", result);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
iteratePromises();

//Bai 18
import { fetchUser } from "./bai18";
fetchUser(1).then((user) => {
    console.log("Fetched user:", user); // Output after 1s: Fetched user: { id: 1, name: 'User1' }
}).catch((error) => {
    console.error("Error fetching user:", error);
});

//Bai 19
async function fetchMultipleUsers(ids: number[]) {
    try {
        const userPromises = ids.map((id) => fetchUser(id));
        const users = await Promise.all(userPromises);
        console.log("Fetched users:", users);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}
fetchMultipleUsers([1, 2, 3]);

//Bai 20
//Add a timeout: if the API call takes more than 2 seconds, throw an error.
import { fetchUserWithTimeout } from "./bai20";
fetchUserWithTimeout(1).then((user) => {
    console.log("Fetched user with timeout:", user); // Output after 1s: Fetched user with timeout: { id: 1, name: 'User1' }
}).catch((error) => {
    console.error("Error fetching user with timeout:", error);
});







