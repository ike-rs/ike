const decoder = new TextDecoder("utf-8");
const data = Ike.readTextFileSync("src/hello.txt");

console.log(data);