async function readFile() {
  console.log('Start reading file');
  const data = await Ike.readFile('src/hello.txt');
  console.log(new TextDecoder().decode(data));
}

console.log('Before calling readFile');
readFile();
console.log('After calling readFile');
