export const setTimeout = (cb, _delay, ...args) => {
  if (typeof cb !== 'function') {
    throw new Error('setTimeout requires a function as first argument');
  }

  const delay = _delay ? parseInt(_delay, 10) : 0;
  return set_timeout_ex(cb, delay, ...args);
};

export const clearTimeout = (id) => {
  return clear_timeout_ex(parseInt(id, 10) || 0);
};
