import { validate } from './validate';
const $uuidParse = $rustFunction('uuidParse');

export const parse = (uuid: string): Uint8Array => {
  if (!validate(uuid)) {
    throw new TypeError('Invalid UUID provided to parse');
  }

  return $uuidParse(uuid);
};
