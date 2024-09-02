// const app = Ike.serve({
//   port: 3001,
//   handler: (req) => {},
// });

const params = new URLSearchParams();
params.append('name', 'John Doe');

const headers = new Headers();
headers.append('Content-Type', 'application/json');
