const describe = $rustFunction("describe");
const $it = $rustFunction("it");
const it = (test, fn) => {
  return $it(test, () => {
    return $try_it(fn);
  });
};
const $try_it = (fn) => {
  try {
    fn();
    return "pass";
  } catch (e) {
    // console.error(e);
    return "fail";
  }
};
it.skip = (test, fn) => {
  return $it(test, () => {
    return "skip";
  });
};
it.todo = (test, fn) => {
  return $it(test, () => {
    return "todo";
  });
};
it.if = (condition, test, fn) => {
  if (condition) {
    return it(test, fn);
  }
};
export { describe, it };
