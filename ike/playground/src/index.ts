// console.log({
//   test: {
//     message: "Hello, world!",
//   },
//   dwa: {},
// });

try {
  throw new TypeError("Not implemented");
} catch (err) {
  console.log(err);
}

try {
  throw new RangeError("Not implemented");
} catch (err) {
  console.log(err);
}

try {
  throw new Error("Not implemented");
} catch (err) {
  console.log(err);
}

try {
  throw new SyntaxError("Not implemented");
} catch (err) {
  console.log(err);
}
