async function readFile() {
  console.log('Start reading file');
  const data = Ike.createFile('src/hello.1txt');
  console.log(data);
}

console.log('Before calling readFile');
await readFile();
console.log('After calling readFile');
