const code = `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
export function Home(props: {title: string, path: string}){
  let x = Ike.path.join(path, 'file.txt');

  return <p>{props.title}</p>;
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home title='test' />
  </StrictMode>,
)
`;

const transpiled = Ike.transpile('tsx', code, true);

console.log(transpiled);
