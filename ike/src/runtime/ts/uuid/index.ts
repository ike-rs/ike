import { validate } from './validate';

export const parse = (uuid: string): Uint8Array => {
  if (!validate(uuid)) {
    throw new TypeError('Invalid UUID provided to parse');
  }

  return new Uint8Array();
};
