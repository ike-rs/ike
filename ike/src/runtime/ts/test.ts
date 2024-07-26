const describe = $rustFunction('describe');
const $it = $rustFunction('it');

const it = (test: string, fn: () => void) => {
  return $it(test, () => {
    return $try_it(fn);
  });
};

const $try_it = (fn: () => void) => {
  try {
    fn();

    return 'pass';
  } catch (e) {
    console.error(e);

    return 'fail';
  }
};

it.skip = (test: string, fn: () => void) => {
  return $it(test, () => {
    return 'skip';
  });
};

it.todo = (test: string, fn: () => void) => {
  return $it(test, () => {
    return 'todo';
  });
};

it.if = (condition: boolean, test: string, fn: () => void) => {
  if (condition) {
    return it(test, fn);
  }
};

export { describe, it };
