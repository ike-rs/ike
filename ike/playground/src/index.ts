// const asyncIterator = (async function* () {
//   yield 1;
//   yield 2;
//   yield 3;
// })();

// const myReadableStream = ReadableStream.from(asyncIterator);
// console.log(myReadableStream);

// for await (const chunk of myReadableStream) {
//   console.log(chunk);
// }
const code = `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
export function Home(props: {title: string}){
  return <p>{props.title}</p>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home title='test' />
  </StrictMode>,
)
`;

const transpiled = Ike.transpile('tsx', code);

console.log(transpiled);
