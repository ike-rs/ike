const timeout = setTimeout(() => {
  console.log("Hello, World!");
}, 3000);

setTimeout(() => {
  clearTimeout(timeout);
  console.log("Timeout cleared!");
}, 100);
