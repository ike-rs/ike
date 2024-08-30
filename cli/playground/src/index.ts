// url with hash
const url = new URL('https://example.com?query=string&name=John#hash');

console.log(url.searchParams.get('query')); // 'string'
