async function readFile() {
  console.log('Start reading file');
  const data = await Ike.remove('testdir');
  console.log(data);
}

console.log('Before calling readFile');
await readFile();
console.log('After calling readFile');
