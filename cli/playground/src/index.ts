const namedSet = new Set([
  'convertBytes',
  'formatBytes',
  'parseNumericValue',
  new Set('dwa'),
  false,
]);

console.log(namedSet.values().next().value);

console.log(namedSet);

console.log(
  false,
  true,
  123,
  'hello',
  null,
  undefined,
  NaN,
  Infinity,
  Symbol(),
  Symbol.for('foo'),
);

console.log(['dwa', false, true, 123, 1321]);

const map = new Map();

map.set('foo', 'bar');
map.set('hello', 'world');
map.set(Symbol.for('foo'), 'symbol');
map.set(false, false);
map.set('daw', new Set([1, 2, 3, 4, 5]));

console.log(map);

class test {
  constructor() {
    console.log('test');
  }

  get test() {
    return 'test';
  }
}

const x = new test();

console.log(x);

console.log(new Date());

const dataview = new DataView(new ArrayBuffer(8));

console.log(dataview);

const pending = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('test');
  }, 1000);
});

const resolved = new Promise((resolve, reject) => {
  resolve('test');
});

console.log(pending, resolved);

const arrayBuffer = new ArrayBuffer(8);

console.log(arrayBuffer);

const sharedArrayBuffer = new SharedArrayBuffer(8);
console.log(sharedArrayBuffer);

const uint8 = new Uint8Array(arrayBuffer);

console.log(uint8);

const typedarrayoverlimit = new Uint8Array(1001);

console.log(typedarrayoverlimit);

const fn = () => {
  console.log('test');
};

const generator = function* () {
  yield 1;
  yield 2;
  yield 3;
};

const asyncGenerator = async function* () {
  yield 1;
  yield 2;
  yield 3;
};

console.log(
  function () {
    return 'dwa';
  },
  fn,
  generator,
  asyncGenerator,
);

console.log(new Error('test'), new TypeError('test'), new RangeError('test'));
