import { Base64 } from 'https://esm.run/js-base64@3.7.6';

const data = `
    object:
    array: ["hello", "world"]
    key: "value"
`;

console.log(Base64.encode(data));