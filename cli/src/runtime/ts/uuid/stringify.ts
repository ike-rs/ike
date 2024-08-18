import { InvalidArgTypeError } from '@std/_internal_';
import { assert } from '@std/assert';

const $uuidStringify = $rustFunction('uuidStringify');
export const stringify = (uuid: Uint8Array, offset: number = 0): string => {
  if (!(uuid instanceof Uint8Array)) {
    throw new InvalidArgTypeError('uuid', 'Uint8Array', uuid);
  }

  assert(offset >= 0, 'Offset must be a non-negative integer');

  return $uuidStringify(uuid, offset);
};
