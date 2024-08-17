async function readFile() {
  console.log('Start reading file');
  const data = await Ike.readTextFile('src/hello.1txt');
  console.log(data);

  setTimeout(() => {
    console.log('End reading file');
  }, 3000);
}

console.log('Before calling readFile');
await readFile();
console.log('After calling readFile');
