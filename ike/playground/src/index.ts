const headers1 = new Headers([
    ['Content-Type', 'application/json'],
    ['Content-Type', 'application/txt'],
    ['Set-Cookie', 'name=value'],
    ['Set-Cookie', 'name2=value2'],
])

console.log(headers1.get('Set-Cookie')) // application/xml