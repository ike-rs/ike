import x from '@std/_internal_';

const headers = new Headers();
const headers1 = new Headers({
  'Content-Type': 'application/json',
});

const headers2 = new Headers([['Content-Type', 'application/json']]);
