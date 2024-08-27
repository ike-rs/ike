import { getArgument, toString } from '@std/_internal_';

const atob = (data) => {
  const argument = getArgument(data, 'data', 'atob');
  const string = toString(argument);

  try {
    return atob_ex(string);
  } catch (error) {
    throw new Error(`atob: Failed to decode base64 string: ${error}`);
  }
};

const btoa = (data) => {
  const argument = getArgument(data, 'data', 'btoa');
  const string = toString(argument);

  try {
    return btoa_ex(string);
  } catch (error) {
    throw new Error(`btoa: Failed to encode string: ${error}`);
  }
};

export { atob, btoa };
