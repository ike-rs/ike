// const decoder = new TextDecoder("utf-8");
// const data = Ike.readFileSync("src/hello.txt");
// console.log(data[0])
// console.log("dwadaw")

const promise = new Promise((resolve, reject) => {
    resolve("Promise resolved");
})

console.log(promise)

const pendingPromise = new Promise((resolve, reject) => {
    // do nothing
})

console.log(pendingPromise)

const rejectedPromise = new Promise((resolve, reject) => {
    reject("Promise rejected");
})

console.log(rejectedPromise)