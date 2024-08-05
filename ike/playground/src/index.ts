const url = new URL('https://example.com/?a=b ~');
console.log(url.href);   // "https://example.com/?a=b%20~"