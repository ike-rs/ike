export * from './parse';
export * from './stringify';
export * from './validate';

export const uuidv4 = $rustFunction('uuidv4');

export const uuidv5 = (
  namespace: 'dns' | 'url' | 'oid' | 'x500' | (string & {}),
  name: string,
) => {
  if (typeof namespace !== 'string') {
    throw new TypeError('Namespace must be a string');
  }

  if (typeof name !== 'string') {
    throw new TypeError('Name must be a string');
  }

  return $rustFunction('uuidv5')(namespace, name);
};
